import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createRoomCode, validateRoomCode, generateJoinUrl } from "~/lib/room-code-generator";
import { generateSessionId } from "~/lib/session";
import { validateCharacterConfiguration } from "~/lib/character-validation";
import { getDefaultSettings } from "~/lib/default-settings";
import { assignRoles, validateRoleConfiguration, getVisiblePlayers } from "~/lib/role-assignment";
import { GameStateMachine, canStartGame } from "~/lib/game-state-machine";
import { computeRoleKnowledge } from "~/lib/role-knowledge";
import { getMissionRequirements, validateMissionTeam } from "~/lib/mission-rules";
import { 
  calculateVotingProgress, 
  calculateRejectionTracker, 
  calculateVotingResults,
  validateVotingSession,
  areAllPlayersVoted,
  canPlayerChangeVote 
} from "~/lib/voting-utils";
import type { GameState, GameSettings } from "~/types/room";
import type { StartRequirement } from "~/types/game-state";
import type { RoleKnowledge } from "~/types/role-knowledge";
import type { MissionPlayer } from "~/types/mission";
import type { VotingSession, VoteChoice, Vote } from "~/types/voting";

// Input validation schemas
const createRoomSchema = z.object({
  hostName: z.string().min(1, "Host name is required").max(50, "Host name too long"),
  settings: z.object({
    characters: z.array(z.string()).optional(),
    playerCount: z.number().min(5).max(10).optional(),
    timeLimit: z.number().positive().optional(),
    allowSpectators: z.boolean().optional(),
    autoStart: z.boolean().optional(),
  }).optional(),
});

const joinRoomSchema = z.object({
  roomCode: z.string().length(8, "Room code must be 8 characters"),
  playerName: z.string().min(1, "Player name is required").max(50, "Player name too long"),
  sessionId: z.string().optional(),
});

const updateSettingsSchema = z.object({
  roomId: z.string().cuid("Invalid room ID"),
  settings: z.object({
    characters: z.array(z.string()),
    playerCount: z.number().min(5).max(10),
    timeLimit: z.number().positive().optional(),
    allowSpectators: z.boolean(),
    autoStart: z.boolean(),
  }),
});

const startGameSchema = z.object({
  roomId: z.string().cuid("Invalid room ID"),
  hostId: z.string().cuid("Invalid host ID"),
});

export const roomRouter = createTRPCRouter({
  /**
   * Create a new game room
   */
  createRoom: publicProcedure
    .input(createRoomSchema)
    .mutation(async ({ ctx, input }) => {
      const { hostName, settings } = input;
      
      // Generate unique room code
      let roomCode: string;
      let attempts = 0;
      const maxAttempts = 10;
      
      do {
        roomCode = createRoomCode();
        attempts++;
        
        // Check if room code already exists
        const existingRoom = await ctx.db.room.findUnique({
          where: { code: roomCode },
        });
        
        if (!existingRoom) break;
        
        if (attempts >= maxAttempts) {
          throw new Error("Unable to generate unique room code");
        }
      } while (true);
      
      // Merge with default settings
      const defaultSettings = getDefaultSettings(5);
      const roomSettings: GameSettings = {
        ...defaultSettings,
        ...settings,
      };
      
      // Validate character selection if provided
      if (settings?.characters && settings.characters.length > 0) {
        const validation = validateCharacterConfiguration({
          ...roomSettings,
          characters: settings.characters,
          playerCount: settings.playerCount || 5
        });
        const errors = validation.filter(error => error.severity === 'error');
        if (errors.length > 0) {
          throw new Error(`Invalid character selection: ${errors.map((e: any) => e.message).join(", ")}`);
        }
      }
      
      // Create initial game state
      const gameState: GameState = {
        phase: 'lobby',
        round: 0,
        leaderIndex: 0,
        votes: [],
        missions: [],
      };
      
      // Set expiration time (1 hour from now)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      
      // Create room in database
      const room = await ctx.db.room.create({
        data: {
          code: roomCode,
          hostId: "", // Will be set after creating host player
          gameState: gameState as any,
          settings: roomSettings as any,
          phase: 'lobby',
          expiresAt,
        },
      });
      
      // Generate session ID for host
      const sessionId = generateSessionId();
      
      // Create host player
      const hostPlayer = await ctx.db.player.create({
        data: {
          name: hostName,
          isHost: true,
          isReady: false,
          sessionId,
          roomId: room.id,
        },
      });
      
      // Update room with host ID
      const updatedRoom = await ctx.db.room.update({
        where: { id: room.id },
        data: { hostId: hostPlayer.id },
        include: {
          players: true,
        },
      });
      
      return {
        id: updatedRoom.id,
        code: updatedRoom.code,
        joinUrl: generateJoinUrl(updatedRoom.code),
        hostId: updatedRoom.hostId,
        expiresAt: updatedRoom.expiresAt,
        sessionId,
      };
    }),

  /**
   * Join an existing room
   */
  joinRoom: publicProcedure
    .input(joinRoomSchema)
    .mutation(async ({ ctx, input }) => {
      const { roomCode, playerName, sessionId } = input;
      
      // Validate room code format
      if (!validateRoomCode(roomCode)) {
        throw new Error("Invalid room code format");
      }
      
      // Find room
      const room = await ctx.db.room.findUnique({
        where: { code: roomCode },
        include: {
          players: true,
        },
      });
      
      if (!room) {
        throw new Error("Room not found");
      }
      
      // Check if room has expired
      if (new Date() > room.expiresAt) {
        throw new Error("Room has expired");
      }
      
      // Check if game has started
      const gameState = room.gameState as unknown as GameState;
      if (gameState.phase !== 'lobby') {
        throw new Error("Game has already started");
      }
      
      // Check room capacity
      if (room.players.length >= room.maxPlayers) {
        throw new Error("Room is full");
      }
      
      // Check if player name is already taken
      const existingPlayer = room.players.find(p => p.name === playerName);
      if (existingPlayer) {
        throw new Error("Player name is already taken");
      }
      
      // Check if session ID is provided and valid
      let player;
      if (sessionId) {
        // Try to find existing player with this session ID
        const existingSessionPlayer = await ctx.db.player.findUnique({
          where: { sessionId },
          include: { room: true },
        });
        
        if (existingSessionPlayer && existingSessionPlayer.roomId === room.id) {
          // Update existing player
          player = await ctx.db.player.update({
            where: { id: existingSessionPlayer.id },
            data: { name: playerName },
          });
        } else {
          // Create new player
          player = await ctx.db.player.create({
            data: {
              name: playerName,
              isHost: false,
              isReady: false,
              sessionId,
              roomId: room.id,
            },
          });
        }
      } else {
        // Create new player with new session ID
        const newSessionId = generateSessionId();
        player = await ctx.db.player.create({
          data: {
            name: playerName,
            isHost: false,
            isReady: false,
            sessionId: newSessionId,
            roomId: room.id,
          },
        });
      }
      
      // Get updated room data
      const updatedRoom = await ctx.db.room.findUnique({
        where: { id: room.id },
        include: {
          players: true,
        },
      });
      
      return {
        success: true,
        room: {
          id: updatedRoom!.id,
          code: updatedRoom!.code,
          gameState: updatedRoom!.gameState as unknown as GameState,
          playerCount: updatedRoom!.players.length,
          maxPlayers: updatedRoom!.maxPlayers,
        },
        player: {
          id: player.id,
          name: player.name,
          isHost: player.isHost,
          sessionId: player.sessionId!,
        },
      };
    }),

  /**
   * Get room information
   */
  getRoomInfo: publicProcedure
    .input(z.object({
      roomCode: z.string().length(8, "Room code must be 8 characters"),
    }))
    .query(async ({ ctx, input }) => {
      const { roomCode } = input;
      
      // Validate room code format
      if (!validateRoomCode(roomCode)) {
        throw new Error("Invalid room code format");
      }
      
      // Find room
      const room = await ctx.db.room.findUnique({
        where: { code: roomCode },
        include: {
          players: {
            orderBy: {
              joinedAt: 'asc',
            },
          },
        },
      });
      
      if (!room) {
        throw new Error("Room not found");
      }
      
      // Check if room has expired
      if (new Date() > room.expiresAt) {
        throw new Error("Room has expired");
      }
      
      return {
        id: room.id,
        code: room.code,
        hostId: room.hostId,
        gameState: room.gameState as unknown as GameState,
        settings: room.settings as unknown as GameSettings,
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
        players: room.players.map(p => ({
          id: p.id,
          name: p.name,
          isHost: p.isHost,
          isReady: p.isReady,
          joinedAt: p.joinedAt,
        })),
        createdAt: room.createdAt,
        expiresAt: room.expiresAt,
      };
    }),

  /**
   * Update room settings (host only)
   */
  updateSettings: publicProcedure
    .input(updateSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const { roomId, settings } = input;
      
      // Find room
      const room = await ctx.db.room.findUnique({
        where: { id: roomId },
        include: {
          players: true,
        },
      });
      
      if (!room) {
        throw new Error("Room not found");
      }
      
      // Check if room has expired
      if (new Date() > room.expiresAt) {
        throw new Error("Room has expired");
      }
      
      // Check if game has started
      const gameState = room.gameState as unknown as GameState;
      if (gameState.phase !== 'lobby') {
        throw new Error("Cannot change settings after game has started");
      }
      
      // Validate character selection
      if (settings.characters && settings.characters.length > 0) {
        const validation = validateCharacterConfiguration({
          ...settings,
          characters: settings.characters,
          playerCount: settings.playerCount
        });
        const errors = validation.filter(error => error.severity === 'error');
        if (errors.length > 0) {
          throw new Error(`Invalid character selection: ${errors.map((e: any) => e.message).join(", ")}`);
        }
      }
      
      // Update room settings
      const updatedRoom = await ctx.db.room.update({
        where: { id: roomId },
        data: {
          settings: settings as any,
        },
        include: {
          players: true,
        },
      });
      
      return {
        success: true,
        room: {
          id: updatedRoom.id,
          code: updatedRoom.code,
          settings: updatedRoom.settings as unknown as GameSettings,
          playerCount: updatedRoom.players.length,
          maxPlayers: updatedRoom.maxPlayers,
        },
      };
    }),

  /**
   * Validate character selection
   */
  validateSettings: publicProcedure
    .input(z.object({
      characters: z.array(z.string()),
      playerCount: z.number().min(5).max(10),
    }))
    .query(async ({ input }) => {
      const { characters, playerCount } = input;
      
      const validation = validateCharacterConfiguration({
        characters,
        playerCount,
        allowSpectators: false,
        autoStart: false
      });
      
      return {
        isValid: validation.filter(error => error.severity === 'error').length === 0,
        errors: validation,
      };
    }),

  /**
   * Start the game (host only)
   */
  startGame: publicProcedure
    .input(startGameSchema)
    .mutation(async ({ ctx, input }) => {
      const { roomId, hostId } = input;
      
      // Find room with players
      const room = await ctx.db.room.findUnique({
        where: { id: roomId },
        include: {
          players: {
            orderBy: {
              joinedAt: 'asc',
            },
          },
        },
      });
      
      if (!room) {
        throw new Error("Room not found");
      }
      
      // Check if room has expired
      if (new Date() > room.expiresAt) {
        throw new Error("Room has expired");
      }
      
      // Verify host permission
      if (room.hostId !== hostId) {
        throw new Error("Only the host can start the game");
      }
      
      // Check if game has already started
      const gameState = room.gameState as unknown as GameState;
      if (gameState.phase !== 'lobby') {
        throw new Error("Game has already started");
      }
      
      // Validate start requirements
      const startValidation = canStartGame(room.players.length);
      if (!startValidation.canStart) {
        throw new Error(`Cannot start game: ${startValidation.errors.join(", ")}`);
      }
      
      // Get settings and validate role configuration
      const settings = room.settings as unknown as GameSettings;
      const roleValidation = validateRoleConfiguration(room.players.length, settings.characters);
      if (!roleValidation.valid) {
        throw new Error(`Invalid role configuration: ${roleValidation.errors.join(", ")}`);
      }
      
      // Assign roles to players
      const playersForAssignment = room.players.map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        role: p.role || undefined,
        roleData: p.roleData ? p.roleData as any : undefined,
        isReady: p.isReady,
        joinedAt: p.joinedAt,
        roomId: p.roomId,
        sessionId: p.sessionId || undefined,
      }));
      
      const roleAssignments = assignRoles(playersForAssignment, settings.characters);
      
      // Create updated game state
      const stateMachine = new GameStateMachine(gameState);
      const transitionSuccess = stateMachine.transitionTo('roleReveal');
      if (!transitionSuccess) {
        throw new Error("Invalid game state transition");
      }
      
      const newGameState = stateMachine.getGameState();
      
      // Begin database transaction
      const result = await ctx.db.$transaction(async (tx) => {
        // Update room with new game state and phase
        const updatedRoom = await tx.room.update({
          where: { id: roomId },
          data: {
            gameState: newGameState as any,
            phase: 'roleReveal',
            startedAt: new Date(),
          },
        });
        
        // Update players with role assignments
        const updatedPlayers = await Promise.all(
          roleAssignments.map(async (assignment) => {
            const visiblePlayers = getVisiblePlayers(assignment, roleAssignments);
            const player = room.players.find(p => p.id === assignment.playerId)!;
            
            return tx.player.update({
              where: { id: assignment.playerId },
              data: {
                role: assignment.roleId,
                roleData: {
                  roleId: assignment.roleId,
                  assignedAt: assignment.assignedAt,
                  visiblePlayers: visiblePlayers.map(vp => ({
                    playerId: vp.playerId,
                    roleId: vp.roleId,
                    name: room.players.find(p => p.id === vp.playerId)?.name || 'Unknown',
                  })),
                } as any,
              },
            });
          })
        );
        
        return { room: updatedRoom, players: updatedPlayers };
      });
      
      return {
        success: true,
        gameState: newGameState,
        phase: 'roleReveal',
        startedAt: result.room.startedAt,
        message: "Game started successfully",
      };
    }),

  /**
   * Check start requirements
   */
  checkStartRequirements: publicProcedure
    .input(z.object({
      roomId: z.string().cuid("Invalid room ID"),
    }))
    .query(async ({ ctx, input }) => {
      const { roomId } = input;
      
      // Find room with players
      const room = await ctx.db.room.findUnique({
        where: { id: roomId },
        include: {
          players: true,
        },
      });
      
      if (!room) {
        throw new Error("Room not found");
      }
      
      // Check if room has expired
      if (new Date() > room.expiresAt) {
        throw new Error("Room has expired");
      }
      
      const gameState = room.gameState as unknown as GameState;
      const settings = room.settings as unknown as GameSettings;
      
      // Build requirements list
      const requirements: StartRequirement[] = [];
      
      // Minimum players requirement
      const minPlayers = 5;
      requirements.push({
        id: 'min-players',
        name: 'Minimum Players',
        description: `At least ${minPlayers} players required`,
        status: room.players.length >= minPlayers ? 'satisfied' : 'pending',
        required: true,
      });
      
      // Valid settings requirement
      const roleValidation = validateRoleConfiguration(room.players.length, settings.characters);
      requirements.push({
        id: 'valid-settings',
        name: 'Valid Game Settings',
        description: 'Character configuration is valid',
        status: roleValidation.valid ? 'satisfied' : 'failed',
        required: true,
      });
      
      // Game phase requirement
      requirements.push({
        id: 'lobby-phase',
        name: 'Game in Lobby',
        description: 'Game must be in lobby phase to start',
        status: gameState.phase === 'lobby' ? 'satisfied' : 'failed',
        required: true,
      });
      
      // All players ready (optional)
      const allPlayersReady = room.players.every(p => p.isReady);
      requirements.push({
        id: 'all-ready',
        name: 'All Players Ready',
        description: 'All players have confirmed they are ready',
        status: allPlayersReady ? 'satisfied' : 'pending',
        required: false,
      });
      
      return {
        requirements,
        canStart: requirements.filter(r => r.required).every(r => r.status === 'satisfied'),
        playerCount: room.players.length,
        minPlayers,
        gamePhase: gameState.phase,
      };
    }),

  /**
   * Get current game state
   */
  getGameState: publicProcedure
    .input(z.object({
      roomId: z.string().cuid("Invalid room ID"),
    }))
    .query(async ({ ctx, input }) => {
      const { roomId } = input;
      
      // Find room
      const room = await ctx.db.room.findUnique({
        where: { id: roomId },
        include: {
          players: {
            orderBy: {
              joinedAt: 'asc',
            },
          },
        },
      });
      
      if (!room) {
        throw new Error("Room not found");
      }
      
      // Check if room has expired
      if (new Date() > room.expiresAt) {
        throw new Error("Room has expired");
      }
      
      const gameState = room.gameState as unknown as GameState;
      
      return {
        gameState,
        phase: room.phase,
        startedAt: room.startedAt,
        players: room.players.map(p => ({
          id: p.id,
          name: p.name,
          isHost: p.isHost,
          isReady: p.isReady,
          hasRole: !!p.role,
          joinedAt: p.joinedAt,
        })),
      };
    }),

  /**
   * Update player ready status
   */
  updatePlayerReady: publicProcedure
    .input(z.object({
      playerId: z.string().cuid("Invalid player ID"),
      isReady: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { playerId, isReady } = input;
      
      // Find player
      const player = await ctx.db.player.findUnique({
        where: { id: playerId },
        include: {
          room: true,
        },
      });
      
      if (!player) {
        throw new Error("Player not found");
      }
      
      // Check if room has expired
      if (new Date() > player.room.expiresAt) {
        throw new Error("Room has expired");
      }
      
      // Check if game has started
      const gameState = player.room.gameState as unknown as GameState;
      if (gameState.phase !== 'lobby') {
        throw new Error("Cannot change ready status after game has started");
      }
      
      // Update player ready status
      const updatedPlayer = await ctx.db.player.update({
        where: { id: playerId },
        data: { isReady },
      });
      
      return {
        success: true,
        player: {
          id: updatedPlayer.id,
          name: updatedPlayer.name,
          isReady: updatedPlayer.isReady,
        },
      };
    }),

  /**
   * Clean up expired rooms
   */
  cleanupExpiredRooms: publicProcedure
    .mutation(async ({ ctx }) => {
      const now = new Date();
      
      // Find expired rooms
      const expiredRooms = await ctx.db.room.findMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
        select: {
          id: true,
          code: true,
        },
      });
      
      // Delete expired rooms (players will be cascade deleted)
      if (expiredRooms.length > 0) {
        await ctx.db.room.deleteMany({
          where: {
            id: {
              in: expiredRooms.map(r => r.id),
            },
          },
        });
      }
      
      return {
        deletedCount: expiredRooms.length,
        deletedRooms: expiredRooms.map(r => r.code),
      };
    }),

  /**
   * Get role knowledge for a specific player
   */
  getRoleKnowledge: publicProcedure
    .input(z.object({
      roomId: z.string().cuid("Invalid room ID"),
      playerId: z.string().cuid("Invalid player ID"),
    }))
    .query(async ({ ctx, input }) => {
      const { roomId, playerId } = input;
      
      // Get room with all players and their roles
      const room = await ctx.db.room.findUnique({
        where: { id: roomId },
        include: {
          players: {
            select: {
              id: true,
              name: true,
              role: true,
              roleData: true,
            },
          },
        },
      });
      
      if (!room) {
        throw new Error("Room not found");
      }
      
      // Find the requesting player
      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        throw new Error("Player not found in room");
      }
      
      // Check if game has started and roles are assigned
      if (room.phase !== 'role-reveal' && room.phase !== 'roleReveal' || !player.role) {
        throw new Error("Role information not available yet");
      }
      
      // Parse player role data
      const playerRoleData = player.roleData ? JSON.parse(player.roleData as string) : {};
      const playerRole = {
        id: player.role,
        name: player.role,
        team: playerRoleData.team || 'good',
        description: playerRoleData.description || '',
        abilities: playerRoleData.abilities || [],
        seesEvil: playerRoleData.seesEvil || false,
        seenByMerlin: playerRoleData.seenByMerlin || false,
        isAssassin: playerRoleData.isAssassin || false,
      };
      
      // Prepare player data for role knowledge computation
      const playersWithRoles = room.players.map(p => ({
        id: p.id,
        name: p.name,
        role: {
          id: p.role || 'servant',
          name: p.role || 'servant',
          team: p.roleData ? (JSON.parse(p.roleData as string).team || 'good') : 'good',
          description: '',
          abilities: [],
          seesEvil: false,
          seenByMerlin: false,
          isAssassin: false,
        }
      }));
      
      // Compute role knowledge for this player
      const roleKnowledge = computeRoleKnowledge(playerId, playerRole, playersWithRoles);
      
      return roleKnowledge;
    }),

  /**
   * Confirm that a player has seen their role
   */
  confirmRoleRevealed: publicProcedure
    .input(z.object({
      roomId: z.string().cuid("Invalid room ID"),
      playerId: z.string().cuid("Invalid player ID"),
    }))
    .mutation(async ({ ctx, input }) => {
      const { roomId, playerId } = input;
      
      // Get room to verify it exists and check phase
      const room = await ctx.db.room.findUnique({
        where: { id: roomId },
        include: {
          players: {
            select: {
              id: true,
              isReady: true,
            },
          },
        },
      });
      
      if (!room) {
        throw new Error("Room not found");
      }
      
      if (room.phase !== 'role-reveal' && room.phase !== 'roleReveal') {
        throw new Error("Not in role reveal phase");
      }
      
      // Verify player exists in room
      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        throw new Error("Player not found in room");
      }
      
      // Mark player as having seen their role (using isReady field)
      await ctx.db.player.update({
        where: { id: playerId },
        data: { isReady: true },
      });
      
      // Check if all players have seen their roles
      const updatedRoom = await ctx.db.room.findUnique({
        where: { id: roomId },
        include: {
          players: {
            select: {
              isReady: true,
            },
          },
        },
      });
      
      if (!updatedRoom) {
        throw new Error("Room not found");
      }
      
      const allPlayersReady = updatedRoom.players.every(p => p.isReady);
      
      // If all players have seen their roles, advance to next phase
      if (allPlayersReady) {
        const gameState = room.gameState as unknown as GameState;
        const stateMachine = new GameStateMachine(gameState);
        const validNextPhases = stateMachine.getValidNextPhases();
        const nextPhase = validNextPhases[0] || 'voting'; // Default to voting phase
        
        const updatedGameState = {
          ...gameState,
          phase: nextPhase,
          lastUpdated: new Date(),
        };
        
        await ctx.db.room.update({
          where: { id: roomId },
          data: {
            phase: nextPhase,
            gameState: updatedGameState as any,
          },
        });
      }
      
      return {
        success: true,
        allPlayersReady,
        nextPhase: allPlayersReady ? 'voting' : 'roleReveal',
      };
    }),

  // Mission team selection procedures
  submitMissionTeam: publicProcedure
    .input(z.object({
      roomId: z.string(),
      playerId: z.string(),
      teamIds: z.array(z.string()),
    }))
    .mutation(async ({ input, ctx }) => {
      const { roomId, playerId, teamIds } = input;
      
      // Get room and validate
      const room = await ctx.db.room.findUnique({
        where: { id: roomId },
        include: { players: true },
      });
      
      if (!room) {
        throw new Error("Room not found");
      }
      
      if (room.phase !== 'teamSelection') {
        throw new Error(`Cannot submit team in phase: ${room.phase}`);
      }
      
      // Validate player is the leader
      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        throw new Error("Player not found");
      }
      
      const gameState = room.gameState as unknown as GameState;
      const currentLeaderIndex = gameState.leaderIndex ?? 0;
      const sortedPlayers = room.players.sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());
      const currentLeader = sortedPlayers[currentLeaderIndex];
      
      if (!currentLeader || player.id !== currentLeader.id) {
        throw new Error("Only the mission leader can submit the team");
      }
      
      // Convert players to MissionPlayer format
      const missionPlayers: MissionPlayer[] = room.players.map(p => ({
        id: p.id,
        name: p.name,
        role: (p.roleData as any)?.role || 'servant',
        isOnline: true, // Default to online for now
        isLeader: p.id === currentLeader.id,
      }));
      
      // Get current mission data
      const missionRound = (gameState.missions?.length ?? 0) + 1;
      const mission = {
        id: `mission-${missionRound}`,
        round: missionRound,
        requiredPlayers: getMissionRequirements(missionRound, room.players.length).requiredPlayers,
        failsRequired: getMissionRequirements(missionRound, room.players.length).failsRequired,
        leaderIndex: currentLeaderIndex,
        description: getMissionRequirements(missionRound, room.players.length).description,
        specialRules: getMissionRequirements(missionRound, room.players.length).specialRules,
      };
      
      // Validate team
      const validation = validateMissionTeam(teamIds, mission, missionPlayers);
      if (!validation.success) {
        throw new Error(validation.error || "Invalid team selection");
      }
      
      // Update game state with proposed team
      const updatedGameState = {
        ...gameState,
        votes: [], // Reset votes for new team proposal
        phase: 'voting' as const,
        lastUpdated: new Date(),
      };
      
      await ctx.db.room.update({
        where: { id: roomId },
        data: {
          phase: 'voting',
          gameState: updatedGameState as any,
        },
      });
      
      return {
        success: true,
        teamIds,
        nextPhase: 'voting',
      };
    }),

  getMissionData: publicProcedure
    .input(z.object({
      roomId: z.string(),
      playerId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const { roomId, playerId } = input;
      
      // Get room and validate
      const room = await ctx.db.room.findUnique({
        where: { id: roomId },
        include: { players: true },
      });
      
      if (!room) {
        throw new Error("Room not found");
      }
      
      // Validate player is in room
      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        throw new Error("Player not found");
      }
      
      const gameState = room.gameState as unknown as GameState;
      const currentLeaderIndex = gameState.leaderIndex ?? 0;
      const sortedPlayers = room.players.sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());
      const currentLeader = sortedPlayers[currentLeaderIndex];
      
      // Convert players to MissionPlayer format
      const missionPlayers: MissionPlayer[] = room.players.map(p => ({
        id: p.id,
        name: p.name,
        role: (p.roleData as any)?.role || 'servant',
        isOnline: true, // Default to online for now
        isLeader: p.id === currentLeader?.id,
      }));
      
      // Get current mission data
      const missionRound = (gameState.missions?.length ?? 0) + 1;
      const requirements = getMissionRequirements(missionRound, room.players.length);
      const mission = {
        id: `mission-${missionRound}`,
        round: missionRound,
        requiredPlayers: requirements.requiredPlayers,
        failsRequired: requirements.failsRequired,
        leaderIndex: currentLeaderIndex,
        description: requirements.description,
        specialRules: requirements.specialRules,
      };
      
      return {
        mission,
        players: missionPlayers,
        isLeader: player.id === currentLeader?.id,
        proposedTeam: [], // TODO: Store proposed team in game state
      };
    }),

  // Voting procedures
  submitVote: publicProcedure
    .input(z.object({
      roomId: z.string(),
      playerId: z.string(),
      choice: z.enum(['approve', 'reject']),
    }))
    .mutation(async ({ input, ctx }) => {
      const { roomId, playerId, choice } = input;
      
      // Get room and validate
      const room = await ctx.db.room.findUnique({
        where: { id: roomId },
        include: { players: true },
      });
      
      if (!room) {
        throw new Error("Room not found");
      }
      
      if (room.phase !== 'voting') {
        throw new Error(`Cannot vote in phase: ${room.phase}`);
      }
      
      // Validate player is in room
      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        throw new Error("Player not found");
      }
      
      const gameState = room.gameState as unknown as GameState & {
        votes?: Vote[];
        votingResult?: any;
        rejectionCount?: number;
        lastUpdated?: Date;
      };
      
      // Create or update vote in game state
      const votes = (gameState.votes || []) as Vote[];
      const existingVoteIndex = votes.findIndex(v => v.playerId === playerId);
      
      const newVote: Vote = {
        id: `vote-${playerId}-${Date.now()}`,
        playerId,
        playerName: player.name,
        choice,
        submittedAt: new Date(),
        roundId: `round-${gameState.round || 1}`,
        missionId: `mission-${gameState.round || 1}`,
      };
      
      let updatedVotes: Vote[];
      if (existingVoteIndex >= 0) {
        // Update existing vote
        updatedVotes = votes.map((v, index) => 
          index === existingVoteIndex ? newVote : v
        );
      } else {
        // Add new vote
        updatedVotes = [...votes, newVote];
      }
      
      // Check if all players have voted
      const allPlayersVoted = areAllPlayersVoted(updatedVotes, room.players.length);
      
      let nextPhase = room.phase;
      let votingResult = null;
      
      if (allPlayersVoted) {
        // Calculate voting results
        const currentRejections = gameState.rejectionCount || 0;
        const currentLeaderIndex = gameState.leaderIndex || 0;
        
        votingResult = calculateVotingResults(
          updatedVotes,
          room.players.length,
          currentRejections,
          currentLeaderIndex,
          room.players.length
        );
        
        nextPhase = votingResult.nextPhase;
        
        // Update game state based on results
        const updatedGameState = {
          ...gameState,
          votes: updatedVotes,
          votingResult,
          phase: nextPhase,
          rejectionCount: votingResult.approved ? currentRejections : currentRejections + 1,
          leaderIndex: votingResult.nextLeaderIndex ?? currentLeaderIndex,
          lastUpdated: new Date(),
        };
        
        await ctx.db.room.update({
          where: { id: roomId },
          data: {
            phase: nextPhase,
            gameState: updatedGameState as any,
          },
        });
      } else {
        // Update votes in game state
        const updatedGameState = {
          ...gameState,
          votes: updatedVotes,
          lastUpdated: new Date(),
        };
        
        await ctx.db.room.update({
          where: { id: roomId },
          data: {
            gameState: updatedGameState as any,
          },
        });
      }
      
      return {
        success: true,
        vote: newVote,
        allPlayersVoted,
        result: votingResult,
        nextPhase,
      };
    }),

  getVotingState: publicProcedure
    .input(z.object({
      roomId: z.string(),
      playerId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const { roomId, playerId } = input;
      
      // Get room and validate
      const room = await ctx.db.room.findUnique({
        where: { id: roomId },
        include: { players: true },
      });
      
      if (!room) {
        throw new Error("Room not found");
      }
      
      // Validate player is in room
      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        throw new Error("Player not found");
      }
      
      const gameState = room.gameState as unknown as GameState & {
        votes?: Vote[];
        votingResult?: any;
        rejectionCount?: number;
        lastUpdated?: Date;
      };
      const votes = (gameState.votes || []) as Vote[];
      const rejectionCount = gameState.rejectionCount || 0;
      
      // Get voting progress
      const progress = calculateVotingProgress(
        votes,
        room.players.map(p => ({
          id: p.id,
          name: p.name,
          isOnline: true, // Default to online for now
        }))
      );
      
      // Get rejection tracker
      const rejectionTracker = calculateRejectionTracker(rejectionCount);
      
      // Get current player's vote
      const currentPlayerVote = votes.find(v => v.playerId === playerId);
      
      // Check if player can change vote (simplified - always allow for now)
      const canChangeVote = !gameState.votingResult && room.phase === 'voting';
      
      // Calculate time remaining (simplified - 60 seconds from phase start)
      const phaseStartTime = new Date(gameState.lastUpdated || new Date());
      const deadline = new Date(phaseStartTime.getTime() + 60000); // 60 seconds
      const timeRemaining = Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000));
      
      return {
        session: {
          id: `voting-${gameState.round || 1}`,
          missionId: `mission-${gameState.round || 1}`,
          roundId: `round-${gameState.round || 1}`,
          proposalNumber: rejectionCount + 1,
          status: gameState.votingResult ? 'completed' : 'active',
          votes,
          result: gameState.votingResult,
        },
        progress,
        rejectionTracker,
        currentPlayerVote: currentPlayerVote?.choice as VoteChoice,
        canChangeVote,
        timeRemaining,
        isRevealing: !!gameState.votingResult,
      };
    }),

  /**
   * Submit mission vote
   */
  submitMissionVote: publicProcedure
    .input(z.object({
      roomId: z.string(),
      playerId: z.string(),
      vote: z.enum(['success', 'failure']),
    }))
    .mutation(async ({ input, ctx }) => {
      const { roomId, playerId, vote } = input;
      
      // Get room and validate
      const room = await ctx.db.room.findUnique({
        where: { id: roomId },
        include: { players: true },
      });
      
      if (!room) {
        throw new Error("Room not found");
      }
      
      // Validate player is in room
      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        throw new Error("Player not found");
      }
      
      const gameState = room.gameState as unknown as GameState & {
        selectedTeam?: string[];
        missionVotes?: { playerId: string; vote: 'success' | 'failure'; timestamp: Date }[];
        missionResult?: { outcome: 'success' | 'failure'; votes: { success: number; failure: number }; };
        missionOutcomes?: ('success' | 'failure')[];
        currentMission?: number;
        assignedRoles?: Record<string, string>;
      };
      
      // Validate game is in mission execution phase
      if (room.phase !== 'mission-execution') {
        throw new Error("Room is not in mission execution phase");
      }
      
      // Validate player is on the selected team
      const selectedTeam = gameState.selectedTeam || [];
      if (!selectedTeam.includes(playerId)) {
        throw new Error("You are not on the selected team");
      }
      
      // Validate role constraints (good players can't vote for failure)
      const playerRole = gameState.assignedRoles?.[playerId] as string;
      if (playerRole && !['mordred', 'assassin', 'morgana', 'oberon'].includes(playerRole) && vote === 'failure') {
        throw new Error("Good players cannot vote for mission failure");
      }
      
      // Get existing mission votes
      const missionVotes = gameState.missionVotes || [];
      
      // Check if player has already voted
      const existingVote = missionVotes.find(v => v.playerId === playerId);
      if (existingVote) {
        throw new Error("You have already voted on this mission");
      }
      
      // Add new vote
      const newVote = {
        playerId,
        vote,
        timestamp: new Date(),
      };
      
      const updatedMissionVotes = [...missionVotes, newVote];
      
      // Check if all team members have voted
      const allVoted = selectedTeam.every(teamMemberId => 
        updatedMissionVotes.some(v => v.playerId === teamMemberId)
      );
      
      let missionResult = null;
      let nextPhase = room.phase;
      
      if (allVoted) {
        // Calculate mission result
        const successVotes = updatedMissionVotes.filter(v => v.vote === 'success').length;
        const failureVotes = updatedMissionVotes.filter(v => v.vote === 'failure').length;
        
        // Determine failure requirement (Mission 4 with 7+ players needs 2 fails)
        const currentMission = gameState.currentMission || 1;
        const failVotesRequired = currentMission === 4 && room.players.length >= 7 ? 2 : 1;
        
        const outcome = failureVotes >= failVotesRequired ? 'failure' : 'success';
        
        missionResult = {
          outcome,
          votes: {
            success: successVotes,
            failure: failureVotes,
          },
          failVotesRequired,
        };
        
        // Update mission outcomes array
        const missionOutcomes = gameState.missionOutcomes || [];
        const updatedOutcomes = [...missionOutcomes];
        
        if (updatedOutcomes.length === (currentMission - 1)) {
          updatedOutcomes.push(outcome);
        } else {
          updatedOutcomes[currentMission - 1] = outcome;
        }
        
        // Check if game is over
        const goodWins = updatedOutcomes.filter(o => o === 'success').length;
        const evilWins = updatedOutcomes.filter(o => o === 'failure').length;
        
        if (goodWins >= 3) {
          nextPhase = 'assassin-attempt';
        } else if (evilWins >= 3) {
          nextPhase = 'game-over';
        } else {
          nextPhase = 'mission-selection';
        }
      }
      
      // Update room
      const updatedGameState = {
        ...gameState,
        missionVotes: updatedMissionVotes,
        missionResult,
        missionOutcomes: missionResult ? (gameState.missionOutcomes || []).concat(missionResult.outcome as 'success' | 'failure') : gameState.missionOutcomes,
        lastUpdated: new Date(),
      };
      
      await ctx.db.room.update({
        where: { id: roomId },
        data: {
          gameState: JSON.parse(JSON.stringify(updatedGameState)),
          phase: nextPhase,
        },
      });
      
      return {
        success: true,
        vote: newVote,
        allVoted,
        result: missionResult,
        nextPhase,
      };
    }),

  /**
   * Get mission execution state
   */
  getMissionExecutionState: publicProcedure
    .input(z.object({
      roomId: z.string(),
      playerId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const { roomId, playerId } = input;
      
      // Get room and validate
      const room = await ctx.db.room.findUnique({
        where: { id: roomId },
        include: { players: true },
      });
      
      if (!room) {
        throw new Error("Room not found");
      }
      
      // Validate player is in room
      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        throw new Error("Player not found");
      }
      
      const gameState = room.gameState as unknown as GameState & {
        selectedTeam?: string[];
        missionVotes?: { playerId: string; vote: 'success' | 'failure'; timestamp: Date }[];
        missionResult?: { outcome: 'success' | 'failure'; votes: { success: number; failure: number }; };
        missionOutcomes?: ('success' | 'failure')[];
        currentMission?: number;
        assignedRoles?: Record<string, string>;
      };
      
      const currentMission = gameState.currentMission || 1;
      const selectedTeam = gameState.selectedTeam || [];
      const missionVotes = gameState.missionVotes || [];
      const missionOutcomes = gameState.missionOutcomes || [];
      
      // Calculate wins
      const goodWins = missionOutcomes.filter(o => o === 'success').length;
      const evilWins = missionOutcomes.filter(o => o === 'failure').length;
      
      // Get player role
      const playerRole = gameState.assignedRoles?.[playerId] as string;
      const isEvilRole = playerRole && ['mordred', 'assassin', 'morgana', 'oberon'].includes(playerRole);
      
      // Check if player has voted
      const hasVoted = missionVotes.some(v => v.playerId === playerId);
      const canVote = selectedTeam.includes(playerId) && !hasVoted && !gameState.missionResult;
      
      // Get team members with voting status
      const teamMembers = selectedTeam.map(teamPlayerId => {
        const teamPlayer = room.players.find(p => p.id === teamPlayerId);
        return {
          playerId: teamPlayerId,
          playerName: teamPlayer?.name || 'Unknown',
          hasVoted: missionVotes.some(v => v.playerId === teamPlayerId),
          isCurrentPlayer: teamPlayerId === playerId,
        };
      });
      
      // Calculate voting progress
      const votingProgress = {
        votesSubmitted: missionVotes.length,
        totalVotes: selectedTeam.length,
        percentageComplete: Math.round((missionVotes.length / selectedTeam.length) * 100),
        isComplete: missionVotes.length >= selectedTeam.length,
      };
      
      return {
        missionNumber: currentMission,
        canVote,
        hasVoted,
        isWaiting: hasVoted && !gameState.missionResult,
        showResults: !!gameState.missionResult,
        playerRole: isEvilRole ? 'evil' : 'good',
        teamMembers,
        votingProgress,
        missionResult: gameState.missionResult,
        gameWins: { good: goodWins, evil: evilWins },
        playerCount: room.players.length,
      };
    }),
});
