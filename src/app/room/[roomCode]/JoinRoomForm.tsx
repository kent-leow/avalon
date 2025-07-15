'use client';

import { useState } from 'react';
import { PlayerNameInput } from './PlayerNameInput';
import { RoomJoinStatus } from './RoomJoinStatus';
import { validateRoomCode } from '~/lib/room-code-generator';
import { createSession, getSession } from '~/lib/session';
import { api } from '~/trpc/react';
import { type Room, type Player } from '~/types/room';

interface JoinRoomFormProps {
  roomCode?: string; // Pre-filled for URL joins
  onJoinSuccess: (room: Room, player: Player) => void;
  onJoinError: (error: string) => void;
  className?: string;
}

export function JoinRoomForm({ 
  roomCode = '', 
  onJoinSuccess, 
  onJoinError, 
  className = '' 
}: JoinRoomFormProps) {
  const [enteredRoomCode, setEnteredRoomCode] = useState(roomCode);
  const [playerName, setPlayerName] = useState('');
  const [joinStatus, setJoinStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [roomInfo, setRoomInfo] = useState<Partial<Room> | undefined>();

  const joinRoomMutation = api.room.joinRoom.useMutation({
    onSuccess: (data) => {
      setJoinStatus('success');
      setRoomInfo(data.room);
      
      // Create/update session
      const session = getSession();
      if (session) {
        createSession(playerName, data.room.id);
      }
      
      // Create Room and Player objects for the callback
      const room: Room = {
        id: data.room.id,
        code: data.room.code,
        hostId: '', // Will be populated from room info
        players: [], // Will be populated from room info
        gameState: data.room.gameState,
        settings: {
          characters: [],
          playerCount: data.room.playerCount,
          allowSpectators: false,
          autoStart: false
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000)
      };

      const player: Player = {
        id: data.player.id,
        name: data.player.name,
        isHost: data.player.isHost,
        joinedAt: new Date(),
        roomId: data.room.id,
        sessionId: data.player.sessionId,
      };

      // Simulate delay before navigation
      setTimeout(() => {
        onJoinSuccess(room, player);
      }, 1000);
    },
    onError: (error) => {
      console.error('Error joining room:', error);
      const errorMessage = error.message || 'Failed to join room. Please try again.';
      setError(errorMessage);
      setJoinStatus('error');
      onJoinError(errorMessage);
    }
  });

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const codeToUse = enteredRoomCode || roomCode;
    
    if (!codeToUse.trim()) {
      setError('Please enter a room code');
      return;
    }

    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!validateRoomCode(codeToUse)) {
      setError('Invalid room code format');
      return;
    }

    setJoinStatus('loading');
    setError('');

    // Get existing session ID if available
    const session = getSession();
    const sessionId = session?.id;

    joinRoomMutation.mutate({
      roomCode: codeToUse,
      playerName: playerName.trim(),
      sessionId,
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-[#252547]/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-8 shadow-xl" data-testid="join-room-form">
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4">
              Join Game Room
            </h1>
            <p className="text-lg text-slate-100 opacity-90 leading-relaxed">
              Enter the room code to join an existing Avalon game
            </p>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-6">
            {/* Room Code Input - only show if not pre-filled */}
            {!roomCode && (
              <div>
                <label htmlFor="roomCode" className="block text-sm font-medium text-slate-200 opacity-75 uppercase tracking-wide mb-2">
                  Room Code
                </label>
                <input
                  id="roomCode"
                  type="text"
                  value={enteredRoomCode}
                  onChange={(e) => setEnteredRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code"
                  className="w-full px-4 py-3 bg-[#1a1a2e] border border-slate-600/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 font-mono text-lg tracking-wider"
                  disabled={joinRoomMutation.isPending}
                  maxLength={8}
                  required
                />
              </div>
            )}

            {/* Player Name Input */}
            <PlayerNameInput
              value={playerName}
              onChange={setPlayerName}
              error={error && error.includes('name') ? error : ''}
              disabled={joinRoomMutation.isPending}
            />

            {/* General Error */}
            {error && !error.includes('name') && (
              <div className="text-red-500 text-sm font-medium bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={joinRoomMutation.isPending || !playerName.trim() || (!enteredRoomCode && !roomCode)}
              className="w-full bg-gradient-to-r from-[#3d3d7a] to-[#4a4a96] hover:from-[#4a4a96] hover:to-[#5a5ab2] text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {joinRoomMutation.isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Joining...</span>
                </div>
              ) : (
                'Join Room'
              )}
            </button>
          </form>

          {/* Room Code Info - show when pre-filled */}
          {roomCode && (
            <div className="text-sm text-slate-300 opacity-75 bg-[#1a1a2e] rounded-lg p-3">
              <p className="font-mono text-lg mb-1">{roomCode}</p>
              <p>You're joining this room</p>
            </div>
          )}
        </div>
      </div>

      {/* Join Status */}
      <RoomJoinStatus
        status={joinStatus}
        error={error}
        roomInfo={roomInfo}
      />
    </div>
  );
}
