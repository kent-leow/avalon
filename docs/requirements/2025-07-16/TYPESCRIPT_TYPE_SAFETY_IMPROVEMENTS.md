# TypeScript Type Safety Improvements

## Current Issues
- **24 instances** of `any` type usage in mobile-utils.ts
- Missing proper type definitions for browser APIs
- Generic type parameters could be more specific

## Specific Improvements Needed

### 1. Mobile Utils Type Definitions
**File**: `src/lib/mobile-utils.ts`

#### Browser API Types
```typescript
// Current (line 70)
(window.navigator as any).standalone === true;

// Improved
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}
(window.navigator as NavigatorWithStandalone).standalone === true;
```

#### Network Connection Types
```typescript
// Current (line 215)
const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

// Improved
interface NetworkConnection {
  type: string;
  downlink: number;
  effectiveType: string;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
  mozConnection?: NetworkConnection;
  webkitConnection?: NetworkConnection;
}

const connection = (navigator as NavigatorWithConnection).connection || 
                  (navigator as NavigatorWithConnection).mozConnection || 
                  (navigator as NavigatorWithConnection).webkitConnection;
```

#### Battery API Types
```typescript
// Current (line 216)
const battery = (navigator as any).battery || (navigator as any).mozBattery || (navigator as any).webkitBattery;

// Improved
interface BatteryManager {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
}

interface NavigatorWithBattery extends Navigator {
  battery?: BatteryManager;
  mozBattery?: BatteryManager;
  webkitBattery?: BatteryManager;
}
```

### 2. Performance API Types
```typescript
// Current (line 214)
const performance = window.performance as any;

// Improved
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}
```

### 3. Fullscreen API Types
```typescript
// Current (lines 322-326)
} else if ((element as any).webkitRequestFullscreen) {
  return (element as any).webkitRequestFullscreen();
}

// Improved
interface ElementWithFullscreen extends Element {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}
```

### 4. Wake Lock API Types
```typescript
// Current (line 312)
if (typeof window === 'undefined' || !(navigator as any).wakeLock) {

// Improved
interface WakeLockSentinel {
  released: boolean;
  type: string;
  release(): Promise<void>;
}

interface WakeLock {
  request(type: string): Promise<WakeLockSentinel>;
}

interface NavigatorWithWakeLock extends Navigator {
  wakeLock?: WakeLock;
}
```

## Implementation Plan

### Phase 1: Create Type Definitions (High Priority)
1. Create `src/types/browser-apis.ts` with proper type definitions
2. Replace all `any` types in mobile-utils.ts
3. Add type safety to all browser API interactions

### Phase 2: Strict Type Checking (Medium Priority)
1. Enable strict TypeScript compiler options
2. Add `noImplicitAny: true` to tsconfig.json
3. Fix all implicit any types

### Phase 3: Generic Type Improvements (Low Priority)
1. Add proper generic constraints to utility functions
2. Improve type inference in complex functions
3. Add better return type annotations

## Benefits
- **Improved IDE support** with better autocomplete
- **Compile-time error detection** for API misuse
- **Better documentation** through type definitions
- **Easier refactoring** with type-safe code
- **Runtime error prevention** through type validation
