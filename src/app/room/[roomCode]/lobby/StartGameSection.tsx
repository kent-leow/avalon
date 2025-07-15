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

interface StartGameSectionProps {
  roomId: string;
  roomCode: string;
  className?: string;
}

export default function StartGameSection({
  roomId,
  roomCode,
  className = "",
}: StartGameSectionProps) {
  const router = useRouter();
  const session = getSession();
  
  const [gameStartStatus, setGameStartStatus] = useState<GameStartStatusType>({
    status: 'idle',
    progress: 0,
    message: '',
  });

  // Queries
  const { data: gameState, refetch: refetchGameState } = api.room.getGameState.useQuery(
    { roomId },
    {
      refetchInterval: 2000, // Poll every 2 seconds for real-time updates
      enabled: !!roomId,
    }
  );

  const { data: startRequirements, refetch: refetchStartRequirements } = api.room.checkStartRequirements.useQuery(
    { roomId },
    {
      refetchInterval: 2000, // Poll every 2 seconds for real-time updates
      enabled: !!roomId,
    }
  );

  // Get current player info from session
  const currentPlayer = gameState && session 
    ? gameState.players.find(p => p.name === session.name) // Find by name since session ID might not match player ID
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
      // Refetch data to update UI
      refetchGameState();
      refetchStartRequirements();
    },
  });

  // Handle game start
  const handleStartGame = () => {
    if (!currentPlayer || !gameState) return;
    
    const hostPlayer = gameState.players.find(p => p.isHost);
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
    if (!currentPlayer || !gameState) return;
    
    const player = gameState.players.find(p => p.id === currentPlayer.id);
    if (!player) return;

    updatePlayerReadyMutation.mutate({
      playerId: currentPlayer.id,
      isReady: !player.isReady,
    });
  };

  // Check if current player is host
  const isHost = gameState?.players.find(p => p.id === currentPlayer?.id)?.isHost ?? false;

  // Convert game state players to PlayerReadyStatus format
  const playerReadyStatuses: PlayerReadyStatus[] = gameState?.players.map(player => ({
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
  
  // Handle game phase changes
  useEffect(() => {
    if (gameState?.phase === 'roleReveal') {
      // Game has started, redirect to game page
      router.push(`/room/${roomCode}/game`);
    }
  }, [gameState?.phase, router, roomCode]);

  if (!gameState) {
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
    <div className={`bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] rounded-2xl p-8 ${className}`}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-2">
          Start Game
        </h2>
        <p className="text-slate-300 text-lg">
          Complete the requirements below to begin your Avalon adventure
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PreStartChecklist
          playerCount={playerCount}
          minPlayers={minPlayers}
          settingsValid={settingsValid}
          allPlayersReady={allPlayersReady}
          requirements={requirements}
        />
        
        <PlayerReadyList
          players={playerReadyStatuses}
          hostId={gameState.players.find(p => p.isHost)?.id ?? ''}
        />
      </div>

      {/* Player Ready Toggle (for non-host players) */}
      {!isHost && currentPlayer && (
        <div className="mb-6 text-center">
          <button
            onClick={handleToggleReady}
            disabled={updatePlayerReadyMutation.isPending}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              gameState.players.find(p => p.id === currentPlayer.id)?.isReady
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
              gameState.players.find(p => p.id === currentPlayer.id)?.isReady 
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
