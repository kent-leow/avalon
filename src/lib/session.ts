/**
 * Session management utilities for player identity
 */

const SESSION_STORAGE_KEY = 'avalon_player_session';
const COOKIE_NAME = 'avalon_session';

export interface PlayerSession {
  id: string;
  name: string;
  roomId?: string;
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
    
    const session: PlayerSession = JSON.parse(sessionData);
    
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
export function createSession(name: string, roomId?: string): PlayerSession {
  const session: PlayerSession = {
    id: generateSessionId(),
    name,
    roomId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  };
  
  saveSession(session);
  return session;
}

/**
 * Update existing session
 */
export function updateSession(updates: Partial<PlayerSession>): PlayerSession | null {
  const currentSession = getSession();
  if (!currentSession) return null;
  
  const updatedSession = {
    ...currentSession,
    ...updates
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
 * Check if a session exists and is valid
 */
export function hasValidSession(): boolean {
  return getSession() !== null;
}
