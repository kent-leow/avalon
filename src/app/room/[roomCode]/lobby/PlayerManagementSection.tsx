'use client';

import { useState } from 'react';
import { api } from '~/trpc/react';
import { getSession } from '~/lib/session';
import type { Player } from '~/types/room';

interface PlayerManagementSectionProps {
  roomId: string;
  roomCode: string;
  players: Player[];
  isHost: boolean;
}

interface ExtendedPlayer extends Player {
  isCurrentPlayer: boolean;
  canKick: boolean;
  canMakeHost: boolean;
}

export default function PlayerManagementSection({
  roomId,
  roomCode,
  players,
  isHost,
}: PlayerManagementSectionProps) {
  const [playerActions, setPlayerActions] = useState<{[key: string]: boolean}>({});
  const session = getSession();
  const currentPlayerId = session && players.find(p => p.name === session.name)?.id;

  const updatePlayerReady = api.room.updatePlayerReady.useMutation();
  const kickPlayer = api.room.kickPlayer.useMutation();
  const transferHost = api.room.transferHost.useMutation();

  // Create extended player data with action permissions
  const extendedPlayers: ExtendedPlayer[] = players.map(player => ({
    ...player,
    isCurrentPlayer: player.id === currentPlayerId,
    canKick: isHost && player.id !== currentPlayerId && !player.isHost,
    canMakeHost: isHost && player.id !== currentPlayerId && !player.isHost,
  }));

  const handleToggleReady = async () => {
    if (!currentPlayerId) return;
    
    const currentPlayer = players.find(p => p.id === currentPlayerId);
    if (!currentPlayer) return;

    setPlayerActions(prev => ({ ...prev, [currentPlayerId]: true }));
    
    try {
      await updatePlayerReady.mutateAsync({
        playerId: currentPlayerId,
        isReady: !currentPlayer.isReady,
      });
    } catch (error) {
      console.error('Failed to toggle ready status:', error);
    } finally {
      setPlayerActions(prev => ({ ...prev, [currentPlayerId]: false }));
    }
  };

  const handleKickPlayer = async (playerId: string) => {
    if (!isHost || !currentPlayerId) return;
    
    const confirmed = window.confirm('Are you sure you want to kick this player?');
    if (!confirmed) return;

    setPlayerActions(prev => ({ ...prev, [playerId]: true }));
    
    try {
      await kickPlayer.mutateAsync({
        roomId,
        playerId,
      });
    } catch (error) {
      console.error('Failed to kick player:', error);
    } finally {
      setPlayerActions(prev => ({ ...prev, [playerId]: false }));
    }
  };

  const handleTransferHost = async (playerId: string) => {
    if (!isHost || !currentPlayerId) return;
    
    const playerName = players.find(p => p.id === playerId)?.name;
    const confirmed = window.confirm(`Are you sure you want to transfer host to ${playerName}?`);
    if (!confirmed) return;

    setPlayerActions(prev => ({ ...prev, [playerId]: true }));
    
    try {
      await transferHost.mutateAsync({
        roomId,
        newHostId: playerId,
      });
    } catch (error) {
      console.error('Failed to transfer host:', error);
    } finally {
      setPlayerActions(prev => ({ ...prev, [playerId]: false }));
    }
  };

  const getPlayerStatusColor = (player: ExtendedPlayer) => {
    if (player.isHost) return 'bg-amber-500';
    if (player.isReady) return 'bg-green-500';
    return 'bg-slate-400';
  };

  const getPlayerStatusText = (player: ExtendedPlayer) => {
    if (player.isHost) return 'Host';
    if (player.isReady) return 'Ready';
    return 'Not Ready';
  };

  return (
    <div className="bg-[#252547]/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-2">
          Players ({players.length}/10)
        </h3>
        <p className="text-slate-300">
          {isHost ? 'Manage players and room settings' : 'Waiting for all players to join'}
        </p>
      </div>

      <div className="space-y-3">
        {extendedPlayers.map((player) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
              player.isCurrentPlayer
                ? 'bg-blue-500/20 border-blue-500/30'
                : 'bg-[#1a1a2e]/60 border-slate-600/30 hover:border-slate-500/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getPlayerStatusColor(player)}`}></div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-white">
                    {player.name}
                  </span>
                  {player.isCurrentPlayer && (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                      You
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-400">
                  {getPlayerStatusText(player)}
                </div>
              </div>
            </div>

            {isHost && !player.isCurrentPlayer && (
              <div className="flex items-center space-x-2">
                {player.canMakeHost && (
                  <button
                    onClick={() => handleTransferHost(player.id)}
                    disabled={playerActions[player.id]}
                    className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Transfer host privileges to this player"
                  >
                    {playerActions[player.id] ? 'Processing...' : 'Make Host'}
                  </button>
                )}
                
                {player.canKick && (
                  <button
                    onClick={() => handleKickPlayer(player.id)}
                    disabled={playerActions[player.id]}
                    className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove this player from the room"
                  >
                    {playerActions[player.id] ? 'Kicking...' : 'Kick'}
                  </button>
                )}
              </div>
            )}

            {player.isCurrentPlayer && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleToggleReady}
                  disabled={playerActions[currentPlayerId || '']}
                  className={`text-xs px-3 py-1 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    player.isReady
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-green-600 hover:bg-green-500 text-white'
                  }`}
                  title={player.isReady ? 'Mark as not ready' : 'Mark as ready'}
                >
                  {playerActions[currentPlayerId || ''] 
                    ? 'Processing...' 
                    : player.isReady 
                      ? 'Not Ready' 
                      : 'Ready'
                  }
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {players.length < 5 && (
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-yellow-500 font-medium">Minimum 5 players required</span>
          </div>
          <p className="text-yellow-400 text-sm mt-1">
            {5 - players.length} more player{5 - players.length !== 1 ? 's' : ''} needed to start the game
          </p>
        </div>
      )}

      {players.length >= 5 && (
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-500 font-medium">Ready to start game</span>
          </div>
          <p className="text-green-400 text-sm mt-1">
            You have enough players to begin the game
          </p>
        </div>
      )}
    </div>
  );
}
