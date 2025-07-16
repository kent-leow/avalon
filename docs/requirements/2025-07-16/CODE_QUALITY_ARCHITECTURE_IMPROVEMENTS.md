# Code Quality & Architecture Improvements

## Current Code Quality State
- ✅ **TypeScript**: Strict type checking enabled
- ✅ **ESLint**: Next.js recommended rules
- ✅ **Prettier**: Code formatting configured
- ✅ **Modular architecture**: Feature-based organization
- ⚠️ **Test coverage**: Minimal (only 2 test files)
- ⚠️ **Documentation**: Limited inline documentation
- ⚠️ **Error handling**: Basic error handling

## Architecture Improvements

### 1. Enhanced Error Handling (High Priority)

#### Global Error Boundary
**File**: `src/components/ErrorBoundary.tsx` (new)
```typescript
'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to monitoring service
    this.logError(error, errorInfo);
  }

  private logError(error: Error, errorInfo: React.ErrorInfo) {
    // Send to logging service (e.g., Sentry, LogRocket)
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h1>
      <p className="text-slate-300 mb-4">We're sorry for the inconvenience.</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Reload Page
      </button>
    </div>
  </div>
);
```

#### Enhanced API Error Handling
**File**: `src/lib/api-error-handler.ts` (new)
```typescript
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown): never {
  if (error instanceof z.ZodError) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid input data',
      cause: error.errors,
    });
  }

  if (error instanceof APIError) {
    throw new TRPCError({
      code: error.statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST',
      message: error.message,
      cause: error.details,
    });
  }

  if (error instanceof Error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
}
```

### 2. Improved State Management (Medium Priority)

#### Game State Context
**File**: `src/contexts/GameContext.tsx` (new)
```typescript
'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { GameState, GameAction } from '~/types/game-state';

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  // Action creators
  updateGamePhase: (phase: GameState['phase']) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayerRole: (playerId: string, role: RoleType) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'UPDATE_PHASE':
      return { ...state, phase: action.payload };
    
    case 'ADD_PLAYER':
      return {
        ...state,
        players: [...state.players, action.payload],
      };
    
    case 'REMOVE_PLAYER':
      return {
        ...state,
        players: state.players.filter(p => p.id !== action.payload),
      };
    
    case 'UPDATE_PLAYER_ROLE':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload.playerId
            ? { ...p, role: action.payload.role }
            : p
        ),
      };
    
    default:
      return state;
  }
}

export function GameProvider({ children, initialState }: {
  children: React.ReactNode;
  initialState: GameState;
}) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const updateGamePhase = useCallback((phase: GameState['phase']) => {
    dispatch({ type: 'UPDATE_PHASE', payload: phase });
  }, []);

  const addPlayer = useCallback((player: Player) => {
    dispatch({ type: 'ADD_PLAYER', payload: player });
  }, []);

  const removePlayer = useCallback((playerId: string) => {
    dispatch({ type: 'REMOVE_PLAYER', payload: playerId });
  }, []);

  const updatePlayerRole = useCallback((playerId: string, role: RoleType) => {
    dispatch({ type: 'UPDATE_PLAYER_ROLE', payload: { playerId, role } });
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        updateGamePhase,
        addPlayer,
        removePlayer,
        updatePlayerRole,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
```

### 3. Enhanced Logging System (Medium Priority)

#### Structured Logging
**File**: `src/lib/logger.ts` (new)
```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  roomCode?: string;
}

class Logger {
  private minLevel: LogLevel;

  constructor() {
    this.minLevel = process.env.NODE_ENV === 'production' 
      ? LogLevel.WARN 
      : LogLevel.DEBUG;
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify(entry, null, 2));
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(entry);
    }
  }

  private sendToLoggingService(entry: LogEntry) {
    // Send to logging service (e.g., Datadog, New Relic)
  }
}

export const logger = new Logger();
```

### 4. Component Composition Improvements (Medium Priority)

#### Compound Component Pattern
**File**: `src/components/ui/Card.tsx` (enhanced)
```typescript
import React from 'react';
import { cn } from '~/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-slate-800 border-slate-700',
      elevated: 'bg-slate-800 border-slate-700 shadow-lg',
      outlined: 'bg-transparent border-slate-600 border-2',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border p-6',
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 pb-6', className)}
      {...props}
    />
  )
);

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-6', className)}
      {...props}
    />
  )
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };
```

### 5. Enhanced Configuration Management (Low Priority)

#### Environment Configuration
**File**: `src/config/index.ts` (new)
```typescript
import { z } from 'zod';

const configSchema = z.object({
  // App configuration
  app: z.object({
    name: z.string().default('Avalon'),
    version: z.string().default('1.0.0'),
    environment: z.enum(['development', 'staging', 'production']),
  }),

  // Database configuration
  database: z.object({
    url: z.string().url(),
    maxConnections: z.number().default(10),
    timeout: z.number().default(30000),
  }),

  // Game configuration
  game: z.object({
    maxPlayers: z.number().default(10),
    minPlayers: z.number().default(5),
    roomCodeLength: z.number().default(6),
    sessionTimeout: z.number().default(24 * 60 * 60 * 1000), // 24 hours
  }),

  // Security configuration
  security: z.object({
    jwtSecret: z.string().min(32),
    encryptionKey: z.string().min(32),
    rateLimit: z.object({
      requests: z.number().default(100),
      window: z.number().default(60000),
    }),
  }),

  // Feature flags
  features: z.object({
    tutorialSystem: z.boolean().default(true),
    antiCheatSystem: z.boolean().default(true),
    realTimeSync: z.boolean().default(true),
    mobileOptimizations: z.boolean().default(true),
  }),
});

const rawConfig = {
  app: {
    name: process.env.APP_NAME || 'Avalon',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL!,
    maxConnections: Number(process.env.DATABASE_MAX_CONNECTIONS) || 10,
    timeout: Number(process.env.DATABASE_TIMEOUT) || 30000,
  },
  game: {
    maxPlayers: Number(process.env.GAME_MAX_PLAYERS) || 10,
    minPlayers: Number(process.env.GAME_MIN_PLAYERS) || 5,
    roomCodeLength: Number(process.env.ROOM_CODE_LENGTH) || 6,
    sessionTimeout: Number(process.env.SESSION_TIMEOUT) || 24 * 60 * 60 * 1000,
  },
  security: {
    jwtSecret: process.env.JWT_SECRET!,
    encryptionKey: process.env.ENCRYPTION_KEY!,
    rateLimit: {
      requests: Number(process.env.RATE_LIMIT_REQUESTS) || 100,
      window: Number(process.env.RATE_LIMIT_WINDOW) || 60000,
    },
  },
  features: {
    tutorialSystem: process.env.FEATURE_TUTORIAL_SYSTEM === 'true',
    antiCheatSystem: process.env.FEATURE_ANTI_CHEAT_SYSTEM === 'true',
    realTimeSync: process.env.FEATURE_REAL_TIME_SYNC === 'true',
    mobileOptimizations: process.env.FEATURE_MOBILE_OPTIMIZATIONS === 'true',
  },
};

export const config = configSchema.parse(rawConfig);
```

## Code Quality Metrics

### Current State
- **TypeScript Coverage**: 100%
- **ESLint Errors**: 0
- **Prettier Formatting**: Consistent
- **Component Reusability**: High
- **Code Duplication**: Minimal

### Improvement Targets
- **Test Coverage**: 80%+ (currently ~5%)
- **Documentation Coverage**: 90%+ (currently ~20%)
- **Error Handling**: Comprehensive (currently basic)
- **Performance Monitoring**: Implemented
- **Security Auditing**: Automated

## Implementation Timeline

### Phase 1: Foundation (Week 1)
- [ ] Implement global error boundary
- [ ] Add structured logging
- [ ] Enhance API error handling

### Phase 2: State Management (Week 2)
- [ ] Implement game state context
- [ ] Add configuration management
- [ ] Enhance component composition

### Phase 3: Quality Assurance (Week 3)
- [ ] Add comprehensive testing
- [ ] Implement performance monitoring
- [ ] Add automated security auditing

### Phase 4: Documentation (Week 4)
- [ ] Complete code documentation
- [ ] Add architectural documentation
- [ ] Create developer guides

## Tools to Add

### Development Tools
```json
{
  "devDependencies": {
    "@storybook/react": "^7.0.0",
    "chromatic": "^11.0.0",
    "eslint-plugin-testing-library": "^6.0.0",
    "eslint-plugin-jsx-a11y": "^6.8.0",
    "husky": "^8.0.0",
    "lint-staged": "^15.0.0"
  }
}
```

### Quality Gates
```json
{
  "scripts": {
    "pre-commit": "lint-staged",
    "pre-push": "npm run test && npm run typecheck",
    "quality-check": "npm run lint && npm run typecheck && npm run test:coverage"
  }
}
```

This comprehensive improvement plan addresses all major areas where the codebase can be enhanced while maintaining the high-quality foundation that's already in place.
