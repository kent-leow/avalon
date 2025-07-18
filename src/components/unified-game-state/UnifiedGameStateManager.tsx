'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { UnifiedGameStateProvider } from '~/context/UnifiedGameStateContext';
import { useUnifiedGameState } from '~/hooks/useUnifiedGameState';
import { StateSync } from './StateSync';
import { ConflictResolver } from './ConflictResolver';
import { OptimisticUpdateManager } from './OptimisticUpdateManager';
import { StatePersistence } from './StatePersistence';
import { createMockUnifiedGameState } from '~/lib/unified-game-state-utils';
import type { 
  UnifiedGameStateManagerProps, 
  DebugInfo, 
  UnifiedGameState, 
  StateConflict, 
  OptimisticUpdate, 
  GameStateSnapshot,
  OptimisticUpdateError,
  ConflictResolutionError,
  PersistenceError
} from '~/types/unified-game-state';

/**
 * Unified Game State Manager
 * 
 * Central component that orchestrates all game state management,
 * real-time synchronization, and conflict resolution across all 18 game features.
 */

function UnifiedGameStateManagerContent({
  roomCode,
  playerId,
  initialState,
  syncConfig = {
    enableRealTimeSync: true,
    syncInterval: 1000,
    maxRetries: 3,
    retryDelay: 1000,
    conflictResolutionTimeout: 10000,
    optimisticUpdates: true
  },
  persistenceConfig = {
    enableAutoSave: true,
    autoSaveInterval: 5000,
    enableLocalStorage: true,
    enableIndexedDB: false,
    maxSnapshots: 10,
    compressionEnabled: false
  },
  onStateChange,
  onError,
  onConflict,
  onSync,
  enableDebugMode = false,
  children
}: UnifiedGameStateManagerProps) {
  // Use unified game state hook
  const {
    gameState,
    isLoading,
    error,
    syncStatus,
    conflicts,
    pendingUpdates,
    updateGameState,
    rollbackUpdate,
    resolveConflict,
    persistState,
    restoreState,
    clearError,
    retry
  } = useUnifiedGameState(roomCode, playerId, {
    enableRealTimeSync: syncConfig.enableRealTimeSync,
    enableOptimisticUpdates: syncConfig.optimisticUpdates,
    enablePersistence: persistenceConfig.enableAutoSave,
    syncInterval: syncConfig.syncInterval,
    maxRetries: syncConfig.maxRetries
  });

  // Debug state
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    stateVersion: 0,
    lastSyncTime: 0,
    syncLatency: 0,
    conflictCount: 0,
    pendingUpdateCount: 0,
    persistenceStatus: 'saved',
    memoryUsage: 0,
    networkStatus: 'online'
  });

  // Refs for performance monitoring
  const syncStartTime = useRef<number>(0);
  const performanceObserver = useRef<PerformanceObserver | null>(null);

  // Initialize mock state if no initial state provided
  useEffect(() => {
    if (!initialState && !gameState) {
      const mockState = createMockUnifiedGameState({
        roomCode,
        playerCount: 5,
        gamePhase: 'lobby',
        withConflicts: false,
        withOptimisticUpdates: false,
        withErrors: false
      });
      void updateGameState(mockState);
    }
  }, [initialState, gameState, roomCode, updateGameState]);

  // Update debug info
  useEffect(() => {
    if (gameState) {
      setDebugInfo(prev => ({
        ...prev,
        stateVersion: gameState.version,
        lastSyncTime: gameState.metadata.lastSyncedAt,
        conflictCount: conflicts.length,
        pendingUpdateCount: pendingUpdates.length,
        persistenceStatus: gameState.metadata.persistenceStatus,
        memoryUsage: JSON.stringify(gameState).length
      }));
    }
  }, [gameState, conflicts.length, pendingUpdates.length]);

  // Monitor sync performance
  useEffect(() => {
    if (syncStatus === 'syncing') {
      syncStartTime.current = Date.now();
    } else if (syncStatus === 'synchronized' && syncStartTime.current > 0) {
      const latency = Date.now() - syncStartTime.current;
      setDebugInfo(prev => ({ ...prev, syncLatency: latency }));
    }
  }, [syncStatus]);

  // Callback handlers
  useEffect(() => {
    if (gameState && onStateChange) {
      onStateChange(gameState);
    }
  }, [gameState, onStateChange]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  useEffect(() => {
    if (conflicts.length > 0 && onConflict) {
      onConflict(conflicts[0]!);
    }
  }, [conflicts, onConflict]);

  useEffect(() => {
    if (onSync) {
      onSync(syncStatus);
    }
  }, [syncStatus, onSync]);

  // Handle state recovery
  const handleRecovery = useCallback(async () => {
    try {
      await retry();
    } catch (error) {
      console.error('Recovery failed:', error);
    }
  }, [retry]);

  // Handle conflict resolution
  const handleConflictResolution = useCallback(async (conflictId: string) => {
    try {
      await resolveConflict(conflictId, 'last_writer_wins');
    } catch (error) {
      console.error('Conflict resolution failed:', error);
    }
  }, [resolveConflict]);

  // Handle optimistic update rollback
  const handleOptimisticRollback = useCallback(async (updateId: string) => {
    try {
      await rollbackUpdate(updateId);
    } catch (error) {
      console.error('Optimistic update rollback failed:', error);
    }
  }, [rollbackUpdate]);

  // Handle state persistence
  const handlePersistence = useCallback(async () => {
    try {
      await persistState();
    } catch (error) {
      console.error('State persistence failed:', error);
    }
  }, [persistState]);

  // Render loading state
  if (isLoading && !gameState) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="bg-[#1a1a2e] p-6 rounded-lg border border-[#252547]">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3b82f6]"></div>
            <span className="text-[#e5e7eb] font-medium">Loading game state...</span>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !gameState) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="bg-[#1a1a2e] p-6 rounded-lg border border-[#ef4444] max-w-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-[#ef4444] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <span className="text-[#e5e7eb] font-bold text-lg">State Error</span>
          </div>
          <p className="text-[#9ca3af] mb-4">{error.message}</p>
          <div className="flex space-x-3">
            <button
              onClick={handleRecovery}
              className="bg-[#3b82f6] text-white px-4 py-2 rounded-md hover:bg-[#3d3d7a] transition-colors"
            >
              Retry
            </button>
            <button
              onClick={clearError}
              className="bg-[#252547] text-[#e5e7eb] px-4 py-2 rounded-md hover:bg-[#3d3d7a] transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4">
      {/* State Management Header */}
      <div className="bg-[#1a1a2e] p-4 rounded-lg border border-[#252547] mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-[#e5e7eb] font-bold text-xl">Game State Manager</h1>
            <div className="flex items-center space-x-2">
              <div 
                className={`w-3 h-3 rounded-full ${
                  syncStatus === 'synchronized' ? 'bg-[#22c55e]' : 
                  syncStatus === 'syncing' ? 'bg-[#f59e0b] animate-pulse' : 
                  syncStatus === 'conflict' ? 'bg-[#f59e0b]' : 
                  'bg-[#ef4444]'
                }`}
              />
              <span className="text-[#9ca3af] text-sm capitalize">{syncStatus}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-[#9ca3af] text-sm">
              Room: <span className="text-[#e5e7eb] font-mono">{roomCode}</span>
            </div>
            <div className="text-[#9ca3af] text-sm">
              Version: <span className="text-[#e5e7eb] font-mono">{gameState?.version || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - State Components */}
        <div className="space-y-4">
          {/* State Sync Component */}
          {gameState && (
            <StateSync
              gameState={gameState}
              roomCode={roomCode}
              playerId={playerId}
              syncConfig={syncConfig}
              onSync={(syncedState: UnifiedGameState) => void updateGameState(syncedState)}
              onSyncError={(error: any) => console.error('Sync error:', error)}
              onConflict={(conflict: StateConflict) => console.warn('Sync conflict:', conflict)}
              syncInterval={syncConfig.syncInterval}
              enableOptimisticUpdates={syncConfig.optimisticUpdates}
            />
          )}

          {/* Conflict Resolver Component */}
          {conflicts.length > 0 && (
            <ConflictResolver
              conflicts={conflicts}
              resolutionStrategy="last_writer_wins"
              onResolve={(resolvedState: UnifiedGameState) => void updateGameState(resolvedState)}
              onResolutionError={(error: ConflictResolutionError) => console.error('Resolution error:', error)}
              autoResolve={false}
              resolutionTimeout={syncConfig.conflictResolutionTimeout}
            />
          )}

          {/* Optimistic Update Manager */}
          {pendingUpdates.length > 0 && (
            <OptimisticUpdateManager
              gameState={gameState!}
              pendingUpdates={pendingUpdates}
              onUpdate={(update: OptimisticUpdate) => console.log('Optimistic update:', update)}
              onRollback={handleOptimisticRollback}
              onConfirm={(updateId: string) => console.log('Update confirmed:', updateId)}
              onUpdateError={(error: OptimisticUpdateError) => console.error('Update error:', error)}
              onApplyUpdate={(state: UnifiedGameState) => void updateGameState(state)}
              onRollbackUpdate={(state: UnifiedGameState) => void updateGameState(state)}
              maxRetries={syncConfig.maxRetries}
              timeoutMs={5000}
            />
          )}
        </div>

        {/* Right Column - Persistence & Debug */}
        <div className="space-y-4">
          {/* State Persistence Component */}
          {gameState && (
            <StatePersistence
              gameState={gameState}
              persistenceConfig={persistenceConfig}
              onSave={(snapshot: GameStateSnapshot) => console.log('State saved:', snapshot.id)}
              onRestore={(snapshot: GameStateSnapshot) => console.log('State restored:', snapshot.id)}
              onPersistenceError={(error: PersistenceError) => console.error('Persistence error:', error)}
              enableAutoSave={persistenceConfig.enableAutoSave}
              autoSaveInterval={persistenceConfig.autoSaveInterval}
            />
          )}

          {/* Debug Information */}
          {enableDebugMode && (
            <div className="bg-[#1a1a2e] p-4 rounded-lg border border-[#252547]">
              <h3 className="text-[#e5e7eb] font-bold text-lg mb-3">Debug Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[#9ca3af]">State Version:</span>
                  <span className="text-[#e5e7eb] font-mono ml-2">{debugInfo.stateVersion}</span>
                </div>
                <div>
                  <span className="text-[#9ca3af]">Sync Latency:</span>
                  <span className="text-[#e5e7eb] font-mono ml-2">{debugInfo.syncLatency}ms</span>
                </div>
                <div>
                  <span className="text-[#9ca3af]">Conflicts:</span>
                  <span className="text-[#e5e7eb] font-mono ml-2">{debugInfo.conflictCount}</span>
                </div>
                <div>
                  <span className="text-[#9ca3af]">Pending Updates:</span>
                  <span className="text-[#e5e7eb] font-mono ml-2">{debugInfo.pendingUpdateCount}</span>
                </div>
                <div>
                  <span className="text-[#9ca3af]">Memory Usage:</span>
                  <span className="text-[#e5e7eb] font-mono ml-2">{debugInfo.memoryUsage} bytes</span>
                </div>
                <div>
                  <span className="text-[#9ca3af]">Network:</span>
                  <span className="text-[#e5e7eb] font-mono ml-2">{debugInfo.networkStatus}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Child Components */}
      {children}
    </div>
  );
}

export function UnifiedGameStateManager(props: UnifiedGameStateManagerProps) {
  return (
    <UnifiedGameStateProvider
      roomCode={props.roomCode}
      playerId={props.playerId}
      initialState={props.initialState}
    >
      <UnifiedGameStateManagerContent {...props} />
    </UnifiedGameStateProvider>
  );
}
