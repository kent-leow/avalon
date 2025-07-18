/**
 * Game Error Recovery System Types
 * 
 * Type definitions for comprehensive error handling and recovery
 * mechanisms across all game features.
 */

export interface GameError {
  id: string;
  type: ErrorType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  technicalDetails?: string;
  recoverable: boolean;
  timestamp: number;
  context: ErrorContext;
  affectedFeatures: string[];
  retryable: boolean;
}

export interface ErrorContext {
  roomCode?: string;
  playerId?: string;
  gamePhase?: string;
  actionType?: string;
  userAgent?: string;
  connectionType?: string;
  additionalData?: Record<string, unknown>;
}

export interface RecoveryState {
  isRecovering: boolean;
  activeErrors: GameError[];
  recoveryProgress: number;
  lastRecoveryAttempt: number | null;
  recoveryAttempts: number;
  maxRecoveryAttempts: number;
  recoveryStrategy: RecoveryStrategy | null;
  fallbackActive: boolean;
}

export interface RecoveryStrategy {
  id: string;
  name: string;
  description: string;
  priority: number;
  estimatedTime: number;
  actions: RecoveryAction[];
  fallbackStrategy?: RecoveryStrategy;
}

export interface RecoveryAction {
  type: RecoveryActionType;
  label: string;
  description: string;
  automated: boolean;
  requiresUserConfirmation: boolean;
  estimatedTime: number;
  execute: () => Promise<RecoveryResult>;
}

export interface RecoveryResult {
  success: boolean;
  message: string;
  errorResolved: boolean;
  partialRecovery: boolean;
  fallbackActivated: boolean;
  recoveryTime: number;
  newErrors?: GameError[];
}

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryableErrors: ErrorType[];
}

export interface FallbackConfig {
  enableOfflineMode: boolean;
  enableReducedFunctionality: boolean;
  fallbackComponents: Record<string, React.ComponentType>;
  fallbackTimeouts: Record<string, number>;
  gracefulDegradation: boolean;
}

export interface ConnectionState {
  isConnected: boolean;
  connectionType: 'online' | 'offline' | 'slow' | 'unstable';
  latency: number;
  bandwidth: number;
  lastHeartbeat: number;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

export interface ConnectionError extends GameError {
  type: 'connection';
  connectionType: string;
  isTemporary: boolean;
  canRetry: boolean;
  estimatedRecoveryTime: number;
}

export interface FailedAction {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
  attempts: number;
  maxAttempts: number;
  error: GameError;
  nextRetryAt: number;
}

export interface RecoveryNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  actions?: RecoveryAction[];
  dismissible: boolean;
  autoHide: boolean;
  duration?: number;
  timestamp: number;
}

export interface ErrorAnalytics {
  errorCount: number;
  errorRate: number;
  recoveryRate: number;
  averageRecoveryTime: number;
  commonErrors: Array<{
    error: GameError;
    count: number;
    recoverySuccess: number;
  }>;
  failurePatterns: string[];
}

// Error Recovery System Configuration
export interface GameErrorRecoveryConfig {
  retryConfig: RetryConfig;
  fallbackConfig: FallbackConfig;
  notificationConfig: {
    showTechnicalDetails: boolean;
    autoHideSuccess: boolean;
    maxNotifications: number;
  };
  recoveryTimeouts: {
    connectionRecovery: number;
    stateRecovery: number;
    fallbackActivation: number;
  };
  enableAnalytics: boolean;
  debugMode: boolean;
}

// Component Props Types
export interface GameErrorRecoverySystemProps {
  children: React.ReactNode;
  roomCode: string;
  playerId: string;
  config?: Partial<GameErrorRecoveryConfig>;
  onRecoveryStart?: (error: GameError) => void;
  onRecoveryComplete?: (result: RecoveryResult) => void;
  onRecoveryFailed?: (error: GameError) => void;
  onFallbackActivated?: (feature: string) => void;
}

export interface ConnectionRecoveryManagerProps {
  connectionState: ConnectionState;
  onConnectionRecovered?: () => void;
  onConnectionFailed?: (error: ConnectionError) => void;
  retryConfig?: RetryConfig;
  enableAutoReconnect?: boolean;
}

export interface ErrorMessageCenterProps {
  errors: GameError[];
  notifications: RecoveryNotification[];
  onErrorDismiss?: (errorId: string) => void;
  onRetryAction?: (action: RecoveryAction) => void;
  onNotificationDismiss?: (notificationId: string) => void;
  showRecoveryOptions?: boolean;
  showTechnicalDetails?: boolean;
}

export interface RetryMechanismProps {
  failedActions: FailedAction[];
  retryConfig: RetryConfig;
  onRetrySuccess?: (action: FailedAction) => void;
  onRetryFailed?: (action: FailedAction) => void;
  onMaxRetriesExceeded?: (action: FailedAction) => void;
}

export interface FallbackHandlerProps {
  children: React.ReactNode;
  fallbackConfig: FallbackConfig;
  onFallbackActivated?: (feature: string) => void;
  onFallbackDeactivated?: (feature: string) => void;
  enabledFeatures: string[];
}

export interface RecoveryUIProps {
  recoveryState: RecoveryState;
  onRecoveryAction?: (action: RecoveryAction) => void;
  onManualRecovery?: () => void;
  onCancelRecovery?: () => void;
  showProgress?: boolean;
  showAdvancedOptions?: boolean;
}

// Type Unions
export type ErrorType = 
  | 'connection' 
  | 'state' 
  | 'validation' 
  | 'timeout' 
  | 'auth' 
  | 'network' 
  | 'server' 
  | 'client' 
  | 'unknown';

export type RecoveryActionType = 
  | 'retry' 
  | 'refresh' 
  | 'reconnect' 
  | 'fallback' 
  | 'ignore' 
  | 'reset' 
  | 'reload' 
  | 'restore';

export type RecoveryStatus = 
  | 'idle' 
  | 'detecting' 
  | 'recovering' 
  | 'success' 
  | 'failed' 
  | 'fallback';

// Default configurations
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  jitter: true,
  retryableErrors: ['connection', 'timeout', 'network', 'server'],
};

export const DEFAULT_FALLBACK_CONFIG: FallbackConfig = {
  enableOfflineMode: true,
  enableReducedFunctionality: true,
  fallbackComponents: {},
  fallbackTimeouts: {
    connection: 5000,
    state: 3000,
    render: 2000,
  },
  gracefulDegradation: true,
};

export const DEFAULT_GAME_ERROR_RECOVERY_CONFIG: GameErrorRecoveryConfig = {
  retryConfig: DEFAULT_RETRY_CONFIG,
  fallbackConfig: DEFAULT_FALLBACK_CONFIG,
  notificationConfig: {
    showTechnicalDetails: false,
    autoHideSuccess: true,
    maxNotifications: 5,
  },
  recoveryTimeouts: {
    connectionRecovery: 10000,
    stateRecovery: 5000,
    fallbackActivation: 3000,
  },
  enableAnalytics: true,
  debugMode: false,
};
