/**
 * Real-time Event Emitter Integration for TRPC
 * Bridges TRPC mutations with SSE real-time events
 */

import * as SSEEvents from '~/server/sse-events';
import type { PrismaClient } from '@prisma/client';
import type { GameState } from '~/types/game-state';
import type { RealTimeEventType } from '~/types/real-time-sync';

/**
 * Emit a real-time event to a specific room
 */
export function emitRoomEvent(
  roomCode: string,
  eventType: RealTimeEventType,
  payload: any,
  playerId?: string
) {
  SSEEvents.emitRoomEvent(roomCode, eventType, payload, playerId);
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
  SSEEvents.emitPlayerEvent(playerId, roomCode, eventType, payload);
}

/**
 * Get room state and emit it to all connected players
 */
export async function syncRoomState(roomId: string, roomCode: string, db: PrismaClient) {
  return SSEEvents.syncRoomState(roomId, roomCode, db);
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
) {
  return SSEEvents.notifyPlayerJoined(roomId, roomCode, playerId, playerName, db);
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
) {
  return SSEEvents.notifyPlayerLeft(roomId, roomCode, playerId, playerName, db);
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
  return SSEEvents.notifyPlayerReadyChanged(roomCode, playerId, playerName, isReady);
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
  return SSEEvents.notifyGamePhaseChanged(roomCode, newPhase, previousPhase, gameState);
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
  return SSEEvents.notifyGameStarted(roomId, roomCode, gameState, db);
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
  return SSEEvents.notifyVoteCast(roomCode, playerId, playerName, choice, progress);
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
) {
  return SSEEvents.notifySettingsChanged(roomId, roomCode, settings, changedBy, db);
}

/**
 * Get online players in a room
 */
export function getOnlinePlayersInRoom(roomCode: string): string[] {
  return SSEEvents.getOnlinePlayersInRoom(roomCode);
}

/**
 * Subscribe a player to room events
 */
export function subscribeToRoom(roomCode: string, playerId: string, sessionId: string): void {
  return SSEEvents.subscribeToRoom(roomCode, playerId, sessionId);
}

/**
 * Unsubscribe a player from room events
 */
export function unsubscribeFromRoom(sessionId: string): void {
  return SSEEvents.unsubscribeFromRoom(sessionId);
}

/**
 * Get all active subscribers for a room
 */
export function getRoomSubscribers(roomCode: string): string[] {
  return SSEEvents.getRoomSubscribers(roomCode);
}
