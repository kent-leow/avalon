'use client';

import { useState } from 'react';
import { RoomCodeDisplay } from './RoomCodeDisplay';
import { createRoomCode, generateJoinUrl } from '~/lib/room-code-generator';
import { type Room } from '~/types/room';

interface CreateRoomFormProps {
  onRoomCreated: (room: Room) => void;
  className?: string;
}

export function CreateRoomForm({ onRoomCreated, className = '' }: CreateRoomFormProps) {
  const [hostName, setHostName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string>('');

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hostName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Mock room creation for now
      const roomCode = createRoomCode();
      const joinUrl = generateJoinUrl(roomCode);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockRoom: Room = {
        id: crypto.randomUUID(),
        code: roomCode,
        hostId: crypto.randomUUID(),
        players: [{
          id: crypto.randomUUID(),
          name: hostName,
          isHost: true,
          joinedAt: new Date(),
          roomId: roomCode,
        }],
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
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      };

      setCreatedRoom(mockRoom);
      onRoomCreated(mockRoom);
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (createdRoom) {
    return (
      <RoomCodeDisplay
        roomCode={createdRoom.code}
        joinUrl={generateJoinUrl(createdRoom.code)}
        className={className}
      />
    );
  }

  return (
    <div className={`bg-[#252547]/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-8 shadow-xl ${className}`} data-testid="create-room-form">
      <div className="text-center space-y-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4">
            Create New Room
          </h1>
          <p className="text-lg text-slate-100 opacity-90 leading-relaxed">
            Start a new Avalon game and invite your friends to join
          </p>
        </div>

        <form onSubmit={handleCreateRoom} className="space-y-6">
          <div>
            <label htmlFor="hostName" className="block text-sm font-medium text-slate-200 opacity-75 uppercase tracking-wide mb-2">
              Your Name
            </label>
            <input
              id="hostName"
              type="text"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-[#1a1a2e] border border-slate-600/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
              disabled={isCreating}
              maxLength={50}
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm font-medium bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isCreating || !hostName.trim()}
            className="w-full bg-gradient-to-r from-[#3d3d7a] to-[#4a4a96] hover:from-[#4a4a96] hover:to-[#5a5ab2] text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isCreating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Room...</span>
              </div>
            ) : (
              'Create Room'
            )}
          </button>
        </form>

        <div className="text-sm text-slate-300 opacity-75 space-y-2">
          <p>• Room will expire after 1 hour of inactivity</p>
          <p>• Share the room code with friends to invite them</p>
          <p>• You can configure game settings once the room is created</p>
        </div>
      </div>
    </div>
  );
}
