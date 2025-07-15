import { useState } from 'react';
import MissionContextPanel from './MissionContextPanel';
import MissionVotingInterface from './MissionVotingInterface';
import MissionTeamStatus from './MissionTeamStatus';
import MissionResultsReveal from './MissionResultsReveal';
import type { MissionExecutionState, MissionResult } from '~/types/mission-execution';

interface MissionExecutionScreenProps {
  executionState: MissionExecutionState;
  onVote: (vote: 'success' | 'failure') => void;
  onResultsComplete: () => void;
  missionResult?: MissionResult;
  className?: string;
}

export default function MissionExecutionScreen({
  executionState,
  onVote,
  onResultsComplete,
  missionResult,
  className = ''
}: MissionExecutionScreenProps) {
  const [showResults, setShowResults] = useState(false);

  const handleVote = (vote: 'success' | 'failure') => {
    onVote(vote);
  };

  const handleResultsComplete = () => {
    setShowResults(false);
    onResultsComplete();
  };

  // Show results overlay if mission result is available
  if (missionResult && (executionState.showResults || showResults)) {
    return (
      <MissionResultsReveal
        result={missionResult}
        onComplete={handleResultsComplete}
        className={className}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] p-4 ${className}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Mission Execution
          </h1>
          <p className="text-gray-400">
            Team members must now vote on the mission outcome
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mission Context */}
          <div className="lg:col-span-1">
            <MissionContextPanel 
              context={executionState.missionContext}
              className="h-fit"
            />
          </div>

          {/* Voting Interface */}
          <div className="lg:col-span-1">
            <MissionVotingInterface
              voteOptions={executionState.voteOptions}
              onVote={handleVote}
              hasVoted={executionState.hasVoted}
              canVote={executionState.canVote}
              playerRole={executionState.playerRole}
              className="h-fit"
            />
          </div>

          {/* Team Status */}
          <div className="lg:col-span-1">
            <MissionTeamStatus
              teamMembers={executionState.teamMembers}
              votingProgress={executionState.votingProgress}
              className="h-fit"
            />
          </div>
        </div>

        {/* Waiting State */}
        {executionState.isWaiting && (
          <div className="mt-8 text-center">
            <div className="bg-[#252547]/90 backdrop-blur-sm border border-[#3b4171]/30 rounded-lg p-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-8 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
                <span className="text-white font-medium">Processing mission results...</span>
              </div>
              <p className="text-gray-400">
                The fate of the mission is being determined...
              </p>
            </div>
          </div>
        )}

        {/* Game Progress Indicator */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/20 border border-gray-600/30 rounded-full">
            <span className="text-lg">⚔️</span>
            <span className="text-gray-300 font-medium">
              Mission {executionState.missionContext.missionNumber} of {executionState.missionContext.totalMissions}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
