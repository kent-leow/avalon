import { type NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  windowStart: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimits = new Map<string, RateLimitEntry>();

// Export for testing
export { rateLimits };

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

export interface RateLimitConfig {
  limit: number;
  window: number; // in milliseconds
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 100, window: 60 * 1000 }
): RateLimitResult {
  const now = Date.now();
  const { limit, window } = config;
  
  // Clean up expired entries periodically
  cleanupExpiredEntries(now);
  
  const current = rateLimits.get(identifier);
  
  if (!current || now >= current.resetTime) {
    // Create new window
    const resetTime = now + window;
    rateLimits.set(identifier, {
      count: 1,
      resetTime,
      windowStart: now
    });
    
    return {
      success: true,
      remaining: limit - 1,
      reset: resetTime,
      limit
    };
  }
  
  if (current.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: current.resetTime,
      limit
    };
  }
  
  current.count++;
  
  return {
    success: true,
    remaining: limit - current.count,
    reset: current.resetTime,
    limit
  };
}

export function rateLimitByIP(
  request: NextRequest,
  config?: RateLimitConfig
): RateLimitResult {
  const ip = getClientIP(request);
  return rateLimit(ip, config);
}

export function rateLimitByUser(
  userId: string,
  config?: RateLimitConfig
): RateLimitResult {
  return rateLimit(`user:${userId}`, config);
}

export function rateLimitByRoom(
  roomCode: string,
  config?: RateLimitConfig
): RateLimitResult {
  return rateLimit(`room:${roomCode}`, config);
}

function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || '127.0.0.1';
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const remoteAddr = request.headers.get('x-remote-addr');
  if (remoteAddr) {
    return remoteAddr;
  }
  
  return '127.0.0.1';
}

function cleanupExpiredEntries(now: number): void {
  // Clean up expired entries every minute
  if (Math.random() < 0.01) { // 1% chance to clean up
    for (const [key, entry] of rateLimits.entries()) {
      if (now >= entry.resetTime) {
        rateLimits.delete(key);
      }
    }
  }
}

// Pre-defined rate limit configurations
export const RATE_LIMIT_CONFIGS = {
  // General API limits
  API_GENERAL: { limit: 100, window: 60 * 1000 }, // 100 requests per minute
  API_STRICT: { limit: 20, window: 60 * 1000 }, // 20 requests per minute
  
  // Room-specific limits
  ROOM_CREATE: { limit: 5, window: 60 * 1000 }, // 5 room creations per minute
  ROOM_JOIN: { limit: 10, window: 60 * 1000 }, // 10 room joins per minute
  
  // Game action limits
  GAME_ACTION: { limit: 30, window: 60 * 1000 }, // 30 game actions per minute
  VOTE_ACTION: { limit: 10, window: 60 * 1000 }, // 10 votes per minute
  
  // Real-time limits
  REALTIME_UPDATES: { limit: 120, window: 60 * 1000 }, // 120 updates per minute
  
  // Security limits
  AUTH_ATTEMPTS: { limit: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
} as const;

// Rate limit error class
export class RateLimitError extends Error {
  constructor(
    public remaining: number,
    public reset: number,
    public limit: number
  ) {
    super('Rate limit exceeded');
    this.name = 'RateLimitError';
  }
}

// Middleware helper
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return (request: NextRequest) => {
    const result = rateLimitByIP(request, config);
    
    if (!result.success) {
      throw new RateLimitError(result.remaining, result.reset, result.limit);
    }
    
    return result;
  };
}
