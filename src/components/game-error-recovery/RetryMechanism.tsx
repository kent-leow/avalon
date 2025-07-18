/**
 * Retry Mechanism Component
 * 
 * Implements automatic retry logic with exponential backoff
 * for failed actions and operations.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import type { RetryMechanismProps, FailedAction } from '~/types/game-error-recovery';
import { calculateRetryDelay } from '~/lib/error-recovery-utils';

/**
 * RetryMechanism Component
 * 
 * Manages automatic retry of failed actions with exponential backoff
 * and provides visual feedback for retry progress.
 */
export function RetryMechanism({
  failedActions,
  retryConfig,
  onRetrySuccess,
  onRetryFailed,
  onMaxRetriesExceeded,
}: RetryMechanismProps) {
  const [retryingActions, setRetryingActions] = useState<Set<string>>(new Set());
  const [retryProgress, setRetryProgress] = useState<Record<string, number>>({});
  const retryTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Schedule retries for failed actions
  useEffect(() => {
    failedActions.forEach(action => {
      if (
        action.attempts < action.maxAttempts &&
        !retryingActions.has(action.id) &&
        !retryTimeoutsRef.current.has(action.id)
      ) {
        scheduleRetry(action);
      }
    });
  }, [failedActions, retryingActions]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      retryTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      retryTimeoutsRef.current.clear();
    };
  }, []);

  const scheduleRetry = (action: FailedAction) => {
    const delay = calculateRetryDelay(action.attempts + 1, retryConfig);
    const timeUntilRetry = Math.max(0, action.nextRetryAt - Date.now());
    const totalDelay = Math.max(delay, timeUntilRetry);

    console.log(`Scheduling retry for action ${action.id} in ${totalDelay}ms`);

    const timeout = setTimeout(() => {
      executeRetry(action);
    }, totalDelay);

    retryTimeoutsRef.current.set(action.id, timeout);
  };

  const executeRetry = async (action: FailedAction) => {
    console.log(`Executing retry for action ${action.id}, attempt ${action.attempts + 1}`);
    
    setRetryingActions(prev => new Set(prev).add(action.id));
    setRetryProgress(prev => ({ ...prev, [action.id]: 0 }));

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setRetryProgress(prev => ({
          ...prev,
          [action.id]: Math.min((prev[action.id] || 0) + 10, 90)
        }));
      }, 100);

      // Simulate retry execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      clearInterval(progressInterval);
      setRetryProgress(prev => ({ ...prev, [action.id]: 100 }));

      // Simulate success/failure
      const success = Math.random() > 0.3; // 70% success rate
      
      if (success) {
        console.log(`Retry successful for action ${action.id}`);
        onRetrySuccess?.(action);
        
        // Clean up
        setRetryingActions(prev => {
          const newSet = new Set(prev);
          newSet.delete(action.id);
          return newSet;
        });
        setRetryProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[action.id];
          return newProgress;
        });
        retryTimeoutsRef.current.delete(action.id);
        
      } else {
        console.log(`Retry failed for action ${action.id}`);
        
        const updatedAction: FailedAction = {
          ...action,
          attempts: action.attempts + 1,
          nextRetryAt: Date.now() + calculateRetryDelay(action.attempts + 2, retryConfig),
        };
        
        setRetryingActions(prev => {
          const newSet = new Set(prev);
          newSet.delete(action.id);
          return newSet;
        });
        setRetryProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[action.id];
          return newProgress;
        });
        retryTimeoutsRef.current.delete(action.id);
        
        if (updatedAction.attempts >= updatedAction.maxAttempts) {
          console.log(`Max retries exceeded for action ${action.id}`);
          onMaxRetriesExceeded?.(updatedAction);
        } else {
          onRetryFailed?.(updatedAction);
          // Schedule next retry
          scheduleRetry(updatedAction);
        }
      }
    } catch (error) {
      console.error(`Retry execution failed for action ${action.id}:`, error);
      
      setRetryingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(action.id);
        return newSet;
      });
      setRetryProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[action.id];
        return newProgress;
      });
      retryTimeoutsRef.current.delete(action.id);
      
      const updatedAction: FailedAction = {
        ...action,
        attempts: action.attempts + 1,
        nextRetryAt: Date.now() + calculateRetryDelay(action.attempts + 2, retryConfig),
      };
      
      if (updatedAction.attempts >= updatedAction.maxAttempts) {
        onMaxRetriesExceeded?.(updatedAction);
      } else {
        onRetryFailed?.(updatedAction);
        scheduleRetry(updatedAction);
      }
    }
  };

  const getTimeUntilRetry = (action: FailedAction): number => {
    return Math.max(0, action.nextRetryAt - Date.now());
  };

  const formatTimeRemaining = (milliseconds: number): string => {
    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Don't render if no failed actions
  if (failedActions.length === 0) {
    return null;
  }

  return (
    <div className="retry-mechanism fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-[#1a1a2e] border border-[#3d3d7a] rounded-lg p-4 shadow-lg">
        <h3 className="text-sm font-semibold text-white mb-3">
          Retry Operations
        </h3>
        
        <div className="space-y-3">
          {failedActions.map((action) => (
            <div key={action.id} className="bg-[#252547] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    retryingActions.has(action.id) 
                      ? 'bg-[#3b82f6] animate-pulse' 
                      : 'bg-[#f59e0b]'
                  }`}></div>
                  <span className="text-sm font-medium text-white">
                    {action.type.charAt(0).toUpperCase() + action.type.slice(1)} Action
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {action.attempts}/{action.maxAttempts}
                </span>
              </div>
              
              <div className="text-xs text-gray-300 mb-2">
                {action.error.message}
              </div>
              
              {retryingActions.has(action.id) ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Retrying...</span>
                    <span className="text-white">{retryProgress[action.id] || 0}%</span>
                  </div>
                  <div className="w-full bg-[#3d3d7a] rounded-full h-1">
                    <div 
                      className="bg-[#3b82f6] h-1 rounded-full transition-all duration-300"
                      style={{ width: `${retryProgress[action.id] || 0}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-400">
                  {action.attempts < action.maxAttempts ? (
                    <>
                      Next retry in: {formatTimeRemaining(getTimeUntilRetry(action))}
                    </>
                  ) : (
                    <>
                      Max retries reached
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Summary stats */}
        <div className="mt-4 pt-3 border-t border-[#3d3d7a]">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Failed Actions:</span>
            <span className="text-white font-medium">{failedActions.length}</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-400">Retrying:</span>
            <span className="text-[#3b82f6] font-medium">{retryingActions.size}</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-400">Max Retries:</span>
            <span className="text-white font-medium">{retryConfig.maxRetries}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
