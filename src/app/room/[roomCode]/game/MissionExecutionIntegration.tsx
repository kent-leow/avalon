"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '~/trpc/react';
import MissionExecutionScreen from './MissionExecutionScreen';
import { createMissionVoteOptions, createMissionContext, createMissionTeamMembers, calculateVotingProgress } from '~/lib/mission-execution-utils';
import type { MissionExecutionState, MissionResult } from '~/types/mission-execution';

const MOCK_PLAYER_ID = 'integration-player-1';

export default function MissionExecutionIntegration() {
  const params = useParams();
  const roomCode = params.roomCode as string;
  const [roomId, setRoomId] = useState<string | null>(null);
  const [missionResult, setMissionResult] = useState<MissionResult | undefined>();

  // Get room info
  const { data: room } = api.room.getRoomInfo.useQuery(
    { roomCode },
    { 
      enabled: !!roomCode
    }
  );

  useEffect(() => {
    if (room) {
      setRoomId(room.id);
    }
  }, [room]);

  // Get mission execution state
  const { data: executionData, refetch: refetchExecution } = api.room.getMissionExecutionState.useQuery(
    { roomId: roomCode, playerId: MOCK_PLAYER_ID },
    { 
      enabled: !!roomCode,
      refetchInterval: 2000
    }
  );

  // Submit mission vote mutation
  const submitVoteMutation = api.room.submitMissionVote.useMutation({
    onSuccess: (data) => {
      if (data.result) {
        // Create mission result for display
        const result: MissionResult = {
          outcome: data.result.outcome as 'success' | 'failure',
          votes: data.result.votes,
          failVotesRequired: data.result.failVotesRequired,
          gameImpact: {
            goodTeamWins: data.result.outcome === 'success' ? 1 : 0,
            evilTeamWins: data.result.outcome === 'failure' ? 1 : 0,
            isGameOver: false,
            nextPhase: 'mission-selection'
          },
          animations: [
            { type: 'vote-reveal', delay: 1000, duration: 2000, intensity: 'normal' },
            { type: 'calculation', delay: 2000, duration: 2000, intensity: 'normal' },
            { type: 'outcome', delay: 3000, duration: 1500, intensity: 'dramatic' },
            { type: 'impact', delay: 4000, duration: 1000, intensity: 'normal' }
          ]
        };
        setMissionResult(result);
      }
      refetchExecution();
    },
    onError: (error) => {
      console.error('Failed to submit mission vote:', error);
    }
  });

  const createExecutionState = (): MissionExecutionState | null => {
    if (!executionData) return null;

    const voteOptions = createMissionVoteOptions(executionData.playerRole as 'good' | 'evil');
    const missionContext = createMissionContext(
      executionData.missionNumber,
      executionData.playerCount,
      executionData.gameWins
    );
    const teamMembers = createMissionTeamMembers(
      executionData.teamMembers.map(tm => tm.playerId),
      executionData.teamMembers.reduce((acc, tm) => {
        acc[tm.playerId] = tm.playerName;
        return acc;
      }, {} as Record<string, string>),
      executionData.teamMembers.filter(tm => tm.hasVoted).map(tm => tm.playerId),
      MOCK_PLAYER_ID
    );

    return {
      canVote: executionData.canVote,
      hasVoted: executionData.hasVoted,
      isWaiting: executionData.isWaiting,
      showResults: executionData.showResults,
      playerRole: executionData.playerRole as 'good' | 'evil',
      voteOptions,
      teamMembers,
      missionContext,
      votingProgress: executionData.votingProgress
    };
  };

  const handleVote = (vote: 'success' | 'failure') => {
    if (!roomId) return;
    
    submitVoteMutation.mutate({
      roomId,
      playerId: MOCK_PLAYER_ID,
      vote
    });
  };

  const handleResultsComplete = () => {
    setMissionResult(undefined);
    refetchExecution();
  };

  // Loading state
  if (!room || !executionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading mission execution...</p>
        </div>
      </div>
    );
  }

  // Error state - simplified since room phase is not easily accessible
  if (!executionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Mission Not Available</h2>
          <p className="text-gray-400">
            Mission execution is not currently available.
          </p>
        </div>
      </div>
    );
  }

  const executionState = createExecutionState();
  
  if (!executionState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Unable to Load Mission</h2>
          <p className="text-gray-400">
            Failed to load mission execution state.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547]">
      {/* Integration Header */}
      <div className="bg-green-500/20 border-b border-green-500/30 p-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">
            🔌 Mission Execution Integration
          </h2>
          <p className="text-green-300">
            Connected to room <span className="font-mono bg-black/20 px-2 py-1 rounded">{roomCode}</span>
          </p>
          <div className="mt-2 flex items-center gap-4 text-sm">
            <span className="text-gray-300">
              Room ID: <span className="font-mono">{roomId}</span>
            </span>
            <span className="text-gray-300">
              Player: <span className="font-mono">{MOCK_PLAYER_ID}</span>
            </span>
            <span className="text-gray-300">
              Mission: <span className="font-mono">{executionData.missionNumber}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Mission Execution Interface */}
      <MissionExecutionScreen
        executionState={executionState}
        onVote={handleVote}
        onResultsComplete={handleResultsComplete}
        missionResult={missionResult}
      />
    </div>
  );
}
