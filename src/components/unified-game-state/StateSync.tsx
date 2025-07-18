'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { detectConflicts, UNIFIED_GAME_STATE_CONFIG } from '~/lib/unified-game-state-utils';
import type { StateSyncProps, UnifiedGameState, StateConflict, SyncError } from '~/types/unified-game-state';

/**
 * State Sync Component
 * 
 * Handles real-time synchronization of game state across all players
 * with conflict detection and optimistic updates.
 */

export function StateSync({
  gameState,
  roomCode,
  playerId,
  syncConfig,
  onSync,
  onSyncError,
  onConflict,
  syncInterval = UNIFIED_GAME_STATE_CONFIG.SYNC_INTERVAL,
  enableOptimisticUpdates = true
}: StateSyncProps) {
  // Sync state
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const [syncLatency, setSyncLatency] = useState<number>(0);
  const [retryCount, setRetryCount] = useState<number>(0);

  // Refs for timers and performance
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncStartTime = useRef<number>(0);
  const lastKnownVersion = useRef<number>(gameState.version);

  // Mock sync implementation (will be replaced with real API in Phase 2)
  const mockSyncWithServer = useCallback(async (state: UnifiedGameState): Promise<UnifiedGameState> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    
    // Simulate occasional conflicts
    if (Math.random() < 0.1) {
      const conflictingState = {
        ...state,
        version: state.version + 1,
        timestamp: Date.now(),
        metadata: {
          ...state.metadata,
          updatedAt: Date.now()
        }
      };
      
      const conflicts = detectConflicts(state, conflictingState);
      if (conflicts.length > 0) {
        onConflict(conflicts[0]!);
        throw new Error('Sync conflict detected');
      }
    }

    // Simulate network errors
    if (Math.random() < 0.05) {
      throw new Error('Network error during sync');
    }

    // Return synchronized state
    return {
      ...state,
      metadata: {
        ...state.metadata,
        lastSyncedAt: Date.now(),
        syncStatus: 'synchronized'
      }
    };
  }, [onConflict]);

  // Perform sync operation
  const performSync = useCallback(async () => {
    if (syncStatus === 'syncing') return;

    try {
      setSyncStatus('syncing');
      syncStartTime.current = Date.now();
      
      const syncedState = await mockSyncWithServer(gameState);
      
      // Calculate latency
      const latency = Date.now() - syncStartTime.current;
      setSyncLatency(latency);
      
      // Update last sync time
      setLastSyncTime(Date.now());
      lastKnownVersion.current = syncedState.version;
      
      // Reset retry count on successful sync
      setRetryCount(0);
      
      // Notify parent of successful sync
      onSync(syncedState);
      
    } catch (error) {
      const syncError: SyncError = {
        type: 'network',
        message: error instanceof Error ? error.message : 'Unknown sync error',
        recoverable: true,
        retryAfter: Math.pow(2, retryCount) * 1000
      };
      
      onSyncError(syncError);
      setRetryCount(prev => prev + 1);
      
      // Schedule retry if within limits
      if (retryCount < syncConfig.maxRetries) {
        setTimeout(() => {
          void performSync();
        }, syncError.retryAfter);
      }
    } finally {
      setSyncStatus('idle');
    }
  }, [gameState, syncStatus, syncConfig.maxRetries, retryCount, mockSyncWithServer, onSync, onSyncError]);

  // Set up sync interval
  useEffect(() => {
    if (syncConfig.enableRealTimeSync) {
      syncIntervalRef.current = setInterval(() => {
        void performSync();
      }, syncInterval);
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [syncConfig.enableRealTimeSync, syncInterval, performSync]);

  // Trigger sync when state version changes
  useEffect(() => {
    if (gameState.version !== lastKnownVersion.current) {
      void performSync();
    }
  }, [gameState.version, performSync]);

  // Manual sync trigger
  const triggerManualSync = useCallback(() => {
    void performSync();
  }, [performSync]);

  // Format sync status for display
  const getSyncStatusDisplay = () => {
    if (syncStatus === 'syncing') return 'Syncing...';
    if (retryCount > 0) return `Retry ${retryCount}/${syncConfig.maxRetries}`;
    if (lastSyncTime > 0) {
      const timeSinceSync = Date.now() - lastSyncTime;
      if (timeSinceSync < 5000) return 'Synchronized';
      if (timeSinceSync < 30000) return 'Recently synced';
      return 'Sync outdated';
    }
    return 'Not synced';
  };

  // Get sync status color
  const getSyncStatusColor = () => {
    if (syncStatus === 'syncing') return 'text-[#f59e0b]';
    if (retryCount > 0) return 'text-[#ef4444]';
    if (lastSyncTime > 0 && Date.now() - lastSyncTime < 5000) return 'text-[#22c55e]';
    return 'text-[#9ca3af]';
  };

  return (
    <div className="bg-[#1a1a2e] p-4 rounded-lg border border-[#252547]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[#e5e7eb] font-bold text-lg">State Synchronization</h3>
        <div className="flex items-center space-x-2">
          <div 
            className={`w-2 h-2 rounded-full ${
              syncStatus === 'syncing' ? 'bg-[#f59e0b] animate-pulse' : 
              retryCount > 0 ? 'bg-[#ef4444]' : 
              lastSyncTime > 0 && Date.now() - lastSyncTime < 5000 ? 'bg-[#22c55e]' : 
              'bg-[#9ca3af]'
            }`}
          />
          <span className={`text-sm font-medium ${getSyncStatusColor()}`}>
            {getSyncStatusDisplay()}
          </span>
        </div>
      </div>

      {/* Sync Information */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#252547] p-3 rounded">
          <div className="text-[#9ca3af] text-xs font-medium">SYNC INTERVAL</div>
          <div className="text-[#e5e7eb] font-mono text-sm">{syncInterval}ms</div>
        </div>
        <div className="bg-[#252547] p-3 rounded">
          <div className="text-[#9ca3af] text-xs font-medium">LATENCY</div>
          <div className="text-[#e5e7eb] font-mono text-sm">{syncLatency}ms</div>
        </div>
        <div className="bg-[#252547] p-3 rounded">
          <div className="text-[#9ca3af] text-xs font-medium">STATE VERSION</div>
          <div className="text-[#e5e7eb] font-mono text-sm">v{gameState.version}</div>
        </div>
        <div className="bg-[#252547] p-3 rounded">
          <div className="text-[#9ca3af] text-xs font-medium">LAST SYNC</div>
          <div className="text-[#e5e7eb] font-mono text-sm">
            {lastSyncTime > 0 ? 
              `${Math.round((Date.now() - lastSyncTime) / 1000)}s ago` : 
              'Never'
            }
          </div>
        </div>
      </div>

      {/* Sync Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-[#9ca3af] text-sm">
            Player: <span className="text-[#e5e7eb] font-mono">{playerId}</span>
          </div>
          <div className="text-[#9ca3af] text-sm">
            Room: <span className="text-[#e5e7eb] font-mono">{roomCode}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {enableOptimisticUpdates && (
            <div className="text-[#3b82f6] text-xs font-medium bg-[#252547] px-2 py-1 rounded">
              OPTIMISTIC
            </div>
          )}
          <button
            onClick={triggerManualSync}
            disabled={syncStatus === 'syncing'}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              syncStatus === 'syncing' 
                ? 'bg-[#252547] text-[#9ca3af] cursor-not-allowed' 
                : 'bg-[#3b82f6] text-white hover:bg-[#3d3d7a]'
            }`}
          >
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* Retry Information */}
      {retryCount > 0 && (
        <div className="mt-3 p-2 bg-[#ef4444] bg-opacity-10 border border-[#ef4444] rounded">
          <div className="text-[#ef4444] text-sm font-medium">
            Sync failed. Retrying {retryCount}/{syncConfig.maxRetries}
          </div>
        </div>
      )}
    </div>
  );
}
