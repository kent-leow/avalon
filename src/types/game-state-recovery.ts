/**
 * Enhanced Game State Recovery Types
 * 
 * Comprehensive type definitions for game state recovery, persistence,
 * reconnection handling, and error recovery mechanisms.
 */

export type RecoveryStatus = 
  | 'stable'
  | 'saving'
  | 'recovering'
  | 'reconnecting'
  | 'failed'
  | 'timeout'
  | 'abandoned';

export type RecoveryAction = 
  | 'auto-save'
  | 'manual-save'
  | 'reconnect'
  | 'restore'
  | 'validate'
  | 'cleanup'
  | 'abandon';

export type PersistenceType = 
  | 'memory'
  | 'local-storage'
  | 'session-storage'
  | 'database'
  | 'redis';

export type RecoveryTrigger = 
  | 'timer'
  | 'action'
  | 'disconnect'
  | 'error'
  | 'manual'
  | 'server-restart';

export type PlayerConnectionState = 
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'timeout'
  | 'abandoned'
  | 'bot-replaced';

export type GameRecoveryPhase = 
  | 'detecting'
  | 'backing-up'
  | 'validating'
  | 'restoring'
  | 'synchronizing'
  | 'resuming'
  | 'complete';

export interface GameStateSnapshot {
  id: string;
  roomCode: string;
  timestamp: string;
  version: number;
  checksum: string;
  gameState: Record<string, any>;
  playerStates: Record<string, PlayerStateSnapshot>;
  metadata: SnapshotMetadata;
  compressionType?: 'gzip' | 'brotli' | 'none';
}

export interface PlayerStateSnapshot {
  playerId: string;
  sessionId: string;
  connectionState: PlayerConnectionState;
  lastActivity: string;
  gameData: Record<string, any>;
  uiState: Record<string, any>;
  pendingActions: PendingAction[];
  recoveryToken: string;
}

export interface PendingAction {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
  playerId: string;
  requiresValidation: boolean;
  retryCount: number;
  maxRetries: number;
}

export interface SnapshotMetadata {
  createdBy: 'timer' | 'action' | 'manual';
  gamePhase: string;
  playerCount: number;
  activeConnections: number;
  criticalAction: boolean;
  compressionRatio?: number;
  validationHash: string;
}

export interface RecoveryConfiguration {
  autoSaveInterval: number; // milliseconds
  maxSnapshots: number;
  compressionEnabled: boolean;
  persistenceTypes: PersistenceType[];
  reconnectionConfig: ReconnectionConfig;
  timeoutConfig: TimeoutConfig;
  validationConfig: ValidationConfig;
}

export interface ReconnectionConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
  jitterEnabled: boolean;
  gracePeriod: number; // milliseconds
}

export interface TimeoutConfig {
  playerTimeout: number; // milliseconds
  gamePhaseTimeout: Record<string, number>;
  reconnectionTimeout: number; // milliseconds
  abandonmentTimeout: number; // milliseconds
  massDisconnectionThreshold: number; // percentage
  pauseOnMassDisconnection: boolean;
}

export interface ValidationConfig {
  enableChecksums: boolean;
  enableStateValidation: boolean;
  enableActionValidation: boolean;
  strictMode: boolean;
  maxValidationRetries: number;
  validationTimeout: number; // milliseconds
}

export interface RecoveryState {
  status: RecoveryStatus;
  phase: GameRecoveryPhase;
  progress: number; // 0-100
  currentSnapshot: GameStateSnapshot | null;
  availableSnapshots: GameStateSnapshot[];
  playerStates: Record<string, PlayerRecoveryState>;
  errorHistory: RecoveryError[];
  recoveryStartTime: string | null;
  lastSuccessfulSave: string | null;
  nextScheduledSave: string | null;
}

export interface PlayerRecoveryState {
  playerId: string;
  connectionState: PlayerConnectionState;
  lastSeen: string;
  disconnectedAt: string | null;
  reconnectionAttempts: number;
  recoveryToken: string;
  botReplaced: boolean;
  timeoutWarning: boolean;
  pendingActions: PendingAction[];
}

export interface RecoveryError {
  id: string;
  type: 'save' | 'load' | 'validation' | 'reconnection' | 'timeout' | 'corruption';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: Record<string, any>;
  recovered: boolean;
  retryCount: number;
}

export interface RecoveryNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  playerId?: string;
  duration?: number; // milliseconds
  actions?: RecoveryNotificationAction[];
  dismissible: boolean;
}

export interface RecoveryNotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: () => void;
}

export interface RecoveryMetrics {
  totalSaves: number;
  totalRestores: number;
  totalReconnections: number;
  averageSaveTime: number;
  averageRestoreTime: number;
  averageReconnectionTime: number;
  failureRate: number;
  corruptionRate: number;
  timeoutRate: number;
  lastRecoveryTime: string | null;
}

export interface ConflictResolution {
  conflictId: string;
  type: 'action' | 'state' | 'timing';
  description: string;
  timestamp: string;
  conflictingActions: PendingAction[];
  resolution: ConflictResolutionStrategy;
  resolvedAction?: PendingAction;
  rejected: PendingAction[];
}

export interface ConflictResolutionStrategy {
  strategy: 'timestamp' | 'priority' | 'merge' | 'user-choice' | 'discard';
  rules: Record<string, any>;
  requiresUserInput: boolean;
  timeout: number; // milliseconds
}

export interface BotReplacementConfig {
  enabled: boolean;
  triggerTimeout: number; // milliseconds
  botBehavior: 'random' | 'conservative' | 'aggressive' | 'smart';
  notifyPlayers: boolean;
  allowPlayerReturn: boolean;
  maxReplacements: number;
}

export interface GamePauseConfig {
  enabled: boolean;
  massDisconnectionThreshold: number; // percentage
  pauseDuration: number; // milliseconds
  notificationMessage: string;
  allowManualResume: boolean;
  autoResumeConditions: string[];
}

export interface RecoveryHookConfig {
  beforeSave?: (snapshot: GameStateSnapshot) => Promise<GameStateSnapshot>;
  afterSave?: (snapshot: GameStateSnapshot) => Promise<void>;
  beforeRestore?: (snapshot: GameStateSnapshot) => Promise<boolean>;
  afterRestore?: (snapshot: GameStateSnapshot) => Promise<void>;
  onError?: (error: RecoveryError) => Promise<void>;
  onPlayerReconnect?: (playerId: string) => Promise<void>;
  onPlayerTimeout?: (playerId: string) => Promise<void>;
}

export interface PersistenceAdapter {
  save: (key: string, data: any) => Promise<void>;
  load: (key: string) => Promise<any>;
  remove: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  exists: (key: string) => Promise<boolean>;
  list: (prefix?: string) => Promise<string[]>;
}

export interface RecoveryAnalytics {
  sessionId: string;
  startTime: string;
  endTime: string | null;
  totalSaves: number;
  totalRestores: number;
  totalReconnections: number;
  errors: RecoveryError[];
  metrics: RecoveryMetrics;
  playerActivity: Record<string, PlayerActivityLog>;
}

export interface PlayerActivityLog {
  playerId: string;
  events: PlayerActivityEvent[];
  totalConnectedTime: number;
  totalDisconnectedTime: number;
  reconnectionCount: number;
  timeouts: number;
}

export interface PlayerActivityEvent {
  type: 'connect' | 'disconnect' | 'action' | 'timeout' | 'recovery';
  timestamp: string;
  data: Record<string, any>;
  duration?: number;
}

// Recovery configuration constants
export const DEFAULT_RECOVERY_CONFIG: RecoveryConfiguration = {
  autoSaveInterval: 30000, // 30 seconds
  maxSnapshots: 50,
  compressionEnabled: true,
  persistenceTypes: ['memory', 'local-storage', 'database'],
  reconnectionConfig: {
    maxAttempts: 5,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitterEnabled: true,
    gracePeriod: 5000
  },
  timeoutConfig: {
    playerTimeout: 300000, // 5 minutes
    gamePhaseTimeout: {
      'lobby': 600000, // 10 minutes
      'role-reveal': 120000, // 2 minutes
      'mission-proposal': 180000, // 3 minutes
      'voting': 120000, // 2 minutes
      'mission-execution': 180000, // 3 minutes
      'assassin-attempt': 300000, // 5 minutes
      'game-results': 300000 // 5 minutes
    },
    reconnectionTimeout: 60000, // 1 minute
    abandonmentTimeout: 900000, // 15 minutes
    massDisconnectionThreshold: 50, // 50% of players
    pauseOnMassDisconnection: true
  },
  validationConfig: {
    enableChecksums: true,
    enableStateValidation: true,
    enableActionValidation: true,
    strictMode: false,
    maxValidationRetries: 3,
    validationTimeout: 5000
  }
};

// Bot replacement configuration
export const DEFAULT_BOT_CONFIG: BotReplacementConfig = {
  enabled: true,
  triggerTimeout: 120000, // 2 minutes
  botBehavior: 'smart',
  notifyPlayers: true,
  allowPlayerReturn: true,
  maxReplacements: 3
};

// Game pause configuration
export const DEFAULT_PAUSE_CONFIG: GamePauseConfig = {
  enabled: true,
  massDisconnectionThreshold: 50,
  pauseDuration: 300000, // 5 minutes
  notificationMessage: 'Game paused due to connection issues. Waiting for players to reconnect...',
  allowManualResume: true,
  autoResumeConditions: ['all-players-connected', 'majority-connected']
};

// Recovery status messages
export const RECOVERY_MESSAGES = {
  SAVING: 'Saving game state...',
  RECOVERING: 'Recovering game state...',
  RECONNECTING: 'Reconnecting to game...',
  FAILED: 'Recovery failed. Please try again.',
  TIMEOUT: 'Connection timeout. Attempting to reconnect...',
  ABANDONED: 'Game abandoned due to inactivity.',
  SUCCESS: 'Game state recovered successfully!',
  PARTIAL: 'Partial recovery completed. Some data may be lost.',
  VALIDATION_FAILED: 'Game state validation failed. Starting fresh.',
  CONFLICT_DETECTED: 'Conflict detected. Resolving...',
  BOT_REPLACED: 'Player replaced by bot due to disconnection.',
  GAME_PAUSED: 'Game paused due to connection issues.',
  GAME_RESUMED: 'Game resumed. All players reconnected.'
};
