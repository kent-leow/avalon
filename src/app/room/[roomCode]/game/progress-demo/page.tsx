'use client';

import { useState } from 'react';
import CurrentStatusBar from '../CurrentStatusBar';
import MissionProgressTrack from '../MissionProgressTrack';
import PlayerStatusPanel from '../PlayerStatusPanel';
import HistoricalDetails from '../HistoricalDetails';
import type { GameProgress, PlayerStatus, VoteHistoryEntry } from '~/types/game-progress';

export default function GameProgressDemo() {
  const [currentTab, setCurrentTab] = useState<'status' | 'progress' | 'players' | 'history'>('status');

  // Mock data for demonstration
  const mockGameProgress: GameProgress = {
    currentRound: 2,
    totalRounds: 5,
    currentPhase: {
      id: 'team_selection',
      name: 'Team Selection',
      description: 'Leader is selecting team members for the mission',
      status: 'active',
      estimatedDuration: 300000,
      startTime: new Date(Date.now() - 60000),
      progressPercentage: 75,
    },
    currentLeader: 'player1',
    missionResults: [
      {
        missionNumber: 1,
        outcome: 'success',
        teamMembers: ['player1', 'player2', 'player3'],
        votes: { success: 3, failure: 0 },
        failVotesRequired: 1,
        completedAt: new Date(Date.now() - 300000),
        leader: 'player1',
      },
      {
        missionNumber: 2,
        outcome: 'pending',
        teamMembers: ['player1', 'player4', 'player5'],
        votes: { success: 0, failure: 0 },
        failVotesRequired: 1,
        completedAt: undefined,
        leader: 'player2',
      },
    ],
    scoreTracker: {
      goodTeamWins: 1,
      evilTeamWins: 0,
      totalMissions: 5,
      isGameComplete: false,
    },
    playerStatuses: [
      {
        playerId: 'player1',
        playerName: 'Alice',
        isLeader: true,
        isOnline: true,
        currentActivity: {
          type: 'selecting-team',
          description: 'Selecting team members',
          progress: 75,
          timeRemaining: 120000,
          isBlocked: false,
        },
        lastSeen: new Date(),
        isCurrentPlayer: true,
      },
      {
        playerId: 'player2',
        playerName: 'Bob',
        isLeader: false,
        isOnline: true,
        currentActivity: {
          type: 'waiting',
          description: 'Waiting for team selection',
          isBlocked: false,
        },
        lastSeen: new Date(Date.now() - 30000),
        isCurrentPlayer: false,
      },
      {
        playerId: 'player3',
        playerName: 'Charlie',
        isLeader: false,
        isOnline: true,
        currentActivity: {
          type: 'waiting',
          description: 'Waiting for team selection',
          isBlocked: false,
        },
        lastSeen: new Date(Date.now() - 60000),
        isCurrentPlayer: false,
      },
      {
        playerId: 'player4',
        playerName: 'Diana',
        isLeader: false,
        isOnline: false,
        currentActivity: {
          type: 'idle',
          description: 'Offline',
          isBlocked: true,
        },
        lastSeen: new Date(Date.now() - 120000),
        isCurrentPlayer: false,
      },
      {
        playerId: 'player5',
        playerName: 'Eve',
        isLeader: false,
        isOnline: true,
        currentActivity: {
          type: 'waiting',
          description: 'Waiting for team selection',
          isBlocked: false,
        },
        lastSeen: new Date(Date.now() - 15000),
        isCurrentPlayer: false,
      },
    ],
    gameTimer: {
      totalTime: 300000,
      remainingTime: 180000,
      isActive: true,
      warningThreshold: 60000,
      urgentThreshold: 30000,
      label: 'Team Selection',
    },
    phaseHistory: [
      {
        phase: 'Game Start',
        timestamp: new Date(Date.now() - 600000),
        duration: 60000,
        outcome: 'completed',
        participants: ['player1', 'player2', 'player3', 'player4', 'player5'],
        details: { roles: 'assigned' },
      },
      {
        phase: 'Team Selection',
        timestamp: new Date(Date.now() - 540000),
        duration: 120000,
        outcome: 'completed',
        participants: ['player1'],
        details: { selectedTeam: ['player1', 'player2', 'player3'] },
      },
      {
        phase: 'Team Voting',
        timestamp: new Date(Date.now() - 420000),
        duration: 90000,
        outcome: 'approved',
        participants: ['player1', 'player2', 'player3', 'player4', 'player5'],
        details: { votes: { approve: 4, reject: 1 } },
      },
      {
        phase: 'Mission Execution',
        timestamp: new Date(Date.now() - 330000),
        duration: 60000,
        outcome: 'success',
        participants: ['player1', 'player2', 'player3'],
        details: { missionVotes: { success: 3, failure: 0 } },
      },
    ],
  };

  const mockVoteHistory: VoteHistoryEntry[] = [
    {
      round: 1,
      voteType: 'team-proposal',
      timestamp: new Date(Date.now() - 420000),
      result: 'approved',
      votes: [
        { playerId: 'player1', playerName: 'Alice', vote: 'approve', isRevealed: true },
        { playerId: 'player2', playerName: 'Bob', vote: 'approve', isRevealed: true },
        { playerId: 'player3', playerName: 'Charlie', vote: 'approve', isRevealed: true },
        { playerId: 'player4', playerName: 'Diana', vote: 'approve', isRevealed: true },
        { playerId: 'player5', playerName: 'Eve', vote: 'reject', isRevealed: true },
      ],
      proposedTeam: ['player1', 'player2', 'player3'],
    },
    {
      round: 1,
      voteType: 'mission-outcome',
      timestamp: new Date(Date.now() - 330000),
      result: 'success',
      votes: [
        { playerId: 'player1', playerName: 'Alice', vote: 'success', isRevealed: false },
        { playerId: 'player2', playerName: 'Bob', vote: 'success', isRevealed: false },
        { playerId: 'player3', playerName: 'Charlie', vote: 'success', isRevealed: false },
      ],
    },
  ];

  const tabs = [
    { id: 'status', label: 'Current Status', icon: '📊' },
    { id: 'progress', label: 'Mission Progress', icon: '🎯' },
    { id: 'players', label: 'Player Status', icon: '👥' },
    { id: 'history', label: 'Game History', icon: '📋' },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      {/* Header */}
      <div className="bg-[#16213e] border-b border-[#3b4171]/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Game Progress Demo</h1>
              <p className="text-gray-400 mt-1">Feature 9: Track Game Progress</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                Round {mockGameProgress.currentRound} of {mockGameProgress.totalRounds}
              </div>
              <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-sm">
                {mockGameProgress.currentPhase.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-[#252547] border-b border-[#3b4171]/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors ${
                  currentTab === tab.id
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {currentTab === 'status' && (
          <div className="space-y-6">
            <CurrentStatusBar 
              progress={mockGameProgress} 
              className="mb-6"
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MissionProgressTrack 
                  missionResults={mockGameProgress.missionResults}
                  scoreTracker={mockGameProgress.scoreTracker}
                  currentRound={mockGameProgress.currentRound}
                />
              </div>
              <div>
                <PlayerStatusPanel 
                  gameProgress={mockGameProgress}
                  playerStatuses={mockGameProgress.playerStatuses}
                  currentPlayerId="player1"
                />
              </div>
            </div>
          </div>
        )}

        {currentTab === 'progress' && (
          <MissionProgressTrack 
            missionResults={mockGameProgress.missionResults}
            scoreTracker={mockGameProgress.scoreTracker}
            currentRound={mockGameProgress.currentRound}
          />
        )}

        {currentTab === 'players' && (
          <PlayerStatusPanel 
            gameProgress={mockGameProgress}
            playerStatuses={mockGameProgress.playerStatuses}
            currentPlayerId="player1"
          />
        )}

        {currentTab === 'history' && (
          <HistoricalDetails 
            gameProgress={mockGameProgress}
            voteHistory={mockVoteHistory}
          />
        )}
      </div>

      {/* Footer */}
      <div className="bg-[#16213e] border-t border-[#3b4171]/30 p-6 mt-12">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p className="text-sm">
            Feature 9 Demo: Real-time game progress tracking with mission timeline, player status, and historical analysis
          </p>
        </div>
      </div>
    </div>
  );
}
