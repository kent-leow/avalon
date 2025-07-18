/**
 * Real-time Game Synchronization Types
 * Comprehensive type definitions for Socket.IO-based real-time synchronization
 */

// Connection State Management
export interface ConnectionState {
  status: 'connected' | 'disconnected' | 'reconnecting' | 'error';
  latency: number; // milliseconds
  lastSeen: Date;
  retryCount: number;
  queuedActions: QueuedAction[];
  socketId?: string;
  playerId: string;
  roomCode: string;
}

export interface ConnectionIndicator {
  signal: 'excellent' | 'good' | 'poor' | 'offline';
  color: string;
  animation: string;
  tooltip: string;
  latency: number;
}

// Real-time Event System
export interface RealTimeEvent {
  id: string;
  type: RealTimeEventType;
  payload: any;
  timestamp: Date;
  playerId: string;
  roomCode: string;
  version: number; // For conflict resolution
}

export type RealTimeEventType = 
  | 'player_joined'
  | 'player_left'
  | 'player_reconnected'
  | 'vote_cast'
  | 'vote_retracted'
  | 'mission_team_selected'
  | 'mission_team_submitted'
  | 'mission_vote_cast'
  | 'mission_result_revealed'
  | 'game_phase_changed'
  | 'game_state_updated'
  | 'settings_changed'
  | 'player_ready_changed'
  | 'player_ready_status'
  | 'role_revealed'
  | 'assassin_target_selected'
  | 'game_ended'
  | 'typing_indicator'
  | 'player_activity'
  | 'connection_status_changed'
  | 'sync_conflict'
  | 'error_occurred'
  | 'voting_progress_updated'
  | 'room_state_sync';

// Action Queue System
export interface QueuedAction {
  id: string;
  type: string;
  payload: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ActionQueue {
  actions: QueuedAction[];
  isProcessing: boolean;
  lastProcessed: Date;
  errors: QueueError[];
}

export interface QueueError {
  actionId: string;
  error: string;
  timestamp: Date;
  retryable: boolean;
}

// Optimistic UI Updates
export interface OptimisticUpdate {
  id: string;
  type: string;
  localState: any;
  originalState: any;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'rejected';
  rollbackFn?: () => void;
}

export interface OptimisticState {
  updates: OptimisticUpdate[];
  conflicts: SyncConflict[];
  pendingCount: number;
}

// Synchronization Conflicts
export interface SyncConflict {
  id: string;
  type: 'state_mismatch' | 'version_conflict' | 'timestamp_conflict' | 'concurrent_action';
  localVersion: number;
  serverVersion: number;
  conflictData: any;
  timestamp: Date;
  resolved: boolean;
  resolution?: ConflictResolution;
}

export interface ConflictResolution {
  strategy: 'server_wins' | 'client_wins' | 'merge' | 'user_choice';
  mergedState?: any;
  timestamp: Date;
}

// Real-time Animations
export interface RealTimeAnimations {
  connectionPulse: {
    online: string;
    offline: string;
    reconnecting: string;
  };
  syncStates: {
    syncing: string;
    synced: string;
    conflict: string;
    error: string;
  };
  activityIndicators: {
    typing: string;
    voting: string;
    selecting: string;
    idle: string;
  };
}

// Synchronization Patterns
export interface SyncPatterns {
  immediate: {
    events: RealTimeEventType[];
    animation: string;
    fallback: string;
  };
  batched: {
    events: RealTimeEventType[];
    interval: number;
    animation: string;
  };
  periodic: {
    events: RealTimeEventType[];
    interval: number;
    animation: string;
  };
}

// Player Activity Tracking
export interface PlayerActivity {
  playerId: string;
  activity: ActivityType;
  timestamp: Date;
  metadata?: any;
}

export type ActivityType = 
  | 'online'
  | 'offline'
  | 'typing'
  | 'voting'
  | 'selecting_team'
  | 'viewing_role'
  | 'idle'
  | 'reconnecting';

// Room Synchronization State
export interface RoomSyncState {
  roomCode: string;
  version: number;
  lastUpdated: Date;
  connectedPlayers: string[];
  playerActivities: PlayerActivity[];
  pendingEvents: RealTimeEvent[];
  syncStatus: 'synced' | 'syncing' | 'conflict' | 'error';
}

// Error Recovery
export interface ErrorRecovery {
  connectionError: {
    ui: string;
    action: string;
    animation: string;
  };
  stateConflict: {
    ui: string;
    action: string;
    animation: string;
  };
  serverError: {
    ui: string;
    action: string;
    animation: string;
  };
}

// Performance Monitoring
export interface PerformanceMetrics {
  latency: number;
  eventProcessingTime: number;
  queueSize: number;
  errorRate: number;
  reconnectionCount: number;
  syncConflicts: number;
  timestamp: Date;
}

// Socket.IO Configuration
export interface SocketConfig {
  url: string;
  options: {
    transports: string[];
    reconnection: boolean;
    reconnectionDelay: number;
    reconnectionDelayMax: number;
    maxReconnectionAttempts: number;
    timeout: number;
  };
}

// Real-time Hooks Interface
export interface UseRealTimeSync {
  connectionState: ConnectionState;
  isConnected: boolean;
  latency: number;
  queuedActions: QueuedAction[];
  optimisticUpdates: OptimisticUpdate[];
  conflicts: SyncConflict[];
  metrics: PerformanceMetrics;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  sendEvent: (event: Omit<RealTimeEvent, 'id' | 'timestamp'>) => void;
  retryFailedActions: () => void;
  resolveConflict: (conflictId: string, resolution: ConflictResolution) => void;
  
  // Optimistic updates
  optimisticUpdate: <T>(type: string, update: T, rollbackFn?: () => void) => void;
  confirmUpdate: (updateId: string) => void;
  rejectUpdate: (updateId: string) => void;
}

// Constants
export const REAL_TIME_CONSTANTS = {
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  BATCH_INTERVAL_MS: 200,
  HEARTBEAT_INTERVAL_MS: 30000,
  RECONNECTION_DELAY_MS: 2000,
  MAX_RECONNECTION_ATTEMPTS: 10,
  QUEUE_SIZE_LIMIT: 100,
  OPTIMISTIC_UPDATE_TIMEOUT_MS: 5000,
  SYNC_TIMEOUT_MS: 10000,
  PERFORMANCE_SAMPLE_INTERVAL_MS: 5000,
} as const;

export const ANIMATION_CLASSES: RealTimeAnimations = {
  connectionPulse: {
    online: 'animate-pulse text-green-500',
    offline: 'animate-bounce text-red-500',
    reconnecting: 'animate-spin text-yellow-500',
  },
  syncStates: {
    syncing: 'animate-spin border-blue-500',
    synced: 'animate-bounce text-green-500',
    conflict: 'animate-shake text-yellow-500',
    error: 'animate-pulse text-red-500',
  },
  activityIndicators: {
    typing: 'animate-pulse opacity-75',
    voting: 'animate-bounce text-blue-500',
    selecting: 'animate-spin text-purple-500',
    idle: 'opacity-50',
  },
} as const;

export const SYNC_PATTERNS: SyncPatterns = {
  immediate: {
    events: ['vote_cast', 'mission_team_selected', 'game_phase_changed', 'game_state_updated'],
    animation: 'instant-feedback',
    fallback: 'queue-and-retry',
  },
  batched: {
    events: ['player_activity', 'typing_indicator'],
    interval: 200,
    animation: 'smooth-update',
  },
  periodic: {
    events: ['connection_status_changed'],
    interval: 5000,
    animation: 'background-sync',
  },
} as const;

export const ERROR_RECOVERY: ErrorRecovery = {
  connectionError: {
    ui: 'show-reconnection-banner',
    action: 'auto-retry-with-backoff',
    animation: 'pulse-reconnecting-indicator',
  },
  stateConflict: {
    ui: 'show-conflict-resolution-modal',
    action: 'merge-states-with-user-input',
    animation: 'highlight-conflicting-elements',
  },
  serverError: {
    ui: 'show-error-message-with-retry',
    action: 'retry-with-exponential-backoff',
    animation: 'shake-error-element',
  },
} as const;
