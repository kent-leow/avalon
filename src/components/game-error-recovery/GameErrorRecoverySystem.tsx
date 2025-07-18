/**
 * Game Error Recovery System Component
 * 
 * Main coordinator for all error recovery operations across the game.
 * Provides comprehensive error handling, recovery strategies, and fallback mechanisms.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import type {
  GameErrorRecoverySystemProps,
  GameError,
  RecoveryResult,
  GameErrorRecoveryConfig,
} from '~/types/game-error-recovery';
import { DEFAULT_GAME_ERROR_RECOVERY_CONFIG } from '~/types/game-error-recovery';
import { useGameErrorRecovery } from '~/hooks/useGameErrorRecovery';
import { useConnectionRecovery } from '~/hooks/useConnectionRecovery';
import { ConnectionRecoveryManager } from './ConnectionRecoveryManager';
import { ErrorMessageCenter } from './ErrorMessageCenter';
import { RetryMechanism } from './RetryMechanism';
import { FallbackHandler } from './FallbackHandler';
import { RecoveryUI } from './RecoveryUI';
import { createMockErrorScenarios } from '~/lib/error-recovery-utils';

/**
 * GameErrorRecoverySystem Component
 * 
 * Coordinates all error recovery operations and provides a unified
 * interface for handling errors across the game.
 */
export function GameErrorRecoverySystem({
  children,
  roomCode,
  playerId,
  config: userConfig,
  onRecoveryStart,
  onRecoveryComplete,
  onRecoveryFailed,
  onFallbackActivated,
}: GameErrorRecoverySystemProps) {
  const [config] = useState<GameErrorRecoveryConfig>(() => ({
    ...DEFAULT_GAME_ERROR_RECOVERY_CONFIG,
    ...userConfig,
  }));
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [failedActions, setFailedActions] = useState<any[]>([]);
  const initializationRef = useRef<boolean>(false);

  // Initialize error recovery hook
  const errorRecovery = useGameErrorRecovery({
    roomCode,
    playerId,
    config,
    onError: (error: GameError) => {
      console.log('Error detected:', error);
      
      // Create notification for error
      const notification = {
        id: `notification-${error.id}`,
        type: error.severity === 'critical' ? 'error' : 'warning',
        title: getErrorTitle(error),
        message: formatErrorMessage(error),
        dismissible: error.severity !== 'critical',
        autoHide: error.severity === 'low',
        duration: error.severity === 'low' ? 5000 : undefined,
        timestamp: Date.now(),
      };
      
      setNotifications(prev => [...prev, notification]);
    },
    onRecoveryStart: (error: GameError) => {
      console.log('Recovery started for error:', error.id);
      onRecoveryStart?.(error);
    },
    onRecoveryComplete: (result: RecoveryResult) => {
      console.log('Recovery completed:', result);
      onRecoveryComplete?.(result);
      
      // Add success notification
      if (result.success) {
        const successNotification = {
          id: `success-${Date.now()}`,
          type: 'success',
          title: 'Recovery Successful',
          message: result.message,
          dismissible: true,
          autoHide: true,
          duration: 3000,
          timestamp: Date.now(),
        };
        setNotifications(prev => [...prev, successNotification]);
      }
    },
    onRecoveryFailed: (error: GameError) => {
      console.log('Recovery failed for error:', error.id);
      onRecoveryFailed?.(error);
      
      // Add failure notification
      const failureNotification = {
        id: `failure-${Date.now()}`,
        type: 'error',
        title: 'Recovery Failed',
        message: `Failed to recover from ${error.type} error. Please try again.`,
        dismissible: true,
        autoHide: false,
        timestamp: Date.now(),
      };
      setNotifications(prev => [...prev, failureNotification]);
    },
    onFallbackActivated: (feature: string) => {
      console.log('Fallback activated for feature:', feature);
      onFallbackActivated?.(feature);
    },
  });

  // Initialize connection recovery hook
  const connectionRecovery = useConnectionRecovery({
    roomCode,
    playerId,
    retryConfig: config.retryConfig,
    enableAutoReconnect: true,
    onConnectionLost: (error) => {
      errorRecovery.addError(error);
    },
    onConnectionRecovered: () => {
      console.log('Connection recovered');
      
      // Add success notification
      const successNotification = {
        id: `connection-success-${Date.now()}`,
        type: 'success',
        title: 'Connection Restored',
        message: 'Successfully reconnected to the game server.',
        dismissible: true,
        autoHide: true,
        duration: 3000,
        timestamp: Date.now(),
      };
      setNotifications(prev => [...prev, successNotification]);
    },
    onReconnectAttempt: (attempt) => {
      console.log(`Reconnection attempt ${attempt}`);
    },
    onReconnectFailed: (error) => {
      console.log('Reconnection failed:', error);
      errorRecovery.addError(error);
    },
  });

  // Initialize with demo errors in development mode
  useEffect(() => {
    if (config.debugMode && !initializationRef.current) {
      initializationRef.current = true;
      
      // Create demo errors for testing
      const demoErrors = createMockErrorScenarios();
      
      // Add a connection error after a short delay
      setTimeout(() => {
        console.log('Adding demo connection error');
        errorRecovery.addError(demoErrors.connectionError);
      }, 2000);
      
      // Add a state error after another delay
      setTimeout(() => {
        console.log('Adding demo state error');
        errorRecovery.addError(demoErrors.stateError);
      }, 4000);
    }
  }, [config.debugMode, errorRecovery]);

  // Auto-remove notifications
  useEffect(() => {
    const timers = notifications
      .filter(notification => notification.autoHide && notification.duration)
      .map(notification => {
        return setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, notification.duration);
      });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications]);

  // Handle error dismissal
  const handleErrorDismiss = (errorId: string) => {
    errorRecovery.removeError(errorId);
  };

  // Handle notification dismissal
  const handleNotificationDismiss = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Handle retry action
  const handleRetryAction = async (action: any) => {
    try {
      const result = await errorRecovery.executeRecoveryAction(action);
      console.log('Retry action result:', result);
    } catch (error) {
      console.error('Retry action failed:', error);
    }
  };

  // Handle recovery action
  const handleRecoveryAction = async (action: any) => {
    try {
      const result = await errorRecovery.executeRecoveryAction(action);
      console.log('Recovery action result:', result);
    } catch (error) {
      console.error('Recovery action failed:', error);
    }
  };

  // Handle manual recovery
  const handleManualRecovery = () => {
    if (errorRecovery.hasActiveErrors) {
      const firstError = errorRecovery.recoveryState.activeErrors[0];
      if (firstError) {
        const strategies = errorRecovery.getRecoveryStrategies(firstError);
        const manualStrategy = strategies.find(s => !s.actions.every(a => a.automated));
        if (manualStrategy) {
          errorRecovery.startRecovery(firstError, manualStrategy);
        }
      }
    }
  };

  // Handle fallback activation
  const handleFallbackActivated = (feature: string) => {
    errorRecovery.activateFallback(feature);
  };

  // Handle fallback deactivation
  const handleFallbackDeactivated = () => {
    errorRecovery.deactivateFallback();
  };

  return (
    <div className="game-error-recovery-system relative w-full h-full">
      {/* Main application content */}
      <FallbackHandler
        fallbackConfig={config.fallbackConfig}
        onFallbackActivated={handleFallbackActivated}
        onFallbackDeactivated={handleFallbackDeactivated}
        enabledFeatures={['game-state', 'realtime-sync', 'player-actions']}
      >
        {children}
      </FallbackHandler>

      {/* Connection recovery manager */}
      <ConnectionRecoveryManager
        connectionState={connectionRecovery.connectionState}
        onConnectionRecovered={connectionRecovery.checkConnection}
        onConnectionFailed={(error: any) => errorRecovery.addError(error)}
        retryConfig={config.retryConfig}
        enableAutoReconnect={true}
      />

      {/* Retry mechanism for failed actions */}
      {failedActions.length > 0 && (
        <RetryMechanism
          failedActions={failedActions}
          retryConfig={config.retryConfig}
          onRetrySuccess={(action: any) => {
            setFailedActions(prev => prev.filter(a => a.id !== action.id));
          }}
          onRetryFailed={(action: any) => {
            console.log('Retry failed for action:', action.id);
          }}
          onMaxRetriesExceeded={(action: any) => {
            setFailedActions(prev => prev.filter(a => a.id !== action.id));
          }}
        />
      )}

      {/* Recovery UI overlay */}
      {errorRecovery.isRecovering && (
        <RecoveryUI
          recoveryState={errorRecovery.recoveryState}
          onRecoveryAction={handleRecoveryAction}
          onManualRecovery={handleManualRecovery}
          onCancelRecovery={() => errorRecovery.clearAllErrors()}
          showProgress={true}
          showAdvancedOptions={config.debugMode}
        />
      )}

      {/* Error message center */}
      <ErrorMessageCenter
        errors={errorRecovery.recoveryState.activeErrors}
        notifications={notifications}
        onErrorDismiss={handleErrorDismiss}
        onRetryAction={handleRetryAction}
        onNotificationDismiss={handleNotificationDismiss}
        showRecoveryOptions={true}
        showTechnicalDetails={config.notificationConfig.showTechnicalDetails}
      />
    </div>
  );
}

// Helper functions
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

function formatErrorMessage(error: GameError): string {
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
}
