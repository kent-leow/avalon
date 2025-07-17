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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4">
              Game in Progress
            </h1>
            <div className="text-lg text-slate-100 opacity-90">
              Room Code: <span className="font-mono text-2xl">{roomCode}</span>
            </div>
          </div>

          {/* Placeholder for game content */}
          <div className="bg-[#252547]/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-8 text-center">
            <div className="text-2xl font-bold text-white mb-4">
              Game Interface Coming Soon
            </div>
            <div className="text-slate-300 mb-6">
              The game interface is under development. For now, you can return to the lobby.
            </div>
            <button
              onClick={() => router.push(`/room/${roomCode}/lobby`)}
              className="bg-[#3d3d7a] hover:bg-[#4a4a96] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Return to Lobby
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { GameClient };
