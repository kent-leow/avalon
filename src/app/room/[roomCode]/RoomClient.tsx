'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { JoinRoomForm } from './JoinRoomForm';
import { getSession, clearSession } from '~/lib/session';
import { validateRoomCode } from '~/lib/room-code-generator';
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

  // Check room code validity and redirect if invalid
  useEffect(() => {
    if (!mounted) return;
    
    // Validate room code format immediately
    if (!validateRoomCode(roomCode)) {
      console.log('Invalid room code format, redirecting to home:', roomCode);
      router.replace('/');
      return;
    }
  }, [roomCode, router, mounted]);

  // Check room data to determine game state
  const { data: roomData, isLoading, error } = api.room.getRoomInfo.useQuery(
    { roomCode },
    { 
      enabled: shouldCheckRoom && mounted && validateRoomCode(roomCode),
      retry: 1,
    }
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const session = getSession();
    if (session?.roomCode === roomCode && validateRoomCode(roomCode)) {
      setHasValidSession(true);
      setShouldCheckRoom(true);
    } else {
      setHasValidSession(false);
      setShouldCheckRoom(false);
    }
  }, [roomCode, mounted]);

  useEffect(() => {
    console.log('RoomClient useEffect triggered:', { roomData: !!roomData, isLoading, hasValidSession, error });
    
    // Handle expired room error
    if (error?.message?.includes('expired')) {
      // Clear session and show join form
      clearSession();
      setHasValidSession(false);
      setShouldCheckRoom(false);
      return;
    }
    
    if (roomData && !isLoading && hasValidSession) {
      // Determine where to redirect based on game state
      const gameState = roomData.gameState;
      console.log('Room data received, redirecting to lobby. Game state:', gameState);
      if (gameState.phase === 'lobby') {
        console.log('Redirecting to lobby:', `/room/${roomCode}/lobby`);
        router.push(`/room/${roomCode}/lobby`);
      } else {
        // Game has started, redirect to game
        console.log('Redirecting to game:', `/room/${roomCode}/game`);
        router.push(`/room/${roomCode}/game`);
      }
    } else if (error && hasValidSession) {
      // Handle specific error cases
      if (error?.message?.includes('Room not found') || 
          error?.message?.includes('Room has expired') ||
          error?.message?.includes('not found') ||
          error?.message?.includes('does not exist')) {
        console.log('Room not found or expired, clearing session and redirecting to home');
        clearSession();
        setHasValidSession(false);
        setShouldCheckRoom(false);
        router.replace('/');
        return;
      }
      
      // Room query failed (likely expired), clear session and show join form
      console.log('Room query failed, clearing session:', error.message);
      clearSession();
      setHasValidSession(false);
      setShouldCheckRoom(false);
    }
  }, [roomData, isLoading, error, roomCode, router, hasValidSession]);

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
