/**
 * Real-time Notification System Component
 * Handles real-time notifications and updates
 */

'use client';

import { useState, useEffect } from 'react';
import type { RealTimeEvent } from '~/types/real-time-sync';
import { formatTimestamp } from '~/lib/real-time-sync-utils';

interface RealTimeNotificationProps {
  events: RealTimeEvent[];
  maxVisible?: number;
  autoHide?: boolean;
  hideDelay?: number;
  className?: string;
  onEventClick?: (event: RealTimeEvent) => void;
  onEventDismiss?: (eventId: string) => void;
}

export default function RealTimeNotification({
  events,
  maxVisible = 3,
  autoHide = true,
  hideDelay = 5000,
  className = '',
  onEventClick,
  onEventDismiss,
}: RealTimeNotificationProps) {
  const [visibleEvents, setVisibleEvents] = useState<RealTimeEvent[]>([]);
  const [hiddenEvents, setHiddenEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    const recentEvents = events
      .filter(event => !hiddenEvents.has(event.id))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, maxVisible);

    setVisibleEvents(recentEvents);

    // Auto-hide events if enabled
    if (autoHide) {
      recentEvents.forEach(event => {
        setTimeout(() => {
          setHiddenEvents(prev => new Set(prev).add(event.id));
        }, hideDelay);
      });
    }
  }, [events, maxVisible, autoHide, hideDelay, hiddenEvents]);

  const getEventIcon = (eventType: RealTimeEvent['type']) => {
    switch (eventType) {
      case 'player_joined':
        return (
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        );
      case 'player_left':
        return (
          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        );
      case 'player_reconnected':
        return (
          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        );
      case 'vote_cast':
        return (
          <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        );
      case 'mission_team_selected':
        return (
          <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        );
      case 'game_phase_changed':
        return (
          <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        );
      case 'game_ended':
        return (
          <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        );
      case 'sync_conflict':
        return (
          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        );
      case 'error_occurred':
        return (
          <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center animate-bounce">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        );
      default:
        return (
          <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        );
    }
  };

  const getEventMessage = (event: RealTimeEvent) => {
    switch (event.type) {
      case 'player_joined':
        return `${event.payload.playerName} joined the game`;
      case 'player_left':
        return `${event.payload.playerName} left the game`;
      case 'player_reconnected':
        return `${event.payload.playerName} reconnected`;
      case 'vote_cast':
        return `${event.payload.playerName} voted`;
      case 'mission_team_selected':
        return `Mission team selected`;
      case 'game_phase_changed':
        return `Game phase changed to ${event.payload.newPhase}`;
      case 'game_ended':
        return `Game ended - ${event.payload.winner} wins!`;
      case 'sync_conflict':
        return `Sync conflict detected`;
      case 'error_occurred':
        return `Error: ${event.payload.message}`;
      default:
        return `${event.type.replace('_', ' ')} event`;
    }
  };

  const getEventColor = (eventType: RealTimeEvent['type']) => {
    switch (eventType) {
      case 'player_joined':
        return 'border-green-500 bg-green-500/10';
      case 'player_left':
        return 'border-red-500 bg-red-500/10';
      case 'player_reconnected':
        return 'border-blue-500 bg-blue-500/10';
      case 'vote_cast':
        return 'border-purple-500 bg-purple-500/10';
      case 'mission_team_selected':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'game_phase_changed':
        return 'border-indigo-500 bg-indigo-500/10';
      case 'game_ended':
        return 'border-orange-500 bg-orange-500/10';
      case 'sync_conflict':
        return 'border-red-500 bg-red-500/10';
      case 'error_occurred':
        return 'border-red-600 bg-red-600/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const handleEventClick = (event: RealTimeEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const handleEventDismiss = (eventId: string) => {
    setHiddenEvents(prev => new Set(prev).add(eventId));
    if (onEventDismiss) {
      onEventDismiss(eventId);
    }
  };

  if (visibleEvents.length === 0) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-2 ${className}`}>
      {visibleEvents.map((event) => (
        <div
          key={event.id}
          className={`
            p-3 rounded-lg border-l-4 shadow-lg backdrop-blur-sm
            ${getEventColor(event.type)}
            transform transition-all duration-300 ease-in-out
            hover:scale-105 cursor-pointer
            animate-slide-in-right
          `}
          onClick={() => handleEventClick(event)}
        >
          <div className="flex items-start space-x-3">
            {/* Event Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {getEventIcon(event.type)}
            </div>

            {/* Event Content */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white">
                {getEventMessage(event)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {formatTimestamp(event.timestamp)}
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEventDismiss(event.id);
              }}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
