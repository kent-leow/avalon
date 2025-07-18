/**
 * Game Error Recovery Context
 * 
 * React Context for managing global error recovery state
 * and providing error recovery capabilities across the application.
 */

'use client';

import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import type {
  GameError,
  RecoveryState,
  RecoveryAction,
  RecoveryResult,
  RecoveryStrategy,
  RecoveryNotification,
  GameErrorRecoveryConfig,
} from '~/types/game-error-recovery';
import { DEFAULT_GAME_ERROR_RECOVERY_CONFIG } from '~/types/game-error-recovery';
import {
  createMockRecoveryState,
  generateRecoveryStrategies,
  createRecoveryNotification,
  shouldRetryError,
  calculateRetryDelay,
} from '~/lib/error-recovery-utils';

// Context state interface
interface GameErrorRecoveryContextState {
  recoveryState: RecoveryState;
  notifications: RecoveryNotification[];
  config: GameErrorRecoveryConfig;
  analytics: {
    totalErrors: number;
    recoveredErrors: number;
    failedRecoveries: number;
    averageRecoveryTime: number;
  };
}

// Context actions
type GameErrorRecoveryAction =
  | { type: 'ADD_ERROR'; payload: GameError }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'START_RECOVERY'; payload: { error: GameError; strategy: RecoveryStrategy } }
  | { type: 'UPDATE_RECOVERY_PROGRESS'; payload: number }
  | { type: 'COMPLETE_RECOVERY'; payload: RecoveryResult }
  | { type: 'FAIL_RECOVERY'; payload: { error: GameError; reason: string } }
  | { type: 'ACTIVATE_FALLBACK'; payload: string }
  | { type: 'DEACTIVATE_FALLBACK' }
  | { type: 'ADD_NOTIFICATION'; payload: RecoveryNotification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'UPDATE_CONFIG'; payload: Partial<GameErrorRecoveryConfig> }
  | { type: 'RESET_STATE' };

// Context interface
interface GameErrorRecoveryContextValue {
  state: GameErrorRecoveryContextState;
  addError: (error: GameError) => void;
  removeError: (errorId: string) => void;
  startRecovery: (error: GameError, strategy?: RecoveryStrategy) => Promise<void>;
  executeRecoveryAction: (action: RecoveryAction) => Promise<RecoveryResult>;
  activateFallback: (feature: string) => void;
  deactivateFallback: () => void;
  addNotification: (notification: RecoveryNotification) => void;
  removeNotification: (notificationId: string) => void;
  updateConfig: (config: Partial<GameErrorRecoveryConfig>) => void;
  resetState: () => void;
  isRecovering: boolean;
  hasActiveErrors: boolean;
  isFallbackActive: boolean;
}

// Initial state
const initialState: GameErrorRecoveryContextState = {
  recoveryState: createMockRecoveryState(),
  notifications: [],
  config: DEFAULT_GAME_ERROR_RECOVERY_CONFIG,
  analytics: {
    totalErrors: 0,
    recoveredErrors: 0,
    failedRecoveries: 0,
    averageRecoveryTime: 0,
  },
};

// Reducer
function gameErrorRecoveryReducer(
  state: GameErrorRecoveryContextState,
  action: GameErrorRecoveryAction
): GameErrorRecoveryContextState {
  switch (action.type) {
    case 'ADD_ERROR':
      return {
        ...state,
        recoveryState: {
          ...state.recoveryState,
          activeErrors: [...state.recoveryState.activeErrors, action.payload],
        },
        analytics: {
          ...state.analytics,
          totalErrors: state.analytics.totalErrors + 1,
        },
      };

    case 'REMOVE_ERROR':
      return {
        ...state,
        recoveryState: {
          ...state.recoveryState,
          activeErrors: state.recoveryState.activeErrors.filter(
            error => error.id !== action.payload
          ),
        },
      };

    case 'START_RECOVERY':
      return {
        ...state,
        recoveryState: {
          ...state.recoveryState,
          isRecovering: true,
          recoveryProgress: 0,
          lastRecoveryAttempt: Date.now(),
          recoveryAttempts: state.recoveryState.recoveryAttempts + 1,
          recoveryStrategy: action.payload.strategy,
        },
      };

    case 'UPDATE_RECOVERY_PROGRESS':
      return {
        ...state,
        recoveryState: {
          ...state.recoveryState,
          recoveryProgress: action.payload,
        },
      };

    case 'COMPLETE_RECOVERY':
      const { success, errorResolved, recoveryTime } = action.payload;
      return {
        ...state,
        recoveryState: {
          ...state.recoveryState,
          isRecovering: false,
          recoveryProgress: 100,
          activeErrors: errorResolved
            ? state.recoveryState.activeErrors.slice(1)
            : state.recoveryState.activeErrors,
          recoveryStrategy: null,
        },
        analytics: {
          ...state.analytics,
          recoveredErrors: success ? state.analytics.recoveredErrors + 1 : state.analytics.recoveredErrors,
          failedRecoveries: success ? state.analytics.failedRecoveries : state.analytics.failedRecoveries + 1,
          averageRecoveryTime: success
            ? (state.analytics.averageRecoveryTime + recoveryTime) / 2
            : state.analytics.averageRecoveryTime,
        },
      };

    case 'FAIL_RECOVERY':
      return {
        ...state,
        recoveryState: {
          ...state.recoveryState,
          isRecovering: false,
          recoveryProgress: 0,
          recoveryStrategy: null,
        },
        analytics: {
          ...state.analytics,
          failedRecoveries: state.analytics.failedRecoveries + 1,
        },
      };

    case 'ACTIVATE_FALLBACK':
      return {
        ...state,
        recoveryState: {
          ...state.recoveryState,
          fallbackActive: true,
        },
      };

    case 'DEACTIVATE_FALLBACK':
      return {
        ...state,
        recoveryState: {
          ...state.recoveryState,
          fallbackActive: false,
        },
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        ),
      };

    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: { ...state.config, ...action.payload },
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Context
const GameErrorRecoveryContext = createContext<GameErrorRecoveryContextValue | null>(null);

// Provider component
interface GameErrorRecoveryProviderProps {
  children: ReactNode;
  initialConfig?: Partial<GameErrorRecoveryConfig>;
}

export function GameErrorRecoveryProvider({
  children,
  initialConfig,
}: GameErrorRecoveryProviderProps) {
  const [state, dispatch] = useReducer(gameErrorRecoveryReducer, {
    ...initialState,
    config: { ...initialState.config, ...initialConfig },
  });

  // Auto-remove notifications
  useEffect(() => {
    state.notifications.forEach(notification => {
      if (notification.autoHide && notification.duration) {
        const timer = setTimeout(() => {
          dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [state.notifications]);

  // Auto-retry failed actions
  useEffect(() => {
    const autoRetryTimer = setInterval(() => {
      state.recoveryState.activeErrors.forEach(error => {
        if (shouldRetryError(error, state.config.retryConfig) && !state.recoveryState.isRecovering) {
          const strategies = generateRecoveryStrategies(error);
          const autoStrategy = strategies.find(s => 
            s.actions.every(a => a.automated && !a.requiresUserConfirmation)
          );
          
          if (autoStrategy) {
            startRecovery(error, autoStrategy);
          }
        }
      });
    }, 5000);

    return () => clearInterval(autoRetryTimer);
  }, [state.recoveryState.activeErrors, state.config.retryConfig]);

  // Context actions
  const addError = useCallback((error: GameError) => {
    dispatch({ type: 'ADD_ERROR', payload: error });
    
    // Create notification
    const strategies = generateRecoveryStrategies(error);
    const notification = createRecoveryNotification(error, strategies[0]);
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, []);

  const removeError = useCallback((errorId: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: errorId });
  }, []);

  const startRecovery = useCallback(async (error: GameError, strategy?: RecoveryStrategy) => {
    const recoveryStrategy = strategy || generateRecoveryStrategies(error)[0];
    
    if (!recoveryStrategy) {
      console.error('No recovery strategy found for error:', error);
      return;
    }

    dispatch({ type: 'START_RECOVERY', payload: { error, strategy: recoveryStrategy } });

    try {
      // Execute recovery actions
      for (const action of recoveryStrategy.actions) {
        dispatch({ type: 'UPDATE_RECOVERY_PROGRESS', payload: 25 });
        
        const result = await executeRecoveryAction(action);
        
        dispatch({ type: 'UPDATE_RECOVERY_PROGRESS', payload: 75 });
        
        if (result.success) {
          dispatch({ type: 'COMPLETE_RECOVERY', payload: result });
          
          // Add success notification
          const successNotification: RecoveryNotification = {
            id: `success-${Date.now()}`,
            type: 'success',
            title: 'Recovery Successful',
            message: result.message,
            dismissible: true,
            autoHide: true,
            duration: 3000,
            timestamp: Date.now(),
          };
          dispatch({ type: 'ADD_NOTIFICATION', payload: successNotification });
          
          return;
        }
      }
      
      // If we get here, recovery failed
      dispatch({ type: 'FAIL_RECOVERY', payload: { error, reason: 'All recovery actions failed' } });
      
    } catch (recoveryError) {
      dispatch({ type: 'FAIL_RECOVERY', payload: { error, reason: (recoveryError as Error).message } });
    }
  }, []);

  const executeRecoveryAction = useCallback(async (action: RecoveryAction): Promise<RecoveryResult> => {
    // Simulate action execution with delay
    await new Promise(resolve => setTimeout(resolve, action.estimatedTime / 2));
    
    try {
      const result = await action.execute();
      
      // Add delay to simulate real recovery time
      await new Promise(resolve => setTimeout(resolve, action.estimatedTime / 2));
      
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Recovery action failed: ${(error as Error).message}`,
        errorResolved: false,
        partialRecovery: false,
        fallbackActivated: false,
        recoveryTime: action.estimatedTime,
      };
    }
  }, []);

  const activateFallback = useCallback((feature: string) => {
    dispatch({ type: 'ACTIVATE_FALLBACK', payload: feature });
    
    const notification: RecoveryNotification = {
      id: `fallback-${Date.now()}`,
      type: 'warning',
      title: 'Fallback Mode Active',
      message: `${feature} is running in fallback mode with limited functionality.`,
      dismissible: true,
      autoHide: false,
      timestamp: Date.now(),
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, []);

  const deactivateFallback = useCallback(() => {
    dispatch({ type: 'DEACTIVATE_FALLBACK' });
  }, []);

  const addNotification = useCallback((notification: RecoveryNotification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
  }, []);

  const updateConfig = useCallback((config: Partial<GameErrorRecoveryConfig>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: config });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  const value: GameErrorRecoveryContextValue = {
    state,
    addError,
    removeError,
    startRecovery,
    executeRecoveryAction,
    activateFallback,
    deactivateFallback,
    addNotification,
    removeNotification,
    updateConfig,
    resetState,
    isRecovering: state.recoveryState.isRecovering,
    hasActiveErrors: state.recoveryState.activeErrors.length > 0,
    isFallbackActive: state.recoveryState.fallbackActive,
  };

  return (
    <GameErrorRecoveryContext.Provider value={value}>
      {children}
    </GameErrorRecoveryContext.Provider>
  );
}

// Hook to use the context
export function useGameErrorRecovery(): GameErrorRecoveryContextValue {
  const context = useContext(GameErrorRecoveryContext);
  if (!context) {
    throw new Error('useGameErrorRecovery must be used within a GameErrorRecoveryProvider');
  }
  return context;
}
