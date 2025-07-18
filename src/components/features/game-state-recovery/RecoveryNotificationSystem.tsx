/**
 * Recovery Notification System
 * 
 * Notification system for recovery-related alerts, warnings, and status updates.
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  Users,
  Shield
} from 'lucide-react';
import type { RecoveryNotification, RecoveryNotificationAction } from '~/types/game-state-recovery';

interface RecoveryNotificationSystemProps {
  notifications: RecoveryNotification[];
  onDismiss: (notificationId: string) => void;
  onAction: (notificationId: string, actionId: string) => void;
  maxVisible?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export default function RecoveryNotificationSystem({
  notifications,
  onDismiss,
  onAction,
  maxVisible = 5,
  position = 'top-right'
}: RecoveryNotificationSystemProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<RecoveryNotification[]>([]);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    const filtered = notifications
      .filter(n => !dismissedNotifications.has(n.id))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, maxVisible);
    
    setVisibleNotifications(filtered);
  }, [notifications, dismissedNotifications, maxVisible]);

  const handleDismiss = (notificationId: string) => {
    setDismissedNotifications(prev => new Set(prev).add(notificationId));
    onDismiss(notificationId);
  };

  const handleAction = (notificationId: string, actionId: string) => {
    onAction(notificationId, actionId);
  };

  const getNotificationConfig = (type: RecoveryNotification['type']) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-400',
          iconColor: 'text-green-400'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400',
          iconColor: 'text-yellow-400'
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          iconColor: 'text-red-400'
        };
      case 'info':
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-400',
          iconColor: 'text-blue-400'
        };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
      default:
        return 'top-4 right-4';
    }
  };

  const getActionButtonConfig = (type: RecoveryNotificationAction['type']) => {
    switch (type) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'secondary':
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50 space-y-3 max-w-sm w-full`}>
      {visibleNotifications.map((notification) => {
        const config = getNotificationConfig(notification.type);
        const Icon = config.icon;
        
        return (
          <div
            key={notification.id}
            className={`
              p-4 rounded-lg border backdrop-blur-sm
              ${config.bgColor} ${config.borderColor}
              transform transition-all duration-300 ease-in-out
              hover:scale-105 shadow-lg
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <Icon className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${config.textColor} truncate`}>
                      {notification.title}
                    </h4>
                    <div className="flex items-center space-x-2 ml-2">
                      <span className="text-xs text-gray-400">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </span>
                      {notification.dismissible && (
                        <button
                          onClick={() => handleDismiss(notification.id)}
                          className="text-gray-400 hover:text-white transition-colors duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mt-1">
                    {notification.message}
                  </p>
                  
                  {notification.playerId && (
                    <div className="flex items-center space-x-1 mt-2">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        Player: {notification.playerId}
                      </span>
                    </div>
                  )}
                  
                  {notification.actions && notification.actions.length > 0 && (
                    <div className="flex items-center space-x-2 mt-3">
                      {notification.actions.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleAction(notification.id, action.id)}
                          className={`
                            px-3 py-1 text-xs rounded transition-colors duration-200
                            ${getActionButtonConfig(action.type)}
                          `}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Individual notification components for common recovery scenarios
interface ConnectionNotificationProps {
  playerId: string;
  isReconnecting: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ConnectionNotification({
  playerId,
  isReconnecting,
  onRetry,
  onDismiss
}: ConnectionNotificationProps) {
  const notification: RecoveryNotification = {
    id: `connection-${playerId}`,
    type: isReconnecting ? 'warning' : 'error',
    title: isReconnecting ? 'Reconnecting...' : 'Connection Lost',
    message: isReconnecting 
      ? `Attempting to reconnect player ${playerId}...`
      : `Player ${playerId} has lost connection`,
    timestamp: new Date().toISOString(),
    playerId,
    dismissible: !isReconnecting,
    actions: isReconnecting ? [] : onRetry ? [
      {
        id: 'retry',
        label: 'Retry',
        type: 'primary',
        action: onRetry
      }
    ] : []
  };

  return (
    <RecoveryNotificationSystem
      notifications={[notification]}
      onDismiss={onDismiss || (() => {
        // Default dismiss handler for connection notification
      })}
      onAction={(_, actionId) => {
        if (actionId === 'retry' && onRetry) {
          onRetry();
        }
      }}
      maxVisible={1}
    />
  );
}

interface SaveNotificationProps {
  isSuccess: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function SaveNotification({
  isSuccess,
  onRetry,
  onDismiss
}: SaveNotificationProps) {
  const notification: RecoveryNotification = {
    id: `save-${Date.now()}`,
    type: isSuccess ? 'success' : 'error',
    title: isSuccess ? 'Game Saved' : 'Save Failed',
    message: isSuccess 
      ? 'Game state has been successfully saved'
      : 'Failed to save game state',
    timestamp: new Date().toISOString(),
    dismissible: true,
    duration: isSuccess ? 3000 : undefined,
    actions: isSuccess ? [] : onRetry ? [
      {
        id: 'retry',
        label: 'Retry',
        type: 'primary',
        action: onRetry
      }
    ] : []
  };

  return (
    <RecoveryNotificationSystem
      notifications={[notification]}
      onDismiss={onDismiss || (() => {
        // Default dismiss handler for save notification
      })}
      onAction={(_, actionId) => {
        if (actionId === 'retry' && onRetry) {
          onRetry();
        }
      }}
      maxVisible={1}
    />
  );
}

interface RecoveryNotificationProps {
  isActive: boolean;
  progress: number;
  onCancel?: () => void;
  onDismiss?: () => void;
}

export function RecoveryProgressNotification({
  isActive,
  progress,
  onCancel,
  onDismiss
}: RecoveryNotificationProps) {
  if (!isActive) return null;

  const notification: RecoveryNotification = {
    id: `recovery-${Date.now()}`,
    type: 'info',
    title: 'Recovering Game State',
    message: `Recovery in progress... ${progress}%`,
    timestamp: new Date().toISOString(),
    dismissible: false,
    actions: onCancel ? [
      {
        id: 'cancel',
        label: 'Cancel',
        type: 'danger',
        action: onCancel
      }
    ] : []
  };

  return (
    <RecoveryNotificationSystem
      notifications={[notification]}
      onDismiss={onDismiss || (() => {
        // Default dismiss handler for recovery progress notification
      })}
      onAction={(_, actionId) => {
        if (actionId === 'cancel' && onCancel) {
          onCancel();
        }
      }}
      maxVisible={1}
    />
  );
}
