/**
 * SSE-based Real-time Event System for tRPC Subscriptions
 * Replaces WebSocket-based Socket.IO for Vercel compatibility
 */

import { eventEmitter } from '~/server/api/trpc';
import type { PrismaClient } from '@prisma/client';
import type { GameState } from '~/types/game-state';
import { createRealTimeEvent } from '~/lib/real-time-sync-utils';
import type { RealTimeEvent, RealTimeEventType } from '~/types/real-time-sync';

// Room subscription management
const roomSubscriptions = new Map<string, Set<string>>();
const playerSubscriptions = new Map<string, { roomCode: string; playerId: string; sessionId: string }>();

/**
 * Subscribe a player to room events
 */
export function subscribeToRoom(roomCode: string, playerId: string, sessionId: string): void {
  // Add to room subscriptions
  if (!roomSubscriptions.has(roomCode)) {
    roomSubscriptions.set(roomCode, new Set());
  }
  roomSubscriptions.get(roomCode)!.add(sessionId);

  // Track player subscription
  playerSubscriptions.set(sessionId, { roomCode, playerId, sessionId });

  console.log(`[SSE] Player ${playerId} subscribed to room ${roomCode} with session ${sessionId}`);
}

/**
 * Unsubscribe a player from room events
 */
export function unsubscribeFromRoom(sessionId: string): void {
  const subscription = playerSubscriptions.get(sessionId);
  if (!subscription) return;

  const { roomCode } = subscription;
  
  // Remove from room subscriptions
  const roomSubs = roomSubscriptions.get(roomCode);
  if (roomSubs) {
    roomSubs.delete(sessionId);
    if (roomSubs.size === 0) {
      roomSubscriptions.delete(roomCode);
    }
  }

  // Remove player subscription
  playerSubscriptions.delete(sessionId);

  console.log(`[SSE] Session ${sessionId} unsubscribed from room ${roomCode}`);
}

/**
 * Get all active subscribers for a room
 */
export function getRoomSubscribers(roomCode: string): string[] {
  const subscribers = roomSubscriptions.get(roomCode);
  return subscribers ? Array.from(subscribers) : [];
}

/**
 * Get online players in a room
 */
export function getOnlinePlayersInRoom(roomCode: string): string[] {
  const subscribers = getRoomSubscribers(roomCode);
  return subscribers
    .map(sessionId => playerSubscriptions.get(sessionId)?.playerId)
    .filter(Boolean) as string[];
}

/**
 * Emit a real-time event to a specific room
 */
export function emitRoomEvent(
  roomCode: string,
  eventType: RealTimeEventType,
  payload: any,
  playerId?: string
): void {
  const event = createRealTimeEvent(
    eventType,
    payload,
    playerId || 'system',
    roomCode
  );

  // Emit to all subscribers of the room
  const subscribers = getRoomSubscribers(roomCode);
  subscribers.forEach(sessionId => {
    eventEmitter.emit(`room:${roomCode}:${sessionId}`, event);
  });

  console.log(`[SSE] Emitted ${eventType} to room ${roomCode} (${subscribers.length} subscribers)`);
}

/**
 * Emit a real-time event to a specific player
 */
export function emitPlayerEvent(
  playerId: string,
  roomCode: string,
  eventType: RealTimeEventType,
  payload: any
): void {
  const event = createRealTimeEvent(
    eventType,
    payload,
    playerId,
    roomCode
  );

  // Find the player's session and emit
  const playerSession = Array.from(playerSubscriptions.entries())
    .find(([_, sub]) => sub.playerId === playerId && sub.roomCode === roomCode);

  if (playerSession) {
    const [sessionId] = playerSession;
    eventEmitter.emit(`room:${roomCode}:${sessionId}`, event);
    console.log(`[SSE] Emitted ${eventType} to player ${playerId} in room ${roomCode}`);
  }
}

/**
 * Get room state and emit it to all connected players
 */
export async function syncRoomState(roomId: string, roomCode: string, db: PrismaClient): Promise<void> {
  try {
    const room = await db.room.findUnique({
      where: { id: roomId },
      include: { players: true },
    });

    if (!room) return;

    const onlinePlayerIds = getOnlinePlayersInRoom(roomCode);

    const roomStatePayload = {
      room: {
        id: room.id,
        roomCode: room.code,
        phase: room.phase,
        players: room.players.map((player: any) => ({
          id: player.id,
          name: player.name,
          isHost: player.isHost,
          isReady: player.isReady,
          isOnline: onlinePlayerIds.includes(player.id),
        })),
        settings: room.settings,
        gameState: room.gameState,
      },
      timestamp: new Date(),
    };

    emitRoomEvent(roomCode, 'room_state_sync', roomStatePayload);
  } catch (error) {
    console.error('[SSE] Error syncing room state:', error);
  }
}

/**
 * Emit player joined event and sync room state
 */
export async function notifyPlayerJoined(
  roomId: string,
  roomCode: string,
  playerId: string,
  playerName: string,
  db: PrismaClient
): Promise<void> {
  // Emit player joined event
  emitRoomEvent(
    roomCode,
    'player_joined',
    {
      playerId,
      playerName,
      timestamp: new Date(),
    },
    playerId
  );

  // Sync full room state
  await syncRoomState(roomId, roomCode, db);
}

/**
 * Emit player left event and sync room state
 */
export async function notifyPlayerLeft(
  roomId: string,
  roomCode: string,
  playerId: string,
  playerName: string,
  db: PrismaClient
): Promise<void> {
  // Emit player left event
  emitRoomEvent(
    roomCode,
    'player_left',
    {
      playerId,
      playerName,
      timestamp: new Date(),
    }
  );

  // Sync full room state
  await syncRoomState(roomId, roomCode, db);
}

/**
 * Emit player ready status changed
 */
export function notifyPlayerReadyChanged(
  roomCode: string,
  playerId: string,
  playerName: string,
  isReady: boolean
): void {
  emitRoomEvent(
    roomCode,
    'player_ready_changed',
    {
      playerId,
      playerName,
      isReady,
      timestamp: new Date(),
    },
    playerId
  );
}

/**
 * Emit game phase changed
 */
export function notifyGamePhaseChanged(
  roomCode: string,
  newPhase: string,
  previousPhase: string,
  gameState: any
): void {
  emitRoomEvent(
    roomCode,
    'game_phase_changed',
    {
      newPhase,
      previousPhase,
      gameState,
      timestamp: new Date(),
    }
  );
}

/**
 * Notify game started
 */
export async function notifyGameStarted(
  roomId: string,
  roomCode: string,
  gameState: GameState,
  db: PrismaClient
): Promise<void> {
  const room = await db.room.findUnique({
    where: { id: roomId },
    include: {
      players: true,
    },
  });

  if (!room) return;

  emitRoomEvent(roomCode, 'game_phase_changed', {
    gameState,
    phase: 'roleReveal',
    startedAt: new Date(),
  });
}

/**
 * Emit vote cast event
 */
export function notifyVoteCast(
  roomCode: string,
  playerId: string,
  playerName: string,
  choice: 'approve' | 'reject',
  progress: any
): void {
  emitRoomEvent(
    roomCode,
    'vote_cast',
    {
      playerId,
      playerName,
      choice,
      progress,
      timestamp: new Date(),
    },
    playerId
  );
}

/**
 * Emit settings changed event
 */
export async function notifySettingsChanged(
  roomId: string,
  roomCode: string,
  settings: any,
  changedBy: string,
  db: PrismaClient
): Promise<void> {
  emitRoomEvent(
    roomCode,
    'settings_changed',
    {
      settings,
      changedBy,
      timestamp: new Date(),
    }
  );

  // Sync full room state to ensure consistency
  await syncRoomState(roomId, roomCode, db);
}

/**
 * Emit host transfer event
 */
export async function notifyHostTransfer(
  roomId: string,
  roomCode: string,
  previousHostId: string,
  newHostId: string,
  previousHostName: string,
  newHostName: string,
  db: PrismaClient
): Promise<void> {
  emitRoomEvent(
    roomCode,
    'host_transfer',
    {
      previousHostId,
      newHostId,
      previousHostName,
      newHostName,
      timestamp: new Date(),
    }
  );

  // Sync full room state to ensure consistency
  await syncRoomState(roomId, roomCode, db);
}
