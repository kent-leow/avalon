'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '~/lib/session';
import { type PlayerSession } from '~/lib/session';
import { useSSERealtimeRoom } from '~/hooks/useSSERealtimeRoom';

interface PageProps {
  params: Promise<{
    roomCode: string;
  }>;
}

function GameClient({ roomCode }: { roomCode: string }) {
  const router = useRouter();
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Use real-time room hook instead of polling
  const {
    roomState,
    isConnected,
    connectionState,
  } = useSSERealtimeRoom({
    roomCode,
    playerId: session?.id || '',
    playerName: session?.name || '',
    enabled: !!session && sessionChecked,
  });

  useEffect(() => {
    const checkSession = () => {
      const currentSession = getSession();
      
      if (!currentSession) {
        router.push(`/room/${roomCode}`);
        return;
      }
      setSession(currentSession);
      setSessionChecked(true);
    };

    checkSession();
  }, [roomCode, router]);

  if (!sessionChecked || roomState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading game...</div>
          {connectionState.status === 'reconnecting' && (
            <div className="text-slate-300 text-sm mt-2">Connecting to real-time updates...</div>
          )}
          {connectionState.status === 'error' && (
            <div className="text-red-400 text-sm mt-2">Connection failed. Retrying...</div>
          )}
        </div>
      </div>
    );
  }

  if (roomState.error || !roomState.room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">
            {roomState.error ? 'Error loading room' : 'Game not found'}
          </div>
          {roomState.error && (
            <div className="text-red-400 text-sm mb-4 max-w-md">
              {roomState.error}
            </div>
          )}
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

  const playerInRoom = session && roomState.room.players.find((p: any) => p.name === session.name);
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4">
              Game in Progress
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="text-lg text-slate-100 opacity-90">
                Room Code: <span className="font-mono text-2xl">{roomCode}</span>
              </div>
              {/* Real-time connection indicator */}
              <div className={`px-3 py-1 rounded-full text-xs flex items-center gap-2 ${
                isConnected 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-yellow-400'
                } ${isConnected ? 'animate-pulse' : ''}`}></div>
                {isConnected ? 'Live' : 'Reconnecting'}
              </div>
            </div>
          </div>

          <div className="bg-[#252547]/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-8 text-center">
            <div className="text-2xl font-bold text-white mb-4">
              Game Interface Coming Soon
            </div>
            <div className="text-slate-300 mb-6">
              The game interface is under development. For now, you can return to the lobby.
            </div>
            <div className="space-y-4">
              {/* Game state information */}
              <div className="bg-[#1a1a2e]/60 rounded-lg p-4">
                <div className="text-lg font-semibold text-white mb-2">Current Game State</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Phase:</span>
                    <span className="text-white ml-2">{roomState.room.phase}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Players:</span>
                    <span className="text-white ml-2">{roomState.room.players.length}</span>
                  </div>
                  {roomState.room.gameState && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400">Round:</span>
                      <span className="text-white ml-2">{roomState.room.gameState.round || 0}</span>
                    </div>
                  )}
                </div>
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
    </div>
  );
}

export default async function GamePage({ params }: PageProps) {
  const { roomCode } = await params;

  return <GameClient roomCode={roomCode} />;
}
