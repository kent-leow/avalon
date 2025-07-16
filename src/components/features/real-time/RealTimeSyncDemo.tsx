/**
 * Real-time Synchronization Demo Component
 * Interactive demonstration of real-time sync features
 */

'use client';

import { useState, useEffect } from 'react';
import type { 
  ConnectionState, 
  RealTimeEvent, 
  SyncConflict, 
  OptimisticUpdate, 
  PlayerActivity,
} from '~/types/real-time-sync';
import { 
  createConnectionState,
  createRealTimeEvent,
  createOptimisticUpdate,
  createSyncConflict,
  createPlayerActivity,
} from '~/lib/real-time-sync-utils';
import ConnectionStatus from '~/components/ui/real-time/ConnectionStatus';
import PlayerActivityIndicator from '~/components/ui/real-time/PlayerActivityIndicator';
import SyncStatus from '~/components/ui/real-time/SyncStatus';
import RealTimeNotification from '~/components/ui/real-time/RealTimeNotification';

interface RealTimeSyncDemoProps {
  className?: string;
}

export default function RealTimeSyncDemo({ className = '' }: RealTimeSyncDemoProps) {
  const [activeTab, setActiveTab] = useState<'connection' | 'events' | 'sync' | 'activities'>('connection');
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    createConnectionState('demo-player', 'DEMO123', 'socket-demo-123')
  );
  const [realtimeEvents, setRealtimeEvents] = useState<RealTimeEvent[]>([]);
  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdate[]>([]);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [playerActivities, setPlayerActivities] = useState<PlayerActivity[]>([]);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'conflict' | 'error'>('synced');

  // Mock data generation
  useEffect(() => {
    const generateMockData = () => {
      // Generate connection states
      const states: ConnectionState['status'][] = ['connected', 'disconnected', 'reconnecting', 'error'];
      const randomState = states[Math.floor(Math.random() * states.length)]!;
      
      setConnectionState(prev => ({
        ...prev,
        status: randomState,
        latency: Math.floor(Math.random() * 500) + 50,
        retryCount: randomState === 'reconnecting' ? Math.floor(Math.random() * 3) : 0,
        lastSeen: new Date(),
        queuedActions: Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => ({
          id: `action-${i}`,
          type: 'test_action',
          payload: { test: true },
          timestamp: new Date(),
          retryCount: 0,
          maxRetries: 3,
          status: 'pending' as const,
        })),
      }));

      // Generate events
      const eventTypes: RealTimeEvent['type'][] = [
        'player_joined',
        'player_left',
        'vote_cast',
        'mission_team_selected',
        'game_phase_changed',
      ];
      
      if (Math.random() < 0.3) {
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]!;
        const event = createRealTimeEvent(
          eventType,
          { 
            playerName: `Player ${Math.floor(Math.random() * 6) + 1}`,
            data: 'demo data',
          },
          'demo-player',
          'DEMO123'
        );
        setRealtimeEvents(prev => [event, ...prev.slice(0, 9)]);
      }

      // Generate optimistic updates
      if (Math.random() < 0.2) {
        const update = createOptimisticUpdate(
          'demo_update',
          { value: Math.floor(Math.random() * 100) },
          { value: 0 }
        );
        setOptimisticUpdates(prev => [update, ...prev.slice(0, 4)]);
      }

      // Generate conflicts
      if (Math.random() < 0.1) {
        const conflict = createSyncConflict(
          'state_mismatch',
          Math.floor(Math.random() * 10) + 1,
          Math.floor(Math.random() * 10) + 1,
          { demo: 'conflict data' }
        );
        setConflicts(prev => [conflict, ...prev.slice(0, 2)]);
      }

      // Generate player activities
      const activities: PlayerActivity['activity'][] = [
        'online',
        'offline',
        'typing',
        'voting',
        'selecting_team',
        'viewing_role',
        'idle',
      ];
      
      const players = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
      const newActivities = players.map(name => 
        createPlayerActivity(
          `player-${name}`,
          activities[Math.floor(Math.random() * activities.length)]!
        )
      );
      setPlayerActivities(newActivities);

      // Update sync status
      const syncStates: typeof syncStatus[] = ['synced', 'syncing', 'conflict', 'error'];
      setSyncStatus(syncStates[Math.floor(Math.random() * syncStates.length)]!);
    };

    generateMockData();
    const interval = setInterval(generateMockData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveConflict = (conflictId: string) => {
    setConflicts(prev => 
      prev.map(conflict => 
        conflict.id === conflictId 
          ? { ...conflict, resolved: true }
          : conflict
      )
    );
  };

  const handleEventClick = (event: RealTimeEvent) => {
    console.log('Event clicked:', event);
  };

  const handleEventDismiss = (eventId: string) => {
    setRealtimeEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const simulateConnectionChange = (status: ConnectionState['status']) => {
    setConnectionState(prev => ({
      ...prev,
      status,
      retryCount: status === 'reconnecting' ? prev.retryCount + 1 : 0,
    }));
  };

  const simulateEvent = (type: RealTimeEvent['type']) => {
    const event = createRealTimeEvent(
      type,
      { 
        playerName: `Demo Player`,
        message: `Simulated ${type.replace('_', ' ')} event`,
      },
      'demo-player',
      'DEMO123'
    );
    setRealtimeEvents(prev => [event, ...prev.slice(0, 9)]);
  };

  const tabs = [
    { id: 'connection', label: 'Connection', icon: '🔗' },
    { id: 'events', label: 'Events', icon: '📡' },
    { id: 'sync', label: 'Sync Status', icon: '🔄' },
    { id: 'activities', label: 'Player Activities', icon: '👥' },
  ];

  return (
    <div className={`bg-gray-900 text-white p-6 rounded-lg ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Real-time Synchronization Demo</h2>
        <p className="text-gray-400">
          Interactive demonstration of real-time sync features including connection status, 
          event notifications, sync conflicts, and player activities.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md transition-colors
              ${activeTab === tab.id 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Connection Status Tab */}
        {activeTab === 'connection' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connection Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Connection Indicator</h4>
                <ConnectionStatus 
                  connectionState={connectionState}
                  showDetails={true}
                />
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Simulate Connection States</h4>
                <div className="space-y-2">
                  {['connected', 'disconnected', 'reconnecting', 'error'].map(status => (
                    <button
                      key={status}
                      onClick={() => simulateConnectionChange(status as ConnectionState['status'])}
                      className={`
                        w-full px-3 py-2 text-sm rounded transition-colors
                        ${connectionState.status === status 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }
                      `}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Real-time Events</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Simulate Events</h4>
                <div className="space-y-2">
                  {[
                    'player_joined',
                    'player_left',
                    'vote_cast',
                    'mission_team_selected',
                    'game_phase_changed',
                  ].map(eventType => (
                    <button
                      key={eventType}
                      onClick={() => simulateEvent(eventType as RealTimeEvent['type'])}
                      className="w-full px-3 py-2 text-sm rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                    >
                      {eventType.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Recent Events</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {realtimeEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="p-2 bg-gray-700 rounded text-sm">
                      <div className="font-medium">{event.type.replace('_', ' ')}</div>
                      <div className="text-xs text-gray-400">
                        {event.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sync Status Tab */}
        {activeTab === 'sync' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Synchronization Status</h3>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <SyncStatus
                syncStatus={syncStatus}
                optimisticUpdates={optimisticUpdates}
                conflicts={conflicts}
                showDetails={true}
                onResolveConflict={handleResolveConflict}
              />
            </div>
          </div>
        )}

        {/* Player Activities Tab */}
        {activeTab === 'activities' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Player Activities</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playerActivities.map((activity) => (
                <div key={activity.playerId} className="bg-gray-800 p-4 rounded-lg">
                  <PlayerActivityIndicator
                    playerId={activity.playerId}
                    playerName={activity.playerId.replace('player-', '')}
                    activities={[activity]}
                    showDetails={true}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Real-time Notifications */}
      <RealTimeNotification
        events={realtimeEvents}
        onEventClick={handleEventClick}
        onEventDismiss={handleEventDismiss}
      />
    </div>
  );
}
