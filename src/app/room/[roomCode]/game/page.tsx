'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '~/lib/session';
import { type PlayerSession } from '~/lib/session';
import { useOptimizedRealtimeRoom } from '~/hooks/useOptimizedRealtimeRoom';
import { GameEngine } from '~/components/game-engine';
import { type GameState, type GamePhase } from '~/types/game-state';

interface PageProps {
  params: Promise<{
    roomCode: string;
  }>;
}

function GameClient({ roomCode }: { roomCode: string }) {
  const router = useRouter();
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Use optimized real-time room hook instead of individual SSE subscription
  const {
    roomState,
    isConnected,
    connectionState,
  } = useOptimizedRealtimeRoom({
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

  // Create game state from room state
  const gameState: GameState = {
    phase: roomState.room.phase as GamePhase,
    round: roomState.room.gameState?.round || 1,
    leaderIndex: roomState.room.gameState?.leaderIndex || 0,
    startedAt: roomState.room.gameState?.startedAt ? new Date(roomState.room.gameState.startedAt) : new Date(),
    votes: roomState.room.gameState?.votes || [],
    missions: roomState.room.gameState?.missions || [],
    assassinAttempt: roomState.room.gameState?.assassinAttempt || undefined,
  };

  return (
    <GameEngine
      roomCode={roomCode}
      playerId={session?.id || ''}
      playerName={session?.name || ''}
      initialGameState={gameState}
      onError={(error) => {
        console.error('Game Engine Error:', error);
        // Handle error - could show a toast or redirect
      }}
      onPhaseTransition={(fromPhase, toPhase) => {
        console.log(`Phase transition: ${fromPhase} -> ${toPhase}`);
        // Handle phase transition - could trigger analytics or other side effects
      }}
    />
  );
}

export default function GamePage({ params }: PageProps) {
  const [roomCode, setRoomCode] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ roomCode }) => setRoomCode(roomCode));
  }, [params]);

  if (!roomCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return <GameClient roomCode={roomCode} />;
}
