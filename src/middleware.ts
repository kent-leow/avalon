import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from './lib/auth';
import { rateLimitByIP, RATE_LIMIT_CONFIGS, RateLimitError } from './lib/rate-limit';
import { createCSRFMiddleware, skipCSRFForRoute } from './lib/csrf';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  try {
    // Skip middleware for static files and API health checks
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/api/health') ||
      pathname.startsWith('/api/ping')
    ) {
      return NextResponse.next();
    }
    
    // Apply rate limiting to all routes
    const rateLimitResult = rateLimitByIP(request, RATE_LIMIT_CONFIGS.API_GENERAL);
    if (!rateLimitResult.success) {
      return new NextResponse('Rate limit exceeded', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        },
      });
    }
    
    // Apply CSRF protection for API routes (except tRPC in development)
    if (pathname.startsWith('/api') && !skipCSRFForRoute(pathname)) {
      try {
        const csrfMiddleware = createCSRFMiddleware();
        await csrfMiddleware(request);
      } catch (error) {
        if (error instanceof Error && error.message.includes('CSRF')) {
          return new NextResponse('CSRF token validation failed', {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }
        throw error;
      }
    }
    
    // Protect room routes with authentication
    if (pathname.startsWith('/room/')) {
      const session = await verifySession();
      if (!session) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      // Extract room code from URL and verify access
      const roomCodeMatch = pathname.match(/^\/room\/([^\/]+)/);
      if (roomCodeMatch) {
        const roomCode = roomCodeMatch[1];
        if (session.roomCode !== roomCode) {
          return NextResponse.redirect(new URL('/', request.url));
        }
      }
    }
    
    // Add security headers to all responses
    const response = NextResponse.next();
    
    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Add CSP header
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:;"
    );
    
    // Add HTTPS redirect in production
    if (process.env.NODE_ENV === 'production') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString());
    
    return response;
    
  } catch (error) {
    console.error('Middleware error:', error);
    
    // Handle specific error types
    if (error instanceof RateLimitError) {
      return new NextResponse('Rate limit exceeded', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': error.limit.toString(),
          'X-RateLimit-Remaining': error.remaining.toString(),
          'X-RateLimit-Reset': error.reset.toString(),
        },
      });
    }
    
    if (error instanceof Error && error.message.includes('CSRF')) {
      return new NextResponse('CSRF token validation failed', {
        status: 403,
      });
    }
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Generic error response
    return new NextResponse('Internal Server Error', {
      status: 500,
    });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
