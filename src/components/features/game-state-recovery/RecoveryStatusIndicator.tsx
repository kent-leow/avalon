/**
 * Recovery Status Indicator
 * 
 * Visual indicator showing the current recovery status with progress bar,
 * error states, and recovery actions.
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import type { RecoveryStatus, RecoveryState, RecoveryError } from '~/types/game-state-recovery';

interface RecoveryStatusIndicatorProps {
  recoveryState: RecoveryState;
  onRetry?: () => void;
  onDismissError?: (errorId: string) => void;
  compact?: boolean;
}

export default function RecoveryStatusIndicator({
  recoveryState,
  onRetry,
  onDismissError,
  compact = false
}: RecoveryStatusIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getStatusConfig = (status: RecoveryStatus) => {
    switch (status) {
      case 'stable':
        return {
          icon: ShieldCheck,
          color: 'green',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-400',
          label: 'Stable'
        };
      case 'saving':
        return {
          icon: Shield,
          color: 'blue',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-400',
          label: 'Saving'
        };
      case 'recovering':
        return {
          icon: RefreshCw,
          color: 'yellow',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400',
          label: 'Recovering'
        };
      case 'reconnecting':
        return {
          icon: Wifi,
          color: 'blue',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-400',
          label: 'Reconnecting'
        };
      case 'failed':
        return {
          icon: ShieldX,
          color: 'red',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          label: 'Failed'
        };
      case 'timeout':
        return {
          icon: Clock,
          color: 'orange',
          bgColor: 'bg-orange-500/20',
          borderColor: 'border-orange-500/30',
          textColor: 'text-orange-400',
          label: 'Timeout'
        };
      case 'abandoned':
        return {
          icon: XCircle,
          color: 'gray',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/30',
          textColor: 'text-gray-400',
          label: 'Abandoned'
        };
      default:
        return {
          icon: Shield,
          color: 'gray',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/30',
          textColor: 'text-gray-400',
          label: 'Unknown'
        };
    }
  };

  const statusConfig = getStatusConfig(recoveryState.status);
  const Icon = statusConfig.icon;
  const isActive = ['saving', 'recovering', 'reconnecting'].includes(recoveryState.status);
  const hasErrors = recoveryState.errorHistory.length > 0;
  const recentErrors = recoveryState.errorHistory.slice(-3);

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className={`
          w-3 h-3 rounded-full border-2 ${statusConfig.borderColor}
          ${statusConfig.bgColor}
          ${isActive ? 'animate-pulse' : ''}
        `} />
        <span className={`text-sm font-medium ${statusConfig.textColor}`}>
          {statusConfig.label}
        </span>
      </div>
    );
  }

  return (
    <div className={`
      bg-gray-800 rounded-lg border transition-all duration-200
      ${statusConfig.borderColor} ${statusConfig.bgColor}
      ${isExpanded ? 'p-4' : 'p-3'}
    `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon className={`
            h-5 w-5 ${statusConfig.textColor}
            ${isActive ? 'animate-spin' : ''}
          `} />
          
          <div>
            <div className="flex items-center space-x-2">
              <span className={`font-medium ${statusConfig.textColor}`}>
                {statusConfig.label}
              </span>
              {recoveryState.progress < 100 && (
                <span className="text-xs text-gray-400">
                  {recoveryState.progress}%
                </span>
              )}
            </div>
            
            {recoveryState.phase !== 'complete' && (
              <div className="text-xs text-gray-500 mt-1">
                {recoveryState.phase.charAt(0).toUpperCase() + recoveryState.phase.slice(1)}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {hasErrors && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
              title="Show error details"
            >
              <AlertTriangle className="h-4 w-4" />
            </button>
          )}
          
          {recoveryState.status === 'failed' && onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
            >
              Retry
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-white transition-colors duration-200"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <RefreshCw className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {recoveryState.progress < 100 && (
        <div className="mt-3">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-${statusConfig.color}-500 transition-all duration-500`}
              style={{ width: `${recoveryState.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Last Save</div>
              <div className="text-white">
                {recoveryState.lastSuccessfulSave 
                  ? new Date(recoveryState.lastSuccessfulSave).toLocaleTimeString()
                  : 'Never'
                }
              </div>
            </div>
            
            <div>
              <div className="text-gray-400">Snapshots</div>
              <div className="text-white">
                {recoveryState.availableSnapshots.length}
              </div>
            </div>
            
            <div>
              <div className="text-gray-400">Active Players</div>
              <div className="text-white">
                {Object.values(recoveryState.playerStates).filter(p => p.connectionState === 'connected').length}
              </div>
            </div>
            
            <div>
              <div className="text-gray-400">Next Save</div>
              <div className="text-white">
                {recoveryState.nextScheduledSave 
                  ? new Date(recoveryState.nextScheduledSave).toLocaleTimeString()
                  : 'Scheduled'
                }
              </div>
            </div>
          </div>

          {/* Player Connection Status */}
          <div>
            <div className="text-sm font-medium text-gray-300 mb-2">Player Status</div>
            <div className="space-y-1">
              {Object.entries(recoveryState.playerStates).map(([playerId, playerState]) => (
                <div key={playerId} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{playerId}</span>
                  <div className="flex items-center space-x-2">
                    <div className={`
                      w-2 h-2 rounded-full
                      ${playerState.connectionState === 'connected' ? 'bg-green-500' :
                        playerState.connectionState === 'disconnected' ? 'bg-red-500' :
                        playerState.connectionState === 'reconnecting' ? 'bg-yellow-500' :
                        'bg-gray-500'}
                    `} />
                    <span className={`
                      ${playerState.connectionState === 'connected' ? 'text-green-400' :
                        playerState.connectionState === 'disconnected' ? 'text-red-400' :
                        playerState.connectionState === 'reconnecting' ? 'text-yellow-400' :
                        'text-gray-400'}
                    `}>
                      {playerState.connectionState}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error Details */}
      {showDetails && hasErrors && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-red-400">Recent Errors</div>
            <button
              onClick={() => setShowDetails(false)}
              className="text-red-400 hover:text-red-300"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            {recentErrors.map((error, index) => (
              <div key={error.id} className="flex items-start justify-between text-sm">
                <div className="flex-1">
                  <div className="text-red-300">{error.message}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(error.timestamp).toLocaleString()}
                  </div>
                </div>
                
                {onDismissError && (
                  <button
                    onClick={() => onDismissError(error.id)}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
