'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { JoinRoomForm } from './JoinRoomForm';
import { getSession } from '~/lib/session';
import { type Room, type Player } from '~/types/room';

interface RoomClientProps {
  roomCode: string;
}

export function RoomClient({ roomCode }: RoomClientProps) {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (session?.roomId) {
      // User already has an active session, redirect to lobby
      router.push(`/room/${roomCode}/lobby`);
    }
  }, [roomCode, router]);

  const handleJoinSuccess = (room: Room, player: Player) => {
    console.log('Successfully joined room:', room, 'as player:', player);
    // Navigate to room lobby
    router.push(`/room/${roomCode}/lobby`);
  };

  const handleJoinError = (error: string) => {
    console.error('Failed to join room:', error);
    // Error is already displayed in the form component
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <JoinRoomForm
          roomCode={roomCode}
          onJoinSuccess={handleJoinSuccess}
          onJoinError={handleJoinError}
        />
      </div>
    </div>
  );
}
