"use client";

import { useState } from 'react';
import MissionExecutionScreen from './MissionExecutionScreen';
import { createMissionVoteOptions, createMissionContext, createMissionTeamMembers, calculateVotingProgress, calculateMissionResult } from '~/lib/mission-execution-utils';
import type { MissionExecutionState, MissionResult, MissionVotingSession } from '~/types/mission-execution';

const DEMO_SCENARIOS = [
  {
    name: 'Standard Mission - Good Player',
    playerRole: 'good' as const,
    missionNumber: 2,
    playerCount: 6,
    currentWins: { good: 1, evil: 0 },
    teamMembers: ['player1', 'player2', 'player3'],
    currentPlayerId: 'player1',
    playerNames: {
      player1: 'You',
      player2: 'Alice',
      player3: 'Bob'
    }
  },
  {
    name: 'Standard Mission - Evil Player',
    playerRole: 'evil' as const,
    missionNumber: 3,
    playerCount: 7,
    currentWins: { good: 1, evil: 1 },
    teamMembers: ['player1', 'player2', 'player3', 'player4'],
    currentPlayerId: 'player1',
    playerNames: {
      player1: 'You',
      player2: 'Carol',
      player3: 'Dave',
      player4: 'Eve'
    }
  },
  {
    name: 'Critical Mission 4 - Two Fails Required',
    playerRole: 'evil' as const,
    missionNumber: 4,
    playerCount: 8,
    currentWins: { good: 2, evil: 1 },
    teamMembers: ['player1', 'player2', 'player3', 'player4', 'player5'],
    currentPlayerId: 'player1',
    playerNames: {
      player1: 'You',
      player2: 'Frank',
      player3: 'Grace',
      player4: 'Henry',
      player5: 'Ivy'
    }
  },
  {
    name: 'Final Mission - Game Deciding',
    playerRole: 'good' as const,
    missionNumber: 5,
    playerCount: 7,
    currentWins: { good: 2, evil: 2 },
    teamMembers: ['player1', 'player2', 'player3'],
    currentPlayerId: 'player1',
    playerNames: {
      player1: 'You',
      player2: 'Jack',
      player3: 'Kate'
    }
  }
];

export default function MissionExecutionDemo() {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedPlayers, setVotedPlayers] = useState<string[]>([]);
  const [missionResult, setMissionResult] = useState<MissionResult | undefined>();
  const [showResults, setShowResults] = useState(false);

  const currentScenario = DEMO_SCENARIOS[selectedScenario]!;

  const createExecutionState = (): MissionExecutionState => {
    const voteOptions = createMissionVoteOptions(currentScenario.playerRole);
    const missionContext = createMissionContext(
      currentScenario.missionNumber,
      currentScenario.playerCount,
      currentScenario.currentWins
    );
    const teamMembers = createMissionTeamMembers(
      currentScenario.teamMembers,
      currentScenario.playerNames as Record<string, string>,
      votedPlayers,
      currentScenario.currentPlayerId
    );
    const votingProgress = calculateVotingProgress(
      votedPlayers.length,
      currentScenario.teamMembers.length
    );

    return {
      canVote: !hasVoted,
      hasVoted,
      isWaiting: hasVoted && !votingProgress.isComplete,
      showResults,
      playerRole: currentScenario.playerRole,
      voteOptions,
      teamMembers,
      missionContext,
      votingProgress
    };
  };

  const handleVote = (vote: 'success' | 'failure') => {
    setHasVoted(true);
    setVotedPlayers([...votedPlayers, currentScenario.currentPlayerId]);
    
    // Simulate other players voting after a delay
    setTimeout(() => {
      const remainingPlayers = currentScenario.teamMembers.filter(
        id => id !== currentScenario.currentPlayerId
      );
      setVotedPlayers([...votedPlayers, currentScenario.currentPlayerId, ...remainingPlayers]);
      
      // Calculate and show results
      setTimeout(() => {
        const mockSession: MissionVotingSession = {
          missionNumber: currentScenario.missionNumber,
          teamMembers: currentScenario.teamMembers,
          votes: [
            { playerId: currentScenario.currentPlayerId, vote, timestamp: new Date() },
            ...remainingPlayers.map(id => ({
              playerId: id,
              vote: (Math.random() > 0.7 ? 'failure' : 'success') as "success" | "failure",
              timestamp: new Date()
            }))
          ],
          isComplete: true,
          failVotesRequired: currentScenario.missionNumber === 4 && currentScenario.playerCount >= 7 ? 2 : 1,
          failVotesReceived: 0,
          successVotesReceived: 0,
          startTime: new Date()
        };
        
        const result = calculateMissionResult(mockSession, {
          goodWins: currentScenario.currentWins.good,
          evilWins: currentScenario.currentWins.evil
        });
        setMissionResult(result);
        setShowResults(true);
      }, 1500);
    }, 2000);
  };

  const handleResultsComplete = () => {
    setShowResults(false);
    setMissionResult(undefined);
  };

  const resetScenario = () => {
    setHasVoted(false);
    setVotedPlayers([]);
    setMissionResult(undefined);
    setShowResults(false);
  };

  const executionState = createExecutionState();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547]">
      {/* Demo Controls */}
      <div className="bg-black/20 border-b border-gray-600/30 p-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">Mission Execution Demo</h2>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-gray-300 font-medium">Scenario:</label>
              <select
                value={selectedScenario}
                onChange={(e) => {
                  setSelectedScenario(Number(e.target.value));
                  resetScenario();
                }}
                className="bg-[#252547] border border-gray-600 rounded px-3 py-1 text-white"
              >
                {DEMO_SCENARIOS.map((scenario, index) => (
                  <option key={index} value={index}>
                    {scenario.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={resetScenario}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Reset Demo
            </button>
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
