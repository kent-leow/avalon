/**
 * tRPC Subscriptions Router
 * SSE-based real-time subscriptions for room events
 */

import { z } from "zod";
import { observable } from "@trpc/server/observable";
import { createTRPCRouter, publicSubscription } from "~/server/api/trpc";
import { 
  subscribeToRoom, 
  unsubscribeFromRoom,
  emitRoomEvent,
  emitPlayerEvent,
} from "~/server/sse-events";
import { generateSessionId } from "~/lib/session";
import type { RealTimeEvent } from "~/types/real-time-sync";

export const subscriptionsRouter = createTRPCRouter({
  /**
   * Subscribe to room events
   */
  subscribeToRoom: publicSubscription
    .input(z.object({
      roomCode: z.string().length(8),
      playerId: z.string(),
      playerName: z.string(),
    }))
    .subscription(({ input, ctx }) => {
      const { roomCode, playerId, playerName } = input;
      const sessionId = generateSessionId();

      return observable<RealTimeEvent>((emit) => {
        console.log(`[Subscription] Player ${playerName} (${playerId}) subscribing to room ${roomCode}`);

        // Subscribe to room events
        subscribeToRoom(roomCode, playerId, sessionId);

        // Set up event listener
        const eventKey = `room:${roomCode}:${sessionId}`;
        
        const eventHandler = (event: RealTimeEvent) => {
          emit.next(event);
        };

        ctx.eventEmitter.on(eventKey, eventHandler);

        // Fetch and send initial room state
        (async () => {
          try {
            // Get current room state from database
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
              console.error(`[Subscription] Room ${roomCode} not found`);
              emit.error(new Error(`Room ${roomCode} not found`));
              return;
            }

            // Send initial room state sync
            emit.next({
              id: `room-sync-${Date.now()}`,
              type: 'room_state_sync',
              payload: {
                room: {
                  id: room.id,
                  roomCode: room.code,
                  phase: room.phase,
                  players: room.players.map(p => ({
                    id: p.id,
                    name: p.name,
                    isHost: p.isHost,
                    isReady: p.isReady,
                    isOnline: true, // Assume online for now
                  })),
                  settings: room.settings,
                  gameState: room.gameState,
                },
              },
              timestamp: new Date(),
              playerId,
              roomCode,
              version: 1,
            });
          } catch (error) {
            console.error(`[Subscription] Failed to fetch initial room state for ${roomCode}:`, error);
            emit.error(error);
          }
        })();

        // Emit initial connection event
        emitRoomEvent(roomCode, 'player_connected', {
          playerId,
          playerName,
          timestamp: new Date(),
        }, playerId);

        // Cleanup function
        return () => {
          console.log(`[Subscription] Player ${playerName} (${playerId}) unsubscribing from room ${roomCode}`);
          
          // Remove event listener
          ctx.eventEmitter.off(eventKey, eventHandler);
          
          // Unsubscribe from room
          unsubscribeFromRoom(sessionId);

          // Emit disconnection event
          emitRoomEvent(roomCode, 'player_disconnected', {
            playerId,
            playerName,
            timestamp: new Date(),
          }, playerId);
        };
      });
    }),

  /**
   * Send real-time event to room
   */
  sendRoomEvent: publicSubscription
    .input(z.object({
      roomCode: z.string().length(8),
      playerId: z.string(),
      eventType: z.enum([
        'player_ready_changed',
        'vote_cast', 
        'mission_team_selected',
        'game_phase_changed',
        'settings_changed',
        'player_activity',
      ]),
      payload: z.any(),
    }))
    .subscription(({ input }) => {
      const { roomCode, playerId, eventType, payload } = input;

      return observable<{ success: boolean }>((emit) => {
        try {
          // Emit the event to all room subscribers
          emitRoomEvent(roomCode, eventType, payload, playerId);
          
          emit.next({ success: true });
          emit.complete();
        } catch (error) {
          emit.error(error);
        }

        return () => {
          // Cleanup if needed
        };
      });
    }),

  /**
   * Send real-time event to specific player
   */
  sendPlayerEvent: publicSubscription
    .input(z.object({
      targetPlayerId: z.string(),
      roomCode: z.string().length(8),
      senderId: z.string(),
      eventType: z.enum([
        'private_message',
        'role_reveal',
        'mission_result',
        'vote_result',
      ]),
      payload: z.any(),
    }))
    .subscription(({ input }) => {
      const { targetPlayerId, roomCode, senderId, eventType, payload } = input;

      return observable<{ success: boolean }>((emit) => {
        try {
          // Emit the event to the target player
          emitPlayerEvent(targetPlayerId, roomCode, eventType, payload);
          
          emit.next({ success: true });
          emit.complete();
        } catch (error) {
          emit.error(error);
        }

        return () => {
          // Cleanup if needed
        };
      });
    }),

  /**
   * Get room connection info
   */
  getRoomConnectionInfo: publicSubscription
    .input(z.object({
      roomCode: z.string().length(8),
    }))
    .subscription(({ input, ctx }) => {
      const { roomCode } = input;

      return observable<{ 
        onlineCount: number; 
        onlinePlayerIds: string[];
        timestamp: Date;
      }>((emit) => {
        const intervalId = setInterval(() => {
          // This would be implemented using the SSE events system
          // For now, return mock data
          emit.next({
            onlineCount: 0,
            onlinePlayerIds: [],
            timestamp: new Date(),
          });
        }, 5000);

        return () => {
          clearInterval(intervalId);
        };
      });
    }),
});
