'use client';

import { useState } from 'react';
import { PlayerNameInput } from './PlayerNameInput';
import { RoomJoinStatus } from './RoomJoinStatus';
import { validateRoomCode } from '~/lib/room-code-generator';
import { createSession, getSession } from '~/lib/session';
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
  const [isJoining, setIsJoining] = useState(false);
  const [joinStatus, setJoinStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [roomInfo, setRoomInfo] = useState<Partial<Room> | undefined>();

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

    setIsJoining(true);
    setJoinStatus('loading');
    setError('');

    try {
      // Get or create session
      let session = getSession();
      if (!session) {
        session = createSession(playerName, codeToUse);
      }

      // Mock room joining for now
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful join
      const mockRoom: Room = {
        id: crypto.randomUUID(),
        code: codeToUse,
        hostId: crypto.randomUUID(),
        players: [
          {
            id: crypto.randomUUID(),
            name: 'Host Player',
            isHost: true,
            joinedAt: new Date(Date.now() - 5000),
            roomId: codeToUse,
          },
          {
            id: session.id,
            name: playerName,
            isHost: false,
            joinedAt: new Date(),
            roomId: codeToUse,
            sessionId: session.id,
          }
        ],
        gameState: {
          phase: 'lobby',
          round: 0,
          leaderIndex: 0,
          votes: [],
          missions: []
        },
        settings: {
          characters: ['merlin', 'assassin', 'loyal', 'loyal', 'minion'],
          playerCount: 5,
          allowSpectators: false,
          autoStart: false
        },
        createdAt: new Date(Date.now() - 60000),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      };

      const player = mockRoom.players.find(p => p.sessionId === session.id)!;

      setRoomInfo(mockRoom);
      setJoinStatus('success');
      
      // Simulate delay before navigation
      setTimeout(() => {
        onJoinSuccess(mockRoom, player);
      }, 1000);

    } catch (err) {
      console.error('Error joining room:', err);
      const errorMessage = 'Failed to join room. Please check the room code and try again.';
      setError(errorMessage);
      setJoinStatus('error');
      onJoinError(errorMessage);
    } finally {
      setIsJoining(false);
    }
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
                  disabled={isJoining}
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
              disabled={isJoining}
            />

            {/* General Error */}
            {error && !error.includes('name') && (
              <div className="text-red-500 text-sm font-medium bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isJoining || !playerName.trim() || (!enteredRoomCode && !roomCode)}
              className="w-full bg-gradient-to-r from-[#3d3d7a] to-[#4a4a96] hover:from-[#4a4a96] hover:to-[#5a5ab2] text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isJoining ? (
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
