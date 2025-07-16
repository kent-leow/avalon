"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { GameResultsScreen } from '~/components/features/game-results/GameResultsScreen';
import { api } from '~/trpc/react';
import type { GameResults } from '~/types/game-results';

interface GameResultsIntegrationProps {
  roomCode: string;
  gameId: string;
}

export const GameResultsIntegration: React.FC<GameResultsIntegrationProps> = ({
  roomCode,
  gameId,
}) => {
  const router = useRouter();
  
  // Fetch game results from the API
  const { data: gameResults, isLoading, error } = api.room.getGameResults.useQuery({
    roomCode,
    gameId,
  });

  // Mutations for actions
  const playAgainMutation = api.room.resetGame.useMutation({
    onSuccess: () => {
      router.push(`/room/${roomCode}`);
    },
    onError: (error) => {
      console.error('Failed to reset game:', error);
    },
  });

  const returnToLobbyMutation = api.room.returnToLobby.useMutation({
    onSuccess: () => {
      router.push(`/room/${roomCode}`);
    },
    onError: (error) => {
      console.error('Failed to return to lobby:', error);
    },
  });

  const handlePlayAgain = () => {
    playAgainMutation.mutate({ roomCode });
  };

  const handleReturnToLobby = () => {
    returnToLobbyMutation.mutate({ roomCode });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mb-4"></div>
          <p className="text-white text-lg">Loading game results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl font-bold mb-2">Error Loading Results</h2>
          <p className="text-gray-300 mb-4">
            {error.message || 'Failed to load game results'}
          </p>
          <button
            onClick={() => router.push(`/room/${roomCode}`)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Return to Room
          </button>
        </div>
      </div>
    );
  }

  if (!gameResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-400 text-6xl mb-4">🎮</div>
          <h2 className="text-white text-2xl font-bold mb-2">No Results Found</h2>
          <p className="text-gray-300 mb-4">
            Game results are not available yet.
          </p>
          <button
            onClick={() => router.push(`/room/${roomCode}`)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Return to Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <GameResultsScreen
      gameResults={gameResults}
      onPlayAgain={handlePlayAgain}
      onReturnToLobby={handleReturnToLobby}
    />
  );
};
