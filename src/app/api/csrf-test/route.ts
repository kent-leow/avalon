import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken } from '~/lib/csrf';

export async function GET() {
  try {
    const token = await generateCSRFToken();
    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json({ error: 'Failed to generate CSRF token' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      message: 'CSRF token validation passed', 
      data: body 
    }, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
