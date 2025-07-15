"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import VotingScreen from "./VotingScreen";
import { type VoteChoice } from "~/types/voting";

interface VotingScreenIntegrationProps {
  roomCode: string;
  playerId: string;
}

export default function VotingScreenIntegration({
  roomCode,
  playerId,
}: VotingScreenIntegrationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get room ID from room code
  const { data: roomData } = api.room.getRoomInfo.useQuery({
    roomCode,
  });

  // Get mission data
  const { data: missionData } = api.room.getMissionData.useQuery(
    {
      roomId: roomData?.id || "",
      playerId,
    },
    {
      enabled: !!roomData?.id,
    }
  );

  // Get voting state
  const { data: votingState, refetch: refetchVotingState } = api.room.getVotingState.useQuery(
    {
      roomId: roomData?.id || "",
      playerId,
    },
    {
      enabled: !!roomData?.id,
      refetchInterval: 2000, // Poll every 2 seconds
    }
  );

  // Submit vote mutation
  const submitVoteMutation = api.room.submitVote.useMutation({
    onSuccess: () => {
      // Refetch voting state to get updated data
      void refetchVotingState();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleVoteSubmit = async (choice: VoteChoice) => {
    if (!roomData?.id) return;

    setError(null);
    
    try {
      await submitVoteMutation.mutateAsync({
        roomId: roomData.id,
        playerId,
        choice,
      });
    } catch (error) {
      // Error is handled by onError callback
      console.error("Vote submission error:", error);
    }
  };

  const handleContinue = () => {
    // Navigate to next phase based on voting result
    if (votingState?.session.result?.nextPhase === 'mission') {
      // Navigate to mission phase
      window.location.href = `/room/${roomCode}/game/mission`;
    } else if (votingState?.session.result?.nextPhase === 'teamSelection') {
      // Navigate back to team selection
      window.location.href = `/room/${roomCode}/game/team-selection`;
    } else if (votingState?.session.result?.nextPhase === 'evilVictory') {
      // Navigate to game over
      window.location.href = `/room/${roomCode}/game/game-over`;
    }
  };

  useEffect(() => {
    if (roomData && missionData && votingState) {
      setIsLoading(false);
    }
  }, [roomData, missionData, votingState]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading voting session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-400 text-lg mb-2">Error Loading Voting Session</p>
          <p className="text-slate-300 text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              void refetchVotingState();
            }}
            className="mt-4 px-6 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!missionData || !votingState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">No voting session available</p>
        </div>
      </div>
    );
  }

  const gameState = {
    session: {
      ...votingState.session,
      proposedTeam: [], // TODO: Get from mission data
      startedAt: new Date(),
      deadline: new Date(Date.now() + votingState.timeRemaining * 1000),
      status: votingState.session.status as 'active' | 'completed' | 'expired',
    },
    progress: votingState.progress,
    rejectionTracker: votingState.rejectionTracker,
    currentPlayerVote: votingState.currentPlayerVote,
    canChangeVote: votingState.canChangeVote,
    timeRemaining: votingState.timeRemaining,
    isRevealing: votingState.isRevealing,
  };

  return (
    <div className="relative">
      {/* Loading overlay */}
      {submitVoteMutation.isPending && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Submitting vote...</p>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-400 hover:text-red-300 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <VotingScreen
        roomId={roomData?.id || ""}
        playerId={playerId}
        gameState={gameState}
        proposedTeam={missionData.players.slice(0, missionData.mission.requiredPlayers)} // Mock proposed team
        missionRound={missionData.mission.round}
        requiredPlayers={missionData.mission.requiredPlayers}
        leaderName={missionData.players.find(p => p.isLeader)?.name || "Unknown"}
        onVoteSubmit={handleVoteSubmit}
        onContinue={handleContinue}
      />
    </div>
  );
}
