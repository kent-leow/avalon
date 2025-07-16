# Security Enhancement Plan

## Current Security State
- ✅ **Anti-cheat system** implemented with device fingerprinting
- ✅ **Input validation** with Zod schemas
- ✅ **Audit logging** system in place
- ⚠️ **Authentication** is basic (no proper session management)
- ⚠️ **Rate limiting** not implemented at API level
- ⚠️ **CSRF protection** not explicitly configured

## Security Improvements

### 1. Authentication & Session Management (High Priority)

#### Implement Proper Session Management
**File**: `src/lib/auth.ts` (new)
```typescript
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createSession(userId: string, roomCode: string) {
  const token = await new SignJWT({ userId, roomCode })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);

  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export async function verifySession() {
  const token = cookies().get('session')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}
```

#### Add Session Middleware
**File**: `src/middleware.ts` (new)
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect room routes
  if (pathname.startsWith('/room/')) {
    const session = await verifySession();
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/room/:path*'],
};
```

### 2. API Rate Limiting (High Priority)

#### Implement Rate Limiting Middleware
**File**: `src/lib/rate-limit.ts` (new)
```typescript
import { NextRequest } from 'next/server';

const rateLimits = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  request: NextRequest,
  limit: number = 100,
  window: number = 60 * 1000 // 1 minute
) {
  const ip = request.ip ?? '127.0.0.1';
  const now = Date.now();
  
  const current = rateLimits.get(ip);
  
  if (!current || now > current.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + window });
    return { success: true, remaining: limit - 1 };
  }
  
  if (current.count >= limit) {
    return { success: false, remaining: 0 };
  }
  
  current.count++;
  return { success: true, remaining: limit - current.count };
}
```

#### Apply Rate Limiting to API Routes
```typescript
// In tRPC procedures
import { rateLimit } from '~/lib/rate-limit';

export const roomRouter = createTRPCRouter({
  create: publicProcedure
    .input(createRoomSchema)
    .mutation(async ({ input, ctx }) => {
      // Apply rate limiting
      const { success } = rateLimit(ctx.req, 5, 60000); // 5 requests per minute
      if (!success) {
        throw new TRPCError({ 
          code: 'TOO_MANY_REQUESTS',
          message: 'Rate limit exceeded'
        });
      }
      
      // Existing logic...
    }),
});
```

### 3. Input Validation Enhancement (Medium Priority)

#### Enhanced Zod Schemas
**File**: `src/lib/validation.ts`
```typescript
import { z } from 'zod';

// Current basic validation
export const roomCodeSchema = z.string().min(1);

// Enhanced validation with security checks
export const secureRoomCodeSchema = z
  .string()
  .min(4)
  .max(8)
  .regex(/^[A-Z0-9]+$/, 'Room code must contain only uppercase letters and numbers')
  .refine((code) => !containsProfanity(code), 'Room code contains inappropriate content');

export const playerNameSchema = z
  .string()
  .min(2)
  .max(20)
  .regex(/^[a-zA-Z0-9\s-_]+$/, 'Player name contains invalid characters')
  .refine((name) => !containsProfanity(name), 'Player name contains inappropriate content');

function containsProfanity(text: string): boolean {
  const profanityList = ['bad', 'words']; // Add actual profanity filter
  return profanityList.some(word => text.toLowerCase().includes(word));
}
```

### 4. CSRF Protection (Medium Priority)

#### CSRF Token Implementation
**File**: `src/lib/csrf.ts` (new)
```typescript
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

export function setCSRFToken() {
  const token = generateCSRFToken();
  cookies().set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  return token;
}

export function verifyCSRFToken(token: string): boolean {
  const storedToken = cookies().get('csrf-token')?.value;
  return storedToken === token;
}
```

### 5. Enhanced Anti-Cheat System (Medium Priority)

#### Behavioral Analysis Enhancement
**File**: `src/lib/anti-cheat-enhanced.ts` (new)
```typescript
interface PlayerBehaviorPattern {
  playerId: string;
  avgDecisionTime: number;
  decisionVariance: number;
  clickPatterns: Array<{ x: number; y: number; timestamp: number }>;
  keystrokePatterns: Array<{ key: string; timestamp: number }>;
  suspiciousActivities: string[];
}

export class EnhancedAntiCheat {
  private behaviorPatterns = new Map<string, PlayerBehaviorPattern>();
  
  analyzeBehavior(playerId: string, action: any): SecurityAlert[] {
    const alerts: SecurityAlert[] = [];
    const pattern = this.behaviorPatterns.get(playerId);
    
    if (!pattern) {
      this.initializePattern(playerId);
      return alerts;
    }
    
    // Analyze decision timing
    if (this.isDecisionTooFast(action)) {
      alerts.push(this.createAlert('SUSPICIOUS_TIMING', playerId));
    }
    
    // Analyze click patterns
    if (this.isClickPatternSuspicious(action)) {
      alerts.push(this.createAlert('SUSPICIOUS_INTERACTION', playerId));
    }
    
    return alerts;
  }
  
  private isDecisionTooFast(action: any): boolean {
    return action.decisionTime < 100; // Less than 100ms is suspicious
  }
  
  private isClickPatternSuspicious(action: any): boolean {
    // Check for bot-like perfect precision
    return action.clickAccuracy && action.clickAccuracy > 0.95;
  }
}
```

### 6. Data Protection (High Priority)

#### Encrypt Sensitive Data
**File**: `src/lib/encryption.ts` (new)
```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

export function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = createDecipheriv(algorithm, key, iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### 7. Security Headers (Medium Priority)

#### Add Security Headers
**File**: `next.config.js`
```javascript
const config = {
  // Existing config...
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};
```

## Implementation Priority

### Phase 1: Critical Security (Week 1)
- [ ] Implement session management
- [ ] Add API rate limiting
- [ ] Enhance input validation

### Phase 2: Protection Measures (Week 2)
- [ ] Add CSRF protection
- [ ] Implement data encryption
- [ ] Add security headers

### Phase 3: Advanced Security (Week 3)
- [ ] Enhance anti-cheat system
- [ ] Add behavioral analysis
- [ ] Implement security monitoring

## Security Checklist

### Authentication & Authorization
- [ ] Proper session management
- [ ] JWT token validation
- [ ] Role-based access control
- [ ] Session timeout handling

### Input Validation
- [ ] All user inputs validated
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF token validation

### Data Protection
- [ ] Sensitive data encryption
- [ ] Secure data transmission
- [ ] Data retention policies
- [ ] Privacy compliance

### Infrastructure Security
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Error handling (no data leakage)
- [ ] Logging and monitoring

## Environment Variables to Add

```bash
# Security keys
JWT_SECRET=your-jwt-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here
CSRF_SECRET=your-csrf-secret-key-here

# Security settings
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60000
SESSION_TIMEOUT=86400
```
