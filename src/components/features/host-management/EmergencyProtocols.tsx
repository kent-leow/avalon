/**
 * Emergency Protocols Interface
 * Interface for handling emergency situations in the game
 */

'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Zap, Clock, CheckCircle, XCircle, Play, Pause, Square } from 'lucide-react';
import type { EmergencyState, EmergencyType, HostActionType } from '~/types/host-management';

interface EmergencyProtocolsProps {
  emergencyState: EmergencyState | null;
  onTriggerEmergency: (type: EmergencyType) => void;
  onResolveEmergency: (resolution: string) => void;
  onExecuteAction: (action: HostActionType) => void;
  className?: string;
}

export default function EmergencyProtocols({
  emergencyState,
  onTriggerEmergency,
  onResolveEmergency,
  onExecuteAction,
  className = ''
}: EmergencyProtocolsProps) {
  const [selectedProtocol, setSelectedProtocol] = useState<EmergencyType | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (emergencyState?.active) {
      const interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - emergencyState.triggered.getTime()) / 1000);
        setTimeElapsed(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [emergencyState]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getEmergencyIcon = (type: EmergencyType) => {
    switch (type) {
      case 'game_breaking_bug':
        return '🐛';
      case 'player_dispute':
        return '⚔️';
      case 'technical_failure':
        return '💻';
      case 'security_breach':
        return '🔒';
      case 'host_abandonment':
        return '👑';
      case 'mass_disconnect':
        return '📡';
      default:
        return '🚨';
    }
  };

  const getEmergencyColor = (type: EmergencyType) => {
    switch (type) {
      case 'game_breaking_bug':
        return 'text-orange-500';
      case 'player_dispute':
        return 'text-red-500';
      case 'technical_failure':
        return 'text-blue-500';
      case 'security_breach':
        return 'text-purple-500';
      case 'host_abandonment':
        return 'text-yellow-500';
      case 'mass_disconnect':
        return 'text-gray-500';
      default:
        return 'text-red-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-orange-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const emergencyProtocols: Array<{
    type: EmergencyType;
    name: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    autoActions: HostActionType[];
    manualActions: HostActionType[];
  }> = [
    {
      type: 'mass_disconnect',
      name: 'Mass Disconnect',
      description: 'Multiple players have disconnected simultaneously',
      severity: 'high',
      autoActions: ['pause_game'],
      manualActions: ['reset_room', 'end_game']
    },
    {
      type: 'host_abandonment',
      name: 'Host Abandonment',
      description: 'The host has disconnected or abandoned the game',
      severity: 'critical',
      autoActions: ['pause_game'],
      manualActions: ['make_host']
    },
    {
      type: 'player_dispute',
      name: 'Player Dispute',
      description: 'Multiple behavior reports indicate a dispute',
      severity: 'medium',
      autoActions: [],
      manualActions: ['mute_player', 'kick_player']
    },
    {
      type: 'game_breaking_bug',
      name: 'Game Breaking Bug',
      description: 'A technical issue is preventing normal gameplay',
      severity: 'high',
      autoActions: ['pause_game'],
      manualActions: ['reset_room', 'end_game']
    },
    {
      type: 'technical_failure',
      name: 'Technical Failure',
      description: 'System failure affecting game functionality',
      severity: 'high',
      autoActions: ['pause_game'],
      manualActions: ['reset_room']
    },
    {
      type: 'security_breach',
      name: 'Security Breach',
      description: 'Potential security breach detected',
      severity: 'critical',
      autoActions: ['pause_game'],
      manualActions: ['end_game']
    }
  ];

  const getActionIcon = (action: HostActionType) => {
    switch (action) {
      case 'pause_game':
        return <Pause size={14} />;
      case 'resume_game':
        return <Play size={14} />;
      case 'reset_room':
        return '🔄';
      case 'end_game':
        return <Square size={14} />;
      case 'make_host':
        return '👑';
      case 'kick_player':
        return '🚪';
      case 'mute_player':
        return '🔇';
      default:
        return '⚙️';
    }
  };

  const getActionLabel = (action: HostActionType) => {
    const labels: Record<HostActionType, string> = {
      kick_player: 'Kick Player',
      mute_player: 'Mute Player',
      warn_player: 'Warn Player',
      make_host: 'Transfer Host',
      pause_game: 'Pause Game',
      resume_game: 'Resume Game',
      reset_room: 'Reset Room',
      end_game: 'End Game',
      share_room: 'Share Room',
      adjust_timer: 'Adjust Timer',
      enable_spectator: 'Enable Spectator',
      disable_spectator: 'Disable Spectator'
    };
    return labels[action] || action;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Active Emergency */}
      {emergencyState?.active && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-red-500" />
              <div>
                <h4 className="text-sm font-medium text-red-400">Emergency Active</h4>
                <p className="text-xs text-red-300">{emergencyState.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-red-400">{formatTime(timeElapsed)}</div>
              <div className="text-xs text-red-300">elapsed</div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="text-2xl">{getEmergencyIcon(emergencyState.type)}</div>
            <div className="text-sm text-white">{emergencyState.type.replace('_', ' ')}</div>
          </div>

          <div className="space-y-3">
            <div>
              <h5 className="text-xs font-medium text-red-400 mb-2">Available Actions</h5>
              <div className="flex flex-wrap gap-2">
                {emergencyState.manualActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => onExecuteAction(action)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs transition-colors"
                  >
                    {getActionIcon(action)}
                    {getActionLabel(action)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-xs font-medium text-red-400 mb-2">Resolution</h5>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="Describe how the emergency was resolved..."
                  className="flex-1 px-3 py-2 bg-[#1a1a2e] border border-[#252547] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
                <button
                  onClick={() => onResolveEmergency(resolutionText)}
                  disabled={!resolutionText.trim()}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors text-sm"
                >
                  <CheckCircle size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Protocols */}
      <div className="bg-[#0a0a0f] border border-[#252547] rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Shield size={16} className="text-blue-500" />
          Emergency Protocols
        </h4>

        <div className="space-y-2">
          {emergencyProtocols.map((protocol) => (
            <div
              key={protocol.type}
              className={`p-3 rounded-lg border transition-all ${
                selectedProtocol === protocol.type
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-[#252547]/50 bg-[#1a1a2e]/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-lg">{getEmergencyIcon(protocol.type)}</div>
                  <div>
                    <div className="text-sm font-medium text-white">{protocol.name}</div>
                    <div className="text-xs text-gray-400">{protocol.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getSeverityColor(protocol.severity)}`}></div>
                  <span className="text-xs text-gray-400 capitalize">{protocol.severity}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Auto:</span>
                  <div className="flex gap-1">
                    {protocol.autoActions.map((action) => (
                      <span key={action} className="text-xs text-blue-400">
                        {getActionIcon(action)}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => onTriggerEmergency(protocol.type)}
                  disabled={emergencyState?.active}
                  className="flex items-center gap-1 px-3 py-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg text-xs transition-colors"
                >
                  <Zap size={12} />
                  Trigger
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency History */}
      <div className="bg-[#0a0a0f] border border-[#252547] rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-3">Emergency History</h4>
        <div className="text-center py-8 text-gray-400">
          <Clock size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No emergency incidents recorded</p>
        </div>
      </div>
    </div>
  );
}
