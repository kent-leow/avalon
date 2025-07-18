/**
 * Real-time Synchronization Utilities
 * Comprehensive utility functions for Socket.IO-based real-time synchronization
 */

import type { 
  ConnectionState, 
  ConnectionIndicator, 
  RealTimeEvent, 
  QueuedAction, 
  OptimisticUpdate, 
  SyncConflict, 
  ConflictResolution,
  PerformanceMetrics,
  PlayerActivity,
  RoomSyncState,
} from '~/types/real-time-sync';

import {
  REAL_TIME_CONSTANTS,
  ANIMATION_CLASSES,
  SYNC_PATTERNS,
  ERROR_RECOVERY,
} from '~/types/real-time-sync';

// Re-export constants for easier access
export { REAL_TIME_CONSTANTS, ANIMATION_CLASSES, SYNC_PATTERNS, ERROR_RECOVERY };

// Connection State Management
export function createConnectionState(
  playerId: string,
  roomCode: string,
  socketId?: string
): ConnectionState {
  return {
    status: 'disconnected',
    latency: 0,
    lastSeen: new Date(),
    retryCount: 0,
    queuedActions: [],
    socketId,
    playerId,
    roomCode,
  };
}

export function getConnectionIndicator(state: ConnectionState): ConnectionIndicator {
  const { latency, status } = state;
  
  let signal: ConnectionIndicator['signal'] = 'offline';
  let color = 'text-red-500';
  let animation = ANIMATION_CLASSES.connectionPulse.offline;
  let tooltip = 'Offline';

  if (status === 'connected') {
    if (latency < 100) {
      signal = 'excellent';
      color = 'text-green-500';
      animation = ANIMATION_CLASSES.connectionPulse.online;
      tooltip = `Excellent connection (${latency}ms)`;
    } else if (latency < 300) {
      signal = 'good';
      color = 'text-green-400';
      animation = ANIMATION_CLASSES.connectionPulse.online;
      tooltip = `Good connection (${latency}ms)`;
    } else {
      signal = 'poor';
      color = 'text-yellow-500';
      animation = ANIMATION_CLASSES.connectionPulse.online;
      tooltip = `Poor connection (${latency}ms)`;
    }
  } else if (status === 'reconnecting') {
    signal = 'offline';
    color = 'text-yellow-500';
    animation = ANIMATION_CLASSES.connectionPulse.reconnecting;
    tooltip = 'Reconnecting...';
  }

  return {
    signal,
    color,
    animation,
    tooltip,
    latency,
  };
}

// Event Management
export function createRealTimeEvent(
  type: RealTimeEvent['type'],
  payload: any,
  playerId: string,
  roomCode: string,
  version = 1
): RealTimeEvent {
  return {
    id: generateEventId(),
    type,
    payload,
    timestamp: new Date(),
    playerId,
    roomCode,
    version,
  };
}

export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Action Queue Management
export function createQueuedAction(
  type: string,
  payload: any,
  maxRetries: number = REAL_TIME_CONSTANTS.MAX_RETRY_ATTEMPTS
): QueuedAction {
  return {
    id: generateEventId(),
    type,
    payload,
    timestamp: new Date(),
    retryCount: 0,
    maxRetries,
    status: 'pending',
  };
}

export function shouldRetryAction(action: QueuedAction): boolean {
  return action.retryCount < action.maxRetries && action.status === 'failed';
}

export function getRetryDelay(retryCount: number): number {
  return Math.min(
    REAL_TIME_CONSTANTS.RETRY_DELAY_MS * Math.pow(2, retryCount),
    10000
  );
}

export function processActionQueue(
  actions: QueuedAction[],
  processor: (action: QueuedAction) => Promise<void>
): Promise<void> {
  return new Promise((resolve) => {
    const pendingActions = actions.filter(action => 
      action.status === 'pending' || shouldRetryAction(action)
    );

    if (pendingActions.length === 0) {
      resolve();
      return;
    }

    const processNext = async () => {
      const action = pendingActions.shift();
      if (!action) {
        resolve();
        return;
      }

      try {
        action.status = 'processing';
        await processor(action);
        action.status = 'completed';
      } catch (error) {
        action.status = 'failed';
        action.retryCount++;
        
        if (shouldRetryAction(action)) {
          setTimeout(() => {
            pendingActions.push(action);
            processNext();
          }, getRetryDelay(action.retryCount));
        }
      }

      processNext();
    };

    processNext();
  });
}

// Optimistic Updates
export function createOptimisticUpdate(
  type: string,
  localState: any,
  originalState: any,
  rollbackFn?: () => void
): OptimisticUpdate {
  return {
    id: generateEventId(),
    type,
    localState,
    originalState,
    timestamp: new Date(),
    status: 'pending',
    rollbackFn,
  };
}

export function isOptimisticUpdateExpired(update: OptimisticUpdate): boolean {
  const now = new Date();
  const elapsed = now.getTime() - update.timestamp.getTime();
  return elapsed > REAL_TIME_CONSTANTS.OPTIMISTIC_UPDATE_TIMEOUT_MS;
}

export function rollbackOptimisticUpdate(update: OptimisticUpdate): void {
  if (update.rollbackFn) {
    update.rollbackFn();
  }
}

// Conflict Resolution
export function createSyncConflict(
  type: SyncConflict['type'],
  localVersion: number,
  serverVersion: number,
  conflictData: any
): SyncConflict {
  return {
    id: generateEventId(),
    type,
    localVersion,
    serverVersion,
    conflictData,
    timestamp: new Date(),
    resolved: false,
  };
}

export function resolveConflict(
  conflict: SyncConflict,
  resolution: ConflictResolution
): SyncConflict {
  return {
    ...conflict,
    resolved: true,
    resolution: {
      ...resolution,
      timestamp: new Date(),
    },
  };
}

export function mergeStates(localState: any, serverState: any, strategy: ConflictResolution['strategy']): any {
  switch (strategy) {
    case 'server_wins':
      return serverState;
    case 'client_wins':
      return localState;
    case 'merge':
      return { ...localState, ...serverState };
    default:
      return serverState;
  }
}

// Performance Monitoring
export function createPerformanceMetrics(
  latency: number,
  eventProcessingTime: number,
  queueSize: number,
  errorRate: number,
  reconnectionCount: number,
  syncConflicts: number
): PerformanceMetrics {
  return {
    latency,
    eventProcessingTime,
    queueSize,
    errorRate,
    reconnectionCount,
    syncConflicts,
    timestamp: new Date(),
  };
}

export function calculateLatency(sentTime: Date, receivedTime: Date): number {
  return receivedTime.getTime() - sentTime.getTime();
}

export function calculateErrorRate(totalEvents: number, errorCount: number): number {
  return totalEvents > 0 ? (errorCount / totalEvents) * 100 : 0;
}

// Player Activity Tracking
export function createPlayerActivity(
  playerId: string,
  activity: PlayerActivity['activity'],
  metadata?: any
): PlayerActivity {
  return {
    playerId,
    activity,
    timestamp: new Date(),
    metadata,
  };
}

export function isPlayerActive(activity: PlayerActivity): boolean {
  const now = new Date();
  const elapsed = now.getTime() - activity.timestamp.getTime();
  return elapsed < 60000 && activity.activity !== 'offline'; // 1 minute
}

export function getPlayerActivityAnimation(activity: PlayerActivity['activity']): string {
  switch (activity) {
    case 'typing':
      return ANIMATION_CLASSES.activityIndicators.typing;
    case 'voting':
      return ANIMATION_CLASSES.activityIndicators.voting;
    case 'selecting_team':
      return ANIMATION_CLASSES.activityIndicators.selecting;
    case 'online':
      return ANIMATION_CLASSES.connectionPulse.online;
    case 'offline':
      return ANIMATION_CLASSES.connectionPulse.offline;
    case 'reconnecting':
      return ANIMATION_CLASSES.connectionPulse.reconnecting;
    default:
      return ANIMATION_CLASSES.activityIndicators.idle;
  }
}

// Room Synchronization
export function createRoomSyncState(
  roomCode: string,
  connectedPlayers: string[],
  version = 1
): RoomSyncState {
  return {
    roomCode,
    version,
    lastUpdated: new Date(),
    connectedPlayers,
    playerActivities: [],
    pendingEvents: [],
    syncStatus: 'synced',
  };
}

export function updateRoomSyncState(
  currentState: RoomSyncState,
  event: RealTimeEvent
): RoomSyncState {
  return {
    ...currentState,
    version: currentState.version + 1,
    lastUpdated: new Date(),
    pendingEvents: [...currentState.pendingEvents, event],
    syncStatus: 'syncing',
  };
}

// Event Filtering and Batching
export function shouldBatchEvent(eventType: RealTimeEvent['type']): boolean {
  return SYNC_PATTERNS.batched.events.includes(eventType);
}

export function shouldProcessImmediately(eventType: RealTimeEvent['type']): boolean {
  return SYNC_PATTERNS.immediate.events.includes(eventType);
}

export function batchEvents(events: RealTimeEvent[], intervalMs: number): RealTimeEvent[][] {
  const batches: RealTimeEvent[][] = [];
  let currentBatch: RealTimeEvent[] = [];
  let batchStartTime: number | null = null;

  events.forEach(event => {
    const eventTime = event.timestamp.getTime();
    
    if (batchStartTime === null) {
      batchStartTime = eventTime;
      currentBatch = [event];
    } else if (eventTime - batchStartTime < intervalMs) {
      currentBatch.push(event);
    } else {
      batches.push(currentBatch);
      currentBatch = [event];
      batchStartTime = eventTime;
    }
  });

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}

// Error Recovery
export function getErrorRecoveryAction(errorType: keyof typeof ERROR_RECOVERY): string {
  return ERROR_RECOVERY[errorType].action;
}

export function getErrorRecoveryAnimation(errorType: keyof typeof ERROR_RECOVERY): string {
  return ERROR_RECOVERY[errorType].animation;
}

export function getErrorRecoveryUI(errorType: keyof typeof ERROR_RECOVERY): string {
  return ERROR_RECOVERY[errorType].ui;
}

// Validation Functions
export function validateEventPayload(event: RealTimeEvent): boolean {
  return !!(event.id && event.type && event.playerId && event.roomCode);
}

export function validateConnectionState(state: ConnectionState): boolean {
  return !!(state.playerId && state.roomCode && state.lastSeen);
}

export function validateOptimisticUpdate(update: OptimisticUpdate): boolean {
  return !!(update.id && update.type && update.timestamp);
}

// Utility Functions
export function formatLatency(latency: number): string {
  if (latency < 1000) {
    return `${latency}ms`;
  } else {
    return `${(latency / 1000).toFixed(1)}s`;
  }
}

export function formatTimestamp(timestamp: Date): string {
  return timestamp.toLocaleTimeString();
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
}

// Connection Quality Assessment
export function assessConnectionQuality(metrics: PerformanceMetrics): 'excellent' | 'good' | 'poor' | 'critical' {
  const { latency, errorRate, reconnectionCount } = metrics;
  
  if (latency < 100 && errorRate < 5 && reconnectionCount < 2) {
    return 'excellent';
  } else if (latency < 300 && errorRate < 10 && reconnectionCount < 5) {
    return 'good';
  } else if (latency < 1000 && errorRate < 20 && reconnectionCount < 10) {
    return 'poor';
  } else {
    return 'critical';
  }
}

// State Synchronization
export function synchronizeStates(
  localState: any,
  serverState: any,
  conflicts: SyncConflict[]
): { merged: any; newConflicts: SyncConflict[] } {
  const merged = { ...localState };
  const newConflicts: SyncConflict[] = [];

  Object.keys(serverState).forEach(key => {
    if (localState[key] !== serverState[key]) {
      // Potential conflict
      const conflict = createSyncConflict(
        'state_mismatch',
        localState.version || 1,
        serverState.version || 1,
        { key, localValue: localState[key], serverValue: serverState[key] }
      );
      newConflicts.push(conflict);
    }
  });

  return { merged, newConflicts };
}
