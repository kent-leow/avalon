"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { getSession } from "~/lib/session";
import PreStartChecklist from "./PreStartChecklist";
import PlayerReadyList from "./PlayerReadyList";
import StartGameButton from "./StartGameButton";
import GameStartStatus from "./GameStartStatus";
import { type GameStartStatus as GameStartStatusType, type PlayerReadyStatus } from "~/types/game-state";
import { useOptimizedRealtimeRoom } from "~/hooks/useOptimizedRealtimeRoom";

interface StartGameSectionProps {
  roomId: string;
  roomCode: string;
  className?: string;
}

export default function StartGameSection({ roomId, roomCode, className }: StartGameSectionProps) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [gameStartStatus, setGameStartStatus] = useState<GameStartStatusType>({
    status: 'idle',
    progress: 0,
    message: '',
  });

    // Use optimized real-time room hook instead of individual SSE subscription
  const {
    roomState,
    isConnected,
    connectionState,
    updatePlayerReady,
  } = useOptimizedRealtimeRoom({
    roomCode,
    playerId: session?.id || '',
    playerName: session?.name || '',
    enabled: !!session,
  });

  // Extract room and game state from room state
  const room = roomState.room;
  const gameState = room?.gameState;

  // Fetch start requirements and refetch whenever room state changes
  const { data: startRequirements, refetch: refetchStartRequirements } = api.room.checkStartRequirements.useQuery(
    { roomId },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchInterval: false, // No polling - use SSE instead
      enabled: !!roomId,
    }
  );

  // Refetch start requirements when room state changes via SSE
  useEffect(() => {
    if (room && roomState.lastUpdated) {
      refetchStartRequirements();
    }
  }, [room?.settings, room?.players?.length, roomState.lastUpdated, refetchStartRequirements]);

  // Load session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionData = await getSession();
        setSession(sessionData);
      } catch (error) {
        console.error('Failed to load session:', error);
      }
    };
    loadSession();
  }, []);

  // Get current player info from session
  const currentPlayer = room && session 
    ? room.players.find((p: any) => p.name === session.name) // Find by name since session ID might not match player ID
    : null;

  // Mutations
  const startGameMutation = api.room.startGame.useMutation({
    onMutate: () => {
      setGameStartStatus({
        status: 'starting',
        progress: 10,
        message: 'Validating game requirements...',
      });
    },
    onSuccess: () => {
      setGameStartStatus({
        status: 'assigning-roles',
        progress: 75,
        message: 'Assigning roles to players...',
      });
      
      // Simulate role assignment progress
      setTimeout(() => {
        setGameStartStatus({
          status: 'complete',
          progress: 100,
          message: 'Game started successfully!',
        });
        
        // Redirect to game after delay
        setTimeout(() => {
          router.push(`/room/${roomCode}/game`);
        }, 2000);
      }, 1500);
    },
    onError: (error) => {
      setGameStartStatus({
        status: 'error',
        progress: 0,
        message: 'Failed to start game',
        error: error.message,
      });
      
      // Reset status after delay
      setTimeout(() => {
        setGameStartStatus({
          status: 'idle',
          progress: 0,
          message: '',
        });
      }, 3000);
    },
  });

  const updatePlayerReadyMutation = api.room.updatePlayerReady.useMutation({
    onSuccess: () => {
      // No need to refetch - SSE will handle updates
    },
  });

  // Handle game start
  const handleStartGame = () => {
    if (!currentPlayer || !room) return;
    
    const hostPlayer = room.players.find((p: any) => p.isHost);
    if (!hostPlayer || hostPlayer.id !== currentPlayer.id) {
      return;
    }

    startGameMutation.mutate({
      roomId,
      hostId: currentPlayer.id,
    });
  };

  // Handle player ready toggle
  const handleToggleReady = () => {
    if (!currentPlayer || !room) return;
    
    const player = room.players.find((p: any) => p.id === currentPlayer.id);
    if (!player) return;

    updatePlayerReadyMutation.mutate({
      playerId: currentPlayer.id,
      isReady: !player.isReady,
    });
  };

  // Check if current player is host
  const isHost = room?.players.find((p: any) => p.id === currentPlayer?.id)?.isHost ?? false;

  // Convert game state players to PlayerReadyStatus format
  const playerReadyStatuses: PlayerReadyStatus[] = room?.players.map((player: any) => ({
    playerId: player.id,
    name: player.name,
    isHost: player.isHost,
    isReady: player.isReady,
  })) ?? [];

  // Get start requirements or use defaults
  const requirements = startRequirements?.requirements ?? [];
  const canStart = startRequirements?.canStart ?? false;
  const playerCount = startRequirements?.playerCount ?? 0;
  const minPlayers = startRequirements?.minPlayers ?? 5;
  
  // Calculate derived values
  const allPlayersReady = playerReadyStatuses.every(p => p.isReady);
  const settingsValid = requirements.find(r => r.id === 'valid-settings')?.status === 'satisfied';
  
  // Handle game phase changes via SSE
  useEffect(() => {
    if (gameState?.phase === 'roleReveal') {
      // Game has started, redirect to game page
      router.push(`/room/${roomCode}/game`);
    }
  }, [gameState?.phase, router, roomCode]);

  if (roomState.isLoading || !room) {
    return (
      <div className={`bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] rounded-2xl p-8 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-3 text-white">Loading game state...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#252547]/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-2">
          Game Setup
        </h3>
        <p className="text-slate-300">
          Complete the requirements below to begin your Avalon adventure
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <PreStartChecklist
          playerCount={playerCount}
          minPlayers={minPlayers}
          settingsValid={settingsValid}
          allPlayersReady={allPlayersReady}
          requirements={requirements}
        />
        
        <PlayerReadyList
          players={playerReadyStatuses}
          hostId={room.players.find((p: any) => p.isHost)?.id ?? ''}
        />
      </div>

      {/* Player Ready Toggle (for non-host players) */}
      {!isHost && currentPlayer && (
        <div className="mb-4 text-center">
          <button
            onClick={handleToggleReady}
            disabled={updatePlayerReadyMutation.isPending}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              room.players.find((p: any) => p.id === currentPlayer.id)?.isReady
                ? 'bg-[#22c55e] hover:bg-[#16a34a] text-white'
                : 'bg-[#f59e0b] hover:bg-[#d97706] text-white'
            } ${updatePlayerReadyMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {updatePlayerReadyMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Updating...</span>
              </div>
            ) : (
              room.players.find((p: any) => p.id === currentPlayer.id)?.isReady 
                ? 'Mark as Not Ready' 
                : 'Mark as Ready'
            )}
          </button>
        </div>
      )}

      <StartGameButton
        roomId={roomId}
        isHost={isHost}
        canStart={canStart}
        onStartGame={handleStartGame}
        isStarting={startGameMutation.isPending}
      />

      <GameStartStatus
        status={gameStartStatus}
      />
    </div>
  );
}
