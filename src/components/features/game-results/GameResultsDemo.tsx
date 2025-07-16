import React from 'react';
import { GameResultsScreen } from '~/components/features/game-results/GameResultsScreen';
import type { GameResults } from '~/types/game-results';

const mockGameResults: GameResults = {
  outcome: {
    winner: 'good',
    winCondition: 'three-missions-good',
    description: 'The forces of good have triumphed! Three missions were completed successfully.',
    keyMoments: [
      {
        type: 'mission-success',
        timestamp: new Date('2024-01-01T10:30:00'),
        description: 'Mission 1 succeeded with unanimous approval',
        impact: 'high',
        playersInvolved: ['alice', 'bob', 'charlie'],
      },
      {
        type: 'assassin-attempt',
        timestamp: new Date('2024-01-01T11:15:00'),
        description: 'Assassin failed to identify Merlin',
        impact: 'critical',
        playersInvolved: ['eve', 'alice'],
      },
    ],
    margin: 'close',
    finalScore: {
      goodPoints: 3,
      evilPoints: 1,
      bonusPoints: { alice: 5, bob: 3 },
      breakdown: {
        missionPoints: 3,
        rolePoints: 2,
        votingPoints: 1,
        bonusPoints: 8,
      },
    },
  },
  playerRoles: [
    {
      playerId: 'alice',
      playerName: 'Alice',
      avatar: '👑',
      role: 'merlin',
      team: 'good',
      description: 'The wise wizard who knows the identities of evil players',
      roleData: {
        knowledgeGained: ['Identified Mordred', 'Suspected Morgana'],
        abilitiesUsed: ['Divine Insight', 'Team Guidance'],
      },
      rolePerformance: {
        effectiveness: 85,
        metrics: { guidance: 9, deception: 7 },
        achievements: ['Guided team to victory', 'Avoided assassination'],
        mistakes: ['Revealed knowledge too early'],
      },
      survivalStatus: 'alive',
      performance: 'excellent',
    },
    {
      playerId: 'bob',
      playerName: 'Bob',
      avatar: '🛡️',
      role: 'percival',
      team: 'good',
      description: 'The noble knight who can see Merlin and Morgana',
      roleData: {
        knowledgeGained: ['Identified Merlin', 'Confused by Morgana'],
        abilitiesUsed: ['Merlin Protection', 'Strategic Voting'],
      },
      rolePerformance: {
        effectiveness: 78,
        metrics: { protection: 8, voting: 7 },
        achievements: ['Protected Merlin identity', 'Strategic voting'],
        mistakes: ['Confused by Morgana'],
      },
      survivalStatus: 'alive',
      performance: 'good',
    },
    {
      playerId: 'charlie',
      playerName: 'Charlie',
      avatar: '⚔️',
      role: 'loyal-servant',
      team: 'good',
      description: 'A loyal servant of Arthur, fighting for good',
      roleData: {
        knowledgeGained: ['Trusted team members', 'Identified suspicious behavior'],
        abilitiesUsed: ['Team Support', 'Mission Participation'],
      },
      rolePerformance: {
        effectiveness: 72,
        metrics: { teamwork: 8, missions: 7 },
        achievements: ['Successful mission participation', 'Team support'],
        mistakes: ['Trusted wrong player'],
      },
      survivalStatus: 'alive',
      performance: 'good',
    },
    {
      playerId: 'david',
      playerName: 'David',
      avatar: '🗡️',
      role: 'mordred',
      team: 'evil',
      description: 'The hidden evil, unknown to Merlin',
      roleData: {
        knowledgeGained: ['Identified team members', 'Suspected Merlin'],
        abilitiesUsed: ['Stealth', 'Deception'],
      },
      rolePerformance: {
        effectiveness: 65,
        metrics: { deception: 7, stealth: 8 },
        achievements: ['Remained hidden from Merlin', 'Sabotaged one mission'],
        mistakes: ['Failed to convince team'],
      },
      survivalStatus: 'alive',
      performance: 'average',
    },
    {
      playerId: 'eve',
      playerName: 'Eve',
      avatar: '🔮',
      role: 'assassin',
      team: 'evil',
      description: 'The deadly assassin who can eliminate Merlin',
      roleData: {
        knowledgeGained: ['Observed player behavior', 'Analyzed voting patterns'],
        abilitiesUsed: ['Assassination Attempt', 'Strategic Deception'],
      },
      rolePerformance: {
        effectiveness: 45,
        metrics: { assassination: 3, deception: 6 },
        achievements: ['Successfully identified as threat', 'Strategic voting'],
        mistakes: ['Failed to identify Merlin', 'Poor deception'],
      },
      survivalStatus: 'alive',
      performance: 'poor',
    },
  ],
  gameSummary: {
    duration: 1240, // 20 minutes 40 seconds
    totalRounds: 12,
    missionResults: [
      {
        missionNumber: 1,
        outcome: 'success',
        teamMembers: ['alice', 'bob', 'charlie'],
        votes: [
          { playerId: 'alice', vote: 'success' },
          { playerId: 'bob', vote: 'success' },
          { playerId: 'charlie', vote: 'success' },
        ],
        analysis: {
          difficulty: 3,
          strategicImportance: 7,
          keyDecisions: ['Team selection', 'Vote coordination'],
          alternativeOutcomes: ['Could have failed if Eve was selected'],
        },
      },
      {
        missionNumber: 2,
        outcome: 'success',
        teamMembers: ['alice', 'david', 'charlie'],
        votes: [
          { playerId: 'alice', vote: 'success' },
          { playerId: 'david', vote: 'failure' },
          { playerId: 'charlie', vote: 'success' },
        ],
        analysis: {
          difficulty: 6,
          strategicImportance: 8,
          keyDecisions: ['Including David', 'Mission voting'],
          alternativeOutcomes: ['David could have sabotaged more effectively'],
        },
      },
      {
        missionNumber: 3,
        outcome: 'success',
        teamMembers: ['bob', 'charlie', 'alice'],
        votes: [
          { playerId: 'bob', vote: 'success' },
          { playerId: 'charlie', vote: 'success' },
          { playerId: 'alice', vote: 'success' },
        ],
        analysis: {
          difficulty: 4,
          strategicImportance: 9,
          keyDecisions: ['Final mission team', 'Winning strategy'],
          alternativeOutcomes: ['Evil team could have forced different composition'],
        },
      },
    ],
    voteRounds: [
      {
        round: 1,
        missionNumber: 1,
        result: 'approved',
        rejectionCount: 0,
        voteDetails: [
          { playerId: 'alice', playerName: 'Alice', vote: 'approve', timing: 5 },
          { playerId: 'bob', playerName: 'Bob', vote: 'approve', timing: 7 },
          { playerId: 'charlie', playerName: 'Charlie', vote: 'approve', timing: 4 },
          { playerId: 'david', playerName: 'David', vote: 'approve', timing: 8 },
          { playerId: 'eve', playerName: 'Eve', vote: 'reject', timing: 12 },
        ],
      },
    ],
    assassinAttempt: {
      assassin: 'eve',
      target: 'bob',
      wasCorrect: false,
      decisionTime: 45,
      finalOutcome: 'good-wins',
    },
    criticalEvents: [
      {
        type: 'mission-success',
        timestamp: new Date('2024-01-01T10:30:00'),
        description: 'First mission succeeded',
        impact: 'Built good team confidence',
        playersAffected: ['alice', 'bob', 'charlie'],
      },
    ],
    phaseTimeline: [
      {
        phase: 'Role Assignment',
        startTime: new Date('2024-01-01T10:00:00'),
        duration: 30,
        description: 'Players received their roles',
        keyEvents: ['Roles distributed', 'Knowledge phase completed'],
      },
    ],
  },
  voteHistory: [
    {
      round: 1,
      missionNumber: 1,
      proposedTeam: ['alice', 'bob', 'charlie'],
      leader: 'alice',
      result: 'approved',
      votes: [
        { playerId: 'alice', playerName: 'Alice', vote: 'approve', timing: 5 },
        { playerId: 'bob', playerName: 'Bob', vote: 'approve', timing: 7 },
        { playerId: 'charlie', playerName: 'Charlie', vote: 'approve', timing: 4 },
        { playerId: 'david', playerName: 'David', vote: 'approve', timing: 8 },
        { playerId: 'eve', playerName: 'Eve', vote: 'reject', timing: 12 },
      ],
      analysis: {
        distribution: { approve: 4, reject: 1 },
        keyInfluencers: ['alice'],
        surprisingVotes: ['eve'],
        patterns: ['Evil team resistance'],
      },
      consequences: ['Mission proceeded with good team'],
    },
  ],
  teamCompositions: [],
  statistics: {
    overall: {
      totalVotes: 15,
      totalMissions: 3,
      averageMissionDuration: 180,
      approvalRate: 0.73,
      missionSuccessRate: 1.0,
    },
    teamPerformance: {
      goodTeam: {
        size: 3,
        winRate: 1.0,
        averagePerformance: 0.85,
        strengths: ['Coordination', 'Trust'],
        weaknesses: ['Susceptible to deception'],
      },
      evilTeam: {
        size: 2,
        winRate: 0.0,
        averagePerformance: 0.55,
        strengths: ['Initial deception'],
        weaknesses: ['Poor coordination', 'Failed assassination'],
      },
      comparison: {
        performanceDifference: 0.3,
        strategyComparison: 'Good team had better coordination',
        keyDifferentiators: ['Merlin guidance', 'Failed assassination'],
      },
    },
    votingStats: {
      totalRounds: 12,
      averageVotesPerRound: 5,
      rejectionRate: 0.27,
      patterns: [],
    },
    missionStats: {
      successRate: 1.0,
      averageTeamSize: 3,
      mostSuccessfulPlayers: ['alice', 'bob', 'charlie'],
      difficultyRatings: [3, 6, 4],
    },
    deceptionMetrics: {
      successfulDeceptions: 2,
      failedDeceptions: 4,
      deceptionSuccessRate: 0.33,
      topDeceivers: ['david'],
    },
    strategicInsights: [],
  },
  playerPerformance: [],
  achievements: [],
  gameMetadata: {
    gameId: 'game-123',
    roomCode: 'DEMO',
    startTime: new Date('2024-01-01T10:00:00'),
    endTime: new Date('2024-01-01T10:20:40'),
    playerCount: 5,
    settings: {
      characters: ['merlin', 'percival', 'loyal-servant', 'mordred', 'assassin'],
      playerCount: 5,
      timeLimit: 300,
    },
    version: '1.0.0',
    shareToken: 'share-123',
  },
};

export const GameResultsDemo: React.FC = () => {
  const handlePlayAgain = () => {
    console.log('Play again clicked');
  };

  const handleReturnToLobby = () => {
    console.log('Return to lobby clicked');
  };

  return (
    <GameResultsScreen
      gameResults={mockGameResults}
      onPlayAgain={handlePlayAgain}
      onReturnToLobby={handleReturnToLobby}
    />
  );
};
