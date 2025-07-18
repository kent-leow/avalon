/**
 * Error Message Center Component
 * 
 * Centralized display for error messages and recovery notifications
 * with user-friendly messaging and recovery options.
 */

'use client';

import { useEffect, useState } from 'react';
import type { ErrorMessageCenterProps } from '~/types/game-error-recovery';

/**
 * ErrorMessageCenter Component
 * 
 * Displays error messages and recovery notifications with
 * appropriate visual styling and user actions.
 */
export function ErrorMessageCenter({
  errors,
  notifications,
  onErrorDismiss,
  onRetryAction,
  onNotificationDismiss,
  showRecoveryOptions = true,
  showTechnicalDetails = false,
}: ErrorMessageCenterProps) {
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());

  // Auto-remove notifications with duration
  useEffect(() => {
    const timers = notifications
      .filter(notification => notification.autoHide && notification.duration)
      .map(notification => {
        return setTimeout(() => {
          onNotificationDismiss?.(notification.id);
        }, notification.duration);
      });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, onNotificationDismiss]);

  const toggleErrorExpansion = (errorId: string) => {
    setExpandedErrors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(errorId)) {
        newSet.delete(errorId);
      } else {
        newSet.add(errorId);
      }
      return newSet;
    });
  };

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'connection':
        return '🔗';
      case 'network':
        return '🌐';
      case 'timeout':
        return '⏱️';
      case 'validation':
        return '⚠️';
      case 'auth':
        return '🔐';
      case 'server':
        return '🖥️';
      case 'state':
        return '🔄';
      default:
        return '❗';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '💬';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-[#ef4444] bg-[#ef4444]/10';
      case 'high':
        return 'border-[#f59e0b] bg-[#f59e0b]/10';
      case 'medium':
        return 'border-[#3b82f6] bg-[#3b82f6]/10';
      case 'low':
        return 'border-[#22c55e] bg-[#22c55e]/10';
      default:
        return 'border-[#6b7280] bg-[#6b7280]/10';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-[#22c55e] bg-[#22c55e]/10';
      case 'warning':
        return 'border-[#f59e0b] bg-[#f59e0b]/10';
      case 'error':
        return 'border-[#ef4444] bg-[#ef4444]/10';
      case 'info':
        return 'border-[#3b82f6] bg-[#3b82f6]/10';
      default:
        return 'border-[#6b7280] bg-[#6b7280]/10';
    }
  };

  // Don't render if no errors or notifications
  if (errors.length === 0 && notifications.length === 0) {
    return null;
  }

  return (
    <div className="error-message-center fixed top-4 left-4 z-50 max-w-md space-y-3">
      {/* Error Messages */}
      {errors.map((error) => (
        <div
          key={error.id}
          className={`bg-[#1a1a2e] border-2 rounded-lg p-4 shadow-lg ${getSeverityColor(error.severity)}`}
        >
          <div className="flex items-start space-x-3">
            {/* Error icon */}
            <div className="flex-shrink-0 text-xl">
              {getErrorIcon(error.type)}
            </div>

            {/* Error content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  {getErrorTitle(error.type)}
                </h3>
                <div className="flex items-center space-x-2">
                  {/* Severity badge */}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityBadgeColor(error.severity)}`}>
                    {error.severity.toUpperCase()}
                  </span>
                  
                  {/* Dismiss button */}
                  {error.severity !== 'critical' && (
                    <button
                      onClick={() => onErrorDismiss?.(error.id)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <span className="sr-only">Dismiss</span>
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-300 mt-1">
                {error.message}
              </p>

              {/* Technical details toggle */}
              {showTechnicalDetails && error.technicalDetails && (
                <div className="mt-2">
                  <button
                    onClick={() => toggleErrorExpansion(error.id)}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {expandedErrors.has(error.id) ? 'Hide' : 'Show'} Details
                  </button>
                  
                  {expandedErrors.has(error.id) && (
                    <div className="mt-2 p-2 bg-[#252547] rounded border text-xs text-gray-400 font-mono">
                      {error.technicalDetails}
                    </div>
                  )}
                </div>
              )}

              {/* Recovery options */}
              {showRecoveryOptions && error.recoverable && (
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => onRetryAction?.({
                      type: 'retry',
                      label: 'Retry',
                      description: 'Retry the failed action',
                      automated: false,
                      requiresUserConfirmation: false,
                      estimatedTime: 2000,
                      execute: async () => ({
                        success: true,
                        message: 'Action retried successfully',
                        errorResolved: true,
                        partialRecovery: false,
                        fallbackActivated: false,
                        recoveryTime: 1500,
                      }),
                    })}
                    className="bg-[#3d3d7a] hover:bg-[#4a4a8a] text-white text-xs font-medium py-1 px-3 rounded transition-colors"
                  >
                    Retry
                  </button>
                  
                  {error.type === 'connection' && (
                    <button
                      onClick={() => onRetryAction?.({
                        type: 'reconnect',
                        label: 'Reconnect',
                        description: 'Reconnect to the server',
                        automated: false,
                        requiresUserConfirmation: false,
                        estimatedTime: 3000,
                        execute: async () => ({
                          success: true,
                          message: 'Reconnected successfully',
                          errorResolved: true,
                          partialRecovery: false,
                          fallbackActivated: false,
                          recoveryTime: 2500,
                        }),
                      })}
                      className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-medium py-1 px-3 rounded transition-colors"
                    >
                      Reconnect
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Notification Messages */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-[#1a1a2e] border-2 rounded-lg p-4 shadow-lg ${getNotificationColor(notification.type)}`}
        >
          <div className="flex items-start space-x-3">
            {/* Notification icon */}
            <div className="flex-shrink-0 text-xl">
              {getNotificationIcon(notification.type)}
            </div>

            {/* Notification content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  {notification.title}
                </h3>
                
                {/* Dismiss button */}
                {notification.dismissible && (
                  <button
                    onClick={() => onNotificationDismiss?.(notification.id)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <span className="sr-only">Dismiss</span>
                    ✕
                  </button>
                )}
              </div>

              <p className="text-sm text-gray-300 mt-1">
                {notification.message}
              </p>

              {/* Notification actions */}
              {notification.actions && notification.actions.length > 0 && (
                <div className="mt-3 flex space-x-2">
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => onRetryAction?.(action)}
                      className="bg-[#3d3d7a] hover:bg-[#4a4a8a] text-white text-xs font-medium py-1 px-3 rounded transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper functions
function getErrorTitle(type: string): string {
  switch (type) {
    case 'connection':
      return 'Connection Issue';
    case 'network':
      return 'Network Problem';
    case 'timeout':
      return 'Request Timeout';
    case 'validation':
      return 'Invalid Input';
    case 'auth':
      return 'Authentication Required';
    case 'server':
      return 'Server Error';
    case 'state':
      return 'State Recovery';
    default:
      return 'Unexpected Error';
  }
}

function getSeverityBadgeColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-[#ef4444] text-white';
    case 'high':
      return 'bg-[#f59e0b] text-white';
    case 'medium':
      return 'bg-[#3b82f6] text-white';
    case 'low':
      return 'bg-[#22c55e] text-white';
    default:
      return 'bg-[#6b7280] text-white';
  }
}
