/**
 * useConnectionRecovery Hook
 * 
 * Custom hook for managing connection recovery operations,
 * providing connection monitoring, automatic reconnection, and fallback mechanisms.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ConnectionState,
  ConnectionError,
  RetryConfig,
  ErrorContext,
} from '~/types/game-error-recovery';
import { DEFAULT_RETRY_CONFIG } from '~/types/game-error-recovery';
import {
  createMockConnectionState,
  createConnectionError,
  calculateRetryDelay,
  isConnectionStable,
} from '~/lib/error-recovery-utils';

export interface UseConnectionRecoveryOptions {
  roomCode?: string;
  playerId?: string;
  retryConfig?: Partial<RetryConfig>;
  enableAutoReconnect?: boolean;
  heartbeatInterval?: number;
  onConnectionLost?: (error: ConnectionError) => void;
  onConnectionRecovered?: () => void;
  onReconnectAttempt?: (attempt: number) => void;
  onReconnectFailed?: (error: ConnectionError) => void;
}

export interface UseConnectionRecoveryReturn {
  connectionState: ConnectionState;
  retryConfig: RetryConfig;
  isConnected: boolean;
  isReconnecting: boolean;
  reconnectAttempts: number;
  lastHeartbeat: number;
  startHeartbeat: () => void;
  stopHeartbeat: () => void;
  reconnect: () => Promise<boolean>;
  checkConnection: () => Promise<boolean>;
  updateConnectionState: (updates: Partial<ConnectionState>) => void;
  getConnectionError: () => ConnectionError | null;
  canReconnect: boolean;
}

export function useConnectionRecovery(
  options: UseConnectionRecoveryOptions = {}
): UseConnectionRecoveryReturn {
  const {
    roomCode,
    playerId,
    retryConfig: userRetryConfig,
    enableAutoReconnect = true,
    heartbeatInterval = 5000,
    onConnectionLost,
    onConnectionRecovered,
    onReconnectAttempt,
    onReconnectFailed,
  } = options;

  const [connectionState, setConnectionState] = useState<ConnectionState>(() => createMockConnectionState());
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [retryConfig] = useState<RetryConfig>(() => ({
    ...DEFAULT_RETRY_CONFIG,
    ...userRetryConfig,
  }));

  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastConnectionCheckRef = useRef<number>(Date.now());

  // Monitor connection state changes
  useEffect(() => {
    const wasConnected = connectionState.isConnected;
    const isCurrentlyConnected = connectionState.isConnected;
    
    if (wasConnected && !isCurrentlyConnected) {
      // Connection lost
      const error = createConnectionError(connectionState, {
        roomCode,
        playerId,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown',
        connectionType: typeof window !== 'undefined' && 'connection' in navigator 
          ? (navigator as any).connection?.effectiveType || 'unknown'
          : 'unknown',
      });
      
      onConnectionLost?.(error);
      
      if (enableAutoReconnect) {
        scheduleReconnect();
      }
    } else if (!wasConnected && isCurrentlyConnected) {
      // Connection recovered
      onConnectionRecovered?.();
      
      // Reset reconnect attempts
      setConnectionState(prev => ({
        ...prev,
        reconnectAttempts: 0,
      }));
    }
  }, [connectionState.isConnected, roomCode, playerId, enableAutoReconnect, onConnectionLost, onConnectionRecovered]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const updateConnectionState = useCallback((updates: Partial<ConnectionState>) => {
    setConnectionState(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    const now = Date.now();
    lastConnectionCheckRef.current = now;

    try {
      // Simulate connection check
      const isOnline = typeof window !== 'undefined' ? navigator.onLine : true;
      
      if (!isOnline) {
        updateConnectionState({
          isConnected: false,
          connectionType: 'offline',
          lastHeartbeat: now,
        });
        return false;
      }

      // Check network connectivity (mock implementation)
      const startTime = performance.now();
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
      
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      // Determine connection quality
      let connectionType: ConnectionState['connectionType'] = 'online';
      if (latency > 1000) {
        connectionType = 'slow';
      } else if (latency > 500) {
        connectionType = 'unstable';
      }

      updateConnectionState({
        isConnected: true,
        connectionType,
        latency,
        lastHeartbeat: now,
      });
      
      return true;
    } catch (error) {
      updateConnectionState({
        isConnected: false,
        connectionType: 'offline',
        lastHeartbeat: now,
      });
      return false;
    }
  }, [updateConnectionState]);

  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      checkConnection();
    }, heartbeatInterval);

    // Initial check
    checkConnection();
  }, [checkConnection, heartbeatInterval]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const reconnect = useCallback(async (): Promise<boolean> => {
    if (isReconnecting || connectionState.reconnectAttempts >= connectionState.maxReconnectAttempts) {
      return false;
    }

    setIsReconnecting(true);
    const attemptNumber = connectionState.reconnectAttempts + 1;
    
    updateConnectionState({
      reconnectAttempts: attemptNumber,
    });

    onReconnectAttempt?.(attemptNumber);

    try {
      // Calculate delay for this attempt
      const delay = calculateRetryDelay(attemptNumber, retryConfig);
      
      // Wait before attempting reconnection
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Attempt to reconnect
      const success = await checkConnection();
      
      if (success) {
        updateConnectionState({
          isConnected: true,
          reconnectAttempts: 0,
        });
        
        setIsReconnecting(false);
        return true;
      } else {
        const error = createConnectionError(connectionState, {
          roomCode,
          playerId,
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown',
          connectionType: typeof window !== 'undefined' && 'connection' in navigator 
            ? (navigator as any).connection?.effectiveType || 'unknown'
            : 'unknown',
        });
        
        onReconnectFailed?.(error);
        
        if (enableAutoReconnect && attemptNumber < connectionState.maxReconnectAttempts) {
          scheduleReconnect();
        }
        
        setIsReconnecting(false);
        return false;
      }
    } catch (error) {
      const connectionError = createConnectionError(connectionState, {
        roomCode,
        playerId,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown',
        connectionType: typeof window !== 'undefined' && 'connection' in navigator 
          ? (navigator as any).connection?.effectiveType || 'unknown'
          : 'unknown',
      });
      
      onReconnectFailed?.(connectionError);
      setIsReconnecting(false);
      return false;
    }
  }, [
    isReconnecting,
    connectionState,
    retryConfig,
    checkConnection,
    updateConnectionState,
    onReconnectAttempt,
    onReconnectFailed,
    enableAutoReconnect,
    roomCode,
    playerId,
  ]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = calculateRetryDelay(connectionState.reconnectAttempts + 1, retryConfig);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnect();
    }, delay);
  }, [connectionState.reconnectAttempts, retryConfig, reconnect]);

  const getConnectionError = useCallback((): ConnectionError | null => {
    if (connectionState.isConnected && isConnectionStable(connectionState)) {
      return null;
    }

    return createConnectionError(connectionState, {
      roomCode,
      playerId,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown',
      connectionType: typeof window !== 'undefined' && 'connection' in navigator 
        ? (navigator as any).connection?.effectiveType || 'unknown'
        : 'unknown',
    });
  }, [connectionState, roomCode, playerId]);

  // Auto-start heartbeat when component mounts
  useEffect(() => {
    if (enableAutoReconnect) {
      startHeartbeat();
    }
    
    return () => {
      stopHeartbeat();
    };
  }, [enableAutoReconnect, startHeartbeat, stopHeartbeat]);

  // Listen to online/offline events
  useEffect(() => {
    const handleOnline = () => {
      updateConnectionState({
        isConnected: true,
        connectionType: 'online',
        lastHeartbeat: Date.now(),
      });
    };

    const handleOffline = () => {
      updateConnectionState({
        isConnected: false,
        connectionType: 'offline',
        lastHeartbeat: Date.now(),
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [updateConnectionState]);

  return {
    connectionState,
    retryConfig,
    isConnected: connectionState.isConnected,
    isReconnecting,
    reconnectAttempts: connectionState.reconnectAttempts,
    lastHeartbeat: connectionState.lastHeartbeat,
    startHeartbeat,
    stopHeartbeat,
    reconnect,
    checkConnection,
    updateConnectionState,
    getConnectionError,
    canReconnect: connectionState.reconnectAttempts < connectionState.maxReconnectAttempts,
  };
}
