import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');

export interface SessionData {
  userId: string;
  roomCode: string;
  playerName: string;
  isHost: boolean;
  iat?: number;
  exp?: number;
}

export async function createSession(
  userId: string,
  roomCode: string,
  playerName: string,
  isHost: boolean = false
): Promise<void> {
  const token = await new SignJWT({ 
    userId, 
    roomCode, 
    playerName,
    isHost 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  });
}

export async function verifySession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionData;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

export async function updateSession(updates: Partial<SessionData>): Promise<void> {
  const currentSession = await verifySession();
  if (!currentSession) {
    throw new Error('No active session to update');
  }

  const updatedSession = { ...currentSession, ...updates };
  await createSession(
    updatedSession.userId,
    updatedSession.roomCode,
    updatedSession.playerName,
    updatedSession.isHost
  );
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function requireAuth(): Promise<SessionData> {
  const session = await verifySession();
  if (!session) {
    throw new Error('Authentication required');
  }
  return session;
}

export async function requireRoomAccess(roomCode: string): Promise<SessionData> {
  const session = await requireAuth();
  if (session.roomCode !== roomCode) {
    throw new Error('Access denied to this room');
  }
  return session;
}
