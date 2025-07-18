/**
 * Recovery UI Component
 * 
 * Provides user interface for recovery operations including
 * progress indication, manual recovery options, and recovery status.
 */

'use client';

import { useEffect, useState } from 'react';
import type { RecoveryUIProps } from '~/types/game-error-recovery';

/**
 * RecoveryUI Component
 * 
 * Displays recovery progress and provides manual recovery options
 * when automatic recovery is in progress or has failed.
 */
export function RecoveryUI({
  recoveryState,
  onRecoveryAction,
  onManualRecovery,
  onCancelRecovery,
  showProgress = true,
  showAdvancedOptions = false,
}: RecoveryUIProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);

  // Track recovery time
  useEffect(() => {
    if (recoveryState.isRecovering && recoveryState.lastRecoveryAttempt) {
      const startTime = recoveryState.lastRecoveryAttempt;
      
      const interval = setInterval(() => {
        setTimeElapsed(Date.now() - startTime);
      }, 100);

      return () => clearInterval(interval);
    } else {
      setTimeElapsed(0);
    }
  }, [recoveryState.isRecovering, recoveryState.lastRecoveryAttempt]);

  // Calculate estimated time remaining
  useEffect(() => {
    if (recoveryState.recoveryStrategy && recoveryState.recoveryProgress > 0) {
      const totalEstimatedTime = recoveryState.recoveryStrategy.estimatedTime;
      const progressRatio = recoveryState.recoveryProgress / 100;
      const timeSpent = timeElapsed;
      const estimatedTotalTime = timeSpent / progressRatio;
      const remaining = Math.max(0, estimatedTotalTime - timeSpent);
      setEstimatedTimeRemaining(remaining);
    } else {
      setEstimatedTimeRemaining(null);
    }
  }, [recoveryState.recoveryProgress, timeElapsed, recoveryState.recoveryStrategy]);

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getRecoveryStatusColor = () => {
    if (recoveryState.recoveryProgress < 25) return 'bg-[#ef4444]';
    if (recoveryState.recoveryProgress < 50) return 'bg-[#f59e0b]';
    if (recoveryState.recoveryProgress < 75) return 'bg-[#3b82f6]';
    return 'bg-[#22c55e]';
  };

  const getRecoveryStatusText = () => {
    if (recoveryState.recoveryProgress < 25) return 'Starting recovery...';
    if (recoveryState.recoveryProgress < 50) return 'Analyzing issue...';
    if (recoveryState.recoveryProgress < 75) return 'Applying fixes...';
    if (recoveryState.recoveryProgress < 100) return 'Finalizing recovery...';
    return 'Recovery complete!';
  };

  // Don't render if not recovering
  if (!recoveryState.isRecovering) {
    return null;
  }

  return (
    <div className="recovery-ui fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-[#1a1a2e] border border-[#3d3d7a] rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Recovery header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#3b82f6] rounded-full flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                System Recovery
              </h2>
              <p className="text-sm text-gray-400">
                {recoveryState.recoveryStrategy?.name || 'Automatic Recovery'}
              </p>
            </div>
          </div>
          
          {/* Cancel button */}
          <button
            onClick={onCancelRecovery}
            className="text-gray-400 hover:text-white transition-colors"
            title="Cancel recovery"
          >
            <span className="sr-only">Cancel</span>
            ✕
          </button>
        </div>

        {/* Recovery description */}
        {recoveryState.recoveryStrategy?.description && (
          <p className="text-sm text-gray-300 mb-4">
            {recoveryState.recoveryStrategy.description}
          </p>
        )}

        {/* Progress section */}
        {showProgress && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white">
                {getRecoveryStatusText()}
              </span>
              <span className="text-sm text-gray-400">
                {Math.round(recoveryState.recoveryProgress)}%
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-[#252547] rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getRecoveryStatusColor()}`}
                style={{ width: `${recoveryState.recoveryProgress}%` }}
              ></div>
            </div>
            
            {/* Time information */}
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Time elapsed: {formatTime(timeElapsed)}</span>
              {estimatedTimeRemaining && (
                <span>Est. remaining: {formatTime(estimatedTimeRemaining)}</span>
              )}
            </div>
          </div>
        )}

        {/* Active errors */}
        {recoveryState.activeErrors.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-white mb-2">
              Resolving Issues:
            </h3>
            <div className="space-y-2">
              {recoveryState.activeErrors.slice(0, 3).map((error) => (
                <div key={error.id} className="bg-[#252547] rounded p-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      error.severity === 'critical' ? 'bg-[#ef4444]' : 
                      error.severity === 'high' ? 'bg-[#f59e0b]' : 
                      'bg-[#3b82f6]'
                    }`}></div>
                    <span className="text-xs text-gray-300">
                      {error.message}
                    </span>
                  </div>
                </div>
              ))}
              {recoveryState.activeErrors.length > 3 && (
                <div className="text-xs text-gray-400 text-center">
                  +{recoveryState.activeErrors.length - 3} more issues
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recovery actions */}
        <div className="flex space-x-3">
          {/* Manual recovery button */}
          <button
            onClick={onManualRecovery}
            className="flex-1 bg-[#3d3d7a] hover:bg-[#4a4a8a] text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Manual Recovery
          </button>
          
          {/* Advanced options */}
          {showAdvancedOptions && (
            <button
              onClick={() => onRecoveryAction?.({
                type: 'fallback',
                label: 'Use Fallback',
                description: 'Switch to fallback mode',
                automated: false,
                requiresUserConfirmation: true,
                estimatedTime: 1000,
                execute: async () => ({
                  success: true,
                  message: 'Fallback mode activated',
                  errorResolved: false,
                  partialRecovery: true,
                  fallbackActivated: true,
                  recoveryTime: 500,
                }),
              })}
              className="bg-[#f59e0b] hover:bg-[#d97706] text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Fallback
            </button>
          )}
        </div>

        {/* Recovery stats */}
        {showAdvancedOptions && (
          <div className="mt-4 pt-4 border-t border-[#3d3d7a]">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400">Attempt:</span>
                <span className="ml-2 text-white font-medium">
                  {recoveryState.recoveryAttempts}/{recoveryState.maxRecoveryAttempts}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Strategy:</span>
                <span className="ml-2 text-white font-medium">
                  {recoveryState.recoveryStrategy?.priority || 'Auto'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Fallback:</span>
                <span className={`ml-2 font-medium ${
                  recoveryState.fallbackActive ? 'text-[#f59e0b]' : 'text-[#22c55e]'
                }`}>
                  {recoveryState.fallbackActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Errors:</span>
                <span className="ml-2 text-white font-medium">
                  {recoveryState.activeErrors.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
