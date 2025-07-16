/**
 * Real-time Connection Status Component
 * Displays connection quality and status with visual indicators
 */

'use client';

import { useState, useEffect } from 'react';
import type { ConnectionState, ConnectionIndicator } from '~/types/real-time-sync';
import { getConnectionIndicator, formatLatency } from '~/lib/real-time-sync-utils';

interface ConnectionStatusProps {
  connectionState: ConnectionState;
  className?: string;
  showDetails?: boolean;
}

export default function ConnectionStatus({
  connectionState,
  className = '',
  showDetails = false,
}: ConnectionStatusProps) {
  const [indicator, setIndicator] = useState<ConnectionIndicator | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const newIndicator = getConnectionIndicator(connectionState);
    setIndicator(newIndicator);
  }, [connectionState]);

  if (!indicator) return null;

  const getStatusIcon = () => {
    switch (indicator.signal) {
      case 'excellent':
        return (
          <div className="flex space-x-1">
            <div className="w-1 h-4 bg-green-500 rounded-full"></div>
            <div className="w-1 h-4 bg-green-500 rounded-full"></div>
            <div className="w-1 h-4 bg-green-500 rounded-full"></div>
          </div>
        );
      case 'good':
        return (
          <div className="flex space-x-1">
            <div className="w-1 h-4 bg-green-400 rounded-full"></div>
            <div className="w-1 h-4 bg-green-400 rounded-full"></div>
            <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
          </div>
        );
      case 'poor':
        return (
          <div className="flex space-x-1">
            <div className="w-1 h-4 bg-yellow-500 rounded-full"></div>
            <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
          </div>
        );
      case 'offline':
        return (
          <div className="flex space-x-1">
            <div className="w-1 h-4 bg-red-500 rounded-full"></div>
            <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (connectionState.status) {
      case 'connected':
        return 'Online';
      case 'disconnected':
        return 'Offline';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex items-center space-x-2 cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Status Icon */}
        <div className={`${indicator.animation} transition-all duration-200`}>
          {getStatusIcon()}
        </div>

        {/* Status Text */}
        <span className={`text-sm font-medium ${indicator.color}`}>
          {getStatusText()}
        </span>

        {/* Latency Badge */}
        {connectionState.status === 'connected' && (
          <span className="px-2 py-1 bg-gray-700 text-xs rounded-full text-gray-300">
            {formatLatency(indicator.latency)}
          </span>
        )}

        {/* Retry Count */}
        {connectionState.retryCount > 0 && (
          <span className="px-2 py-1 bg-yellow-600 text-xs rounded-full text-white">
            Retry {connectionState.retryCount}
          </span>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-gray-700">
            <div className="font-medium">{indicator.tooltip}</div>
            {showDetails && (
              <div className="mt-1 space-y-1 text-gray-300">
                <div>Socket: {connectionState.socketId?.slice(-8) || 'N/A'}</div>
                <div>Last Seen: {connectionState.lastSeen.toLocaleTimeString()}</div>
                <div>Queued: {connectionState.queuedActions.length}</div>
              </div>
            )}
          </div>
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 absolute top-full left-1/2 transform -translate-x-1/2"></div>
        </div>
      )}

      {/* Details Panel */}
      {showDetails && (
        <div className="mt-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className={indicator.color}>{getStatusText()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Latency:</span>
              <span className="text-gray-300">{formatLatency(indicator.latency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Socket ID:</span>
              <span className="text-gray-300 font-mono text-xs">
                {connectionState.socketId?.slice(-8) || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Seen:</span>
              <span className="text-gray-300">{connectionState.lastSeen.toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Retry Count:</span>
              <span className="text-gray-300">{connectionState.retryCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Queued Actions:</span>
              <span className="text-gray-300">{connectionState.queuedActions.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
