'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { JoinRoomForm } from './JoinRoomForm';
import { getSession } from '~/lib/session';
import { api } from '~/trpc/react';
import { type Room, type Player } from '~/types/room';

interface RoomClientProps {
  roomCode: string;
}

export function RoomClient({ roomCode }: RoomClientProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [shouldCheckRoom, setShouldCheckRoom] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);

  // Check room data to determine game state
  const { data: roomData, isLoading } = api.room.getRoomInfo.useQuery(
    { roomCode },
    { 
      enabled: shouldCheckRoom && mounted,
      retry: 1,
    }
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const session = getSession();
    if (session?.roomCode === roomCode) {
      setHasValidSession(true);
      setShouldCheckRoom(true);
    } else {
      setHasValidSession(false);
      setShouldCheckRoom(false);
    }
  }, [roomCode, mounted]);

  useEffect(() => {
    if (roomData && !isLoading && hasValidSession) {
      // Determine where to redirect based on game state
      const gameState = roomData.gameState;
      if (gameState.phase === 'lobby') {
        router.replace(`/room/${roomCode}/lobby`);
      } else {
        // Game has started, redirect to game
        router.replace(`/room/${roomCode}/game`);
      }
    }
  }, [roomData, isLoading, roomCode, router, hasValidSession]);

  const handleJoinSuccess = (room: Room, player: Player) => {
    console.log('Successfully joined room:', room, 'as player:', player);
    // Navigate to room lobby
    router.push(`/room/${roomCode}/lobby`);
  };

  const handleJoinError = (error: string) => {
    console.error('Failed to join room:', error);
    // Error is already displayed in the form component
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  // Show loading while checking session and room state
  if (hasValidSession && (shouldCheckRoom && isLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">Redirecting to room...</div>
        </div>
      </div>
    );
  }

  // Don't show join form if user has valid session
  if (hasValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading room...</div>
        </div>
      </div>
    );
  }

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
