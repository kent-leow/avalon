/**
 * SSE-based Real-time Sync Hook
 * Replaces WebSocket-based real-time synchronization with tRPC subscriptions
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '~/trpc/react';
import type { 
  RealTimeEvent, 
  ConnectionState, 
  OptimisticUpdate, 
  SyncConflict, 
  ConflictResolution,
  PerformanceMetrics,
  PlayerActivity,
  RoomSyncState,
  QueuedAction,
  UseRealTimeSync,
} from '~/types/real-time-sync';
import { 
  REAL_TIME_CONSTANTS,
  createConnectionState,
  getConnectionIndicator,
  calculateLatency,
  createRealTimeEvent,
  createOptimisticUpdate,
  createSyncConflict,
  resolveConflict,
  createPerformanceMetrics,
  createPlayerActivity,
  createRoomSyncState,
} from '~/lib/real-time-sync-utils';

// Hook Options Interface
interface RealTimeSyncHookOptions {
  enabled?: boolean;
  reconnectOnError?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

// Update Payload Interface
interface RealTimeUpdatePayload {
  event: RealTimeEvent;
  optimisticUpdate?: OptimisticUpdate;
  shouldUpdateUI?: boolean;
  metadata?: any;
}

interface UseSSERealTimeSyncOptions {
  roomCode: string;
  playerId: string;
  playerName: string;
  autoConnect?: boolean;
  onEvent?: (event: RealTimeEvent) => void;
  onConnectionChange?: (state: ConnectionState) => void;
  onError?: (error: Error) => void;
}

export function useSSERealTimeSync(options: UseSSERealTimeSyncOptions): UseRealTimeSync {
  const {
    roomCode,
    playerId,
    playerName,
    autoConnect = true,
    onEvent,
    onConnectionChange,
    onError,
  } = options;

  // State management
  const [connectionState, setConnectionState] = useState<ConnectionState>(() =>
    createConnectionState(playerId, roomCode)
  );
  const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([]);
  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdate[]>([]);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    latency: 0,
    eventProcessingTime: 0,
    queueSize: 0,
    errorRate: 0,
    reconnectionCount: 0,
    syncConflicts: 0,
    timestamp: new Date(),
  });

  // Refs for tracking
  const eventCountRef = useRef({ total: 0, errors: 0 });
  const latencyTimerRef = useRef<Record<string, Date>>({});
  const subscriptionRef = useRef<any>(null);

  // Update connection state helper
  const updateConnectionState = useCallback((updates: Partial<ConnectionState>) => {
    setConnectionState(prev => {
      const newState = { ...prev, ...updates };
      onConnectionChange?.(newState);
      return newState;
    });
  }, [onConnectionChange]);

  // Calculate latency
  const calculateLatency = useCallback((sentTime: Date, receivedTime: Date): number => {
    return receivedTime.getTime() - sentTime.getTime();
  }, []);

  // Handle real-time events
  const handleRealtimeEvent = useCallback((event: RealTimeEvent) => {
    eventCountRef.current.total++;

    // Calculate latency if this is a response to our action
    const sentTime = latencyTimerRef.current[event.id];
    if (sentTime) {
      const latency = calculateLatency(sentTime, new Date());
      updateConnectionState({ latency });
      delete latencyTimerRef.current[event.id];
    }

    // Update connection status
    updateConnectionState({
      status: 'connected',
      lastSeen: new Date(),
    });

    // Process event
    if (onEvent) {
      try {
        onEvent(event);
      } catch (error) {
        console.error('[SSE] Error processing event:', error);
        eventCountRef.current.errors++;
        
        if (onError) {
          onError(error instanceof Error ? error : new Error('Event processing failed'));
        }
      }
    }

    // Update metrics
    setMetrics(prev => ({
      ...prev,
      queueSize: queuedActions.length,
      errorRate: eventCountRef.current.errors / eventCountRef.current.total,
      timestamp: new Date(),
    }));
  }, [onEvent, onError, updateConnectionState, calculateLatency, queuedActions.length]);

  // Connection control (placeholder for SSE implementation)
  const connect = useCallback(() => {
    console.log('[SSE] Connect requested - handled by subscription');
    updateConnectionState({
      status: 'connected',
      retryCount: 0,
    });
  }, [updateConnectionState]);

  const disconnect = useCallback(() => {
    console.log('[SSE] Disconnect requested - handled by subscription');
    updateConnectionState({
      status: 'disconnected',
    });
  }, [updateConnectionState]);

  // Send event (would be implemented with tRPC mutations)
  const sendEvent = useCallback((event: Omit<RealTimeEvent, 'id' | 'timestamp'>) => {
    const eventId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullEvent: RealTimeEvent = {
      ...event,
      id: eventId,
      timestamp: new Date(),
    };

    // Track latency
    latencyTimerRef.current[eventId] = new Date();

    // For SSE implementation, this would trigger a tRPC mutation
    console.log('[SSE] Sending event:', fullEvent);

    // Remove latency timer after timeout
    setTimeout(() => {
      delete latencyTimerRef.current[eventId];
    }, REAL_TIME_CONSTANTS.SYNC_TIMEOUT_MS);
  }, []);

  // Queue management
  const retryFailedActions = useCallback(() => {
    const failedActions = queuedActions.filter(action => action.status === 'failed');
    
    failedActions.forEach(action => {
      if (action.retryCount < action.maxRetries) {
        setQueuedActions(prev => 
          prev.map(a => 
            a.id === action.id 
              ? { ...a, status: 'pending', retryCount: a.retryCount + 1 }
              : a
          )
        );
      }
    });
  }, [queuedActions]);

  // Optimistic updates
  const optimisticUpdate = useCallback(<T>(
    type: string, 
    update: T, 
    rollbackFn?: () => void
  ) => {
    const updateId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const optimisticUpdate: OptimisticUpdate = {
      id: updateId,
      type,
      localState: update,
      originalState: null, // Would store original state
      timestamp: new Date(),
      status: 'pending',
      rollbackFn,
    };

    setOptimisticUpdates(prev => [...prev, optimisticUpdate]);

    // Auto-timeout optimistic updates
    setTimeout(() => {
      setOptimisticUpdates(prev => 
        prev.filter(u => u.id !== updateId)
      );
    }, REAL_TIME_CONSTANTS.OPTIMISTIC_UPDATE_TIMEOUT_MS);
  }, []);

  const confirmUpdate = useCallback((updateId: string) => {
    setOptimisticUpdates(prev =>
      prev.map(update =>
        update.id === updateId
          ? { ...update, status: 'confirmed' as const }
          : update
      )
    );
  }, []);

  const rejectUpdate = useCallback((updateId: string) => {
    setOptimisticUpdates(prev => {
      const update = prev.find(u => u.id === updateId);
      if (update?.rollbackFn) {
        update.rollbackFn();
      }
      
      return prev.map(u =>
        u.id === updateId
          ? { ...u, status: 'rejected' as const }
          : u
      );
    });
  }, []);

  // Conflict resolution
  const resolveConflict = useCallback((conflictId: string, resolution: ConflictResolution) => {
    setConflicts(prev =>
      prev.map(conflict =>
        conflict.id === conflictId
          ? { ...conflict, resolved: true, resolution }
          : conflict
      )
    );
  }, []);

  // Auto-connect effect
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Computed values
  const isConnected = connectionState.status === 'connected';
  const latency = connectionState.latency;

  return {
    connectionState,
    isConnected,
    latency,
    queuedActions,
    optimisticUpdates,
    conflicts,
    metrics,
    
    // Actions
    connect,
    disconnect,
    sendEvent,
    retryFailedActions,
    resolveConflict,
    
    // Optimistic updates
    optimisticUpdate,
    confirmUpdate,
    rejectUpdate,
  };
}
