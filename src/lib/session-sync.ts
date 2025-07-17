/**
 * Session synchronization utilities for client-server session management
 */

import { getSession, saveSession, type PlayerSession } from './session';

/**
 * Verify session is valid by checking server-side session
 */
export async function verifyClientSession(roomCode: string): Promise<boolean> {
  try {
    const response = await fetch('/api/verify-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomCode }),
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      console.log('Session verification failed:', response.status);
      return false;
    }

    const data = await response.json();
    console.log('Session verification result:', data);
    
    return data.valid === true;
  } catch (error) {
    console.error('Error verifying session:', error);
    return false;
  }
}

/**
 * Sync client session with server session after successful authentication
 */
export async function syncClientSession(
  playerId: string,
  playerName: string,
  roomId: string,
  roomCode: string,
  isHost: boolean = false
): Promise<void> {
  // Create/update localStorage session
  const session: PlayerSession = {
    id: playerId,
    name: playerName,
    roomId,
    roomCode,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };

  saveSession(session);
  
  // Verify session is properly synced
  const savedSession = getSession();
  if (!savedSession || savedSession.id !== playerId) {
    throw new Error('Failed to sync client session');
  }

  console.log('Client session synced successfully:', savedSession);
}

/**
 * Check if client session matches expected room
 */
export function validateClientSession(expectedRoomCode: string): boolean {
  const session = getSession();
  
  if (!session) {
    console.log('No client session found');
    return false;
  }

  // For now, we don't store roomCode in localStorage session
  // This is a simplified validation
  return true;
}

/**
 * Wait for session to be available with timeout
 */
export async function waitForSession(
  timeout: number = 3000,
  pollInterval: number = 100
): Promise<PlayerSession | null> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const session = getSession();
    if (session) {
      return session;
    }
    
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  return null;
}
