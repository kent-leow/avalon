import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

const CSRF_TOKEN_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

export interface CSRFTokenData {
  token: string;
  timestamp: number;
}

export async function generateCSRFToken(): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const cookieStore = await cookies();
  
  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  });
  
  return token;
}

export async function verifyCSRFToken(providedToken: string): Promise<boolean> {
  const cookieStore = await cookies();
  const storedToken = cookieStore.get(CSRF_TOKEN_NAME)?.value;
  
  if (!storedToken || !providedToken) {
    return false;
  }
  
  // Use constant-time comparison to prevent timing attacks
  return constantTimeCompare(storedToken, providedToken);
}

export async function requireCSRFToken(providedToken: string): Promise<void> {
  const isValid = await verifyCSRFToken(providedToken);
  if (!isValid) {
    throw new Error('Invalid CSRF token');
  }
}

export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_TOKEN_NAME)?.value || null;
}

export async function deleteCSRFToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CSRF_TOKEN_NAME);
}

// Constant-time string comparison to prevent timing attacks
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

// CSRF middleware for API routes
export function createCSRFMiddleware() {
  return async (request: Request) => {
    // Skip CSRF check for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return;
    }
    
    // Skip CSRF check for tRPC routes during development
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    
    const token = request.headers.get(CSRF_HEADER_NAME) || 
                  request.headers.get('x-xsrf-token') || // Alternative header name
                  '';
    
    await requireCSRFToken(token);
  };
}

// Double-submit cookie pattern
export async function generateDoubleSubmitToken(): Promise<{ token: string; cookie: string }> {
  const token = randomBytes(32).toString('hex');
  const cookieValue = randomBytes(32).toString('hex');
  
  const cookieStore = await cookies();
  cookieStore.set(`${CSRF_TOKEN_NAME}-double`, cookieValue, {
    httpOnly: false, // Must be accessible to client for double-submit
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
  
  return { token, cookie: cookieValue };
}

export async function verifyDoubleSubmitToken(token: string, cookie: string): Promise<boolean> {
  const cookieStore = await cookies();
  const storedCookie = cookieStore.get(`${CSRF_TOKEN_NAME}-double`)?.value;
  
  if (!storedCookie || !token || !cookie) {
    return false;
  }
  
  // Verify the cookie matches and token is valid
  return constantTimeCompare(storedCookie, cookie) && 
         constantTimeCompare(token, generateTokenFromCookie(cookie));
}

function generateTokenFromCookie(cookie: string): string {
  // Simple token generation from cookie (in production, use HMAC)
  return Buffer.from(cookie).toString('base64');
}

// CSRF error class
export class CSRFError extends Error {
  constructor(message: string = 'CSRF token validation failed') {
    super(message);
    this.name = 'CSRFError';
  }
}

// Helper to extract CSRF token from various sources
export function extractCSRFToken(request: Request): string | null {
  // Check headers first
  const headerToken = request.headers.get(CSRF_HEADER_NAME) || 
                      request.headers.get('x-xsrf-token');
  
  if (headerToken) {
    return headerToken;
  }
  
  // Could also check form data or query params if needed
  return null;
}

// Development helpers
export function isCSRFRequired(): boolean {
  return process.env.NODE_ENV === 'production' || 
         process.env.ENABLE_CSRF === 'true';
}

export function skipCSRFForRoute(pathname: string): boolean {
  const skipRoutes = [
    '/api/health',
    '/api/metrics',
    '/api/ping',
    '/api/trpc', // Skip CSRF for tRPC routes
  ];
  
  return skipRoutes.some(route => pathname.startsWith(route));
}

// Constants
export const CSRF_CONSTANTS = {
  TOKEN_NAME: CSRF_TOKEN_NAME,
  HEADER_NAME: CSRF_HEADER_NAME,
  TOKEN_LENGTH: 64, // 32 bytes = 64 hex chars
  MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
} as const;
