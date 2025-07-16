import React from 'react';
import type { PlayerRole } from '~/types/game-results';

interface PlayerPerformanceGridProps {
  players: PlayerRole[];
  winningTeam: 'good' | 'evil';
  characterEmoji: Record<string, string>;
}

export const PlayerPerformanceGrid: React.FC<PlayerPerformanceGridProps> = ({
  players,
  winningTeam,
  characterEmoji,
}) => {
  const getPerformanceColor = (performance: string): string => {
    switch (performance) {
      case 'excellent':
        return 'text-green-300';
      case 'good':
        return 'text-blue-300';
      case 'average':
        return 'text-yellow-300';
      case 'poor':
        return 'text-red-300';
      default:
        return 'text-gray-300';
    }
  };

  const getPerformanceIcon = (performance: string): string => {
    switch (performance) {
      case 'excellent':
        return '⭐';
      case 'good':
        return '👍';
      case 'average':
        return '👌';
      case 'poor':
        return '👎';
      default:
        return '❓';
    }
  };

  const getRoleDisplayName = (role: string): string => {
    const roleMap: Record<string, string> = {
      'merlin': 'Merlin',
      'percival': 'Percival',
      'loyal-servant': 'Loyal Servant',
      'morgana': 'Morgana',
      'mordred': 'Mordred',
      'oberon': 'Oberon',
      'assassin': 'Assassin',
    };
    return roleMap[role] || role;
  };

  const sortedPlayers = [...players].sort((a, b) => {
    // Winners first, then by performance
    if (a.team === winningTeam && b.team !== winningTeam) return -1;
    if (a.team !== winningTeam && b.team === winningTeam) return 1;
    
    const performanceOrder = { excellent: 0, good: 1, average: 2, poor: 3 };
    return performanceOrder[a.performance as keyof typeof performanceOrder] - 
           performanceOrder[b.performance as keyof typeof performanceOrder];
  });

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
      <h3 className="text-xl font-semibold mb-6 text-slate-200">Player Performance</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedPlayers.map((player) => (
          <div
            key={player.playerId}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              player.team === winningTeam
                ? player.team === 'good'
                  ? 'bg-blue-900/20 border-blue-500/30'
                  : 'bg-red-900/20 border-red-500/30'
                : 'bg-slate-700/30 border-slate-600/30'
            }`}
          >
            {/* Player Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-sm">{player.avatar}</span>
                </div>
                <div>
                  <div className="font-semibold text-white">{player.playerName}</div>
                  <div className={`text-xs ${
                    player.team === 'good' ? 'text-blue-300' : 'text-red-300'
                  }`}>
                    {player.team.toUpperCase()} TEAM
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg">
                  {characterEmoji[player.role.toUpperCase().replace('-', '_')] || '🎭'}
                </div>
                <div className="text-xs text-slate-400">
                  {getRoleDisplayName(player.role)}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Performance:</span>
                <div className="flex items-center space-x-1">
                  <span className="text-sm">
                    {getPerformanceIcon(player.performance)}
                  </span>
                  <span className={`text-sm font-medium ${getPerformanceColor(player.performance)}`}>
                    {player.performance.charAt(0).toUpperCase() + player.performance.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Role Effectiveness:</span>
                <div className="flex items-center space-x-1">
                  <div className="w-16 h-1 bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        player.rolePerformance.effectiveness >= 80 ? 'bg-green-500' :
                        player.rolePerformance.effectiveness >= 60 ? 'bg-yellow-500' :
                        player.rolePerformance.effectiveness >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${player.rolePerformance.effectiveness}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-300">
                    {player.rolePerformance.effectiveness}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Status:</span>
                <span className={`text-sm font-medium ${
                  player.survivalStatus === 'alive' ? 'text-green-300' : 'text-red-300'
                }`}>
                  {player.survivalStatus === 'alive' ? '✅ Alive' : '💀 Eliminated'}
                </span>
              </div>
            </div>

            {/* Key Achievements */}
            {player.rolePerformance.achievements.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-600">
                <div className="text-xs text-slate-400 mb-1">Key Achievements:</div>
                <div className="space-y-1">
                  {player.rolePerformance.achievements.slice(0, 2).map((achievement, index) => (
                    <div key={index} className="text-xs text-slate-300 flex items-center space-x-1">
                      <span>•</span>
                      <span>{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
