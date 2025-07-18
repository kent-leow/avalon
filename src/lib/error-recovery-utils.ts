/**
 * Game Error Recovery Utilities
 * 
 * Utility functions for error handling, recovery strategies,
 * and error analysis across all game features.
 */

import type {
  GameError,
  ErrorContext,
  RecoveryStrategy,
  RecoveryAction,
  RecoveryResult,
  RetryConfig,
  ConnectionState,
  ConnectionError,
  FailedAction,
  RecoveryNotification,
  ErrorAnalytics,
  ErrorType,
  RecoveryActionType,
} from '~/types/game-error-recovery';

// Mock data generators for testing
export function createMockGameError(overrides: Partial<GameError> = {}): GameError {
  return {
    id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'connection',
    severity: 'medium',
    message: 'Connection to game server lost',
    technicalDetails: 'WebSocket connection closed with code 1006',
    recoverable: true,
    timestamp: Date.now(),
    context: {
      roomCode: 'DEMO',
      playerId: 'player-123',
      gamePhase: 'mission-selection',
      actionType: 'vote',
      userAgent: navigator.userAgent,
      connectionType: 'wifi',
    },
    affectedFeatures: ['realtime-sync', 'game-state'],
    retryable: true,
    ...overrides,
  };
}

export function createMockConnectionState(): ConnectionState {
  return {
    isConnected: Math.random() > 0.3,
    connectionType: 'online',
    latency: Math.floor(Math.random() * 200) + 50,
    bandwidth: Math.floor(Math.random() * 1000) + 100,
    lastHeartbeat: Date.now() - Math.floor(Math.random() * 5000),
    reconnectAttempts: Math.floor(Math.random() * 3),
    maxReconnectAttempts: 5,
  };
}

export function createMockRecoveryState() {
  return {
    isRecovering: false,
    activeErrors: [],
    recoveryProgress: 0,
    lastRecoveryAttempt: null,
    recoveryAttempts: 0,
    maxRecoveryAttempts: 3,
    recoveryStrategy: null,
    fallbackActive: false,
  };
}

export function createMockFailedAction(overrides: Partial<FailedAction> = {}): FailedAction {
  return {
    id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'vote',
    payload: { vote: 'approve', playerId: 'player-123' },
    timestamp: Date.now(),
    attempts: 1,
    maxAttempts: 3,
    error: createMockGameError(),
    nextRetryAt: Date.now() + 1000,
    ...overrides,
  };
}

// Error categorization and analysis
export function categorizeError(error: GameError): {
  category: 'critical' | 'recoverable' | 'transient';
  priority: number;
  urgency: number;
} {
  const { type, severity, recoverable } = error;
  
  if (severity === 'critical' || !recoverable) {
    return { category: 'critical', priority: 1, urgency: 1 };
  }
  
  if (type === 'connection' || type === 'network' || type === 'timeout') {
    return { category: 'transient', priority: 2, urgency: 2 };
  }
  
  return { category: 'recoverable', priority: 3, urgency: 3 };
}

export function analyzeErrorPattern(errors: GameError[]): {
  patterns: string[];
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
} {
  const patterns: string[] = [];
  const recommendations: string[] = [];
  let severity: 'low' | 'medium' | 'high' = 'low';
  
  // Analyze error frequency
  const errorCounts = errors.reduce((acc, error) => {
    acc[error.type] = (acc[error.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Detect patterns
  if ((errorCounts.connection ?? 0) > 5) {
    patterns.push('Frequent connection issues detected');
    recommendations.push('Check network stability');
    severity = 'high';
  }
  
  if ((errorCounts.timeout ?? 0) > 3) {
    patterns.push('Multiple timeout errors');
    recommendations.push('Consider increasing timeout values');
    severity = 'medium';
  }
  
  if ((errorCounts.validation ?? 0) > 2) {
    patterns.push('Validation errors detected');
    recommendations.push('Review input validation');
  }
  
  return { patterns, recommendations, severity };
}

export function generateRecoveryStrategies(error: GameError): RecoveryStrategy[] {
  const strategies: RecoveryStrategy[] = [];
  
  // Connection error strategies
  if (error.type === 'connection') {
    strategies.push({
      id: 'reconnect-strategy',
      name: 'Reconnect',
      description: 'Attempt to reconnect to the game server',
      priority: 1,
      estimatedTime: 5000,
      actions: [
        {
          type: 'reconnect',
          label: 'Reconnect',
          description: 'Reconnect to game server',
          automated: true,
          requiresUserConfirmation: false,
          estimatedTime: 3000,
          execute: async () => ({
            success: true,
            message: 'Successfully reconnected',
            errorResolved: true,
            partialRecovery: false,
            fallbackActivated: false,
            recoveryTime: 2500,
          }),
        },
      ],
    });
  }
  
  // State error strategies
  if (error.type === 'state') {
    strategies.push({
      id: 'state-recovery-strategy',
      name: 'Recover State',
      description: 'Restore game state from last known good state',
      priority: 2,
      estimatedTime: 3000,
      actions: [
        {
          type: 'restore',
          label: 'Restore State',
          description: 'Restore game state',
          automated: true,
          requiresUserConfirmation: false,
          estimatedTime: 2000,
          execute: async () => ({
            success: true,
            message: 'Game state restored',
            errorResolved: true,
            partialRecovery: false,
            fallbackActivated: false,
            recoveryTime: 1800,
          }),
        },
      ],
    });
  }
  
  // Timeout error strategies
  if (error.type === 'timeout') {
    strategies.push({
      id: 'retry-strategy',
      name: 'Retry Action',
      description: 'Retry the failed action with longer timeout',
      priority: 1,
      estimatedTime: 2000,
      actions: [
        {
          type: 'retry',
          label: 'Retry',
          description: 'Retry the failed action',
          automated: true,
          requiresUserConfirmation: false,
          estimatedTime: 1500,
          execute: async () => ({
            success: true,
            message: 'Action completed successfully',
            errorResolved: true,
            partialRecovery: false,
            fallbackActivated: false,
            recoveryTime: 1200,
          }),
        },
      ],
    });
  }
  
  // Fallback strategy for all errors
  strategies.push({
    id: 'fallback-strategy',
    name: 'Use Fallback',
    description: 'Switch to fallback mode with reduced functionality',
    priority: 999,
    estimatedTime: 1000,
    actions: [
      {
        type: 'fallback',
        label: 'Enable Fallback',
        description: 'Switch to fallback mode',
        automated: false,
        requiresUserConfirmation: true,
        estimatedTime: 500,
        execute: async () => ({
          success: true,
          message: 'Fallback mode activated',
          errorResolved: false,
          partialRecovery: true,
          fallbackActivated: true,
          recoveryTime: 300,
        }),
      },
    ],
  });
  
  return strategies.sort((a, b) => a.priority - b.priority);
}

// Retry utilities
export function calculateRetryDelay(
  attempt: number,
  config: RetryConfig
): number {
  const { initialDelay, maxDelay, backoffMultiplier, jitter } = config;
  
  let delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
  delay = Math.min(delay, maxDelay);
  
  if (jitter) {
    delay = delay * (0.5 + Math.random() * 0.5);
  }
  
  return Math.floor(delay);
}

export function shouldRetryError(error: GameError, config: RetryConfig): boolean {
  return config.retryableErrors.includes(error.type) && error.retryable;
}

export async function executeRetryWithBackoff<T>(
  action: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === config.maxRetries) {
        break;
      }
      
      const delay = calculateRetryDelay(attempt, config);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Error messaging utilities
export function formatErrorMessage(error: GameError, userFriendly: boolean = true): string {
  if (userFriendly) {
    switch (error.type) {
      case 'connection':
        return 'Connection to the game server was lost. We\'ll try to reconnect automatically.';
      case 'network':
        return 'Network issue detected. Please check your internet connection.';
      case 'timeout':
        return 'The action took too long to complete. Please try again.';
      case 'validation':
        return 'Invalid input detected. Please check your action and try again.';
      case 'auth':
        return 'Authentication expired. Please refresh the page.';
      case 'server':
        return 'Server error occurred. We\'re working to fix this.';
      case 'state':
        return 'Game state inconsistency detected. Attempting to recover.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  } else {
    return error.message;
  }
}

export function createRecoveryNotification(
  error: GameError,
  recoveryStrategy?: RecoveryStrategy
): RecoveryNotification {
  return {
    id: `notification-${error.id}`,
    type: error.severity === 'critical' ? 'error' : 'warning',
    title: getErrorTitle(error),
    message: formatErrorMessage(error, true),
    actions: recoveryStrategy?.actions || [],
    dismissible: error.severity !== 'critical',
    autoHide: error.severity === 'low',
    duration: error.severity === 'low' ? 5000 : undefined,
    timestamp: Date.now(),
  };
}

function getErrorTitle(error: GameError): string {
  switch (error.type) {
    case 'connection':
      return 'Connection Issue';
    case 'network':
      return 'Network Problem';
    case 'timeout':
      return 'Request Timeout';
    case 'validation':
      return 'Invalid Input';
    case 'auth':
      return 'Authentication Required';
    case 'server':
      return 'Server Error';
    case 'state':
      return 'State Recovery';
    default:
      return 'Unexpected Error';
  }
}

// Analytics utilities
export function calculateErrorAnalytics(
  errors: GameError[],
  recoveryResults: RecoveryResult[]
): ErrorAnalytics {
  const errorCount = errors.length;
  const timeWindow = 24 * 60 * 60 * 1000; // 24 hours
  const recentErrors = errors.filter(error => 
    Date.now() - error.timestamp < timeWindow
  );
  
  const errorRate = recentErrors.length / (timeWindow / (60 * 60 * 1000)); // errors per hour
  const successfulRecoveries = recoveryResults.filter(result => result.success).length;
  const recoveryRate = recoveryResults.length > 0 ? successfulRecoveries / recoveryResults.length : 0;
  
  const totalRecoveryTime = recoveryResults.reduce((sum, result) => sum + result.recoveryTime, 0);
  const averageRecoveryTime = recoveryResults.length > 0 ? totalRecoveryTime / recoveryResults.length : 0;
  
  // Common errors
  const errorTypeCounts = errors.reduce((acc, error) => {
    const key = `${error.type}-${error.message}`;
    if (!acc[key]) {
      acc[key] = { error, count: 0, recoverySuccess: 0 };
    }
    acc[key].count++;
    return acc;
  }, {} as Record<string, { error: GameError; count: number; recoverySuccess: number }>);
  
  const commonErrors = Object.values(errorTypeCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Failure patterns
  const failurePatterns: string[] = [];
  if (errorRate > 1) {
    failurePatterns.push('High error rate detected');
  }
  if (recoveryRate < 0.8) {
    failurePatterns.push('Low recovery success rate');
  }
  if (averageRecoveryTime > 10000) {
    failurePatterns.push('Slow recovery times');
  }
  
  return {
    errorCount,
    errorRate,
    recoveryRate,
    averageRecoveryTime,
    commonErrors,
    failurePatterns,
  };
}

// Connection utilities
export function isConnectionStable(connectionState: ConnectionState): boolean {
  const { isConnected, latency, lastHeartbeat } = connectionState;
  const heartbeatAge = Date.now() - lastHeartbeat;
  
  return isConnected && latency < 500 && heartbeatAge < 10000;
}

export function createConnectionError(
  connectionState: ConnectionState,
  context: ErrorContext
): ConnectionError {
  return {
    id: `connection-error-${Date.now()}`,
    type: 'connection',
    severity: connectionState.isConnected ? 'low' : 'high',
    message: connectionState.isConnected 
      ? 'Connection unstable' 
      : 'Connection lost',
    technicalDetails: `Latency: ${connectionState.latency}ms, Reconnect attempts: ${connectionState.reconnectAttempts}`,
    recoverable: true,
    timestamp: Date.now(),
    context,
    affectedFeatures: ['realtime-sync', 'game-state', 'player-actions'],
    retryable: true,
    connectionType: connectionState.connectionType,
    isTemporary: connectionState.reconnectAttempts < connectionState.maxReconnectAttempts,
    canRetry: connectionState.reconnectAttempts < connectionState.maxReconnectAttempts,
    estimatedRecoveryTime: calculateRetryDelay(connectionState.reconnectAttempts + 1, {
      initialDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      jitter: true,
      retryableErrors: ['connection'],
      maxRetries: 5,
    }),
  };
}

// Utility function to create mock error scenarios for testing
export function createMockErrorScenarios(): {
  connectionError: GameError;
  stateError: GameError;
  timeoutError: GameError;
  validationError: GameError;
  criticalError: GameError;
} {
  return {
    connectionError: createMockGameError({
      type: 'connection',
      severity: 'high',
      message: 'WebSocket connection lost',
      affectedFeatures: ['realtime-sync', 'game-state'],
    }),
    stateError: createMockGameError({
      type: 'state',
      severity: 'medium',
      message: 'Game state inconsistency detected',
      affectedFeatures: ['game-state', 'player-actions'],
    }),
    timeoutError: createMockGameError({
      type: 'timeout',
      severity: 'medium',
      message: 'Request timeout after 10 seconds',
      affectedFeatures: ['player-actions'],
    }),
    validationError: createMockGameError({
      type: 'validation',
      severity: 'low',
      message: 'Invalid player action',
      affectedFeatures: ['player-actions'],
    }),
    criticalError: createMockGameError({
      type: 'server',
      severity: 'critical',
      message: 'Critical server error',
      recoverable: false,
      affectedFeatures: ['game-engine', 'game-state', 'realtime-sync'],
    }),
  };
}
