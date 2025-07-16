/**
 * Player Role Reveal Component
 * 
 * Displays all player roles with dramatic reveals and team associations.
 */

'use client';

import React, { useState, useEffect } from 'react';
import type { PlayerRole } from '~/types/game-results';
import type { CharacterId } from '~/types/characters';

// Character emoji mapping
const CHARACTER_EMOJI: Record<string, string> = {
  merlin: '🧙‍♂️',
  percival: '🛡️',
  loyal: '⚔️',
  assassin: '🗡️',
  morgana: '🔮',
  mordred: '⚡',
  oberon: '👁️',
  minion: '🏴',
  'loyal-servant': '⚔️',
  'minion-of-mordred': '🏴',
};

interface PlayerRoleRevealProps {
  playerRoles: PlayerRole[];
  revealDelay?: number;
  onComplete?: () => void;
}

export function PlayerRoleReveal({ playerRoles, revealDelay = 1000, onComplete }: PlayerRoleRevealProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerRole | null>(null);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRevealedCount(prev => {
        if (prev < playerRoles.length) {
          return prev + 1;
        }
        clearInterval(interval);
        if (onComplete) {
          setTimeout(onComplete, 1000);
        }
        return prev;
      });
    }, revealDelay);
    
    return () => clearInterval(interval);
  }, [playerRoles.length, revealDelay, onComplete]);
  
  const getTeamDisplayName = (team: string) => {
    switch (team) {
      case 'good': return 'Forces of Good';
      case 'evil': return 'Forces of Evil';
      default: return team;
    }
  };
  
  const getTeamColors = (team: string) => {
    switch (team) {
      case 'good': return 'from-green-600 to-green-800 border-green-500 text-green-300';
      case 'evil': return 'from-red-600 to-red-800 border-red-500 text-red-300';
      default: return 'from-gray-600 to-gray-800 border-gray-500 text-gray-300';
    }
  };
  
  const getTeamIcon = (team: string) => {
    return team === 'good' ? '⚡' : '🔥';
  };
  
  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'merlin': return 'Knows all evil players except Mordred';
      case 'percival': return 'Knows who Merlin and Morgana are';
      case 'loyal-servant': return 'Faithful servant of Arthur';
      case 'assassin': return 'Can eliminate Merlin to win';
      case 'morgana': return 'Appears as Merlin to Percival';
      case 'mordred': return 'Hidden from Merlin\'s sight';
      case 'oberon': return 'Unknown to other evil players';
      case 'minion': return 'Loyal servant of Mordred';
      default: return 'Unknown role';
    }
  };
  
  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent': return '🏆';
      case 'good': return '⭐';
      case 'average': return '✓';
      case 'poor': return '⚠️';
      default: return '❓';
    }
  };
  
  const getPerformanceColors = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-yellow-400 bg-yellow-900/20';
      case 'good': return 'text-blue-400 bg-blue-900/20';
      case 'average': return 'text-green-400 bg-green-900/20';
      case 'poor': return 'text-orange-400 bg-orange-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };
  
  const goodPlayers = playerRoles.filter(p => p.team === 'good');
  const evilPlayers = playerRoles.filter(p => p.team === 'evil');
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-300 mb-2">
          Role Reveal
        </h2>
        <p className="text-gray-400">
          The true identities of all players
        </p>
      </div>
      
      {/* Teams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Good Team */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <span className="text-2xl">⚡</span>
            <h3 className="text-xl font-semibold text-green-400">
              {getTeamDisplayName('good')}
            </h3>
            <span className="text-2xl">⚡</span>
          </div>
          
          <div className="space-y-3">
            {goodPlayers.map((player, index) => {
              const globalIndex = playerRoles.findIndex(p => p.playerId === player.playerId);
              const isRevealed = revealedCount > globalIndex;
              
              return (
                <div
                  key={player.playerId}
                  className={`p-4 rounded-xl border-2 transition-all duration-500 cursor-pointer hover:bg-gray-800/30 ${
                    isRevealed
                      ? 'bg-gradient-to-r from-green-900/20 to-green-800/20 border-green-600/30 animate-fadeIn'
                      : 'bg-gray-900/30 border-gray-600/30 opacity-50'
                  }`}
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                        {player.avatar ? (
                          <img
                            src={player.avatar}
                            alt={player.playerName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg">👤</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-300">
                          {player.playerName}
                        </h4>
                        {isRevealed && (
                          <p className="text-sm text-green-400 flex items-center space-x-1">
                            <span>{CHARACTER_EMOJI[player.role] || '❓'}</span>
                            <span>{player.role}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {isRevealed && (
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getPerformanceColors(player.performance)}`}>
                          {getPerformanceIcon(player.performance)} {player.performance}
                        </span>
                        <span className="text-sm text-gray-400">
                          {player.survivalStatus === 'alive' ? '💚' : '💀'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {isRevealed && (
                    <div className="mt-2 text-xs text-gray-400">
                      {getRoleDescription(player.character)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Evil Team */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <span className="text-2xl">🔥</span>
            <h3 className="text-xl font-semibold text-red-400">
              {getTeamDisplayName('evil')}
            </h3>
            <span className="text-2xl">🔥</span>
          </div>
          
          <div className="space-y-3">
            {evilPlayers.map((player, index) => {
              const globalIndex = playerRoles.findIndex(p => p.playerId === player.playerId);
              const isRevealed = revealedCount > globalIndex;
              
              return (
                <div
                  key={player.playerId}
                  className={`p-4 rounded-xl border-2 transition-all duration-500 cursor-pointer hover:bg-gray-800/30 ${
                    isRevealed
                      ? 'bg-gradient-to-r from-red-900/20 to-red-800/20 border-red-600/30 animate-fadeIn'
                      : 'bg-gray-900/30 border-gray-600/30 opacity-50'
                  }`}
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                        {player.avatar ? (
                          <img
                            src={player.avatar}
                            alt={player.playerName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg">👤</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-300">
                          {player.playerName}
                        </h4>
                        {isRevealed && (
                          <p className="text-sm text-red-400 flex items-center space-x-1">
                            <span>{CHARACTER_EMOJI[player.character] || '❓'}</span>
                            <span>{player.character}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {isRevealed && (
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getPerformanceColors(player.performance)}`}>
                          {getPerformanceIcon(player.performance)} {player.performance}
                        </span>
                        <span className="text-sm text-gray-400">
                          {player.survivalStatus === 'alive' ? '💚' : '💀'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {isRevealed && (
                    <div className="mt-2 text-xs text-gray-400">
                      {getRoleDescription(player.character)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Player Detail Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] p-6 rounded-2xl border-2 border-gray-600/50 shadow-2xl max-w-md w-full">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                {selectedPlayer.avatar ? (
                  <img
                    src={selectedPlayer.avatar}
                    alt={selectedPlayer.playerName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-300">
                {selectedPlayer.playerName}
              </h3>
              <p className={`text-lg font-medium ${
                selectedPlayer.team === 'good' ? 'text-green-400' : 'text-red-400'
              }`}>
                {CHARACTER_EMOJI[selectedPlayer.character] || '❓'} {selectedPlayer.character}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-300 mb-2">Role Description</h4>
                <p className="text-sm text-gray-400">
                  {getRoleDescription(selectedPlayer.character)}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-300 mb-1">Performance</h4>
                  <p className={`text-sm ${getPerformanceColors(selectedPlayer.performance).split(' ')[0]}`}>
                    {getPerformanceIcon(selectedPlayer.performance)} {selectedPlayer.performance}
                  </p>
                </div>
                <div className="bg-gray-900/50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-300 mb-1">Status</h4>
                  <p className="text-sm">
                    {selectedPlayer.survivalStatus === 'alive' ? '💚 Alive' : '💀 Eliminated'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Progress Indicator */}
      <div className="text-center">
        <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(revealedCount / playerRoles.length) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-400">
          {revealedCount} / {playerRoles.length} revealed
        </p>
      </div>
    </div>
  );
}
