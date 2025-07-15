import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createRoomCode, validateRoomCode, generateJoinUrl } from "~/lib/room-code-generator";
import { generateSessionId } from "~/lib/session";
import { validateCharacterConfiguration } from "~/lib/character-validation";
import { getDefaultSettings } from "~/lib/default-settings";
import type { GameState, GameSettings } from "~/types/room";

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
});
