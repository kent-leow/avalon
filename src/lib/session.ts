/**
 * Session management utilities for player identity
 */

const SESSION_STORAGE_KEY = 'avalon_player_session';

export interface PlayerSession {
  id: string;
  name: string;
  roomId?: string;
  roomCode?: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Get the current session from localStorage
 */
export function getSession(): PlayerSession | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData) as PlayerSession;
    
    // Check if session has expired
    if (new Date() > new Date(session.expiresAt)) {
      clearSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    clearSession();
    return null;
  }
}

/**
 * Save session to localStorage
 */
export function saveSession(session: PlayerSession): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error saving session:', error);
  }
}

/**
 * Create a new session
 */
export function createSession(name: string, roomId?: string, roomCode?: string): PlayerSession {
  const session: PlayerSession = {
    id: generateSessionId(),
    name,
    roomId,
    roomCode,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  };
  
  saveSession(session);
  return session;
}

/**
 * Update existing session and extend expiration time
 */
export function updateSession(updates: Partial<PlayerSession>): PlayerSession | null {
  const currentSession = getSession();
  if (!currentSession) return null;
  
  const updatedSession = {
    ...currentSession,
    ...updates,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Extend expiration by 24 hours
  };
  
  saveSession(updatedSession);
  return updatedSession;
}

/**
 * Clear the current session
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

/**
 * Extend session expiration time (called on user activity)
 */
export function extendSession(): PlayerSession | null {
  const currentSession = getSession();
  if (!currentSession) return null;
  
  const extendedSession = {
    ...currentSession,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Extend by 24 hours
  };
  
  saveSession(extendedSession);
  return extendedSession;
}

/**
 * Check if a session exists and is valid
 */
export function hasValidSession(): boolean {
  return getSession() !== null;
}
