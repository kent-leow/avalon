/**
 * Connection Recovery Manager Component
 * 
 * Handles connection issues and automatic reconnection with
 * visual feedback and recovery options.
 */

'use client';

import { useEffect, useState } from 'react';
import type { ConnectionRecoveryManagerProps } from '~/types/game-error-recovery';

/**
 * ConnectionRecoveryManager Component
 * 
 * Manages connection recovery operations and provides visual feedback
 * for connection status and recovery attempts.
 */
export function ConnectionRecoveryManager({
  connectionState,
  onConnectionRecovered,
  onConnectionFailed,
  retryConfig,
  enableAutoReconnect = true,
}: ConnectionRecoveryManagerProps) {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastReconnectAttempt, setLastReconnectAttempt] = useState<number | null>(null);

  // Monitor connection state changes
  useEffect(() => {
    if (!connectionState.isConnected && enableAutoReconnect && !isReconnecting) {
      handleAutoReconnect();
    }
  }, [connectionState.isConnected, enableAutoReconnect, isReconnecting]);

  const handleAutoReconnect = async () => {
    if (reconnectAttempts >= (retryConfig?.maxRetries || 5)) {
      console.log('Max reconnection attempts reached');
      return;
    }

    setIsReconnecting(true);
    setReconnectAttempts(prev => prev + 1);
    setLastReconnectAttempt(Date.now());

    try {
      // Simulate reconnection delay
      const delay = Math.min(
        1000 * Math.pow(2, reconnectAttempts),
        10000
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Attempt reconnection
      const success = await onConnectionRecovered?.();
      
      if (success) {
        setReconnectAttempts(0);
        setIsReconnecting(false);
        console.log('Connection recovered successfully');
      } else {
        setIsReconnecting(false);
        // Will retry automatically due to useEffect
      }
    } catch (error) {
      const delay = Math.min(
        1000 * Math.pow(2, reconnectAttempts),
        10000
      );
      
      setIsReconnecting(false);
      onConnectionFailed?.({
        id: `connection-error-${Date.now()}`,
        type: 'connection',
        severity: 'high',
        message: 'Failed to reconnect to server',
        technicalDetails: (error as Error).message,
        recoverable: true,
        timestamp: Date.now(),
        context: {
          connectionType: connectionState.connectionType,
          additionalData: {
            reconnectAttempts,
          },
        },
        affectedFeatures: ['realtime-sync', 'game-state'],
        retryable: true,
        connectionType: connectionState.connectionType,
        isTemporary: true,
        canRetry: reconnectAttempts < (retryConfig?.maxRetries || 5),
        estimatedRecoveryTime: delay,
      });
    }
  };

  // Don't render anything if connection is stable
  if (connectionState.isConnected && connectionState.connectionType === 'online') {
    return null;
  }

  return (
    <div className="connection-recovery-manager fixed top-4 right-4 z-50">
      <div className="bg-[#1a1a2e] border border-[#3d3d7a] rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-center space-x-3">
          {/* Connection status indicator */}
          <div className="flex-shrink-0">
            {connectionState.isConnected ? (
              <div className="w-3 h-3 bg-[#f59e0b] rounded-full animate-pulse"></div>
            ) : (
              <div className="w-3 h-3 bg-[#ef4444] rounded-full"></div>
            )}
          </div>

          {/* Connection status text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">
              {connectionState.isConnected ? 'Connection Unstable' : 'Connection Lost'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isReconnecting ? (
                <>Reconnecting... (Attempt {reconnectAttempts})</>
              ) : (
                <>
                  {connectionState.connectionType === 'offline' ? 'Offline' : 'Disconnected'}
                  {lastReconnectAttempt && (
                    <span className="ml-2">
                      Last attempt: {new Date(lastReconnectAttempt).toLocaleTimeString()}
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Connection details */}
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Latency:</span>
            <span className={`font-medium ${connectionState.latency > 500 ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
              {connectionState.latency}ms
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Attempts:</span>
            <span className="text-white font-medium">
              {reconnectAttempts}/{retryConfig?.maxRetries || 5}
            </span>
          </div>
        </div>

        {/* Progress bar for reconnection */}
        {isReconnecting && (
          <div className="mt-3">
            <div className="w-full bg-[#252547] rounded-full h-1">
              <div 
                className="bg-[#3b82f6] h-1 rounded-full transition-all duration-300 animate-pulse"
                style={{ width: `${(reconnectAttempts / (retryConfig?.maxRetries || 5)) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Manual reconnect button */}
        {!isReconnecting && !connectionState.isConnected && (
          <button
            onClick={handleAutoReconnect}
            className="mt-3 w-full bg-[#3d3d7a] hover:bg-[#4a4a8a] text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Reconnect Now
          </button>
        )}
      </div>
    </div>
  );
}
