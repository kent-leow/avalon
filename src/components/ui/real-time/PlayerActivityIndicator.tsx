/**
 * Real-time Player Activity Component
 * Shows player activity indicators and status
 */

'use client';

import { useState, useEffect } from 'react';
import type { PlayerActivity } from '~/types/real-time-sync';
import { 
  isPlayerActive, 
  getPlayerActivityAnimation, 
  formatTimestamp 
} from '~/lib/real-time-sync-utils';

interface PlayerActivityIndicatorProps {
  playerId: string;
  playerName: string;
  activities: PlayerActivity[];
  className?: string;
  showDetails?: boolean;
}

export default function PlayerActivityIndicator({
  playerId,
  playerName,
  activities,
  className = '',
  showDetails = false,
}: PlayerActivityIndicatorProps) {
  const [currentActivity, setCurrentActivity] = useState<PlayerActivity | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Find the most recent activity for this player
    const playerActivities = activities.filter(a => a.playerId === playerId);
    const latestActivity = playerActivities.sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    )[0];
    
    setCurrentActivity(latestActivity || null);
  }, [activities, playerId]);

  if (!currentActivity) return null;

  const isActive = isPlayerActive(currentActivity);
  const animation = getPlayerActivityAnimation(currentActivity.activity);

  const getActivityIcon = () => {
    switch (currentActivity.activity) {
      case 'online':
        return (
          <div className="w-3 h-3 bg-green-500 rounded-full">
            <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
          </div>
        );
      case 'offline':
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
      case 'typing':
        return (
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        );
      case 'voting':
        return (
          <div className="w-3 h-3 bg-purple-500 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse mx-auto mt-0.5"></div>
          </div>
        );
      case 'selecting_team':
        return (
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-spin">
            <div className="w-1 h-1 bg-white rounded-full ml-1 mt-1"></div>
          </div>
        );
      case 'viewing_role':
        return (
          <div className="w-3 h-3 bg-indigo-500 rounded-full">
            <div className="w-1 h-1 bg-white rounded-full mx-auto mt-1"></div>
          </div>
        );
      case 'idle':
        return <div className="w-3 h-3 bg-gray-400 rounded-full opacity-50"></div>;
      case 'reconnecting':
        return (
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse">
            <div className="w-2 h-2 bg-yellow-300 rounded-full animate-spin mx-auto mt-0.5"></div>
          </div>
        );
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
    }
  };

  const getActivityLabel = () => {
    switch (currentActivity.activity) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'typing':
        return 'Typing...';
      case 'voting':
        return 'Voting';
      case 'selecting_team':
        return 'Selecting Team';
      case 'viewing_role':
        return 'Viewing Role';
      case 'idle':
        return 'Idle';
      case 'reconnecting':
        return 'Reconnecting...';
      default:
        return 'Unknown';
    }
  };

  const getActivityColor = () => {
    switch (currentActivity.activity) {
      case 'online':
        return 'text-green-500';
      case 'offline':
        return 'text-gray-500';
      case 'typing':
        return 'text-blue-500';
      case 'voting':
        return 'text-purple-500';
      case 'selecting_team':
        return 'text-yellow-500';
      case 'viewing_role':
        return 'text-indigo-500';
      case 'idle':
        return 'text-gray-400';
      case 'reconnecting':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex items-center space-x-2 cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Activity Icon */}
        <div className={`${animation} transition-all duration-200`}>
          {getActivityIcon()}
        </div>

        {/* Player Name */}
        <span className="text-sm font-medium text-gray-300">
          {playerName}
        </span>

        {/* Activity Label */}
        <span className={`text-xs ${getActivityColor()}`}>
          {getActivityLabel()}
        </span>

        {/* Activity Status */}
        {!isActive && (
          <span className="text-xs text-gray-500">
            (Inactive)
          </span>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-gray-700">
            <div className="font-medium">{playerName}</div>
            <div className="mt-1 space-y-1 text-gray-300">
              <div>Activity: {getActivityLabel()}</div>
              <div>Time: {formatTimestamp(currentActivity.timestamp)}</div>
              <div>Status: {isActive ? 'Active' : 'Inactive'}</div>
              {currentActivity.metadata && (
                <div>Data: {JSON.stringify(currentActivity.metadata)}</div>
              )}
            </div>
          </div>
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 absolute top-full left-1/2 transform -translate-x-1/2"></div>
        </div>
      )}

      {/* Details Panel */}
      {showDetails && (
        <div className="mt-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Player:</span>
              <span className="text-gray-300">{playerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Activity:</span>
              <span className={getActivityColor()}>{getActivityLabel()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Time:</span>
              <span className="text-gray-300">{formatTimestamp(currentActivity.timestamp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className={isActive ? 'text-green-500' : 'text-gray-500'}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {currentActivity.metadata && (
              <div className="mt-2">
                <span className="text-gray-400">Metadata:</span>
                <pre className="text-xs text-gray-300 mt-1 bg-gray-900 p-2 rounded">
                  {JSON.stringify(currentActivity.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
