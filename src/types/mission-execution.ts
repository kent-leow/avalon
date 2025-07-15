// Mission execution types for the Avalon game
export interface MissionVote {
  playerId: string;
  vote: 'success' | 'failure';
  timestamp: Date;
}

export interface MissionVotingSession {
  missionNumber: number;
  teamMembers: string[];
  votes: MissionVote[];
  isComplete: boolean;
  result?: 'success' | 'failure';
  failVotesRequired: number;
  failVotesReceived: number;
  successVotesReceived: number;
  startTime: Date;
  endTime?: Date;
}

export interface MissionExecutionState {
  canVote: boolean;
  hasVoted: boolean;
  isWaiting: boolean;
  showResults: boolean;
  playerRole: 'good' | 'evil';
  voteOptions: MissionVoteOption[];
  teamMembers: MissionTeamMember[];
  missionContext: MissionContext;
  votingProgress: VotingProgress;
}

export interface MissionVoteOption {
  value: 'success' | 'failure';
  label: string;
  description: string;
  available: boolean;
  style: 'success' | 'failure';
  icon: string;
}

export interface MissionTeamMember {
  playerId: string;
  playerName: string;
  hasVoted: boolean;
  role?: 'good' | 'evil';
  isCurrentPlayer: boolean;
}

export interface MissionContext {
  missionNumber: number;
  totalMissions: number;
  requiresTwoFails: boolean;
  failVotesRequired: number;
  missionDescription: string;
  consequenceDescription: string;
  stakes: 'low' | 'medium' | 'high' | 'critical';
}

export interface VotingProgress {
  votesSubmitted: number;
  totalVotes: number;
  percentageComplete: number;
  timeRemaining?: number;
  isComplete: boolean;
}

export interface MissionResult {
  outcome: 'success' | 'failure';
  votes: {
    success: number;
    failure: number;
  };
  failVotesRequired: number;
  gameImpact: GameImpact;
  animations: ResultAnimation[];
}

export interface GameImpact {
  goodTeamWins: number;
  evilTeamWins: number;
  isGameOver: boolean;
  winner?: 'good' | 'evil';
  nextPhase: 'mission-selection' | 'assassin-attempt' | 'game-over';
}

export interface ResultAnimation {
  type: 'vote-reveal' | 'calculation' | 'outcome' | 'impact';
  delay: number;
  duration: number;
  intensity: 'subtle' | 'normal' | 'dramatic' | 'explosive';
}

export interface MissionExecutionError {
  type: 'invalid-vote' | 'not-authorized' | 'already-voted' | 'mission-ended';
  message: string;
  retryable: boolean;
}

// Mission execution configuration constants
export const MISSION_EXECUTION_CONFIG = {
  VOTE_TIMEOUT: 60000, // 1 minute
  REVEAL_DELAYS: {
    VOTE_REVEAL: 1000,
    CALCULATION: 2000,
    OUTCOME: 3000,
    IMPACT: 4000
  },
  ANIMATION_DURATIONS: {
    VOTE_SUBMISSION: 500,
    RESULT_REVEAL: 2000,
    OUTCOME_EXPLOSION: 1500,
    GAME_IMPACT: 1000
  },
  MISSION_STAKES: {
    1: 'medium',
    2: 'medium',
    3: 'high',
    4: 'critical',
    5: 'critical'
  } as const,
  FAIL_REQUIREMENTS: {
    // Mission 4 with 7+ players requires 2 fails
    4: (playerCount: number) => playerCount >= 7 ? 2 : 1,
    // All other missions require 1 fail
    default: 1
  }
} as const;

export type MissionStakes = typeof MISSION_EXECUTION_CONFIG.MISSION_STAKES[keyof typeof MISSION_EXECUTION_CONFIG.MISSION_STAKES];
