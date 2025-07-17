import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { env } from '~/env.js';

const secret = new TextEncoder().encode(env.JWT_SECRET);

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
  console.log('Creating JWT session:', { userId, roomCode, playerName, isHost });
  
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

  console.log('JWT token created, setting cookie');
  
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
    maxAge: 24 * 60 * 60, // 24 hours in seconds (not milliseconds)
    path: '/',
  });
  
  console.log('JWT session cookie set successfully');
  
  // Verify the cookie was set
  const verifyToken = cookieStore.get('session')?.value;
  console.log('Cookie verification:', { tokenSet: !!verifyToken, matches: verifyToken === token });
}

export async function verifySession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  console.log('Verifying JWT session, token exists:', !!token);
  
  if (!token) {
    console.log('No JWT token found in cookies');
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    console.log('JWT session verified successfully:', payload);
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
