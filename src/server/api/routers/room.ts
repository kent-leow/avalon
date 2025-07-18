import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createRoomCode, validateRoomCode, generateJoinUrl } from "~/lib/room-code-generator";
import { createSession as createJWTSession } from "~/lib/auth";
import { generateSessionId } from "~/lib/session";
import { validateCharacterConfiguration } from "~/lib/character-validation";
import { getDefaultSettings } from "~/lib/default-settings";
import { assignRoles, validateRoleConfiguration, getVisiblePlayers } from "~/lib/role-assignment";
import { GameStateMachine, canStartGame } from "~/lib/game-state-machine";
import { computeRoleKnowledge } from "~/lib/role-knowledge";
import { getMissionRequirements, validateMissionTeam } from "~/lib/mission-rules";
import { extendRoomOnActivity, validateRoomExpiration } from "~/lib/room-expiration-utils";
import { 
  calculateVotingProgress, 
  calculateRejectionTracker, 
  calculateVotingResults,
  areAllPlayersVoted
} from "~/lib/voting-utils";
import { 
  calculateScoreTracker, 
  createGamePhase, 
  createPlayerActivity, 
  createGameTimer
} from "~/lib/game-progress-utils";
import {
  createHostManagement,
  createHostAction,
  createActivityLog,
  processHostTransfer
} from "~/lib/host-management-utils";
import {
  notifyPlayerJoined,
  notifyPlayerLeft,
  notifyPlayerReadyChanged,
  notifySettingsChanged,
  notifyGameStarted,
  notifyHostTransfer
} from "~/server/sse-events";
import type { GameState, GameSettings } from "~/types/room";
import type { StartRequirement } from "~/types/game-state";
import type { MissionPlayer } from "~/types/mission";
import type { Vote } from "~/types/voting";
import type { GameProgress, PlayerStatus, VoteHistoryEntry } from "~/types/game-progress";
import type { 
  HostManagement, 
  HostAction, 
  HostActionType, 
  PlayerManagement,
  ActivityLog,
  HostTransfer,
  EmergencyType
} from "~/types/host-management";

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

// Host management schemas
const hostActionSchema = z.object({
  roomId: z.string().cuid("Invalid room ID"),
  hostId: z.string().cuid("Invalid host ID"),
  actionType: z.enum([
    'kick_player',
    'mute_player', 
    'warn_player',
    'make_host',
    'pause_game',
    'resume_game',
    'reset_room',
    'end_game',
    'share_room',
    'adjust_timer',
    'enable_spectator',
    'disable_spectator'
  ]),
  targetId: z.string().cuid("Invalid target ID").optional(),
  reason: z.string().max(500, "Reason too long").optional(),
  duration: z.number().positive().optional(),
});

const hostTransferSchema = z.object({
  roomId: z.string().cuid("Invalid room ID"),
  fromHostId: z.string().cuid("Invalid host ID"),
  toPlayerId: z.string().cuid("Invalid player ID"),
  reason: z.string().max(500, "Reason too long").optional(),
});

const hostTransferResponseSchema = z.object({
  roomId: z.string().cuid("Invalid room ID"),
  transferId: z.string().cuid("Invalid transfer ID"),
  playerId: z.string().cuid("Invalid player ID"),
  response: z.enum(['accept', 'reject']),
});

const emergencyProtocolSchema = z.object({
  roomId: z.string().cuid("Invalid room ID"),
  hostId: z.string().cuid("Invalid host ID"),
  type: z.enum([
    'game_breaking_bug',
    'player_dispute',
    'technical_failure',
    'security_breach',
    'host_abandonment',
    'mass_disconnect'
  ]),
  description: z.string().max(1000, "Description too long").optional(),
});

const resolveEmergencySchema = z.object({
  roomId: z.string().cuid("Invalid room ID"),
  hostId: z.string().cuid("Invalid host ID"),
  emergencyId: z.string().cuid("Invalid emergency ID"),
  resolution: z.string().max(1000, "Resolution too long"),
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
      
      // Create JWT session for the host
      try {
        console.log('Creating JWT session for host:', hostPlayer.id, roomCode, hostName);
        await createJWTSession(hostPlayer.id, roomCode, hostName, true);
        console.log('JWT session created successfully for host');
      } catch (error) {
        console.error('Failed to create JWT session for host:', error);
        throw new Error('Failed to create session. Please try again.');
      }
      
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
      
      // Validate room expiration and extend on activity
      try {
        await validateRoomExpiration(ctx.db, room.id);
        await extendRoomOnActivity(ctx.db, room.id);
      } catch (error) {
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
      
      // Create JWT session for the player
      try {
        console.log('Creating JWT session for player:', player.id, roomCode, playerName);
        await createJWTSession(player.id, roomCode, playerName, false);
        console.log('JWT session created successfully for player');
      } catch (error) {
        console.error('Failed to create JWT session for player:', error);
        throw new Error('Failed to create session. Please try again.');
      }
      
      // Emit real-time event for player joined
      await notifyPlayerJoined(room.id, roomCode, player.id, playerName, ctx.db);
      
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
      
      // Validate room expiration and extend if accessing
      try {
        await validateRoomExpiration(ctx.db, room.id);
        await extendRoomOnActivity(ctx.db, room.id);
      } catch (error) {
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
          roomId: p.roomId,
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
      
      // Validate room expiration and extend on activity
      try {
        await validateRoomExpiration(ctx.db, room.id);
        await extendRoomOnActivity(ctx.db, room.id);
      } catch (error) {
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
      
      // Emit real-time event for settings update
      await notifySettingsChanged(
        updatedRoom.id,
        updatedRoom.code,
        updatedRoom.settings,
        'system', // changedBy - we don't have user context here
        ctx.db
      );
      
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
      
      // Validate room expiration and extend on activity
      try {
        await validateRoomExpiration(ctx.db, room.id);
        await extendRoomOnActivity(ctx.db, room.id);
      } catch (error) {
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
      
      // Map character names to role IDs
      const characterToRoleMap: Record<string, string> = {
        'merlin': 'merlin',
        'percival': 'percival',
        'loyal': 'servant',
        'loyal servant': 'servant',
        'loyal servant of arthur': 'servant',
        'servant': 'servant',
        'servant of arthur': 'servant',
        'assassin': 'assassin',
        'morgana': 'morgana',
        'mordred': 'mordred',
        'oberon': 'oberon',
        'minion': 'minion',
        'minion of mordred': 'minion',
      };
      
      // Convert character names to role IDs
      const roleIds = (settings.characters || []).map((char: string) => {
        const lowercaseChar = char.toLowerCase();
        return characterToRoleMap[lowercaseChar] || lowercaseChar;
      });
      
      // If no characters specified, use default configuration
      let finalRoleIds = roleIds;
      if (finalRoleIds.length === 0) {
        const { getStandardRoleConfiguration } = await import("~/lib/role-assignment");
        finalRoleIds = getStandardRoleConfiguration(room.players.length);
      }
      
      const roleValidation = validateRoleConfiguration(room.players.length, finalRoleIds);
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
      
      const roleAssignments = assignRoles(playersForAssignment, finalRoleIds);
      
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
      
      // Emit real-time event for game started
      await notifyGameStarted(result.room.id, room.code, newGameState, ctx.db);
      
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
      
      // Validate room expiration and extend on activity
      try {
        await validateRoomExpiration(ctx.db, room.id);
        await extendRoomOnActivity(ctx.db, room.id);
      } catch (error) {
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
      let roleValidation: { valid: boolean; errors: string[] } = { valid: true, errors: [] };
      try {
        // Ensure settings.characters exists and is valid
        const characters = settings.characters ?? [];
        
        if (characters.length === 0) {
          // Use default role configuration if no characters are set
          const { getStandardRoleConfiguration } = await import("~/lib/role-assignment");
          const defaultCharacters = getStandardRoleConfiguration(room.players.length);
          roleValidation = validateRoleConfiguration(room.players.length, defaultCharacters);
        } else {
          // Convert character names to role IDs if needed
          const roleIds = characters.map((char: string) => {
            // Handle common character name mappings
            const nameToId: Record<string, string> = {
              'loyal': 'servant',
              'loyal servant of arthur': 'servant',
              'loyal servant': 'servant',
              'servant of arthur': 'servant',
              'minion of mordred': 'minion',
            };
            
            const lowercaseChar = char.toLowerCase();
            return nameToId[lowercaseChar] || lowercaseChar;
          });
          
          roleValidation = validateRoleConfiguration(room.players.length, roleIds);
        }
      } catch (error) {
        console.error("Error validating role configuration:", error);
        roleValidation = { 
          valid: false, 
          errors: [`Configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`] 
        };
      }
      
      requirements.push({
        id: 'valid-settings',
        name: 'Valid Game Settings',
        description: roleValidation.valid 
          ? 'Character configuration is valid' 
          : `Issues: ${roleValidation.errors.join(', ')}`,
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
      
      // Validate room expiration and extend on activity
      try {
        await validateRoomExpiration(ctx.db, room.id);
        await extendRoomOnActivity(ctx.db, room.id);
      } catch (error) {
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
      
      // Validate room expiration and extend on activity
      try {
        await validateRoomExpiration(ctx.db, player.room.id);
        await extendRoomOnActivity(ctx.db, player.room.id);
      } catch (error) {
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
      
      // Emit real-time event for ready status change
      await notifyPlayerReadyChanged(
        player.room.code,
        playerId,
        player.name,
        isReady
      );
      
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
   * Kick a player from the room
   */
  kickPlayer: publicProcedure
    .input(z.object({
      roomId: z.string().cuid("Invalid room ID"),
      playerId: z.string().cuid("Invalid player ID"),
    }))
    .mutation(async ({ ctx, input }) => {
      const { roomId, playerId } = input;
      
      // Find the room and player
      const room = await ctx.db.room.findUnique({
        where: { id: roomId },
        include: { players: true },
      });
      
      if (!room) {
        throw new Error("Room not found");
      }
      
      // Validate room expiration and extend on activity
      try {
        await validateRoomExpiration(ctx.db, room.id);
        await extendRoomOnActivity(ctx.db, room.id);
      } catch (error) {
        throw new Error("Room has expired");
      }
      
      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        throw new Error("Player not found in room");
      }
      
      // Check if player is host (can't kick host)
      if (player.isHost) {
        throw new Error("Cannot kick the host");
      }
      
      // Remove player from room
      await ctx.db.player.delete({
        where: { id: playerId },
      });
      
      // Emit real-time event for player leaving
      await notifyPlayerLeft(
        room.id,
        room.code,
        playerId,
        player.name,
        ctx.db
      );
      
      return { success: true };
    }),

  /**
   * Remove the current player from the room
   */
  leaveRoom: publicProcedure
    .input(z.object({
      roomId: z.string().cuid("Invalid room ID"),
      playerId: z.string().cuid("Invalid player ID"),
    }))
    .mutation(async ({ ctx, input }) => {
      const { roomId, playerId } = input;
      
      // Find the room and player
      const room = await ctx.db.room.findUnique({
        where: { id: roomId },
        include: { players: true },
      });
      
      if (!room) {
        throw new Error("Room not found");
      }
      
      // Validate room expiration and extend on activity
      try {
        await validateRoomExpiration(ctx.db, room.id);
        await extendRoomOnActivity(ctx.db, room.id);
      } catch (error) {
        throw new Error("Room has expired");
      }
      
      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        throw new Error("Player not found in room");
      }
      
      // Check if player is the last remaining player
      if (room.players.length === 1) {
        // If this is the last player, delete the entire room
        await ctx.db.room.delete({
          where: { id: roomId },
        });
        
        // Note: Player will be cascade deleted with the room
        return { success: true, roomDeleted: true };
      }
      
      // If player is host and there are other players, transfer host to someone else
      if (player.isHost && room.players.length > 1) {
        const nextHost = room.players.find(p => p.id !== playerId);
        if (nextHost) {
          // Transfer host to the next player
          await ctx.db.player.update({
            where: { id: nextHost.id },
            data: { isHost: true },
          });
          
          // Remove host from leaving player
          await ctx.db.player.update({
            where: { id: playerId },
            data: { isHost: false },
          });
        }
      }
      
      // Remove player from room
      await ctx.db.player.delete({
        where: { id: playerId },
      });
      
      // Emit real-time event for player leaving
      await notifyPlayerLeft(
        room.id,
        room.code,
        playerId,
        player.name,
        ctx.db
      );
      
      return { success: true, roomDeleted: false };
    }),

  /**
   * Transfer host privileges to another player
   */
  transferHost: publicProcedure
    .input(z.object({
      roomId: z.string().cuid("Invalid room ID"),
      newHostId: z.string().cuid("Invalid new host ID"),
    }))
    .mutation(async ({ ctx, input }) => {
      const { roomId, newHostId } = input;
      
      // Find the room and players
      const room = await ctx.db.room.findUnique({
        where: { id: roomId },
        include: { 
          players: true,
        },
      });
      
      if (!room) {
        throw new Error("Room not found");
      }
      
      // Validate room expiration and extend on activity
      try {
        await validateRoomExpiration(ctx.db, room.id);
        await extendRoomOnActivity(ctx.db, room.id);
      } catch (error) {
        throw new Error("Room has expired");
      }
      
      const newHost = room.players.find(p => p.id === newHostId);
      if (!newHost) {
        throw new Error("New host player not found in room");
      }
      
      // Get current host name
      const currentHost = room.players.find(p => p.id === room.hostId);
      
      // Update players in transaction
      await ctx.db.$transaction(async (tx) => {
        // Remove host privileges from all players
        await tx.player.updateMany({
          where: { roomId },
          data: { isHost: false },
        });
        
        // Give host privileges to new host
        await tx.player.update({
          where: { id: newHostId },
          data: { isHost: true },
        });
        
        // Update room hostId
        await tx.room.update({
          where: { id: roomId },
          data: { hostId: newHostId },
        });
      });
      
      // Emit host transfer event to all players in the room
      await notifyHostTransfer(
        roomId,
        room.code,
        room.hostId,
        newHostId,
        currentHost?.name || 'Unknown',
        newHost.name,
        ctx.db
      );
      
      return { success: true };
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
      
      // Get player role data (already parsed as JSON object)
      const playerRoleData = player.roleData as any || {};
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
          team: p.roleData ? ((p.roleData as any).team || 'good') : 'good',
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
        currentPlayerVote: currentPlayerVote?.choice!,
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
      const playerRole = gameState.assignedRoles?.[playerId]!;
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
      const playerRole = gameState.assignedRoles?.[playerId]!;
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

  // Game progress tracking procedures
  getGameProgress: publicProcedure
    .input(z.object({ 
      roomCode: z.string(), 
      playerId: z.string() 
    }))
    .query(async ({ input, ctx }) => {
      const { roomCode, playerId } = input;

      // Get room from database
      const room = await ctx.db.room.findFirst({
        where: { code: roomCode },
        include: { players: true },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      // Verify player is in room
      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        throw new Error("Player not in room");
      }

      const gameState = room.gameState as unknown as GameState;
      if (!gameState?.phase || gameState.phase === 'lobby') {
        throw new Error("Game not in progress");
      }

      // Calculate mission results based on missions in game state
      const missionResults = gameState.missions.map(mission => {
        const successVotes = mission.votes.filter(v => v.vote === 'success').length;
        const failureVotes = mission.votes.filter(v => v.vote === 'failure').length;
        const missionRequirements = getMissionRequirements(room.players.length, mission.round);
        const failVotesRequired = missionRequirements?.failsRequired || 1;
        
        return {
          missionNumber: mission.round,
          outcome: mission.result || 'pending' as 'success' | 'failure' | 'pending',
          teamMembers: mission.teamMembers,
          votes: {
            success: successVotes,
            failure: failureVotes,
          },
          failVotesRequired,
          completedAt: mission.completedAt,
          leader: room.players[gameState.leaderIndex]?.id || '',
        };
      });

      // Calculate score tracker
      const scoreTracker = calculateScoreTracker(missionResults);

      // Create current phase based on game state
      const phaseNames = {
        'lobby': 'Lobby',
        'roleReveal': 'Role Reveal',
        'voting': 'Team Voting',
        'missionSelect': 'Team Selection',
        'missionVote': 'Mission Execution',
        'missionResult': 'Mission Results',
        'assassinAttempt': 'Assassin Phase',
        'gameOver': 'Game Over',
      };

      const currentPhase = createGamePhase(
        gameState.phase,
        gameState.phase,
        gameState.startedAt,
        300000 // 5 minutes
      );

      // Create player statuses
      const playerStatuses: PlayerStatus[] = room.players.map(p => {
        const currentLeader = room.players[gameState.leaderIndex]?.id || '';
        const activityType = gameState.phase === 'missionSelect' ? 'selecting-team' : 
                           gameState.phase === 'voting' ? 'voting' : 
                           gameState.phase === 'missionVote' ? 'mission-voting' : 'waiting';
        
        const activity = createPlayerActivity(
          activityType,
          undefined,
          undefined,
          gameState.phase === 'missionSelect' && p.id === currentLeader
        );

        return {
          playerId: p.id,
          playerName: p.name,
          isLeader: currentLeader === p.id,
          isOnline: true, // TODO: implement real connection tracking
          currentActivity: activity,
          lastSeen: new Date(),
          isCurrentPlayer: p.id === playerId,
        };
      });

      // Create game timer
      const gameTimer = createGameTimer(
        300000, // 5 minutes total
        180000, // 3 minutes remaining
        'Team Selection',
        true
      );

      // Create phase history (mock data for now)
      const phaseHistory = [
        {
          phase: 'Game Start',
          timestamp: gameState.startedAt || new Date(),
          duration: 60000,
          outcome: 'completed',
          participants: room.players.map(p => p.id),
          details: { roles: 'assigned' },
        },
      ];

      const gameProgress: GameProgress = {
        currentRound: gameState.round,
        totalRounds: 5,
        currentPhase,
        currentLeader: room.players[gameState.leaderIndex]?.id || '',
        missionResults,
        scoreTracker,
        playerStatuses,
        gameTimer,
        phaseHistory,
      };

      return gameProgress;
    }),

  getVoteHistory: publicProcedure
    .input(z.object({ 
      roomCode: z.string(), 
      playerId: z.string() 
    }))
    .query(async ({ input, ctx }) => {
      const { roomCode, playerId } = input;

      // Get room from database
      const room = await ctx.db.room.findFirst({
        where: { code: roomCode },
        include: { players: true },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      // Verify player is in room
      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        throw new Error("Player not in room");
      }

      const gameState = room.gameState as unknown as GameState;
      if (!gameState?.phase || gameState.phase === 'lobby') {
        return []; // No history if game not started
      }

      // Create mock vote history using actual vote data
      const voteHistory: VoteHistoryEntry[] = [
        {
          round: gameState.round,
          voteType: 'team-proposal',
          timestamp: new Date(Date.now() - 120000),
          result: 'approved',
          votes: room.players.map(p => ({
            playerId: p.id,
            playerName: p.name,
            vote: Math.random() > 0.5 ? 'approve' : 'reject',
            isRevealed: true,
          })),
          proposedTeam: gameState.missions[0]?.teamMembers || [],
        },
      ];

      return voteHistory;
    }),

  updatePlayerActivity: publicProcedure
    .input(z.object({
      roomCode: z.string(),
      playerId: z.string(),
      activity: z.object({
        type: z.enum(['waiting', 'selecting-team', 'voting', 'mission-voting', 'idle']),
        description: z.string(),
        progress: z.number().optional(),
        timeRemaining: z.number().optional(),
        isBlocked: z.boolean(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const { roomCode, playerId, activity } = input;

      // Get room from database
      const room = await ctx.db.room.findFirst({
        where: { code: roomCode },
        include: { players: true },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      // Verify player is in room
      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        throw new Error("Player not in room");
      }

      const gameState = room.gameState as unknown as GameState;
      if (!gameState?.phase || gameState.phase === 'lobby') {
        throw new Error("Game not in progress");
      }

      // For now, just return success without persisting player activities
      // In a real implementation, we would extend the GameState to include playerActivities
      return { success: true };
    }),

  // Assassin Attempt Procedures
  getAssassinAttemptData: publicProcedure
    .input(z.object({
      roomCode: z.string(),
      playerId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const { roomCode, playerId } = input;

      // Get room from database
      const room = await ctx.db.room.findFirst({
        where: { code: roomCode },
        include: { players: true },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      const gameState = room.gameState as unknown as GameState;
      if (!gameState?.phase || gameState.phase !== 'assassinAttempt') {
        throw new Error("Game not in assassination phase");
      }

      // Verify player is the assassin
      const player = room.players.find(p => p.id === playerId);
      if (!player || player.role !== 'assassin') {
        throw new Error("Only the assassin can access this data");
      }

      // Get all players except the assassin as targets
      const targets = room.players
        .filter(p => p.id !== playerId)
        .map(p => ({
          id: p.id,
          name: p.name,
          avatar: '👤', // Default avatar since avatar doesn't exist in schema
          actualRole: p.role || 'unknown',
          isMerlin: p.role === 'merlin',
        }));

      // Generate mock strategic information
      // In a real implementation, this would be computed from game history
      const strategicInfo = {
        missionTimeline: gameState.missions?.map((mission, index) => ({
          missionNumber: index + 1,
          result: mission.result || 'pending',
          teamMembers: mission.teamMembers || [],
          voteResults: [], // Would be populated from actual vote data
          keyEvents: [`Mission ${index + 1} ${mission.result || 'pending'}`],
        })) || [],
        votingPatterns: targets.map(target => ({
          playerId: target.id,
          consistency: 0.7,
          approvalTendency: 0.6,
          goodAlignment: target.isMerlin ? 0.9 : 0.5,
        })),
        teamCompositions: [],
        behavioralInsights: [],
        merlinClues: targets.filter(t => t.isMerlin).map(target => ({
          type: 'voting-knowledge' as const,
          description: 'Showed strategic voting patterns',
          suspectedPlayers: [target.id],
          confidence: 0.8,
          evidence: ['Consistent strategic voting', 'Subtle team guidance'],
        })),
      };

      return {
        assassin: {
          id: player.id,
          name: player.name,
          avatar: '🗡️', // Default avatar since avatar doesn't exist in schema
          role: 'assassin' as const,
          hasDecided: false,
        },
        targets,
        strategicInfo,
        gameContext: {
          round: gameState.round || 1,
          missionResults: gameState.missions?.map(m => m.result).filter(Boolean) || [],
          goodWins: gameState.missions?.filter(m => m.result === 'success').length || 0,
          evilWins: gameState.missions?.filter(m => m.result === 'failure').length || 0,
          totalPlayers: room.players.length,
          gameDuration: Date.now() - (room.createdAt?.getTime() || 0),
          currentLeader: room.hostId, // Use hostId as fallback
        },
      };
    }),

  submitAssassinAttempt: publicProcedure
    .input(z.object({
      roomCode: z.string(),
      playerId: z.string(),
      targetId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { roomCode, playerId, targetId } = input;

      // Get room from database
      const room = await ctx.db.room.findFirst({
        where: { code: roomCode },
        include: { players: true },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      const gameState = room.gameState as unknown as GameState;
      if (!gameState?.phase || gameState.phase !== 'assassinAttempt') {
        throw new Error("Game not in assassination phase");
      }

      // Verify player is the assassin
      const assassin = room.players.find(p => p.id === playerId);
      if (!assassin || assassin.role !== 'assassin') {
        throw new Error("Only the assassin can make this attempt");
      }

      // Verify target is valid
      const target = room.players.find(p => p.id === targetId);
      if (!target || target.id === playerId) {
        throw new Error("Invalid target selected");
      }

      // Process assassination attempt
      const wasCorrect = target.role === 'merlin';
      const gameOutcome = wasCorrect ? 'evil-wins' : 'good-wins';

      // Update game state
      const updatedGameState: GameState = {
        ...gameState,
        phase: 'gameOver',
        assassinAttempt: {
          assassinId: playerId,
          targetId,
          wasCorrect,
          gameOutcome,
          timestamp: new Date(),
        } as any,
      };

      // Update room in database
      await ctx.db.room.update({
        where: { id: room.id },
        data: {
          gameState: updatedGameState as any,
          updatedAt: new Date(),
        },
      });

      return {
        targetId,
        wasCorrect,
        gameOutcome,
        timestamp: new Date(),
        decisionDuration: 0, // Would be calculated from start time
        revealSequence: {
          stages: [
            {
              type: 'pause',
              duration: 3000,
              description: 'Dramatic pause before reveal',
              effects: ['heartbeat', 'screen-darken'],
              isActive: true,
            },
            {
              type: 'target-reveal',
              duration: 2000,
              description: 'Reveal selected target',
              effects: ['spotlight', 'target-highlight'],
              isActive: false,
            },
            {
              type: 'role-reveal',
              duration: 2000,
              description: 'Reveal target\'s true role',
              effects: ['card-flip', 'role-glow'],
              isActive: false,
            },
            {
              type: 'outcome-reveal',
              duration: 2000,
              description: 'Reveal game outcome',
              effects: ['outcome-flash', 'dramatic-text'],
              isActive: false,
            },
            {
              type: 'celebration',
              duration: 2000,
              description: wasCorrect ? 'Evil team celebration' : 'Good team celebration',
              effects: wasCorrect ? ['dark-victory', 'evil-laugh'] : ['holy-light', 'good-cheer'],
              isActive: false,
            },
          ],
          currentStage: 0,
          isComplete: false,
          duration: 11000,
        },
      };
    }),

  /**
   * Get game results for a completed game
   */
  getGameResults: publicProcedure
    .input(z.object({
      roomCode: z.string().min(1, "Room code is required"),
      gameId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { roomCode } = input;
      
      // Get room from database
      const room = await ctx.db.room.findFirst({
        where: { code: roomCode },
        include: { players: true },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      const gameState = room.gameState as unknown as GameState;
      if (!gameState?.phase || gameState.phase !== 'gameOver') {
        throw new Error("Game is not completed yet");
      }

      // Mock game results for now - in real implementation, this would be calculated
      // from the actual game data stored in the database
      const gameResults: any = {
        outcome: {
          winner: gameState.assassinAttempt?.success ? 'evil' : 'good',
          winCondition: gameState.assassinAttempt?.success ? 'assassin-success' : 'assassin-failure',
          description: gameState.assassinAttempt?.success 
            ? 'Evil triumphs! The assassin successfully eliminated Merlin.'
            : 'Good triumphs! The assassin failed to identify Merlin.',
          keyMoments: [],
          margin: 'close',
          finalScore: {
            goodPoints: gameState.assassinAttempt?.success ? 0 : 3,
            evilPoints: gameState.assassinAttempt?.success ? 3 : 0,
            bonusPoints: {},
            breakdown: {
              missionPoints: 3,
              rolePoints: 0,
              votingPoints: 0,
              bonusPoints: 0,
            },
          },
        },
        playerRoles: room.players.map(player => ({
          playerId: player.id,
          playerName: player.name,
          avatar: '🎭', // Default avatar since player doesn't have avatar field
          role: player.role || 'loyal-servant',
          team: ['merlin', 'percival', 'loyal-servant'].includes(player.role || '') ? 'good' : 'evil',
          description: `Player role: ${player.role}`,
          roleData: {},
          rolePerformance: {
            effectiveness: Math.floor(Math.random() * 40) + 60, // 60-100
            metrics: {},
            achievements: [],
            mistakes: [],
          },
          survivalStatus: 'alive',
          performance: 'good',
        })),
        gameSummary: {
          duration: 1200,
          totalRounds: 8,
          missionResults: [],
          voteRounds: [],
          assassinAttempt: gameState.assassinAttempt ? {
            assassin: gameState.assassinAttempt.assassinId,
            target: gameState.assassinAttempt.targetId,
            wasCorrect: gameState.assassinAttempt.success,
            decisionTime: 45,
            finalOutcome: gameState.assassinAttempt.success ? 'evil-wins' : 'good-wins',
          } : undefined,
          criticalEvents: [],
          phaseTimeline: [],
        },
        voteHistory: [],
        teamCompositions: [],
        statistics: {
          overall: {
            totalVotes: 0,
            totalMissions: 0,
            averageMissionDuration: 0,
            approvalRate: 0,
            missionSuccessRate: 0,
          },
          teamPerformance: {
            goodTeam: {
              size: 0,
              winRate: 0,
              averagePerformance: 0,
              strengths: [],
              weaknesses: [],
            },
            evilTeam: {
              size: 0,
              winRate: 0,
              averagePerformance: 0,
              strengths: [],
              weaknesses: [],
            },
            comparison: {
              performanceDifference: 0,
              strategyComparison: '',
              keyDifferentiators: [],
            },
          },
          votingStats: {
            totalRounds: 0,
            averageVotesPerRound: 0,
            rejectionRate: 0,
            patterns: [],
          },
          missionStats: {
            successRate: 0,
            averageTeamSize: 0,
            mostSuccessfulPlayers: [],
            difficultyRatings: [],
          },
          deceptionMetrics: {
            successfulDeceptions: 0,
            failedDeceptions: 0,
            deceptionSuccessRate: 0,
            topDeceivers: [],
          },
          strategicInsights: [],
        },
        playerPerformance: [],
        achievements: [],
        gameMetadata: {
          gameId: room.id,
          roomCode: room.code,
          startTime: room.startedAt || new Date(),
          endTime: new Date(),
          playerCount: room.players.length,
          settings: room.settings,
          version: '1.0.0',
          shareToken: room.code,
        },
      };

      return gameResults;
    }),

  /**
   * Reset game to lobby state
   */
  resetGame: publicProcedure
    .input(z.object({
      roomCode: z.string().min(1, "Room code is required"),
    }))
    .mutation(async ({ ctx, input }) => {
      const { roomCode } = input;
      
      // Get room from database
      const room = await ctx.db.room.findFirst({
        where: { code: roomCode },
        include: { players: true },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      // Reset game state
      const resetGameState: GameState = {
        phase: 'lobby',
        round: 0,
        leaderIndex: 0,
        startedAt: undefined,
        votes: [],
        missions: [],
        assassinAttempt: undefined,
      };

      // Update room and reset players
      await ctx.db.$transaction(async (tx) => {
        // Update room
        await tx.room.update({
          where: { id: room.id },
          data: {
            gameState: resetGameState as any,
            phase: 'lobby',
            startedAt: null,
            updatedAt: new Date(),
          },
        });

        // Reset all players
        await Promise.all(
          room.players.map(player =>
            tx.player.update({
              where: { id: player.id },
              data: {
                role: null,
                roleData: undefined,
                isReady: false,
              },
            })
          )
        );
      });

      return {
        success: true,
        message: "Game reset successfully",
        gameState: resetGameState,
      };
    }),

  /**
   * Return to lobby (same as reset but with different messaging)
   */
  returnToLobby: publicProcedure
    .input(z.object({
      roomCode: z.string().min(1, "Room code is required"),
    }))
    .mutation(async ({ ctx, input }) => {
      const { roomCode } = input;
      
      // Get room from database
      const room = await ctx.db.room.findFirst({
        where: { code: roomCode },
        include: { players: true },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      // Reset game state (same as resetGame)
      const resetGameState: GameState = {
        phase: 'lobby',
        round: 0,
        leaderIndex: 0,
        startedAt: undefined,
        votes: [],
        missions: [],
        assassinAttempt: undefined,
      };

      // Update room and reset players
      await ctx.db.$transaction(async (tx) => {
        // Update room
        await tx.room.update({
          where: { id: room.id },
          data: {
            gameState: resetGameState as any,
            phase: 'lobby',
            startedAt: null,
            updatedAt: new Date(),
          },
        });

        // Reset all players
        await Promise.all(
          room.players.map(player =>
            tx.player.update({
              where: { id: player.id },
              data: {
                role: null,
                roleData: undefined,
                isReady: false,
              },
            })
          )
        );
      });

      return {
        success: true,
        message: "Returned to lobby successfully",
        gameState: resetGameState,
      };
    }),

  /**
   * Get host management data
   */
  getHostManagement: publicProcedure
    .input(z.object({
      roomId: z.string().cuid("Invalid room ID"),
      hostId: z.string().cuid("Invalid host ID"),
    }))
    .query(async ({ ctx, input }) => {
      const { roomId, hostId } = input;
      
      // Get room and validate host
      const room = await ctx.db.room.findFirst({
        where: { id: roomId },
        include: { players: true },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      const host = room.players.find(p => p.id === hostId);
      if (!host) {
        throw new Error("Host not found");
      }

      // Create host management data
      const hostManagement = createHostManagement(
        room.id,
        host.id,
        host.name,
        undefined // avatar not implemented yet
      );

      // Get player management data
      const playerManagement: PlayerManagement[] = room.players.map(player => ({
        playerId: player.id,
        playerName: player.name,
        playerAvatar: undefined, // avatar not implemented yet
        connectionStatus: 'connected' as const, // simplified for now
        behavior: {
          score: 100, // Default score
          reports: [],
          infractions: [],
          commendations: [],
          riskLevel: 'low' as const,
        },
        actions: [],
        canKick: player.id !== hostId,
        canMute: player.id !== hostId,
        canMakeHost: player.id !== hostId,
        isMuted: false,
        warningCount: 0,
        joinTime: player.joinedAt,
        lastActivity: new Date(), // simplified for now
      }));

      const roomSettings = room.settings as any || {};

      return {
        hostManagement,
        playerManagement,
        roomSettings: {
          roomCode: room.code,
          maxPlayers: roomSettings.playerCount || 10,
          currentPlayers: room.players.length,
          isPublic: false,
          allowSpectators: roomSettings.allowSpectators || false,
          spectatorCount: 0,
          maxSpectators: 5,
          timeLimit: {
            enabled: false,
            phaseLimits: {},
            globalLimit: 60,
            warningThreshold: 10,
            autoExtend: false,
          },
          autoCleanup: {
            enabled: true,
            idleTimeout: 60,
            warningInterval: 5,
            lastActivity: new Date(),
            cleanupScheduled: false,
            cleanupTime: hostManagement.autoCleanupTime,
          },
          moderationLevel: 'standard' as const,
          roomExpiry: room.expiresAt,
        },
      };
    }),

  /**
   * Execute host action
   */
  executeHostAction: publicProcedure
    .input(hostActionSchema)
    .mutation(async ({ ctx, input }) => {
      const { roomId, hostId, actionType, targetId, reason, duration } = input;
      
      // Get room and validate host
      const room = await ctx.db.room.findFirst({
        where: { id: roomId },
        include: { players: true },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      const host = room.players.find(p => p.id === hostId);
      if (!host) {
        throw new Error("Host not found");
      }

      // Create host action
      const action = createHostAction(actionType, hostId, targetId, {
        reason,
        duration,
      });

      // Execute action based on type
      switch (actionType) {
        case 'kick_player':
          if (!targetId) throw new Error("Target player required");
          
          // Remove player from room
          await ctx.db.player.delete({
            where: { id: targetId },
          });
          
          // Log action
          const kickLog = createActivityLog(
            'host_action',
            hostId,
            host.name,
            `Kicked player from room`,
            { reason },
            targetId
          );
          
          break;

        case 'mute_player':
          if (!targetId) throw new Error("Target player required");
          
          // In a real implementation, this would update player status
          // For now, we'll just log the action
          const muteLog = createActivityLog(
            'host_action',
            hostId,
            host.name,
            `Muted player for ${duration || 300} seconds`,
            { reason, duration },
            targetId
          );
          
          break;

        case 'pause_game':
          // Update game state to paused
          const currentState = room.gameState as unknown as GameState;
          await ctx.db.room.update({
            where: { id: roomId },
            data: {
              gameState: {
                ...currentState,
                isPaused: true,
                pausedAt: new Date(),
              } as any,
            },
          });
          
          break;

        case 'resume_game':
          // Update game state to resumed
          const pausedState = room.gameState as unknown as GameState;
          await ctx.db.room.update({
            where: { id: roomId },
            data: {
              gameState: {
                ...pausedState,
                isPaused: false,
                pausedAt: undefined,
              } as any,
            },
          });
          
          break;

        case 'reset_room':
          // Reset room to lobby state
          const resetState: GameState = {
            phase: 'lobby',
            round: 0,
            leaderIndex: 0,
            votes: [],
            missions: [],
          };
          
          await ctx.db.$transaction(async (tx) => {
            await tx.room.update({
              where: { id: roomId },
              data: {
                gameState: resetState as any,
                phase: 'lobby',
                startedAt: null,
              },
            });
            
            // Reset all players
            await Promise.all(
              room.players.map(player =>
                tx.player.update({
                  where: { id: player.id },
                  data: {
                    role: null,
                    roleData: undefined,
                    isReady: false,
                  },
                })
              )
            );
          });
          
          break;

        case 'end_game':
          // Set game to ended state
          const endState: GameState = {
            phase: 'gameOver',
            round: 0,
            leaderIndex: 0,
            votes: [],
            missions: [],
          };
          
          await ctx.db.room.update({
            where: { id: roomId },
            data: {
              gameState: endState as any,
              phase: 'gameOver',
            },
          });
          
          break;

        default:
          // For other actions, just log them
          const actionLog = createActivityLog(
            'host_action',
            hostId,
            host.name,
            `Executed ${actionType}`,
            { reason },
            targetId
          );
          break;
      }

      return {
        success: true,
        action,
        message: `Successfully executed ${actionType}`,
      };
    }),

  /**
   * Initiate host transfer
   */
  initiateHostTransfer: publicProcedure
    .input(hostTransferSchema)
    .mutation(async ({ ctx, input }) => {
      const { roomId, fromHostId, toPlayerId, reason } = input;
      
      // Get room and validate participants
      const room = await ctx.db.room.findFirst({
        where: { id: roomId },
        include: { players: true },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      const fromHost = room.players.find(p => p.id === fromHostId);
      const toPlayer = room.players.find(p => p.id === toPlayerId);
      
      if (!fromHost || !toPlayer) {
        throw new Error("Host or target player not found");
      }

      // Create transfer request
      const transfer = processHostTransfer(fromHostId, toPlayerId, reason);
      
      // In a real implementation, this would be stored in the database
      // For now, we'll return the transfer object
      
      return {
        success: true,
        transfer,
        message: "Host transfer initiated",
      };
    }),

  /**
   * Respond to host transfer
   */
  respondToHostTransfer: publicProcedure
    .input(hostTransferResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const { roomId, transferId, playerId, response } = input;
      
      // Get room and validate player
      const room = await ctx.db.room.findFirst({
        where: { id: roomId },
        include: { players: true },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        throw new Error("Player not found");
      }

      // In a real implementation, this would update the transfer in the database
      // For now, we'll simulate the response
      
      if (response === 'accept') {
        // Transfer host privileges
        // This would involve updating the room's host field
        // and notifying all players
        
        return {
          success: true,
          message: "Host transfer accepted",
          newHostId: playerId,
        };
      } else {
        return {
          success: true,
          message: "Host transfer rejected",
        };
      }
    }),

  /**
   * Trigger emergency protocol
   */
  triggerEmergencyProtocol: publicProcedure
    .input(emergencyProtocolSchema)
    .mutation(async ({ ctx, input }) => {
      const { roomId, hostId, type, description } = input;
      
      // Get room and validate host
      const room = await ctx.db.room.findFirst({
        where: { id: roomId },
        include: { players: true },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      const host = room.players.find(p => p.id === hostId);
      if (!host) {
        throw new Error("Host not found");
      }

      // Create emergency state
      const emergencyState = {
        active: true,
        type,
        triggered: new Date(),
        description: description || `${type.replace('_', ' ')} emergency triggered`,
        autoActions: ['pause_game' as HostActionType],
        manualActions: ['reset_room' as HostActionType, 'end_game' as HostActionType],
        resolved: false,
      };

      // Auto-pause game if not already paused
      const currentState = room.gameState as unknown as GameState & { isPaused?: boolean };
      if (!currentState.isPaused) {
        await ctx.db.room.update({
          where: { id: roomId },
          data: {
            gameState: {
              ...currentState,
              isPaused: true,
              pausedAt: new Date(),
              emergency: emergencyState,
            } as any,
          },
        });
      }

      // Log emergency
      const emergencyLog = createActivityLog(
        'security_event',
        hostId,
        host.name,
        `Triggered ${type} emergency protocol`,
        { description },
      );

      return {
        success: true,
        emergencyState,
        message: `Emergency protocol ${type} activated`,
      };
    }),

  /**
   * Resolve emergency
   */
  resolveEmergency: publicProcedure
    .input(resolveEmergencySchema)
    .mutation(async ({ ctx, input }) => {
      const { roomId, hostId, emergencyId, resolution } = input;
      
      // Get room and validate host
      const room = await ctx.db.room.findFirst({
        where: { id: roomId },
        include: { players: true },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      const host = room.players.find(p => p.id === hostId);
      if (!host) {
        throw new Error("Host not found");
      }

      // Update emergency state
      const currentState = room.gameState as unknown as GameState & { emergency?: any };
      if (currentState.emergency) {
        await ctx.db.room.update({
          where: { id: roomId },
          data: {
            gameState: {
              ...currentState,
              emergency: {
                ...currentState.emergency,
                active: false,
                resolved: true,
                resolution,
                resolvedAt: new Date(),
              },
            } as any,
          },
        });
      }

      // Log resolution
      const resolutionLog = createActivityLog(
        'security_event',
        hostId,
        host.name,
        `Resolved emergency: ${resolution}`,
        { resolution },
      );

      return {
        success: true,
        message: "Emergency resolved successfully",
      };
    }),

  /**
   * Get activity log
   */
  getActivityLog: publicProcedure
    .input(z.object({
      roomId: z.string().cuid("Invalid room ID"),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { roomId, limit = 50, offset = 0 } = input;
      
      // Get room
      const room = await ctx.db.room.findFirst({
        where: { id: roomId },
        include: { players: true },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      // In a real implementation, this would fetch from a dedicated activity log table
      // For now, we'll return mock data
      const mockLogs: ActivityLog[] = [
        createActivityLog(
          'player_event',
          'player_001',
          'Alice',
          'Joined the room',
          {},
        ),
        createActivityLog(
          'game_event',
          'system',
          'System',
          'Game started',
          {},
        ),
        createActivityLog(
          'host_action',
          'host_001',
          'Host',
          'Updated room settings',
          {},
        ),
      ];

      return {
        logs: mockLogs.slice(offset, offset + limit),
        totalCount: mockLogs.length,
        hasMore: offset + limit < mockLogs.length,
      };
    }),
});
