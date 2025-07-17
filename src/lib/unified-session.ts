/**
 * Unified session management
 * Handles both client-side localStorage and server-side JWT cookie sessions
 */

import { createSession as createJWTSession } from './auth';
import { saveSession, type PlayerSession } from './session';

export interface UnifiedSessionData {
  id: string;
  name: string;
  roomId: string;
  roomCode: string;
  isHost: boolean;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Create both localStorage and JWT cookie sessions
 */
export async function createUnifiedSession(
  sessionId: string,
  playerName: string,
  roomId: string,
  roomCode: string,
  isHost: boolean = false
): Promise<UnifiedSessionData> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

  const unifiedSession: UnifiedSessionData = {
    id: sessionId,
    name: playerName,
    roomId,
    roomCode,
    isHost,
    createdAt: now,
    expiresAt,
  };

  // Create localStorage session
  const localSession: PlayerSession = {
    id: sessionId,
    name: playerName,
    roomId,
    createdAt: now,
    expiresAt,
  };

  saveSession(localSession);

  // Create JWT cookie session (server-side)
  try {
    await createJWTSession(sessionId, roomCode, playerName, isHost);
  } catch (error) {
    console.error('Failed to create JWT session:', error);
    // Continue without JWT session for now
  }

  return unifiedSession;
}

/**
 * Clear both localStorage and JWT cookie sessions
 */
export async function clearUnifiedSession(): Promise<void> {
  // Clear localStorage session
  if (typeof window !== 'undefined') {
    localStorage.removeItem('avalon_player_session');
  }

  // Clear JWT cookie session
  try {
    const { destroySession } = await import('./auth');
    await destroySession();
  } catch (error) {
    console.error('Failed to clear JWT session:', error);
    // Continue without clearing JWT session
  }
}
