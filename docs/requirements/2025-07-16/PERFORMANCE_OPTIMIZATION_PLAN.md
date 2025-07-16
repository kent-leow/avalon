# Performance Optimization Plan

## Current Performance State
- **Build time**: ~28.5 seconds (could be optimized)
- **Bundle size**: 99.6 kB shared + route chunks (reasonable)
- **TypeScript compilation**: Full rebuild on changes

## Performance Improvements

### 1. Build Performance (High Priority)

#### Next.js Configuration Optimizations
**File**: `next.config.js`
```javascript
/** @type {import("next").NextConfig} */
const config = {
  // Current minimal config
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Proposed optimizations
  experimental: {
    // Enable SWC minification for faster builds
    swcMinify: true,
    // Enable build cache for faster rebuilds
    buildCacheTime: 24 * 60 * 60 * 1000, // 24 hours
    // Enable concurrent features
    concurrentFeatures: true,
  },
  
  // Image optimization
  images: {
    domains: [], // Add domains if using external images
    formats: ['image/webp', 'image/avif'],
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Production client-side optimizations
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
};
```

#### TypeScript Performance
**File**: `tsconfig.json`
```json
{
  "compilerOptions": {
    // Current config...
    
    // Add performance optimizations
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    "skipLibCheck": true,
    "skipDefaultLibCheck": true
  },
  
  // Exclude unnecessary files from compilation
  "exclude": [
    "node_modules",
    ".next",
    "out",
    "build",
    "dist",
    "coverage",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx"
  ]
}
```

### 2. Runtime Performance (Medium Priority)

#### Component Optimization
```typescript
// Current: Re-renders on every prop change
export const SomeComponent: React.FC<Props> = ({ data }) => {
  // Component logic
};

// Optimized: Memoized to prevent unnecessary re-renders
export const SomeComponent: React.FC<Props> = React.memo(({ data }) => {
  // Component logic
}, (prevProps, nextProps) => {
  // Custom comparison logic
  return prevProps.data.id === nextProps.data.id;
});
```

#### State Management Optimization
```typescript
// Current: Multiple state updates causing re-renders
const [gameState, setGameState] = useState(initialState);
const [players, setPlayers] = useState([]);
const [settings, setSettings] = useState({});

// Optimized: Single state object with useReducer
const [state, dispatch] = useReducer(gameReducer, {
  gameState: initialState,
  players: [],
  settings: {}
});
```

#### API Query Optimization
```typescript
// Current: No caching or optimization
const { data } = api.room.getRoom.useQuery({ roomCode });

// Optimized: With caching and stale-while-revalidate
const { data } = api.room.getRoom.useQuery(
  { roomCode },
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  }
);
```

### 3. Bundle Size Optimization (Medium Priority)

#### Dynamic Imports
```typescript
// Current: Import all at once
import { TutorialSystem } from '~/components/features/tutorial-system';

// Optimized: Dynamic import for code splitting
const TutorialSystem = dynamic(
  () => import('~/components/features/tutorial-system'),
  {
    loading: () => <div>Loading tutorial...</div>,
    ssr: false, // If not needed server-side
  }
);
```

#### Tree Shaking Improvements
```typescript
// Current: Import entire library
import * as qrcode from 'qrcode';

// Optimized: Import only needed functions
import { toString } from 'qrcode';
```

### 4. Database Performance (High Priority)

#### Query Optimization
```typescript
// Current: Multiple queries
const room = await db.room.findUnique({ where: { code } });
const players = await db.player.findMany({ where: { roomId: room.id } });
const settings = await db.gameSettings.findUnique({ where: { roomId: room.id } });

// Optimized: Single query with includes
const room = await db.room.findUnique({
  where: { code },
  include: {
    players: true,
    gameSettings: true,
  }
});
```

#### Database Indexes
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_room_code ON "Room"("code");
CREATE INDEX idx_player_room_id ON "Player"("roomId");
CREATE INDEX idx_game_settings_room_id ON "GameSettings"("roomId");
```

### 5. Real-time Performance (Medium Priority)

#### Socket.IO Optimization
```typescript
// Current: Emit to all players
socket.emit('gameUpdate', gameState);

// Optimized: Emit only to relevant players
socket.to(roomCode).emit('gameUpdate', gameState);

// Optimized: Batch updates
const updates = collectUpdates();
socket.emit('batchUpdate', updates);
```

#### Event Debouncing
```typescript
// Current: Immediate updates
const handlePlayerAction = (action) => {
  updateGameState(action);
  emitUpdate();
};

// Optimized: Debounced updates
const handlePlayerAction = debounce((action) => {
  updateGameState(action);
  emitUpdate();
}, 100);
```

## Implementation Timeline

### Week 1: Build Performance
- [ ] Configure Next.js optimizations
- [ ] Optimize TypeScript compilation
- [ ] Set up build caching

### Week 2: Runtime Performance  
- [ ] Implement React.memo where beneficial
- [ ] Optimize state management
- [ ] Add query caching

### Week 3: Bundle Optimization
- [ ] Implement dynamic imports
- [ ] Optimize library imports
- [ ] Analyze bundle composition

### Week 4: Database & Real-time
- [ ] Optimize database queries
- [ ] Add database indexes
- [ ] Implement Socket.IO optimizations

## Performance Metrics to Track

### Build Metrics
- Build time (target: <20 seconds)
- Bundle size (target: <90 kB shared)
- Type checking time (target: <5 seconds)

### Runtime Metrics
- First Contentful Paint (target: <2 seconds)
- Largest Contentful Paint (target: <3 seconds)
- Time to Interactive (target: <4 seconds)

### User Experience Metrics
- Room creation time (target: <500ms)
- Game state updates (target: <200ms)
- Real-time sync latency (target: <100ms)
