/**
 * Real-time Synchronization Hook
 * Custom React hook for managing Socket.IO real-time synchronization
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { 
  ConnectionState, 
  RealTimeEvent, 
  QueuedAction, 
  OptimisticUpdate, 
  SyncConflict, 
  ConflictResolution,
  PerformanceMetrics,
  PlayerActivity,
  UseRealTimeSync,
} from '~/types/real-time-sync';
import { 
  createConnectionState,
  createRealTimeEvent,
  createQueuedAction,
  createOptimisticUpdate,
  createSyncConflict,
  createPerformanceMetrics,
  processActionQueue,
  shouldRetryAction,
  getRetryDelay,
  isOptimisticUpdateExpired,
  rollbackOptimisticUpdate,
  resolveConflict,
  calculateLatency,
  calculateErrorRate,
  REAL_TIME_CONSTANTS,
} from '~/lib/real-time-sync-utils';

interface UseRealTimeSyncOptions {
  roomCode: string;
  playerId: string;
  playerName: string;
  socketUrl?: string;
  autoConnect?: boolean;
  enableOptimisticUpdates?: boolean;
  enablePerformanceMonitoring?: boolean;
  onEvent?: (event: RealTimeEvent) => void;
  onConnectionChange?: (state: ConnectionState) => void;
  onConflict?: (conflict: SyncConflict) => void;
  onError?: (error: Error) => void;
}

export function useRealTimeSync(options: UseRealTimeSyncOptions): UseRealTimeSync {
  const {
    roomCode,
    playerId,
    playerName,
    socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
    autoConnect = true,
    enableOptimisticUpdates = true,
    enablePerformanceMonitoring = true,
    onEvent,
    onConnectionChange,
    onConflict,
    onError,
  } = options;

  // State
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    createConnectionState(playerId, roomCode)
  );
  const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([]);
  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdate[]>([]);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>(
    createPerformanceMetrics(0, 0, 0, 0, 0, 0)
  );

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const performanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const eventCountRef = useRef({ total: 0, errors: 0 });
  const latencyTimerRef = useRef<{ [key: string]: Date }>({});

  // Update connection state
  const updateConnectionState = useCallback((updates: Partial<ConnectionState>) => {
    setConnectionState(prev => {
      const newState = { ...prev, ...updates };
      if (onConnectionChange) {
        onConnectionChange(newState);
      }
      return newState;
    });
  }, [onConnectionChange]);

  // Socket event handlers
  const handleConnect = useCallback(() => {
    updateConnectionState({
      status: 'connected',
      retryCount: 0,
      socketId: socketRef.current?.id,
      lastSeen: new Date(),
    });

    // Join room
    socketRef.current?.emit('join_room', {
      roomCode,
      playerId,
      playerName,
      timestamp: new Date(),
    });

    // Process queued actions
    if (queuedActions.length > 0) {
      processActionQueue(queuedActions, async (action) => {
        socketRef.current?.emit('action', action);
      });
    }
  }, [roomCode, playerId, playerName, queuedActions, updateConnectionState]);

  const handleDisconnect = useCallback(() => {
    updateConnectionState({
      status: 'disconnected',
      socketId: undefined,
      lastSeen: new Date(),
    });

    // Attempt reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        updateConnectionState({
          status: 'reconnecting',
          retryCount: connectionState.retryCount + 1,
        });
        socketRef.current.connect();
      }
    }, getRetryDelay(connectionState.retryCount));
  }, [connectionState.retryCount, updateConnectionState]);

  const handleError = useCallback((error: any) => {
    updateConnectionState({
      status: 'error',
      lastSeen: new Date(),
    });

    eventCountRef.current.errors++;
    
    if (onError) {
      onError(new Error(error.message || 'Socket error'));
    }
  }, [updateConnectionState, onError]);

  const handleRealtimeEvent = useCallback((event: RealTimeEvent) => {
    eventCountRef.current.total++;

    // Calculate latency if this is a response to our action
    const sentTime = latencyTimerRef.current[event.id];
    if (sentTime) {
      const latency = calculateLatency(sentTime, new Date());
      updateConnectionState({ latency });
      delete latencyTimerRef.current[event.id];
    }

    // Handle optimistic update confirmation/rejection
    if (enableOptimisticUpdates) {
      const relatedUpdate = optimisticUpdates.find(
        update => update.id === event.payload.optimisticUpdateId
      );
      
      if (relatedUpdate) {
        if (event.payload.success) {
          setOptimisticUpdates(prev => 
            prev.map(update => 
              update.id === relatedUpdate.id 
                ? { ...update, status: 'confirmed' }
                : update
            )
          );
        } else {
          setOptimisticUpdates(prev => 
            prev.map(update => 
              update.id === relatedUpdate.id 
                ? { ...update, status: 'rejected' }
                : update
            )
          );
          rollbackOptimisticUpdate(relatedUpdate);
        }
      }
    }

    // Handle conflicts
    if (event.payload.conflict) {
      const conflict = createSyncConflict(
        'version_conflict',
        event.payload.localVersion,
        event.payload.serverVersion,
        event.payload.conflictData
      );
      setConflicts(prev => [...prev, conflict]);
      
      if (onConflict) {
        onConflict(conflict);
      }
    }

    // Update last seen
    updateConnectionState({ lastSeen: new Date() });

    // Call event handler
    if (onEvent) {
      onEvent(event);
    }
  }, [
    enableOptimisticUpdates,
    optimisticUpdates,
    updateConnectionState,
    onEvent,
    onConflict,
  ]);

  const handlePong = useCallback(() => {
    updateConnectionState({ lastSeen: new Date() });
  }, [updateConnectionState]);

  // Initialize socket connection
  const connect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: false, // We handle reconnection manually
      timeout: REAL_TIME_CONSTANTS.SYNC_TIMEOUT_MS,
    });

    // Register event handlers
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('error', handleError);
    socket.on('realtime_event', handleRealtimeEvent);
    socket.on('pong', handlePong);

    socketRef.current = socket;
    updateConnectionState({ socketId: socket.id });
  }, [
    socketUrl,
    handleConnect,
    handleDisconnect,
    handleError,
    handleRealtimeEvent,
    handlePong,
    updateConnectionState,
  ]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    updateConnectionState({
      status: 'disconnected',
      socketId: undefined,
    });
  }, [updateConnectionState]);

  // Send real-time event
  const sendEvent = useCallback((eventData: Omit<RealTimeEvent, 'id' | 'timestamp'>) => {
    const event = createRealTimeEvent(
      eventData.type,
      eventData.payload,
      playerId,
      roomCode,
      eventData.version
    );

    if (socketRef.current?.connected) {
      // Send immediately
      socketRef.current.emit('realtime_event', event);
      
      // Track latency
      latencyTimerRef.current[event.id] = new Date();
    } else {
      // Queue for later
      const action = createQueuedAction('realtime_event', event);
      setQueuedActions(prev => [...prev, action]);
    }
  }, [playerId, roomCode]);

  // Optimistic update
  const optimisticUpdate = useCallback(<T,>(
    type: string,
    update: T,
    rollbackFn?: () => void
  ) => {
    if (!enableOptimisticUpdates) return;

    const optimisticUpdateObj = createOptimisticUpdate(
      type,
      update,
      null, // We don't have original state here
      rollbackFn
    );

    setOptimisticUpdates(prev => [...prev, optimisticUpdateObj]);

    // Set timeout for automatic rollback
    setTimeout(() => {
      if (isOptimisticUpdateExpired(optimisticUpdateObj)) {
        rollbackOptimisticUpdate(optimisticUpdateObj);
        setOptimisticUpdates(prev => 
          prev.map(u => 
            u.id === optimisticUpdateObj.id 
              ? { ...u, status: 'rejected' }
              : u
          )
        );
      }
    }, REAL_TIME_CONSTANTS.OPTIMISTIC_UPDATE_TIMEOUT_MS);
  }, [enableOptimisticUpdates]);

  // Confirm optimistic update
  const confirmUpdate = useCallback((updateId: string) => {
    setOptimisticUpdates(prev => 
      prev.map(update => 
        update.id === updateId 
          ? { ...update, status: 'confirmed' }
          : update
      )
    );
  }, []);

  // Reject optimistic update
  const rejectUpdate = useCallback((updateId: string) => {
    const update = optimisticUpdates.find(u => u.id === updateId);
    if (update) {
      rollbackOptimisticUpdate(update);
      setOptimisticUpdates(prev => 
        prev.map(u => 
          u.id === updateId 
            ? { ...u, status: 'rejected' }
            : u
        )
      );
    }
  }, [optimisticUpdates]);

  // Retry failed actions
  const retryFailedActions = useCallback(() => {
    const failedActions = queuedActions.filter(shouldRetryAction);
    if (failedActions.length === 0) return;

    processActionQueue(failedActions, async (action) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('action', action);
      }
    });
  }, [queuedActions]);

  // Resolve conflict
  const resolveConflictFn = useCallback((
    conflictId: string,
    resolution: ConflictResolution
  ) => {
    setConflicts(prev => 
      prev.map(conflict => 
        conflict.id === conflictId 
          ? resolveConflict(conflict, resolution)
          : conflict
      )
    );
  }, []);

  // Performance monitoring
  useEffect(() => {
    if (!enablePerformanceMonitoring) return;

    const updateMetrics = () => {
      const errorRate = calculateErrorRate(
        eventCountRef.current.total,
        eventCountRef.current.errors
      );

      const newMetrics = createPerformanceMetrics(
        connectionState.latency,
        0, // eventProcessingTime - would need to track this
        queuedActions.length,
        errorRate,
        connectionState.retryCount,
        conflicts.filter(c => !c.resolved).length
      );

      setMetrics(newMetrics);
    };

    performanceTimerRef.current = setInterval(
      updateMetrics,
      REAL_TIME_CONSTANTS.PERFORMANCE_SAMPLE_INTERVAL_MS
    );

    return () => {
      if (performanceTimerRef.current) {
        clearInterval(performanceTimerRef.current);
      }
    };
  }, [
    enablePerformanceMonitoring,
    connectionState.latency,
    connectionState.retryCount,
    queuedActions.length,
    conflicts,
  ]);

  // Auto-connect
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Cleanup expired optimistic updates
  useEffect(() => {
    const cleanupExpired = () => {
      setOptimisticUpdates(prev => 
        prev.filter(update => {
          if (isOptimisticUpdateExpired(update) && update.status === 'pending') {
            rollbackOptimisticUpdate(update);
            return false;
          }
          return true;
        })
      );
    };

    const interval = setInterval(cleanupExpired, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    connectionState,
    isConnected: connectionState.status === 'connected',
    latency: connectionState.latency,
    queuedActions,
    optimisticUpdates,
    conflicts,
    metrics,
    connect,
    disconnect,
    sendEvent,
    retryFailedActions,
    resolveConflict: resolveConflictFn,
    optimisticUpdate,
    confirmUpdate,
    rejectUpdate,
  };
}
