// Game progress tracking types for the Avalon game
export interface GameProgress {
  currentRound: number;
  totalRounds: number;
  currentPhase: GamePhase;
  currentLeader: string;
  missionResults: MissionResult[];
  scoreTracker: ScoreTracker;
  playerStatuses: PlayerStatus[];
  gameTimer?: GameTimer;
  phaseHistory: PhaseHistoryEntry[];
}

export interface GamePhase {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'upcoming';
  estimatedDuration?: number;
  startTime?: Date;
  endTime?: Date;
  progressPercentage: number;
}

export interface MissionResult {
  missionNumber: number;
  outcome: 'success' | 'failure' | 'pending';
  teamMembers: string[];
  votes: {
    success: number;
    failure: number;
  };
  failVotesRequired: number;
  completedAt?: Date;
  leader: string;
}

export interface ScoreTracker {
  goodTeamWins: number;
  evilTeamWins: number;
  totalMissions: number;
  isGameComplete: boolean;
  winner?: 'good' | 'evil';
  winCondition?: string;
}

export interface PlayerStatus {
  playerId: string;
  playerName: string;
  isLeader: boolean;
  isOnline: boolean;
  currentActivity: PlayerActivity;
  lastSeen: Date;
  isCurrentPlayer: boolean;
}

export interface PlayerActivity {
  type: 'waiting' | 'selecting-team' | 'voting' | 'mission-voting' | 'idle';
  description: string;
  progress?: number;
  timeRemaining?: number;
  isBlocked: boolean;
}

export interface GameTimer {
  totalTime: number;
  remainingTime: number;
  isActive: boolean;
  warningThreshold: number;
  urgentThreshold: number;
  label: string;
}

export interface PhaseHistoryEntry {
  phase: string;
  timestamp: Date;
  duration: number;
  outcome?: string;
  participants: string[];
  details: Record<string, unknown>;
}

export interface VoteHistoryEntry {
  round: number;
  voteType: 'team-proposal' | 'mission-outcome';
  timestamp: Date;
  result: 'approved' | 'rejected' | 'success' | 'failure';
  votes: VoteDetail[];
  proposedTeam?: string[];
}

export interface VoteDetail {
  playerId: string;
  playerName: string;
  vote: 'approve' | 'reject' | 'success' | 'failure';
  isRevealed: boolean;
}

export interface TeamComposition {
  missionNumber: number;
  leader: string;
  teamMembers: string[];
  proposalNumber: number;
  approved: boolean;
  votes: {
    approve: number;
    reject: number;
  };
  timestamp: Date;
}

export interface GameProgressState {
  isLoading: boolean;
  error?: string;
  lastUpdated: Date;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  syncStatus: 'synced' | 'syncing' | 'error';
}

export interface ProgressFilter {
  type: 'all' | 'missions' | 'votes' | 'teams';
  round?: number;
  player?: string;
  outcome?: 'success' | 'failure' | 'approved' | 'rejected';
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export interface GameMetrics {
  averagePhaseTime: number;
  totalGameTime: number;
  playerParticipation: Record<string, number>;
  decisionAccuracy: Record<string, number>;
  leadershipRotation: string[];
}

// Game progress configuration constants
export const GAME_PROGRESS_CONFIG = {
  PHASE_NAMES: {
    'mission-selection': 'Team Selection',
    'voting': 'Team Voting',
    'mission-execution': 'Mission Execution',
    'assassin-attempt': 'Assassin Attempt',
    'game-over': 'Game Complete'
  },
  PHASE_DESCRIPTIONS: {
    'mission-selection': 'The leader is selecting team members for the mission',
    'voting': 'All players are voting on the proposed team',
    'mission-execution': 'Selected team members are executing the mission',
    'assassin-attempt': 'The assassin is attempting to identify Merlin',
    'game-over': 'The game has concluded'
  },
  ACTIVITY_DESCRIPTIONS: {
    'waiting': 'Waiting for other players',
    'selecting-team': 'Selecting team members',
    'voting': 'Voting on team proposal',
    'mission-voting': 'Voting on mission outcome',
    'idle': 'Not currently active'
  },
  UPDATE_INTERVALS: {
    FAST: 1000,    // 1 second
    NORMAL: 2000,  // 2 seconds
    SLOW: 5000     // 5 seconds
  },
  TIMER_THRESHOLDS: {
    WARNING: 30000,  // 30 seconds
    URGENT: 10000    // 10 seconds
  },
  ANIMATION_DURATIONS: {
    SCORE_UPDATE: 1000,
    PHASE_TRANSITION: 500,
    LEADER_CHANGE: 800,
    MISSION_COMPLETION: 1500
  }
} as const;

export type GamePhaseType = keyof typeof GAME_PROGRESS_CONFIG.PHASE_NAMES;
export type PlayerActivityType = keyof typeof GAME_PROGRESS_CONFIG.ACTIVITY_DESCRIPTIONS;
