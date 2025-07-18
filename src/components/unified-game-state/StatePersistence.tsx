'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { createSnapshot, restoreFromSnapshot } from '~/lib/unified-game-state-utils';
import type { 
  StatePersistenceProps, 
  GameStateSnapshot,
  PersistenceError,
  PersistenceStatus
} from '~/types/unified-game-state';

/**
 * State Persistence Component
 * 
 * Manages saving and restoring game state snapshots with automatic
 * and manual persistence options.
 */

export function StatePersistence({
  gameState,
  persistenceConfig,
  onSave,
  onRestore,
  onPersistenceError,
  enableAutoSave = true,
  autoSaveInterval = 30000
}: StatePersistenceProps) {
  // Persistence state
  const [status, setStatus] = useState<PersistenceStatus>('idle');
  const [snapshots, setSnapshots] = useState<GameStateSnapshot[]>([]);
  const [lastSaveTime, setLastSaveTime] = useState<number>(0);
  const [saveProgress, setSaveProgress] = useState<number>(0);
  
  // Refs for timers and storage
  const autoSaveTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const saveInProgress = useRef<boolean>(false);
  const storageQuotaUsed = useRef<number>(0);

  // Create a snapshot of the current state
  const createStateSnapshot = useCallback(async (
    description = 'Auto-save',
    tags: string[] = []
  ): Promise<GameStateSnapshot> => {
    try {
      setSaveProgress(0);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSaveProgress(prev => Math.min(prev + 20, 90));
      }, 100);
      
      const snapshot = createSnapshot(gameState, {
        description,
        tags: [...tags, 'unified-state'],
        source: 'StatePersistence'
      });
      
      clearInterval(progressInterval);
      setSaveProgress(100);
      
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return snapshot;
      
    } catch (error) {
      const persistenceError: PersistenceError = {
        type: 'save_failed',
        message: error instanceof Error ? error.message : 'Failed to create snapshot',
        context: { gameState, description, tags }
      };
      
      onPersistenceError(persistenceError);
      throw error;
    } finally {
      setTimeout(() => setSaveProgress(0), 1000);
    }
  }, [gameState, onPersistenceError]);

  // Save state to storage
  const saveState = useCallback(async (
    description = 'Manual save',
    tags: string[] = []
  ) => {
    if (saveInProgress.current) return;
    
    try {
      saveInProgress.current = true;
      setStatus('saving');
      
      const snapshot = await createStateSnapshot(description, tags);
      
      // Add to snapshots list
      setSnapshots(prev => {
        const newSnapshots = [snapshot, ...prev];
        // Limit to max snapshots
        return newSnapshots.slice(0, persistenceConfig.maxSnapshots);
      });
      
      setLastSaveTime(Date.now());
      setStatus('idle');
      
      // Update storage quota usage (mock)
      storageQuotaUsed.current = snapshots.length * 0.1; // MB
      
      onSave(snapshot);
      
    } catch (error) {
      setStatus('error');
      const persistenceError: PersistenceError = {
        type: 'save_failed',
        message: error instanceof Error ? error.message : 'Save operation failed',
        context: { description, tags }
      };
      
      onPersistenceError(persistenceError);
    } finally {
      saveInProgress.current = false;
    }
  }, [createStateSnapshot, snapshots.length, persistenceConfig.maxSnapshots, onSave, onPersistenceError]);

  // Restore state from snapshot
  const restoreState = useCallback(async (snapshot: GameStateSnapshot) => {
    try {
      setStatus('restoring');
      
      // Simulate restore delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const restoredState = restoreFromSnapshot(snapshot);
      
      setStatus('idle');
      onRestore(snapshot);
      
    } catch (error) {
      setStatus('error');
      const persistenceError: PersistenceError = {
        type: 'restore_failed',
        message: error instanceof Error ? error.message : 'Restore operation failed',
        context: { snapshot }
      };
      
      onPersistenceError(persistenceError);
    }
  }, [onRestore, onPersistenceError]);

  // Delete snapshot
  const deleteSnapshot = useCallback((snapshotId: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== snapshotId));
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (enableAutoSave && persistenceConfig.enableAutoSave) {
      autoSaveTimer.current = setInterval(() => {
        void saveState('Auto-save', ['auto', 'periodic']);
      }, autoSaveInterval);
      
      return () => {
        if (autoSaveTimer.current) {
          clearInterval(autoSaveTimer.current);
        }
      };
    }
  }, [enableAutoSave, persistenceConfig.enableAutoSave, autoSaveInterval, saveState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearInterval(autoSaveTimer.current);
      }
    };
  }, []);

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'saving': return 'text-[#f59e0b]';
      case 'restoring': return 'text-[#3b82f6]';
      case 'error': return 'text-[#ef4444]';
      default: return 'text-[#22c55e]';
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (status) {
      case 'saving': return '💾';
      case 'restoring': return '🔄';
      case 'error': return '❌';
      default: return '✅';
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format time ago
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="bg-[#1a1a2e] p-4 rounded-lg border border-[#22c55e]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[#22c55e] rounded-full animate-pulse" />
          <h3 className="text-[#e5e7eb] font-bold text-lg">State Persistence</h3>
          <span className="bg-[#22c55e] text-white px-2 py-1 rounded text-sm font-bold">
            {snapshots.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => void saveState('Manual save', ['manual', 'user'])}
            disabled={status === 'saving'}
            className="bg-[#3b82f6] text-white px-3 py-1 rounded text-sm hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'saving' ? 'Saving...' : 'Save Now'}
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-lg">{getStatusIcon()}</span>
        <span className={`font-medium ${getStatusColor()}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        {lastSaveTime > 0 && (
          <span className="text-[#9ca3af] text-sm">
            Last saved: {formatTimeAgo(lastSaveTime)}
          </span>
        )}
      </div>

      {/* Save Progress */}
      {status === 'saving' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[#9ca3af] text-sm">Saving progress</span>
            <span className="text-[#e5e7eb] text-sm">{saveProgress}%</span>
          </div>
          <div className="w-full bg-[#252547] rounded-full h-2">
            <div 
              className="bg-[#f59e0b] h-2 rounded-full transition-all duration-300"
              style={{ width: `${saveProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Snapshots List */}
      <div className="space-y-2 mb-4">
        {snapshots.slice(0, 5).map(snapshot => (
          <div key={snapshot.id} className="bg-[#252547] p-3 rounded border border-[#3d3d7a]">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-[#e5e7eb] font-medium">{snapshot.description}</span>
                  <div className="flex space-x-1">
                    {snapshot.tags.map(tag => (
                      <span key={tag} className="bg-[#3d3d7a] text-[#9ca3af] px-1 py-0.5 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-[#9ca3af]">
                  <div>
                    Created: {formatTimeAgo(snapshot.timestamp)}
                  </div>
                  <div>
                    Size: {formatFileSize(snapshot.size)}
                  </div>
                  <div>
                    Version: {snapshot.version}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => void restoreState(snapshot)}
                  disabled={status === 'restoring'}
                  className="bg-[#3b82f6] text-white px-2 py-1 rounded text-xs hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Restore
                </button>
                <button
                  onClick={() => deleteSnapshot(snapshot.id)}
                  className="bg-[#ef4444] text-white px-2 py-1 rounded text-xs hover:bg-[#dc2626] transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {snapshots.length > 5 && (
          <div className="text-center text-[#9ca3af] text-sm">
            ... and {snapshots.length - 5} more snapshots
          </div>
        )}
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-3 gap-2 text-sm mb-4">
        <div className="bg-[#252547] p-2 rounded">
          <div className="text-[#9ca3af]">Auto-save</div>
          <div className="text-[#e5e7eb] font-bold">
            {enableAutoSave && persistenceConfig.enableAutoSave ? 'On' : 'Off'}
          </div>
        </div>
        
        <div className="bg-[#252547] p-2 rounded">
          <div className="text-[#9ca3af]">Interval</div>
          <div className="text-[#e5e7eb] font-bold">
            {autoSaveInterval / 1000}s
          </div>
        </div>
        
        <div className="bg-[#252547] p-2 rounded">
          <div className="text-[#9ca3af]">Max Snapshots</div>
          <div className="text-[#e5e7eb] font-bold">
            {persistenceConfig.maxSnapshots}
          </div>
        </div>
      </div>

      {/* Storage Info */}
      <div className="p-2 bg-[#252547] rounded">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#9ca3af] text-sm">Storage Usage</span>
          <span className="text-[#e5e7eb] text-sm">
            {formatFileSize(storageQuotaUsed.current * 1024 * 1024)} / {formatFileSize(100 * 1024 * 1024)}
          </span>
        </div>
        <div className="w-full bg-[#0a0a0f] rounded-full h-2">
          <div 
            className="bg-[#22c55e] h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((storageQuotaUsed.current / 100) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Storage Quota Warning */}
      {storageQuotaUsed.current > 80 && (
        <div className="mt-2 p-2 bg-[#f59e0b] bg-opacity-10 border border-[#f59e0b] rounded">
          <div className="text-[#f59e0b] text-sm font-medium">
            Storage quota warning
          </div>
          <div className="text-[#9ca3af] text-xs">
            Consider deleting old snapshots to free up space
          </div>
        </div>
      )}
    </div>
  );
}
