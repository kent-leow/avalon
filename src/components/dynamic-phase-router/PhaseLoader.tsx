/**
 * Phase Loader Component
 * 
 * Displays loading states during phase transitions and dynamic component loading
 * with progress tracking and timeout handling.
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import type { PhaseLoaderProps } from '~/types/dynamic-phase-router';
import { formatPhaseDisplayName, getLoadingMessage } from '~/lib/phase-router-utils';

/**
 * Phase Loader Component
 * 
 * Provides visual feedback during phase transitions and component loading
 * with progress indicators and timeout handling.
 */
export function PhaseLoader({
  phase,
  loadingType,
  message,
  progress,
  isVisible,
  timeout = 10000,
  onTimeout,
  onCancel,
}: PhaseLoaderProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Start loading timer
   */
  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setElapsedTime(0);
    setIsTimedOut(false);

    // Update elapsed time every 100ms
    intervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 100);
    }, 100);

    // Handle timeout
    if (timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsTimedOut(true);
        onTimeout?.();
      }, timeout);
    }
  };

  /**
   * Stop loading timer
   */
  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  /**
   * Effect to manage timer based on visibility
   */
  useEffect(() => {
    if (isVisible) {
      startTimer();
    } else {
      stopTimer();
    }

    return () => {
      stopTimer();
    };
  }, [isVisible, timeout]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  /**
   * Get loading message
   */
  const getDisplayMessage = () => {
    if (message) {
      return message;
    }
    return getLoadingMessage(phase, loadingType);
  };

  /**
   * Get progress percentage
   */
  const getProgressPercentage = () => {
    if (progress !== undefined) {
      return Math.min(100, Math.max(0, progress));
    }
    
    if (timeout > 0) {
      return Math.min(100, (elapsedTime / timeout) * 100);
    }
    
    return 0;
  };

  /**
   * Get loading icon based on type
   */
  const getLoadingIcon = () => {
    switch (loadingType) {
      case 'transition':
        return '🔄';
      case 'component':
        return '📦';
      case 'validation':
        return '✅';
      default:
        return '⏳';
    }
  };

  /**
   * Handle cancel action
   */
  const handleCancel = () => {
    stopTimer();
    onCancel?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(10, 10, 15, 0.9)',
        backdropFilter: 'blur(4px)',
      }}
      data-testid="phase-loader"
      data-loading-type={loadingType}
      data-phase={phase}
    >
      <div
        className="max-w-md w-full mx-4 p-8 rounded-2xl text-center"
        style={{
          backgroundColor: '#1a1a2e',
          border: '1px solid #252547',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        data-testid="phase-loader-content"
      >
        {/* Loading Icon */}
        <div className="mb-6">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: '#252547' }}
          >
            <span className="text-2xl">{getLoadingIcon()}</span>
          </div>
          
          {/* Animated Spinner */}
          <div
            className="inline-block w-8 h-8 border-2 border-solid rounded-full animate-spin"
            style={{
              borderColor: '#f59e0b',
              borderTopColor: 'transparent',
            }}
            data-testid="loading-spinner"
          />
        </div>

        {/* Loading Message */}
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: '#f8f9fa' }}
          data-testid="loading-message"
        >
          {getDisplayMessage()}
        </h2>

        {/* Phase Information */}
        <p
          className="text-sm mb-6"
          style={{ color: '#9ca3af' }}
          data-testid="phase-info"
        >
          {formatPhaseDisplayName(phase)}
        </p>

        {/* Progress Bar */}
        {(progress !== undefined || timeout > 0) && (
          <div className="mb-6">
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: '#252547' }}
              data-testid="progress-bar-track"
            >
              <div
                className="h-full transition-all duration-300 ease-out"
                style={{
                  backgroundColor: isTimedOut ? '#ef4444' : '#f59e0b',
                  width: `${getProgressPercentage()}%`,
                }}
                data-testid="progress-bar-fill"
              />
            </div>
            
            <div className="flex justify-between items-center mt-2 text-xs" style={{ color: '#9ca3af' }}>
              <span data-testid="progress-percentage">
                {Math.round(getProgressPercentage())}%
              </span>
              {timeout > 0 && (
                <span data-testid="elapsed-time">
                  {Math.round(elapsedTime / 1000)}s / {Math.round(timeout / 1000)}s
                </span>
              )}
            </div>
          </div>
        )}

        {/* Timeout Message */}
        {isTimedOut && (
          <div
            className="mb-4 p-3 rounded-lg"
            style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
            data-testid="timeout-message"
          >
            <p className="text-sm font-medium">
              Loading timeout exceeded. Please try again.
            </p>
          </div>
        )}

        {/* Loading Status */}
        <div className="text-xs space-y-1" style={{ color: '#9ca3af' }}>
          <div data-testid="loading-status">
            Status: {isTimedOut ? 'Timeout' : 'Loading...'}
          </div>
          <div data-testid="loading-type">
            Type: {loadingType}
          </div>
          {elapsedTime > 0 && (
            <div data-testid="loading-duration">
              Duration: {Math.round(elapsedTime / 1000)}s
            </div>
          )}
        </div>

        {/* Cancel Button */}
        {onCancel && (
          <button
            onClick={handleCancel}
            className="mt-6 px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: '#3d3d7a', color: '#ffffff' }}
            data-testid="cancel-button"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default PhaseLoader;
