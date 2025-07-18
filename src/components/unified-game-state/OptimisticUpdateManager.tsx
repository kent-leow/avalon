'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { applyOptimisticUpdate, rollbackOptimisticUpdate } from '~/lib/unified-game-state-utils';
import type { 
  OptimisticUpdateManagerProps, 
  OptimisticUpdate, 
  OptimisticUpdateError,
  UnifiedGameState
} from '~/types/unified-game-state';

/**
 * Optimistic Update Manager Component
 * 
 * Manages optimistic updates for immediate UI responsiveness while awaiting
 * server confirmation, with automatic rollback on failure.
 */

export function OptimisticUpdateManager({
  pendingUpdates,
  onApplyUpdate,
  onRollbackUpdate,
  onUpdateError,
  maxPendingUpdates = 50,
  updateTimeout = 5000,
  showPendingIndicator = true
}: OptimisticUpdateManagerProps) {
  // Update state
  const [processingUpdates, setProcessingUpdates] = useState<Set<string>>(new Set());
  const [failedUpdates, setFailedUpdates] = useState<Set<string>>(new Set());
  const [rollbackQueue, setRollbackQueue] = useState<OptimisticUpdate[]>([]);
  
  // Refs for timers and tracking
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const updateHistory = useRef<OptimisticUpdate[]>([]);
  const retryAttempts = useRef<Map<string, number>>(new Map());

  // Apply an optimistic update
  const applyUpdate = useCallback(async (update: OptimisticUpdate) => {
    if (processingUpdates.has(update.id)) return;

    try {
      setProcessingUpdates(prev => new Set(prev).add(update.id));
      
      // Add to history
      updateHistory.current.push(update);
      
      // Apply the update
      const result = applyOptimisticUpdate(update, {} as UnifiedGameState);
      
      // Set timeout for rollback
      const timeout = setTimeout(() => {
        if (!update.confirmed) {
          void rollbackUpdate(update);
        }
      }, updateTimeout);
      
      timeoutRefs.current.set(update.id, timeout);
      
      onApplyUpdate(result);
      
    } catch (error) {
      const updateError: OptimisticUpdateError = {
        type: 'apply_failed',
        message: error instanceof Error ? error.message : 'Failed to apply update',
        updateId: update.id,
        context: { update }
      };
      
      setFailedUpdates(prev => new Set(prev).add(update.id));
      onUpdateError(updateError);
    } finally {
      setProcessingUpdates(prev => {
        const newSet = new Set(prev);
        newSet.delete(update.id);
        return newSet;
      });
    }
  }, [processingUpdates, onApplyUpdate, onUpdateError, updateTimeout]);

  // Rollback an optimistic update
  const rollbackUpdate = useCallback(async (update: OptimisticUpdate) => {
    try {
      setRollbackQueue(prev => [...prev, update]);
      
      // Simulate rollback delay
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const rollbackResult = rollbackOptimisticUpdate(update);
      
      // Clean up timeout
      const timeout = timeoutRefs.current.get(update.id);
      if (timeout) {
        clearTimeout(timeout);
        timeoutRefs.current.delete(update.id);
      }
      
      // Remove from history
      updateHistory.current = updateHistory.current.filter(u => u.id !== update.id);
      
      onRollbackUpdate(rollbackResult);
      
      // Remove from rollback queue
      setRollbackQueue(prev => prev.filter(u => u.id !== update.id));
      
    } catch (error) {
      const updateError: OptimisticUpdateError = {
        type: 'rollback_failed',
        message: error instanceof Error ? error.message : 'Failed to rollback update',
        updateId: update.id,
        context: { update }
      };
      
      onUpdateError(updateError);
    }
  }, [onRollbackUpdate, onUpdateError]);

  // Retry failed update
  const retryUpdate = useCallback(async (update: OptimisticUpdate) => {
    const currentAttempts = retryAttempts.current.get(update.id) ?? 0;
    
    if (currentAttempts >= 3) {
      const updateError: OptimisticUpdateError = {
        type: 'max_retries_exceeded',
        message: 'Maximum retry attempts exceeded',
        updateId: update.id,
        context: { update, attempts: currentAttempts }
      };
      
      onUpdateError(updateError);
      return;
    }
    
    retryAttempts.current.set(update.id, currentAttempts + 1);
    setFailedUpdates(prev => {
      const newSet = new Set(prev);
      newSet.delete(update.id);
      return newSet;
    });
    
    await applyUpdate(update);
  }, [applyUpdate, onUpdateError]);

  // Process pending updates
  useEffect(() => {
    pendingUpdates.forEach(update => {
      if (!processingUpdates.has(update.id) && !failedUpdates.has(update.id)) {
        void applyUpdate(update);
      }
    });
  }, [pendingUpdates, processingUpdates, failedUpdates, applyUpdate]);

  // Clean up confirmed updates
  useEffect(() => {
    pendingUpdates.forEach(update => {
      if (update.confirmed) {
        const timeout = timeoutRefs.current.get(update.id);
        if (timeout) {
          clearTimeout(timeout);
          timeoutRefs.current.delete(update.id);
        }
      }
    });
  }, [pendingUpdates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Get update type icon
  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'game_action': return '🎮';
      case 'player_action': return '👤';
      case 'mission_action': return '🎯';
      case 'vote_action': return '🗳️';
      case 'role_action': return '👑';
      default: return '📝';
    }
  };

  // Get update status color
  const getStatusColor = (update: OptimisticUpdate) => {
    if (failedUpdates.has(update.id)) return 'text-[#ef4444]';
    if (processingUpdates.has(update.id)) return 'text-[#f59e0b]';
    if (update.confirmed) return 'text-[#22c55e]';
    return 'text-[#3b82f6]';
  };

  // Get update priority
  const getPriorityLevel = (update: OptimisticUpdate) => {
    const age = Date.now() - update.timestamp;
    if (age > updateTimeout * 0.8) return 'high';
    if (age > updateTimeout * 0.5) return 'medium';
    return 'low';
  };

  if (!showPendingIndicator && pendingUpdates.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#1a1a2e] p-4 rounded-lg border border-[#3b82f6]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[#3b82f6] rounded-full animate-pulse" />
          <h3 className="text-[#e5e7eb] font-bold text-lg">Optimistic Updates</h3>
          <span className="bg-[#3b82f6] text-white px-2 py-1 rounded text-sm font-bold">
            {pendingUpdates.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-[#9ca3af]">
          <div>Max: {maxPendingUpdates}</div>
          <div>Timeout: {updateTimeout / 1000}s</div>
        </div>
      </div>

      {/* Updates List */}
      {pendingUpdates.length > 0 && (
        <div className="space-y-2 mb-4">
          {pendingUpdates.slice(0, 10).map(update => (
            <div key={update.id} className="bg-[#252547] p-3 rounded border border-[#3d3d7a]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{getUpdateIcon(update.type)}</span>
                    <span className="text-[#e5e7eb] font-medium capitalize">
                      {update.type.replace('_', ' ')}
                    </span>
                    <span className={`text-sm font-medium ${getStatusColor(update)}`}>
                      {failedUpdates.has(update.id) ? 'Failed' : 
                       processingUpdates.has(update.id) ? 'Processing' :
                       update.confirmed ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                  
                  <div className="text-[#9ca3af] text-sm mb-1">
                    {update.description}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-[#9ca3af]">
                    <div>
                      Player: <span className="text-[#e5e7eb] font-mono">{update.playerId}</span>
                    </div>
                    <div>
                      Priority: <span className="text-[#e5e7eb] font-mono">{getPriorityLevel(update)}</span>
                    </div>
                    <div>
                      Age: <span className="text-[#e5e7eb] font-mono">
                        {Math.floor((Date.now() - update.timestamp) / 1000)}s
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {failedUpdates.has(update.id) && (
                    <button
                      onClick={() => void retryUpdate(update)}
                      className="bg-[#f59e0b] text-white px-2 py-1 rounded text-xs hover:bg-[#d97706] transition-colors"
                    >
                      Retry
                    </button>
                  )}
                  
                  {!update.confirmed && (
                    <button
                      onClick={() => void rollbackUpdate(update)}
                      className="bg-[#ef4444] text-white px-2 py-1 rounded text-xs hover:bg-[#dc2626] transition-colors"
                    >
                      Rollback
                    </button>
                  )}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-2 w-full bg-[#0a0a0f] rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    update.confirmed ? 'bg-[#22c55e] w-full' :
                    failedUpdates.has(update.id) ? 'bg-[#ef4444] w-full' :
                    'bg-[#3b82f6] animate-pulse'
                  }`}
                  style={{
                    width: update.confirmed ? '100%' : 
                           failedUpdates.has(update.id) ? '100%' :
                           `${Math.min(((Date.now() - update.timestamp) / updateTimeout) * 100, 95)}%`
                  }}
                />
              </div>
            </div>
          ))}
          
          {pendingUpdates.length > 10 && (
            <div className="text-center text-[#9ca3af] text-sm">
              ... and {pendingUpdates.length - 10} more updates
            </div>
          )}
        </div>
      )}

      {/* Rollback Queue */}
      {rollbackQueue.length > 0 && (
        <div className="mt-4 p-2 bg-[#ef4444] bg-opacity-10 border border-[#ef4444] rounded">
          <div className="text-[#ef4444] text-sm font-medium mb-1">
            Rollback Queue ({rollbackQueue.length})
          </div>
          <div className="text-[#9ca3af] text-xs">
            Updates being rolled back due to confirmation timeout or errors
          </div>
        </div>
      )}

      {/* Status Summary */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="bg-[#252547] p-2 rounded">
          <div className="text-[#9ca3af]">Pending</div>
          <div className="text-[#e5e7eb] font-bold">
            {pendingUpdates.filter(u => !u.confirmed).length}
          </div>
        </div>
        
        <div className="bg-[#252547] p-2 rounded">
          <div className="text-[#9ca3af]">Failed</div>
          <div className="text-[#e5e7eb] font-bold">
            {failedUpdates.size}
          </div>
        </div>
      </div>

      {/* Overflow Warning */}
      {pendingUpdates.length > maxPendingUpdates * 0.8 && (
        <div className="mt-2 p-2 bg-[#f59e0b] bg-opacity-10 border border-[#f59e0b] rounded">
          <div className="text-[#f59e0b] text-sm font-medium">
            High Update Volume Warning
          </div>
          <div className="text-[#9ca3af] text-xs">
            {pendingUpdates.length} / {maxPendingUpdates} updates pending
          </div>
        </div>
      )}
    </div>
  );
}
