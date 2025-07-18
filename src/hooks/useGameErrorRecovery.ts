/**
 * useGameErrorRecovery Hook
 * 
 * Custom hook for managing game error recovery operations,
 * providing error handling, recovery strategies, and fallback mechanisms.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  GameError,
  RecoveryState,
  RecoveryAction,
  RecoveryResult,
  RecoveryStrategy,
  GameErrorRecoveryConfig,
  ErrorContext,
} from '~/types/game-error-recovery';
import { DEFAULT_GAME_ERROR_RECOVERY_CONFIG } from '~/types/game-error-recovery';
import {
  createMockRecoveryState,
  generateRecoveryStrategies,
  shouldRetryError,
  executeRetryWithBackoff,
  formatErrorMessage,
  createRecoveryNotification,
} from '~/lib/error-recovery-utils';

export interface UseGameErrorRecoveryOptions {
  roomCode?: string;
  playerId?: string;
  config?: Partial<GameErrorRecoveryConfig>;
  onError?: (error: GameError) => void;
  onRecoveryStart?: (error: GameError) => void;
  onRecoveryComplete?: (result: RecoveryResult) => void;
  onRecoveryFailed?: (error: GameError) => void;
  onFallbackActivated?: (feature: string) => void;
}

export interface UseGameErrorRecoveryReturn {
  recoveryState: RecoveryState;
  config: GameErrorRecoveryConfig;
  addError: (error: GameError) => void;
  removeError: (errorId: string) => void;
  startRecovery: (error: GameError, strategy?: RecoveryStrategy) => Promise<void>;
  executeRecoveryAction: (action: RecoveryAction) => Promise<RecoveryResult>;
  activateFallback: (feature: string) => void;
  deactivateFallback: () => void;
  clearAllErrors: () => void;
  getRecoveryStrategies: (error: GameError) => RecoveryStrategy[];
  formatError: (error: GameError, userFriendly?: boolean) => string;
  isRecovering: boolean;
  hasActiveErrors: boolean;
  isFallbackActive: boolean;
  canRetry: (error: GameError) => boolean;
  getErrorContext: () => ErrorContext;
}

export function useGameErrorRecovery(
  options: UseGameErrorRecoveryOptions = {}
): UseGameErrorRecoveryReturn {
  const {
    roomCode,
    playerId,
    config: userConfig,
    onError,
    onRecoveryStart,
    onRecoveryComplete,
    onRecoveryFailed,
    onFallbackActivated,
  } = options;

  const [recoveryState, setRecoveryState] = useState<RecoveryState>(() => createMockRecoveryState());
  const [config] = useState<GameErrorRecoveryConfig>(() => ({
    ...DEFAULT_GAME_ERROR_RECOVERY_CONFIG,
    ...userConfig,
  }));

  const retryTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const recoveryInProgressRef = useRef<boolean>(false);

  // Auto-retry mechanism
  useEffect(() => {
    const autoRetryTimer = setInterval(() => {
      if (recoveryInProgressRef.current) return;

      recoveryState.activeErrors.forEach(error => {
        if (shouldRetryError(error, config.retryConfig)) {
          const strategies = generateRecoveryStrategies(error);
          const autoStrategy = strategies.find(s => 
            s.actions.every(a => a.automated && !a.requiresUserConfirmation)
          );
          
          if (autoStrategy && !retryTimeoutsRef.current.has(error.id)) {
            startRecovery(error, autoStrategy);
          }
        }
      });
    }, 5000);

    return () => clearInterval(autoRetryTimer);
  }, [recoveryState.activeErrors, config.retryConfig]);

  // Cleanup retry timeouts on unmount
  useEffect(() => {
    return () => {
      retryTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      retryTimeoutsRef.current.clear();
    };
  }, []);

  const getErrorContext = useCallback((): ErrorContext => {
    return {
      roomCode,
      playerId,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown',
      connectionType: typeof window !== 'undefined' && 'connection' in navigator 
        ? (navigator as any).connection?.effectiveType || 'unknown'
        : 'unknown',
      additionalData: {
        timestamp: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
        recoveryAttempts: recoveryState.recoveryAttempts,
      },
    };
  }, [roomCode, playerId, recoveryState.recoveryAttempts]);

  const addError = useCallback((error: GameError) => {
    setRecoveryState(prev => ({
      ...prev,
      activeErrors: [...prev.activeErrors, error],
    }));

    onError?.(error);

    // Auto-start recovery for high-severity errors
    if (error.severity === 'high' || error.severity === 'critical') {
      const strategies = generateRecoveryStrategies(error);
      const autoStrategy = strategies.find(s => 
        s.actions.every(a => a.automated && !a.requiresUserConfirmation)
      );
      
      if (autoStrategy) {
        startRecovery(error, autoStrategy);
      }
    }
  }, [onError]);

  const removeError = useCallback((errorId: string) => {
    setRecoveryState(prev => ({
      ...prev,
      activeErrors: prev.activeErrors.filter(error => error.id !== errorId),
    }));

    // Clear associated retry timeout
    const timeout = retryTimeoutsRef.current.get(errorId);
    if (timeout) {
      clearTimeout(timeout);
      retryTimeoutsRef.current.delete(errorId);
    }
  }, []);

  const startRecovery = useCallback(async (error: GameError, strategy?: RecoveryStrategy) => {
    if (recoveryInProgressRef.current) return;

    const recoveryStrategy = strategy || generateRecoveryStrategies(error)[0];
    
    if (!recoveryStrategy) {
      console.error('No recovery strategy found for error:', error);
      onRecoveryFailed?.(error);
      return;
    }

    recoveryInProgressRef.current = true;
    
    setRecoveryState(prev => ({
      ...prev,
      isRecovering: true,
      recoveryProgress: 0,
      lastRecoveryAttempt: Date.now(),
      recoveryAttempts: prev.recoveryAttempts + 1,
      recoveryStrategy,
    }));

    onRecoveryStart?.(error);

    try {
      // Execute recovery actions sequentially
      for (let i = 0; i < recoveryStrategy.actions.length; i++) {
        const action = recoveryStrategy.actions[i];
        if (!action) continue;
        
        const progress = ((i + 1) / recoveryStrategy.actions.length) * 100;
        
        setRecoveryState(prev => ({
          ...prev,
          recoveryProgress: progress * 0.8, // Leave 20% for completion
        }));
        
        const result = await executeRecoveryAction(action);
        
        if (result.success) {
          setRecoveryState(prev => ({
            ...prev,
            isRecovering: false,
            recoveryProgress: 100,
            activeErrors: result.errorResolved 
              ? prev.activeErrors.filter(e => e.id !== error.id)
              : prev.activeErrors,
            recoveryStrategy: null,
            fallbackActive: result.fallbackActivated,
          }));
          
          onRecoveryComplete?.(result);
          
          if (result.fallbackActivated) {
            onFallbackActivated?.(error.affectedFeatures[0] || 'unknown');
          }
          
          recoveryInProgressRef.current = false;
          return;
        }
      }
      
      // If we get here, all recovery actions failed
      setRecoveryState(prev => ({
        ...prev,
        isRecovering: false,
        recoveryProgress: 0,
        recoveryStrategy: null,
      }));
      
      onRecoveryFailed?.(error);
      
    } catch (recoveryError) {
      setRecoveryState(prev => ({
        ...prev,
        isRecovering: false,
        recoveryProgress: 0,
        recoveryStrategy: null,
      }));
      
      console.error('Recovery failed:', recoveryError);
      onRecoveryFailed?.(error);
    } finally {
      recoveryInProgressRef.current = false;
    }
  }, [onRecoveryStart, onRecoveryComplete, onRecoveryFailed, onFallbackActivated]);

  const executeRecoveryAction = useCallback(async (action: RecoveryAction): Promise<RecoveryResult> => {
    // Simulate action execution with proper timing
    const startTime = Date.now();
    
    try {
      // Use retry mechanism for retryable actions
      if (action.type === 'retry') {
        const result = await executeRetryWithBackoff(
          action.execute,
          config.retryConfig
        );
        
        return result;
      } else {
        // Execute action directly
        const result = await action.execute();
        
        // Add minimum delay to simulate real recovery time
        const elapsedTime = Date.now() - startTime;
        const minDelay = Math.max(0, action.estimatedTime - elapsedTime);
        
        if (minDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, minDelay));
        }
        
        return result;
      }
    } catch (error) {
      const recoveryTime = Date.now() - startTime;
      
      return {
        success: false,
        message: `Recovery action failed: ${(error as Error).message}`,
        errorResolved: false,
        partialRecovery: false,
        fallbackActivated: false,
        recoveryTime,
      };
    }
  }, [config.retryConfig]);

  const activateFallback = useCallback((feature: string) => {
    setRecoveryState(prev => ({
      ...prev,
      fallbackActive: true,
    }));

    onFallbackActivated?.(feature);
  }, [onFallbackActivated]);

  const deactivateFallback = useCallback(() => {
    setRecoveryState(prev => ({
      ...prev,
      fallbackActive: false,
    }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setRecoveryState(prev => ({
      ...prev,
      activeErrors: [],
      isRecovering: false,
      recoveryProgress: 0,
      recoveryStrategy: null,
    }));

    // Clear all retry timeouts
    retryTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    retryTimeoutsRef.current.clear();
  }, []);

  const getRecoveryStrategies = useCallback((error: GameError): RecoveryStrategy[] => {
    return generateRecoveryStrategies(error);
  }, []);

  const formatError = useCallback((error: GameError, userFriendly: boolean = true): string => {
    return formatErrorMessage(error, userFriendly);
  }, []);

  const canRetry = useCallback((error: GameError): boolean => {
    return shouldRetryError(error, config.retryConfig);
  }, [config.retryConfig]);

  return {
    recoveryState,
    config,
    addError,
    removeError,
    startRecovery,
    executeRecoveryAction,
    activateFallback,
    deactivateFallback,
    clearAllErrors,
    getRecoveryStrategies,
    formatError,
    isRecovering: recoveryState.isRecovering,
    hasActiveErrors: recoveryState.activeErrors.length > 0,
    isFallbackActive: recoveryState.fallbackActive,
    canRetry,
    getErrorContext,
  };
}
