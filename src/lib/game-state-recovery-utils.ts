/**
 * Game State Recovery Utility Functions
 * 
 * Comprehensive utility functions for game state recovery, persistence,
 * reconnection handling, and error recovery mechanisms.
 */

import type {
  GameStateSnapshot,
  PlayerStateSnapshot,
  RecoveryState,
  RecoveryConfiguration,
  RecoveryError,
  RecoveryNotification,
  ConflictResolution,
  PendingAction,
  PlayerRecoveryState,
  RecoveryMetrics,
  PersistenceAdapter,
  RecoveryAnalytics,
  PlayerActivityLog,
  PlayerActivityEvent,
  ConflictResolutionStrategy
} from '~/types/game-state-recovery';

import {
  DEFAULT_RECOVERY_CONFIG,
  DEFAULT_BOT_CONFIG,
  DEFAULT_PAUSE_CONFIG,
  RECOVERY_MESSAGES
} from '~/types/game-state-recovery';

/**
 * Create initial recovery state
 */
export function createInitialRecoveryState(): RecoveryState {
  return {
    status: 'stable',
    phase: 'complete',
    progress: 100,
    currentSnapshot: null,
    availableSnapshots: [],
    playerStates: {},
    errorHistory: [],
    recoveryStartTime: null,
    lastSuccessfulSave: null,
    nextScheduledSave: new Date(Date.now() + DEFAULT_RECOVERY_CONFIG.autoSaveInterval).toISOString()
  };
}

/**
 * Create game state snapshot
 */
export function createGameStateSnapshot(
  roomCode: string,
  gameState: Record<string, any>,
  playerStates: Record<string, PlayerStateSnapshot>
): GameStateSnapshot {
  const timestamp = new Date().toISOString();
  const id = `snapshot_${roomCode}_${Date.now()}`;
  
  const snapshot: GameStateSnapshot = {
    id,
    roomCode,
    timestamp,
    version: 1,
    checksum: generateChecksum(gameState),
    gameState,
    playerStates,
    metadata: {
      createdBy: 'timer',
      gamePhase: gameState.phase || 'lobby',
      playerCount: Object.keys(playerStates).length,
      activeConnections: Object.values(playerStates).filter(p => p.connectionState === 'connected').length,
      criticalAction: false,
      validationHash: generateValidationHash({ gameState, playerStates })
    }
  };

  return snapshot;
}

/**
 * Create player state snapshot
 */
export function createPlayerStateSnapshot(
  playerId: string,
  sessionId: string,
  gameData: Record<string, any>,
  uiState: Record<string, any> = {}
): PlayerStateSnapshot {
  return {
    playerId,
    sessionId,
    connectionState: 'connected',
    lastActivity: new Date().toISOString(),
    gameData,
    uiState,
    pendingActions: [],
    recoveryToken: generateRecoveryToken(playerId, sessionId)
  };
}

/**
 * Generate checksum for data integrity
 */
export function generateChecksum(data: any): string {
  const jsonString = JSON.stringify(data, Object.keys(data).sort());
  return btoa(jsonString).substring(0, 32);
}

/**
 * Generate validation hash
 */
export function generateValidationHash(data: any): string {
  const jsonString = JSON.stringify(data, Object.keys(data).sort());
  // Simple hash function for validation
  let hash = 0;
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

/**
 * Generate recovery token
 */
export function generateRecoveryToken(playerId: string, sessionId: string): string {
  const timestamp = Date.now().toString();
  const tokenData = `${playerId}_${sessionId}_${timestamp}`;
  return btoa(tokenData);
}

/**
 * Validate game state snapshot
 */
export function validateSnapshot(snapshot: GameStateSnapshot): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!snapshot.id) errors.push('Missing snapshot ID');
  if (!snapshot.roomCode) errors.push('Missing room code');
  if (!snapshot.timestamp) errors.push('Missing timestamp');
  if (!snapshot.gameState) errors.push('Missing game state');
  if (!snapshot.playerStates) errors.push('Missing player states');

  // Validate checksum
  const expectedChecksum = generateChecksum(snapshot.gameState);
  if (snapshot.checksum !== expectedChecksum) {
    errors.push('Checksum mismatch - data may be corrupted');
  }

  // Validate player states
  Object.entries(snapshot.playerStates).forEach(([playerId, playerState]) => {
    if (!playerState.playerId) errors.push(`Missing player ID for ${playerId}`);
    if (!playerState.sessionId) errors.push(`Missing session ID for ${playerId}`);
    if (!playerState.recoveryToken) errors.push(`Missing recovery token for ${playerId}`);
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Compress snapshot data
 */
export function compressSnapshot(snapshot: GameStateSnapshot): GameStateSnapshot {
  // Simple compression simulation - in production, use actual compression
  const compressedSnapshot = { ...snapshot };
  compressedSnapshot.compressionType = 'gzip';
  
  if (compressedSnapshot.metadata) {
    compressedSnapshot.metadata.compressionRatio = 0.7; // Simulated compression ratio
  }
  
  return compressedSnapshot;
}

/**
 * Decompress snapshot data
 */
export function decompressSnapshot(snapshot: GameStateSnapshot): GameStateSnapshot {
  // Simple decompression simulation
  const decompressedSnapshot = { ...snapshot };
  delete decompressedSnapshot.compressionType;
  
  if (decompressedSnapshot.metadata) {
    delete decompressedSnapshot.metadata.compressionRatio;
  }
  
  return decompressedSnapshot;
}

/**
 * Calculate reconnection delay with exponential backoff
 */
export function calculateReconnectionDelay(
  attempt: number,
  config = DEFAULT_RECOVERY_CONFIG.reconnectionConfig
): number {
  const delay = Math.min(
    config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
    config.maxDelay
  );
  
  // Add jitter to prevent thundering herd
  if (config.jitterEnabled) {
    const jitter = Math.random() * 0.1 * delay;
    return delay + jitter;
  }
  
  return delay;
}

/**
 * Check if player has timed out
 */
export function hasPlayerTimedOut(
  playerState: PlayerRecoveryState,
  config = DEFAULT_RECOVERY_CONFIG.timeoutConfig
): boolean {
  if (playerState.connectionState === 'connected') return false;
  
  const lastSeen = new Date(playerState.lastSeen);
  const now = new Date();
  const timeSinceLastSeen = now.getTime() - lastSeen.getTime();
  
  return timeSinceLastSeen > config.playerTimeout;
}

/**
 * Check if game phase has timed out
 */
export function hasGamePhaseTimedOut(
  gamePhase: string,
  phaseStartTime: string,
  config = DEFAULT_RECOVERY_CONFIG.timeoutConfig
): boolean {
  const phaseTimeout = config.gamePhaseTimeout[gamePhase] || config.playerTimeout;
  const startTime = new Date(phaseStartTime);
  const now = new Date();
  const timeSinceStart = now.getTime() - startTime.getTime();
  
  return timeSinceStart > phaseTimeout;
}

/**
 * Detect mass disconnection
 */
export function detectMassDisconnection(
  playerStates: Record<string, PlayerRecoveryState>,
  config = DEFAULT_RECOVERY_CONFIG.timeoutConfig
): boolean {
  const totalPlayers = Object.keys(playerStates).length;
  if (totalPlayers === 0) return false;
  
  const disconnectedPlayers = Object.values(playerStates).filter(
    state => state.connectionState === 'disconnected' || state.connectionState === 'timeout'
  ).length;
  
  const disconnectionRate = (disconnectedPlayers / totalPlayers) * 100;
  return disconnectionRate >= config.massDisconnectionThreshold;
}

/**
 * Resolve action conflicts
 */
export function resolveActionConflicts(
  conflictingActions: PendingAction[],
  strategy: ConflictResolutionStrategy
): ConflictResolution {
  const conflictId = `conflict_${Date.now()}`;
  let resolvedAction: PendingAction | undefined;
  let rejected: PendingAction[] = [];
  
  switch (strategy.strategy) {
    case 'timestamp':
      // Use the earliest action
      resolvedAction = conflictingActions.reduce((earliest, current) => 
        new Date(current.timestamp) < new Date(earliest.timestamp) ? current : earliest
      );
      rejected = conflictingActions.filter(action => action.id !== resolvedAction!.id);
      break;
      
    case 'priority':
      // Use priority rules (implementation depends on action types)
      resolvedAction = conflictingActions[0]; // Simplified
      rejected = conflictingActions.slice(1);
      break;
      
    case 'merge':
      // Merge compatible actions
      resolvedAction = mergeActions(conflictingActions);
      rejected = [];
      break;
      
    case 'discard':
      // Discard all conflicting actions
      resolvedAction = undefined;
      rejected = conflictingActions;
      break;
      
    default:
      // Default to timestamp strategy
      resolvedAction = conflictingActions[0];
      rejected = conflictingActions.slice(1);
  }
  
  return {
    conflictId,
    type: 'action',
    description: `Resolved ${conflictingActions.length} conflicting actions using ${strategy.strategy} strategy`,
    timestamp: new Date().toISOString(),
    conflictingActions,
    resolution: strategy,
    resolvedAction,
    rejected
  };
}

/**
 * Merge compatible actions
 */
function mergeActions(actions: PendingAction[]): PendingAction {
  // Simple merge - in production, this would be more sophisticated
  if (actions.length === 0) {
    throw new Error('Cannot merge empty actions array');
  }
  
  const baseAction = actions[0]!;
  const mergedPayload = actions.reduce((merged, action) => ({
    ...merged,
    ...action.payload
  }), {});
  
  return {
    ...baseAction,
    id: `merged_${Date.now()}`,
    payload: mergedPayload,
    timestamp: new Date().toISOString()
  };
}

/**
 * Create recovery error
 */
export function createRecoveryError(
  type: RecoveryError['type'],
  message: string,
  severity: RecoveryError['severity'] = 'medium',
  context: Record<string, any> = {}
): RecoveryError {
  return {
    id: `error_${Date.now()}`,
    type,
    message,
    timestamp: new Date().toISOString(),
    severity,
    context,
    recovered: false,
    retryCount: 0
  };
}

/**
 * Create recovery notification
 */
export function createRecoveryNotification(
  type: RecoveryNotification['type'],
  title: string,
  message: string,
  options: Partial<RecoveryNotification> = {}
): RecoveryNotification {
  return {
    id: `notification_${Date.now()}`,
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    dismissible: true,
    ...options
  };
}

/**
 * Calculate recovery metrics
 */
export function calculateRecoveryMetrics(analytics: RecoveryAnalytics): RecoveryMetrics {
  const now = new Date();
  const startTime = new Date(analytics.startTime);
  const totalTime = now.getTime() - startTime.getTime();
  
  const totalOperations = analytics.totalSaves + analytics.totalRestores + analytics.totalReconnections;
  const totalErrors = analytics.errors.length;
  
  return {
    totalSaves: analytics.totalSaves,
    totalRestores: analytics.totalRestores,
    totalReconnections: analytics.totalReconnections,
    averageSaveTime: totalTime / Math.max(analytics.totalSaves, 1),
    averageRestoreTime: totalTime / Math.max(analytics.totalRestores, 1),
    averageReconnectionTime: totalTime / Math.max(analytics.totalReconnections, 1),
    failureRate: totalOperations > 0 ? (totalErrors / totalOperations) * 100 : 0,
    corruptionRate: analytics.errors.filter(e => e.type === 'corruption').length / Math.max(totalOperations, 1) * 100,
    timeoutRate: analytics.errors.filter(e => e.type === 'timeout').length / Math.max(totalOperations, 1) * 100,
    lastRecoveryTime: analytics.endTime
  };
}

/**
 * Create player activity log
 */
export function createPlayerActivityLog(playerId: string): PlayerActivityLog {
  return {
    playerId,
    events: [],
    totalConnectedTime: 0,
    totalDisconnectedTime: 0,
    reconnectionCount: 0,
    timeouts: 0
  };
}

/**
 * Add player activity event
 */
export function addPlayerActivityEvent(
  activityLog: PlayerActivityLog,
  event: Omit<PlayerActivityEvent, 'timestamp'>
): PlayerActivityLog {
  const newEvent: PlayerActivityEvent = {
    ...event,
    timestamp: new Date().toISOString()
  };
  
  const updatedLog = { ...activityLog };
  updatedLog.events.push(newEvent);
  
  // Update counters
  switch (event.type) {
    case 'connect':
      updatedLog.reconnectionCount++;
      break;
    case 'timeout':
      updatedLog.timeouts++;
      break;
  }
  
  return updatedLog;
}

/**
 * Clean up old snapshots
 */
export function cleanupOldSnapshots(
  snapshots: GameStateSnapshot[],
  maxSnapshots: number = DEFAULT_RECOVERY_CONFIG.maxSnapshots
): GameStateSnapshot[] {
  if (snapshots.length <= maxSnapshots) return snapshots;
  
  // Sort by timestamp and keep the most recent
  const sortedSnapshots = snapshots.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return sortedSnapshots.slice(0, maxSnapshots);
}

/**
 * Estimate snapshot size
 */
export function estimateSnapshotSize(snapshot: GameStateSnapshot): number {
  const jsonString = JSON.stringify(snapshot);
  return new Blob([jsonString]).size;
}

/**
 * Create persistence adapter for localStorage
 */
export function createLocalStorageAdapter(prefix: string = 'avalon_recovery_'): PersistenceAdapter {
  return {
    async save(key: string, data: any): Promise<void> {
      const fullKey = `${prefix}${key}`;
      const serialized = JSON.stringify(data);
      localStorage.setItem(fullKey, serialized);
    },
    
    async load(key: string): Promise<any> {
      const fullKey = `${prefix}${key}`;
      const serialized = localStorage.getItem(fullKey);
      if (!serialized) return null;
      return JSON.parse(serialized);
    },
    
    async remove(key: string): Promise<void> {
      const fullKey = `${prefix}${key}`;
      localStorage.removeItem(fullKey);
    },
    
    async clear(): Promise<void> {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix));
      keys.forEach(key => localStorage.removeItem(key));
    },
    
    async exists(key: string): Promise<boolean> {
      const fullKey = `${prefix}${key}`;
      return localStorage.getItem(fullKey) !== null;
    },
    
    async list(keyPrefix?: string): Promise<string[]> {
      const searchPrefix = keyPrefix ? `${prefix}${keyPrefix}` : prefix;
      return Object.keys(localStorage)
        .filter(key => key.startsWith(searchPrefix))
        .map(key => key.substring(prefix.length));
    }
  };
}

/**
 * Create persistence adapter for sessionStorage
 */
export function createSessionStorageAdapter(prefix: string = 'avalon_session_'): PersistenceAdapter {
  return {
    async save(key: string, data: any): Promise<void> {
      const fullKey = `${prefix}${key}`;
      const serialized = JSON.stringify(data);
      sessionStorage.setItem(fullKey, serialized);
    },
    
    async load(key: string): Promise<any> {
      const fullKey = `${prefix}${key}`;
      const serialized = sessionStorage.getItem(fullKey);
      if (!serialized) return null;
      return JSON.parse(serialized);
    },
    
    async remove(key: string): Promise<void> {
      const fullKey = `${prefix}${key}`;
      sessionStorage.removeItem(fullKey);
    },
    
    async clear(): Promise<void> {
      const keys = Object.keys(sessionStorage).filter(key => key.startsWith(prefix));
      keys.forEach(key => sessionStorage.removeItem(key));
    },
    
    async exists(key: string): Promise<boolean> {
      const fullKey = `${prefix}${key}`;
      return sessionStorage.getItem(fullKey) !== null;
    },
    
    async list(keyPrefix?: string): Promise<string[]> {
      const searchPrefix = keyPrefix ? `${prefix}${keyPrefix}` : prefix;
      return Object.keys(sessionStorage)
        .filter(key => key.startsWith(searchPrefix))
        .map(key => key.substring(prefix.length));
    }
  };
}

/**
 * Create in-memory persistence adapter
 */
export function createMemoryAdapter(): PersistenceAdapter {
  const storage = new Map<string, any>();
  
  return {
    async save(key: string, data: any): Promise<void> {
      storage.set(key, JSON.parse(JSON.stringify(data))); // Deep clone
    },
    
    async load(key: string): Promise<any> {
      const data = storage.get(key);
      return data ? JSON.parse(JSON.stringify(data)) : null; // Deep clone
    },
    
    async remove(key: string): Promise<void> {
      storage.delete(key);
    },
    
    async clear(): Promise<void> {
      storage.clear();
    },
    
    async exists(key: string): Promise<boolean> {
      return storage.has(key);
    },
    
    async list(prefix?: string): Promise<string[]> {
      const keys = Array.from(storage.keys());
      return prefix ? keys.filter(key => key.startsWith(prefix)) : keys;
    }
  };
}

/**
 * Validate recovery token
 */
export function validateRecoveryToken(token: string, playerId: string): boolean {
  try {
    const decoded = atob(token);
    const [tokenPlayerId] = decoded.split('_');
    return tokenPlayerId === playerId;
  } catch {
    return false;
  }
}

/**
 * Get recovery progress percentage
 */
export function getRecoveryProgress(phase: string, startTime: string): number {
  const phases = ['detecting', 'backing-up', 'validating', 'restoring', 'synchronizing', 'resuming', 'complete'];
  const currentPhaseIndex = phases.indexOf(phase);
  
  if (currentPhaseIndex === -1) return 0;
  if (phase === 'complete') return 100;
  
  const baseProgress = (currentPhaseIndex / (phases.length - 1)) * 100;
  
  // Add time-based progress within the current phase
  const phaseStartTime = new Date(startTime);
  const now = new Date();
  const timeInPhase = now.getTime() - phaseStartTime.getTime();
  const estimatedPhaseTime = 5000; // 5 seconds per phase
  const phaseProgress = Math.min((timeInPhase / estimatedPhaseTime) * (100 / phases.length), 100 / phases.length);
  
  return Math.min(baseProgress + phaseProgress, 100);
}
