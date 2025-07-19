'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import { getSession } from '~/lib/session';
import { type PlayerSession } from '~/lib/session';

interface GameClientProps {
  roomCode: string;
}

function GameClient({ roomCode }: GameClientProps) {
  const router = useRouter();
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const currentSession = getSession();
      
      if (!currentSession) {
        // Redirect to join page if no session
        router.push(`/room/${roomCode}`);
        return;
      }
      setSession(currentSession);
      setSessionChecked(true);
    };

    checkSession();
  }, [roomCode, router]);

  const { data: roomData, isLoading, error } = api.room.getRoomInfo.useQuery(
    { roomCode },
    { 
      enabled: !!roomCode && sessionChecked,
      refetchInterval: 2000,
    }
  );

  if (!sessionChecked || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading game...</div>
        </div>
      </div>
    );
  }

  if (error || !roomData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Game not found</div>
          <button
            onClick={() => router.push(`/room/${roomCode}/lobby`)}
            className="bg-[#3d3d7a] hover:bg-[#4a4a96] text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  // Check if player is in the room
  const playerInRoom = session && roomData.players.find((p: any) => p.name === session.name);
  if (!playerInRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Player not found in room</div>
          <button
            onClick={() => router.push(`/room/${roomCode}`)}
            className="bg-[#3d3d7a] hover:bg-[#4a4a96] text-white px-6 py-2 rounded-lg transition-colors"
          >
            Rejoin Room
          </button>
        </div>
      </div>
    );
  }

  // Render nothing, this file should not be used. All game flow is handled by dynamic game engine UI.
  return null;
}

export { GameClient };
