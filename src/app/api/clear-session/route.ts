import { type NextRequest, NextResponse } from 'next/server';
import { destroySession } from '~/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Clear the JWT session
    await destroySession();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing session:', error);
    return NextResponse.json({ success: false, error: 'Failed to clear session' }, { status: 500 });
  }
}
