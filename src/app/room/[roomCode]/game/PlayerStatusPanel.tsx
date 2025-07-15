import type { GameProgress, PlayerStatus } from '~/types/game-progress';

interface PlayerStatusPanelProps {
  gameProgress: GameProgress;
  playerStatuses: PlayerStatus[];
  currentPlayerId: string;
  className?: string;
}

export default function PlayerStatusPanel({ 
  gameProgress, 
  playerStatuses, 
  currentPlayerId,
  className = '' 
}: PlayerStatusPanelProps) {
  const { currentPhase, currentLeader, missionResults } = gameProgress;
  const currentMission = missionResults.find(m => m.outcome === 'pending');

  const getPlayerStatusIcon = (status: PlayerStatus) => {
    if (status.playerId === currentLeader) {
      return '👑';
    }
    if (currentMission?.teamMembers.includes(status.playerId)) {
      return '⚔️';
    }
    switch (status.currentActivity.type) {
      case 'waiting':
        return '�';
      case 'selecting-team':
        return '🎯';
      case 'voting':
        return '�️';
      case 'mission-voting':
        return '⚔️';
      case 'idle':
        return '�';
      default:
        return '⚪';
    }
  };

  const getPlayerStatusColor = (status: PlayerStatus) => {
    if (status.playerId === currentLeader) {
      return 'text-yellow-400';
    }
    if (currentMission?.teamMembers.includes(status.playerId)) {
      return 'text-blue-400';
    }
    if (!status.isOnline) {
      return 'text-red-400';
    }
    switch (status.currentActivity.type) {
      case 'waiting':
        return 'text-yellow-400';
      case 'selecting-team':
        return 'text-blue-400';
      case 'voting':
        return 'text-purple-400';
      case 'mission-voting':
        return 'text-orange-400';
      case 'idle':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getPlayerBorderColor = (status: PlayerStatus) => {
    if (status.playerId === currentPlayerId) {
      return 'border-blue-500 bg-blue-500/10';
    }
    if (status.playerId === currentLeader) {
      return 'border-yellow-500 bg-yellow-500/10';
    }
    if (currentMission?.teamMembers.includes(status.playerId)) {
      return 'border-blue-400 bg-blue-400/10';
    }
    return 'border-gray-600 bg-gray-600/10';
  };

  const getActionLabel = (status: PlayerStatus) => {
    if (status.playerId === currentLeader) {
      return currentPhase.name === 'Team Selection' ? 'Selecting Team' : 'Leader';
    }
    if (currentMission?.teamMembers.includes(status.playerId)) {
      return currentPhase.name === 'Mission Execution' ? 'On Mission' : 'Team Member';
    }
    if (status.currentActivity.type === 'voting') {
      return 'Voting';
    }
    if (status.currentActivity.type === 'mission-voting') {
      return 'Mission Vote';
    }
    return status.isOnline ? 'Online' : 'Offline';
  };

  const sortedStatuses = [...playerStatuses].sort((a, b) => {
    // Current player first
    if (a.playerId === currentPlayerId) return -1;
    if (b.playerId === currentPlayerId) return 1;
    
    // Leader second
    if (a.playerId === currentLeader) return -1;
    if (b.playerId === currentLeader) return 1;
    
    // Team members third
    const aOnTeam = currentMission?.teamMembers.includes(a.playerId) ?? false;
    const bOnTeam = currentMission?.teamMembers.includes(b.playerId) ?? false;
    if (aOnTeam && !bOnTeam) return -1;
    if (!aOnTeam && bOnTeam) return 1;
    
    // Then by player name
    return a.playerName.localeCompare(b.playerName);
  });

  return (
    <div className={`bg-[#252547]/90 backdrop-blur-sm border border-[#3b4171]/30 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Players</h3>
        <div className="text-sm text-gray-400">
          {playerStatuses.filter(p => p.isOnline).length} online
        </div>
      </div>

      {/* Players List */}
      <div className="space-y-3">
        {sortedStatuses.map((status) => (
          <div
            key={status.playerId}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
              getPlayerBorderColor(status)
            }`}
          >
            {/* Player Info */}
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {getPlayerStatusIcon(status)}
              </div>
              <div>
                <div className={`font-semibold ${getPlayerStatusColor(status)}`}>
                  {status.playerName}
                  {status.playerId === currentPlayerId && (
                    <span className="text-blue-400 ml-2">(You)</span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {getActionLabel(status)}
                </div>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-2">
              {/* Connection Status */}
              <div className={`w-2 h-2 rounded-full ${
                status.isOnline ? 'bg-green-500' : 'bg-red-500'
              }`} />
              
              {/* Activity Status */}
              {(status.currentActivity.type === 'voting' || status.currentActivity.type === 'mission-voting') && (
                <div className="text-xs">
                  {status.currentActivity.isBlocked ? (
                    <span className="text-red-400">✗</span>
                  ) : (
                    <span className="text-green-400">✓</span>
                  )}
                </div>
              )}

              {/* Last Activity */}
              {status.lastSeen && (
                <div className="text-xs text-gray-500">
                  {new Date(status.lastSeen).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Phase Summary */}
      <div className="mt-6 p-3 bg-[#1a1a3a]/50 rounded-lg">
        <div className="text-sm text-gray-400 mb-2">Current Phase</div>
        <div className="font-semibold text-white">
          {currentPhase.name}
        </div>
        
        {/* Waiting For */}
        {currentPhase.status === 'active' && (
          <div className="mt-2 text-xs text-gray-400">
            {currentPhase.description}
          </div>
        )}
      </div>
    </div>
  );
}
