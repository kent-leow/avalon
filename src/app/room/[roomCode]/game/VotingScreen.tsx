"use client";

import { useState, useEffect } from "react";
import { type VotingGameState, type VoteChoice } from "~/types/voting";
import { type MissionPlayer } from "~/types/mission";
import ProposedTeamPanel from "./ProposedTeamPanel";
import VotingInterface from "./VotingInterface";
import VotingProgressTracker from "./VotingProgressTracker";
import VotingResultsReveal from "./VotingResultsReveal";

interface VotingScreenProps {
  roomId: string;
  playerId: string;
  gameState: VotingGameState;
  proposedTeam: MissionPlayer[];
  missionRound: number;
  requiredPlayers: number;
  leaderName: string;
  onVoteSubmit: (choice: VoteChoice) => Promise<void>;
  onContinue: () => void;
}

export default function VotingScreen({
  roomId,
  playerId,
  gameState,
  proposedTeam,
  missionRound,
  requiredPlayers,
  leaderName,
  onVoteSubmit,
  onContinue,
}: VotingScreenProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Show results when voting is complete
  useEffect(() => {
    if (gameState.session.result && gameState.progress.percentage === 100) {
      setShowResults(true);
    }
  }, [gameState.session.result, gameState.progress.percentage]);

  const handleVoteSubmit = async (choice: VoteChoice) => {
    setIsSubmitting(true);
    try {
      await onVoteSubmit(choice);
    } catch (error) {
      console.error('Vote submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    setShowResults(false);
    onContinue();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Mission Vote
        </h1>
        <p className="text-slate-300 text-lg">
          Vote to approve or reject the proposed mission team
        </p>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Proposed team */}
        <ProposedTeamPanel
          proposedTeam={proposedTeam}
          missionRound={missionRound}
          requiredPlayers={requiredPlayers}
          leaderName={leaderName}
        />

        {/* Voting interface */}
        <div className="flex justify-center">
          <VotingInterface
            currentVote={gameState.currentPlayerVote}
            canChangeVote={gameState.canChangeVote}
            onVote={handleVoteSubmit}
            isSubmitting={isSubmitting}
            timeRemaining={gameState.timeRemaining}
          />
        </div>

        {/* Instructions */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a2e]/80 rounded-lg border border-slate-600/30">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-slate-300 text-sm">
              {gameState.currentPlayerVote 
                ? gameState.canChangeVote 
                  ? 'You can change your vote until the deadline' 
                  : 'Your vote has been locked in'
                : 'Select Approve or Reject to cast your vote'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Progress tracker */}
      <VotingProgressTracker
        progress={gameState.progress}
        rejectionTracker={gameState.rejectionTracker}
        timeRemaining={gameState.timeRemaining}
      />

      {/* Results reveal */}
      {showResults && gameState.session.result && (
        <VotingResultsReveal
          result={gameState.session.result}
          votes={gameState.session.votes}
          onContinue={handleContinue}
          rejectionCount={gameState.rejectionTracker.currentRejections}
        />
      )}
    </div>
  );
}
