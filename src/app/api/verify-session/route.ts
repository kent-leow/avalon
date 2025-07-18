import { type NextRequest, NextResponse } from 'next/server';
import { verifySession } from '~/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { roomCode } = await request.json();
    
    // Verify the JWT session
    const session = await verifySession();
    
    if (!session) {
      return NextResponse.json({ valid: false, reason: 'No session found' });
    }
    
    // Check if session matches the room code
    if (session.roomCode !== roomCode) {
      return NextResponse.json({ 
        valid: false, 
        reason: 'Session room mismatch',
        sessionRoom: session.roomCode,
        requestedRoom: roomCode 
      });
    }
    
    return NextResponse.json({ 
      valid: true, 
      session: {
        userId: session.userId,
        playerName: session.playerName,
        roomCode: session.roomCode,
        isHost: session.isHost,
      }
    });
    
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({ valid: false, reason: 'Verification failed' }, { status: 500 });
  }
}
