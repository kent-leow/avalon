/**
 * Real-time Event Emitter Integration for TRPC
 * Bridges TRPC mutations with Socket.IO real-time events
 */

import { getSocketManager } from '~/server/socket';
import type { PrismaClient } from '@prisma/client';
import type { GameState } from '~/types/game-state';
import { createRealTimeEvent } from '~/lib/real-time-sync-utils';
import type { RealTimeEvent, RealTimeEventType } from '~/types/real-time-sync';

/**
 * Emit a real-time event to a specific room
 */
export function emitRoomEvent(
  roomCode: string,
  eventType: RealTimeEventType,
  payload: any,
  playerId?: string
) {
  const socketManager = getSocketManager();
  if (!socketManager) {
    console.warn('[RealTime] Socket manager not available, skipping event emission');
    return;
  }

  const event = createRealTimeEvent(
    eventType,
    payload,
    playerId || 'system',
    roomCode
  );

  socketManager.emitToRoom(roomCode, event);
  console.log(`[RealTime] Emitted ${eventType} to room ${roomCode}`);
}

/**
 * Emit a real-time event to a specific player
 */
export function emitPlayerEvent(
  playerId: string,
  roomCode: string,
  eventType: RealTimeEventType,
  payload: any
) {
  const socketManager = getSocketManager();
  if (!socketManager) {
    console.warn('[RealTime] Socket manager not available, skipping event emission');
    return;
  }

  const event = createRealTimeEvent(
    eventType,
    payload,
    playerId,
    roomCode
  );

  socketManager.emitToPlayer(playerId, roomCode, event);
  console.log(`[RealTime] Emitted ${eventType} to player ${playerId} in room ${roomCode}`);
}

/**
 * Get room state and emit it to all connected players
 */
export async function syncRoomState(roomId: string, roomCode: string, db: any) {
  try {
    const room = await db.room.findUnique({
      where: { id: roomId },
      include: { players: true },
    });

    if (!room) return;

    const socketManager = getSocketManager();
    if (!socketManager) return;

    const onlinePlayerIds = socketManager.getOnlinePlayersInRoom(roomCode);

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
    console.error('[RealTime] Error syncing room state:', error);
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
  db: any
) {
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
  db: any
) {
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
) {
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
) {
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
) {
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
  db: any
) {
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
