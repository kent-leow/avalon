/**
 * Host Management Panel
 * Floating interface for comprehensive host game management
 */

'use client';

import { useState, useEffect } from 'react';
import { Crown, Settings, Users, Activity, BarChart3, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { 
  HostManagement, 
  HostPanelTab, 
  HostPanelState, 
  HostNotification 
} from '~/types/host-management';

interface HostManagementPanelProps {
  hostManagement: HostManagement;
  onClose: () => void;
  className?: string;
}

export default function HostManagementPanel({ 
  hostManagement, 
  onClose, 
  className = '' 
}: HostManagementPanelProps) {
  const [panelState, setPanelState] = useState<HostPanelState>({
    isVisible: true,
    currentTab: 'quick_actions',
    position: 'right',
    size: 'normal',
    notifications: []
  });

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  // Update session duration every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const duration = Math.floor((now.getTime() - hostManagement.sessionStartTime.getTime()) / (1000 * 60));
      setSessionDuration(duration);
    }, 60000);

    return () => clearInterval(interval);
  }, [hostManagement.sessionStartTime]);

  const tabs: Array<{ id: HostPanelTab; label: string; icon: React.ReactNode }> = [
    { id: 'quick_actions', label: 'Quick Actions', icon: <Settings size={16} /> },
    { id: 'player_management', label: 'Players', icon: <Users size={16} /> },
    { id: 'room_settings', label: 'Room', icon: <Settings size={16} /> },
    { id: 'activity_log', label: 'Activity', icon: <Activity size={16} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> }
  ];

  const handleTabChange = (tab: HostPanelTab) => {
    setPanelState(prev => ({ ...prev, currentTab: tab }));
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getAuthorityBadge = () => {
    const badges = {
      owner: { text: 'Owner', color: 'bg-amber-500', glow: 'shadow-amber-500/50' },
      moderator: { text: 'Moderator', color: 'bg-blue-500', glow: 'shadow-blue-500/50' },
      temporary: { text: 'Temp Host', color: 'bg-purple-500', glow: 'shadow-purple-500/50' }
    };
    
    return badges[hostManagement.authorityLevel] || badges.owner;
  };

  const authorityBadge = getAuthorityBadge();

  if (isCollapsed) {
    return (
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        <div className="bg-[#0a0a0f]/95 backdrop-blur-sm border border-[#252547]/50 rounded-lg p-3 shadow-2xl">
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors"
          >
            <Crown size={16} className="animate-pulse" />
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="bg-[#0a0a0f]/95 backdrop-blur-sm border border-[#252547]/50 rounded-lg shadow-2xl w-80 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#252547]/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Crown size={16} className="text-amber-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-white font-medium text-sm">{hostManagement.hostName}</h3>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${authorityBadge.color} ${authorityBadge.glow} shadow-lg`}>
                  <Crown size={10} />
                  {authorityBadge.text}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCollapsed(true)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Session: {formatDuration(sessionDuration)}</span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Online
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#252547]/50 bg-[#1a1a2e]/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                panelState.currentTab === tab.id
                  ? 'text-amber-500 border-b-2 border-amber-500 bg-amber-500/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {panelState.currentTab === 'quick_actions' && (
            <QuickActionsTab hostManagement={hostManagement} />
          )}
          {panelState.currentTab === 'player_management' && (
            <PlayerManagementTab hostManagement={hostManagement} />
          )}
          {panelState.currentTab === 'room_settings' && (
            <RoomSettingsTab hostManagement={hostManagement} />
          )}
          {panelState.currentTab === 'activity_log' && (
            <ActivityLogTab hostManagement={hostManagement} />
          )}
          {panelState.currentTab === 'analytics' && (
            <AnalyticsTab hostManagement={hostManagement} />
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#252547]/50 bg-[#1a1a2e]/30">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Auto-cleanup in: 45m</span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              {hostManagement.privileges.filter(p => p.enabled).length} privileges
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Actions Tab Component
function QuickActionsTab({ hostManagement }: { hostManagement: HostManagement }) {
  const quickActions = [
    { id: 'share_room', label: 'Share Room', icon: '🔗', color: 'bg-blue-500', action: () => {
      // TODO: Implement share room
    } },
    { id: 'pause_game', label: 'Pause Game', icon: '⏸️', color: 'bg-yellow-500', action: () => {
      // TODO: Implement pause game
    } },
    { id: 'reset_room', label: 'Reset Room', icon: '🔄', color: 'bg-orange-500', action: () => {
      // TODO: Implement reset room
    } },
    { id: 'end_game', label: 'End Game', icon: '🛑', color: 'bg-red-500', action: () => {
      // TODO: Implement end game
    } }
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-white mb-3">Quick Actions</h4>
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={`p-3 rounded-lg ${action.color} hover:opacity-90 transition-opacity`}
          >
            <div className="text-center">
              <div className="text-lg mb-1">{action.icon}</div>
              <div className="text-xs text-white font-medium">{action.label}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Player Management Tab Component
function PlayerManagementTab({ hostManagement }: { hostManagement: HostManagement }) {
  const mockPlayers = [
    { id: '1', name: 'Alice', status: 'connected', riskLevel: 'low' },
    { id: '2', name: 'Bob', status: 'connected', riskLevel: 'medium' },
    { id: '3', name: 'Charlie', status: 'idle', riskLevel: 'low' }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-white mb-3">Player Management</h4>
      <div className="space-y-2">
        {mockPlayers.map((player) => (
          <div key={player.id} className="flex items-center justify-between p-3 bg-[#1a1a2e]/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(player.status)}`}></div>
              <span className="text-sm text-white">{player.name}</span>
              <span className={`text-xs ${getRiskColor(player.riskLevel)}`}>
                {player.riskLevel}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button className="text-xs text-yellow-500 hover:text-yellow-400 px-2 py-1 rounded">
                Warn
              </button>
              <button className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded">
                Kick
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Room Settings Tab Component
function RoomSettingsTab({ hostManagement }: { hostManagement: HostManagement }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-white mb-3">Room Settings</h4>
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-2">Room Code</label>
          <div className="flex items-center gap-2">
            <code className="bg-[#1a1a2e]/50 px-3 py-2 rounded text-sm text-amber-500 font-mono">
              {hostManagement.roomId}
            </code>
            <button className="text-xs text-blue-500 hover:text-blue-400">Copy</button>
          </div>
        </div>
        
        <div>
          <label className="block text-xs text-gray-400 mb-2">Time Limits</label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white">Phase Timer</span>
              <button className="text-xs text-blue-500 hover:text-blue-400">Adjust</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white">Game Timer</span>
              <button className="text-xs text-blue-500 hover:text-blue-400">Adjust</button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-2">Spectators</label>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white">Allow Spectators</span>
            <button className="text-xs text-green-500 hover:text-green-400">Enabled</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Activity Log Tab Component
function ActivityLogTab({ hostManagement }: { hostManagement: HostManagement }) {
  const mockLogs = [
    { id: '1', time: '2m ago', action: 'Player joined', actor: 'Alice', type: 'player_event' },
    { id: '2', time: '5m ago', action: 'Game started', actor: 'System', type: 'game_event' },
    { id: '3', time: '8m ago', action: 'Settings updated', actor: hostManagement.hostName, type: 'host_action' }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'host_action': return 'text-amber-500';
      case 'player_event': return 'text-blue-500';
      case 'game_event': return 'text-green-500';
      case 'system_event': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-white mb-3">Activity Log</h4>
      <div className="space-y-2">
        {mockLogs.map((log) => (
          <div key={log.id} className="p-3 bg-[#1a1a2e]/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">{log.time}</span>
              <span className={`text-xs ${getTypeColor(log.type)}`}>
                {log.type.replace('_', ' ')}
              </span>
            </div>
            <div className="text-sm text-white">{log.action}</div>
            <div className="text-xs text-gray-400">by {log.actor}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab({ hostManagement }: { hostManagement: HostManagement }) {
  const mockAnalytics = {
    totalPlayers: 8,
    avgSessionTime: '25m',
    hostActions: 12,
    gameProgress: 65
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-white mb-3">Analytics</h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-[#1a1a2e]/50 rounded-lg text-center">
          <div className="text-lg font-bold text-blue-500">{mockAnalytics.totalPlayers}</div>
          <div className="text-xs text-gray-400">Total Players</div>
        </div>
        <div className="p-3 bg-[#1a1a2e]/50 rounded-lg text-center">
          <div className="text-lg font-bold text-green-500">{mockAnalytics.avgSessionTime}</div>
          <div className="text-xs text-gray-400">Avg Session</div>
        </div>
        <div className="p-3 bg-[#1a1a2e]/50 rounded-lg text-center">
          <div className="text-lg font-bold text-amber-500">{mockAnalytics.hostActions}</div>
          <div className="text-xs text-gray-400">Host Actions</div>
        </div>
        <div className="p-3 bg-[#1a1a2e]/50 rounded-lg text-center">
          <div className="text-lg font-bold text-purple-500">{mockAnalytics.gameProgress}%</div>
          <div className="text-xs text-gray-400">Progress</div>
        </div>
      </div>
    </div>
  );
}
