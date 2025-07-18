'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUnifiedGameStateContext } from '~/context/UnifiedGameStateContext';
import { 
  validateGameState, 
  detectConflicts, 
  resolveConflict as resolveStateConflict, 
  createOptimisticUpdate, 
  applyOptimisticUpdate, 
  createSnapshot,
  createGameStateError,
  UNIFIED_GAME_STATE_CONFIG
} from '~/lib/unified-game-state-utils';
import type { 
  UnifiedGameState, 
  StateConflict, 
  OptimisticUpdate, 
  GameStateError,
  SyncStatus,
  UseUnifiedGameStateReturn,
  ConflictResolutionStrategy
} from '~/types/unified-game-state';

/**
 * Unified Game State Hook
 * 
 * Main hook for managing unified game state with real-time synchronization,
 * conflict resolution, and optimistic updates.
 */

export function useUnifiedGameState(
  roomCode: string,
  playerId: string,
  options: {
    enableRealTimeSync?: boolean;
    enableOptimisticUpdates?: boolean;
    enablePersistence?: boolean;
    syncInterval?: number;
    maxRetries?: number;
  } = {}
): UseUnifiedGameStateReturn {
  const {
    state: gameState,
    isLoading,
    error,
    syncStatus,
    conflicts,
    pendingUpdates,
    dispatch
  } = useUnifiedGameStateContext();

  // Hook options with defaults
  const {
    enableRealTimeSync = true,
    enableOptimisticUpdates = true,
    enablePersistence = true,
    syncInterval = UNIFIED_GAME_STATE_CONFIG.SYNC_INTERVAL,
    maxRetries = UNIFIED_GAME_STATE_CONFIG.MAX_RETRIES
  } = options;

  // Internal state
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const [retryCount, setRetryCount] = useState<number>(0);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mock API functions (will be replaced with real API calls in Phase 2)
  const mockSyncWithServer = useCallback(async (state: UnifiedGameState): Promise<UnifiedGameState> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate occasional sync conflicts
    if (Math.random() < 0.1) {
      const conflictingState = { ...state, version: state.version + 1 };
      const detectedConflicts = detectConflicts(state, conflictingState);
      
      if (detectedConflicts.length > 0) {
        dispatch({ type: 'ADD_CONFLICT', payload: detectedConflicts[0]! });
        throw new Error('Sync conflict detected');
      }
    }
    
    return {
      ...state,
      metadata: {
        ...state.metadata,
        lastSyncedAt: Date.now(),
        syncStatus: 'synchronized'
      }
    };
  }, [dispatch]);

  const mockValidateStateUpdate = useCallback(async (update: Partial<UnifiedGameState>): Promise<boolean> => {
    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Basic validation
    if (!update || Object.keys(update).length === 0) {
      return false;
    }
    
    // Simulate occasional validation failures
    return Math.random() > 0.05;
  }, []);

  // Update game state with optimistic updates
  const updateGameState = useCallback(async (update: Partial<UnifiedGameState>): Promise<void> => {
    if (!gameState) {
      throw new Error('No game state available');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Validate the update
      const isValid = await mockValidateStateUpdate(update);
      if (!isValid) {
        throw new Error('Invalid state update');
      }

      // Create optimistic update if enabled
      if (enableOptimisticUpdates) {
        const optimisticUpdate = createOptimisticUpdate(
          'game_state_change',
          update,
          playerId,
          `Game state update for ${playerId}`,
          { timeoutMs: UNIFIED_GAME_STATE_CONFIG.OPTIMISTIC_UPDATE_TIMEOUT }
        );
        
        optimisticUpdate.rollbackState = gameState;
        dispatch({ type: 'ADD_OPTIMISTIC_UPDATE', payload: optimisticUpdate });
        
        // Apply optimistic update immediately
        const optimisticState = applyOptimisticUpdate(optimisticUpdate, gameState);
        dispatch({ type: 'SET_STATE', payload: optimisticState });
      }

      // Sync with server
      const updatedState = { ...gameState, ...update };
      const syncedState = await mockSyncWithServer(updatedState);
      
      // Update state with server response
      dispatch({ type: 'SET_STATE', payload: syncedState });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'synchronized' });
      
      // Remove optimistic update if it was applied
      if (enableOptimisticUpdates) {
        const optimisticUpdate = pendingUpdates.find(u => u.playerId === playerId);
        if (optimisticUpdate) {
          dispatch({ type: 'REMOVE_OPTIMISTIC_UPDATE', payload: optimisticUpdate.id });
        }
      }
      
      setLastSyncTime(Date.now());
      setRetryCount(0);
      
    } catch (error) {
      const gameStateError = createGameStateError(
        'UPDATE_FAILED',
        error instanceof Error ? error.message : 'Unknown error',
        { update, playerId, roomCode }
      );
      
      dispatch({ type: 'SET_ERROR', payload: gameStateError });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
      
      // Rollback optimistic update if it failed
      if (enableOptimisticUpdates) {
        const optimisticUpdate = pendingUpdates.find(u => u.playerId === playerId);
        if (optimisticUpdate?.rollbackState) {
          dispatch({ type: 'SET_STATE', payload: optimisticUpdate.rollbackState });
          dispatch({ type: 'REMOVE_OPTIMISTIC_UPDATE', payload: optimisticUpdate.id });
        }
      }
      
      // Retry logic
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        retryTimeoutRef.current = setTimeout(() => {
          void updateGameState(update);
        }, Math.pow(2, retryCount) * 1000);
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [gameState, playerId, roomCode, enableOptimisticUpdates, pendingUpdates, mockSyncWithServer, mockValidateStateUpdate, retryCount, maxRetries, dispatch]);

  // Rollback optimistic update
  const rollbackUpdate = useCallback(async (updateId: string): Promise<void> => {
    const update = pendingUpdates.find(u => u.id === updateId);
    if (!update?.rollbackState) {
      return;
    }

    try {
      dispatch({ type: 'SET_STATE', payload: update.rollbackState });
      dispatch({ type: 'REMOVE_OPTIMISTIC_UPDATE', payload: updateId });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'out_of_sync' });
    } catch (error) {
      const gameStateError = createGameStateError(
        'ROLLBACK_FAILED',
        error instanceof Error ? error.message : 'Unknown error',
        { updateId, playerId }
      );
      dispatch({ type: 'SET_ERROR', payload: gameStateError });
    }
  }, [pendingUpdates, playerId, dispatch]);

  // Resolve conflict
  const resolveConflictAction = useCallback(async (
    conflictId: string,
    strategy: ConflictResolutionStrategy
  ): Promise<void> => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) {
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const resolvedState = resolveStateConflict(conflict, strategy);
      
      // Validate resolved state
      if (!validateGameState(resolvedState)) {
        throw new Error('Resolved state is invalid');
      }
      
      // Sync resolved state with server
      const syncedState = await mockSyncWithServer(resolvedState);
      
      dispatch({ type: 'SET_STATE', payload: syncedState });
      dispatch({ type: 'REMOVE_CONFLICT', payload: conflictId });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'synchronized' });
      
    } catch (error) {
      const gameStateError = createGameStateError(
        'CONFLICT_RESOLUTION_FAILED',
        error instanceof Error ? error.message : 'Unknown error',
        { conflictId, strategy, playerId }
      );
      dispatch({ type: 'SET_ERROR', payload: gameStateError });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [conflicts, playerId, mockSyncWithServer, dispatch]);

  // Persist state
  const persistState = useCallback(async (): Promise<void> => {
    if (!gameState || !enablePersistence) {
      return;
    }

    try {
      const snapshot = createSnapshot(gameState);
      localStorage.setItem(`game-state-${roomCode}`, JSON.stringify(snapshot));
      
      dispatch({ type: 'UPDATE_STATE', payload: {
        metadata: {
          ...gameState.metadata,
          persistenceStatus: 'saved'
        }
      }});
    } catch (error) {
      const gameStateError = createGameStateError(
        'PERSISTENCE_FAILED',
        error instanceof Error ? error.message : 'Unknown error',
        { roomCode, playerId }
      );
      dispatch({ type: 'SET_ERROR', payload: gameStateError });
    }
  }, [gameState, roomCode, playerId, enablePersistence, dispatch]);

  // Restore state
  const restoreState = useCallback(async (snapshotId: string): Promise<void> => {
    if (!enablePersistence) {
      return;
    }

    try {
      const savedSnapshot = localStorage.getItem(`game-state-${roomCode}`);
      if (!savedSnapshot) {
        throw new Error('No saved state found');
      }

      const snapshot = JSON.parse(savedSnapshot);
      if (snapshot.id !== snapshotId) {
        throw new Error('Snapshot ID mismatch');
      }

      dispatch({ type: 'SET_STATE', payload: snapshot.gameState });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'out_of_sync' });
      
    } catch (error) {
      const gameStateError = createGameStateError(
        'RESTORE_FAILED',
        error instanceof Error ? error.message : 'Unknown error',
        { snapshotId, roomCode, playerId }
      );
      dispatch({ type: 'SET_ERROR', payload: gameStateError });
    }
  }, [roomCode, playerId, enablePersistence, dispatch]);

  // Clear error
  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, [dispatch]);

  // Retry last operation
  const retry = useCallback(async (): Promise<void> => {
    if (retryCount >= maxRetries) {
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      if (gameState) {
        await mockSyncWithServer(gameState);
        dispatch({ type: 'SET_SYNC_STATUS', payload: 'synchronized' });
        setRetryCount(0);
      }
    } catch (error) {
      const gameStateError = createGameStateError(
        'RETRY_FAILED',
        error instanceof Error ? error.message : 'Unknown error',
        { retryCount, playerId }
      );
      dispatch({ type: 'SET_ERROR', payload: gameStateError });
      setRetryCount(prev => prev + 1);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [gameState, retryCount, maxRetries, playerId, mockSyncWithServer, dispatch]);

  // Real-time sync effect
  useEffect(() => {
    if (!enableRealTimeSync || !gameState) {
      return;
    }

    const setupSync = () => {
      syncTimeoutRef.current = setTimeout(async () => {
        try {
          dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
          await mockSyncWithServer(gameState);
          dispatch({ type: 'SET_SYNC_STATUS', payload: 'synchronized' });
          setLastSyncTime(Date.now());
        } catch (error) {
          dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
        }
        setupSync(); // Schedule next sync
      }, syncInterval);
    };

    setupSync();

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [enableRealTimeSync, gameState, syncInterval, mockSyncWithServer, dispatch]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Return hook interface
  return {
    gameState,
    isLoading,
    error,
    syncStatus,
    conflicts,
    pendingUpdates,
    updateGameState,
    rollbackUpdate,
    resolveConflict: resolveConflictAction,
    persistState,
    restoreState,
    clearError,
    retry
  };
}
