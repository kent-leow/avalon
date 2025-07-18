'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { resolveConflict as resolveStateConflict } from '~/lib/unified-game-state-utils';
import type { 
  ConflictResolverProps, 
  StateConflict, 
  ConflictResolutionStrategy,
  ConflictResolutionError 
} from '~/types/unified-game-state';

/**
 * Conflict Resolver Component
 * 
 * Handles resolution of state conflicts that occur during synchronization
 * with various resolution strategies and manual intervention options.
 */

export function ConflictResolver({
  conflicts,
  resolutionStrategy,
  onResolve,
  onResolutionError,
  autoResolve = false,
  resolutionTimeout = 10000
}: ConflictResolverProps) {
  // Resolution state
  const [resolvingConflicts, setResolvingConflicts] = useState<Set<string>>(new Set());
  const [resolvedConflicts, setResolvedConflicts] = useState<Set<string>>(new Set());
  const [selectedStrategy, setSelectedStrategy] = useState<ConflictResolutionStrategy>(resolutionStrategy);
  
  // Refs for timers
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Available resolution strategies
  const strategies: { value: ConflictResolutionStrategy; label: string; description: string }[] = [
    { 
      value: 'last_writer_wins', 
      label: 'Last Writer Wins', 
      description: 'Use the most recent state' 
    },
    { 
      value: 'first_writer_wins', 
      label: 'First Writer Wins', 
      description: 'Use the earliest state' 
    },
    { 
      value: 'merge_changes', 
      label: 'Merge Changes', 
      description: 'Combine both states' 
    },
    { 
      value: 'manual_resolution', 
      label: 'Manual Resolution', 
      description: 'Require manual intervention' 
    },
    { 
      value: 'rollback_to_checkpoint', 
      label: 'Rollback', 
      description: 'Return to previous state' 
    }
  ];

  // Resolve a specific conflict
  const resolveConflict = useCallback(async (
    conflict: StateConflict,
    strategy: ConflictResolutionStrategy
  ) => {
    if (resolvingConflicts.has(conflict.id)) return;

    try {
      setResolvingConflicts(prev => new Set(prev).add(conflict.id));
      
      // Simulate resolution delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const resolvedState = resolveStateConflict(conflict, strategy);
      
      // Mark as resolved
      setResolvedConflicts(prev => new Set(prev).add(conflict.id));
      
      onResolve(resolvedState);
      
    } catch (error) {
      const resolutionError: ConflictResolutionError = {
        type: 'strategy_failed',
        message: error instanceof Error ? error.message : 'Unknown resolution error',
        conflictId: conflict.id,
        context: { strategy, conflict }
      };
      
      onResolutionError(resolutionError);
    } finally {
      setResolvingConflicts(prev => {
        const newSet = new Set(prev);
        newSet.delete(conflict.id);
        return newSet;
      });
    }
  }, [resolvingConflicts, onResolve, onResolutionError]);

  // Auto-resolve conflicts
  useEffect(() => {
    if (autoResolve) {
      conflicts.forEach(conflict => {
        if (!resolvingConflicts.has(conflict.id) && !resolvedConflicts.has(conflict.id)) {
          void resolveConflict(conflict, selectedStrategy);
        }
      });
    }
  }, [conflicts, autoResolve, selectedStrategy, resolvingConflicts, resolvedConflicts, resolveConflict]);

  // Set up resolution timeouts
  useEffect(() => {
    conflicts.forEach(conflict => {
      if (!timeoutRefs.current.has(conflict.id)) {
        const timeout = setTimeout(() => {
          if (!resolvedConflicts.has(conflict.id)) {
            void resolveConflict(conflict, 'last_writer_wins');
          }
        }, resolutionTimeout);
        
        timeoutRefs.current.set(conflict.id, timeout);
      }
    });

    // Cleanup resolved conflicts
    Array.from(timeoutRefs.current.keys()).forEach(conflictId => {
      if (!conflicts.some(c => c.id === conflictId)) {
        const timeout = timeoutRefs.current.get(conflictId);
        if (timeout) {
          clearTimeout(timeout);
          timeoutRefs.current.delete(conflictId);
        }
      }
    });
  }, [conflicts, resolutionTimeout, resolvedConflicts, resolveConflict]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Get conflict priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-[#ef4444]';
      case 'high': return 'text-[#f59e0b]';
      case 'medium': return 'text-[#3b82f6]';
      case 'low': return 'text-[#22c55e]';
      default: return 'text-[#9ca3af]';
    }
  };

  // Get conflict type icon
  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'simultaneous_action': return '⚡';
      case 'version_mismatch': return '🔄';
      case 'data_corruption': return '⚠️';
      case 'network_partition': return '🌐';
      case 'player_disconnect': return '🔌';
      default: return '❓';
    }
  };

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#1a1a2e] p-4 rounded-lg border border-[#f59e0b]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[#f59e0b] rounded-full animate-bounce" />
          <h3 className="text-[#e5e7eb] font-bold text-lg">Conflict Resolution</h3>
          <span className="bg-[#f59e0b] text-[#0a0a0f] px-2 py-1 rounded text-sm font-bold">
            {conflicts.length}
          </span>
        </div>
        
        {!autoResolve && (
          <div className="flex items-center space-x-2">
            <label className="text-[#9ca3af] text-sm">Strategy:</label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value as ConflictResolutionStrategy)}
              className="bg-[#252547] text-[#e5e7eb] px-2 py-1 rounded border border-[#3d3d7a] text-sm"
            >
              {strategies.map(strategy => (
                <option key={strategy.value} value={strategy.value}>
                  {strategy.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Conflicts List */}
      <div className="space-y-3">
        {conflicts.map(conflict => (
          <div key={conflict.id} className="bg-[#252547] p-3 rounded border border-[#3d3d7a]">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{getConflictIcon(conflict.type)}</span>
                  <span className="text-[#e5e7eb] font-medium capitalize">
                    {conflict.type.replace('_', ' ')}
                  </span>
                  <span className={`text-sm font-medium ${getPriorityColor(conflict.priority)}`}>
                    {conflict.priority.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-[#9ca3af] text-sm mb-2">{conflict.description}</p>
                
                <div className="flex items-center space-x-4 text-xs text-[#9ca3af]">
                  <div>
                    Player: <span className="text-[#e5e7eb] font-mono">{conflict.playerId}</span>
                  </div>
                  <div>
                    States: <span className="text-[#e5e7eb] font-mono">{conflict.conflictingStates.length}</span>
                  </div>
                  <div>
                    Components: <span className="text-[#e5e7eb] font-mono">{conflict.affectedComponents.join(', ')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {resolvingConflicts.has(conflict.id) ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-[#f59e0b] border-t-transparent" />
                    <span className="text-[#f59e0b] text-sm">Resolving...</span>
                  </div>
                ) : resolvedConflicts.has(conflict.id) ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-[#22c55e] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-[#22c55e] text-sm">Resolved</span>
                  </div>
                ) : (
                  <button
                    onClick={() => void resolveConflict(conflict, selectedStrategy)}
                    className="bg-[#3b82f6] text-white px-3 py-1 rounded text-sm hover:bg-[#3d3d7a] transition-colors"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
            
            {/* Resolution Strategy Info */}
            {selectedStrategy === 'manual_resolution' && (
              <div className="mt-2 p-2 bg-[#0a0a0f] rounded border border-[#3d3d7a]">
                <div className="text-[#f59e0b] text-sm font-medium mb-1">Manual Resolution Required</div>
                <div className="text-[#9ca3af] text-xs">
                  This conflict requires manual intervention to resolve safely.
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Auto-resolve Info */}
      {autoResolve && (
        <div className="mt-4 p-2 bg-[#3b82f6] bg-opacity-10 border border-[#3b82f6] rounded">
          <div className="text-[#3b82f6] text-sm font-medium">
            Auto-resolve enabled with "{strategies.find(s => s.value === selectedStrategy)?.label}" strategy
          </div>
        </div>
      )}
      
      {/* Resolution Timeout Warning */}
      {resolutionTimeout > 0 && (
        <div className="mt-2 text-[#9ca3af] text-xs">
          Conflicts will auto-resolve after {resolutionTimeout / 1000}s timeout
        </div>
      )}
    </div>
  );
}
