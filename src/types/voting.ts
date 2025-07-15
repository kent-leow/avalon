/**
 * Voting system types for mission proposals
 */

export type VoteChoice = 'approve' | 'reject';

export interface Vote {
  id: string;
  playerId: string;
  playerName: string;
  choice: VoteChoice;
  submittedAt: Date;
  roundId: string;
  missionId: string;
}

export interface VotingSession {
  id: string;
  missionId: string;
  roundId: string;
  proposedTeam: string[]; // Array of player IDs
  proposalNumber: number; // 1-5, after 5 rejections evil wins
  startedAt: Date;
  deadline: Date;
  status: 'active' | 'completed' | 'expired';
  votes: Vote[];
  result?: VotingResult;
}

export interface VotingResult {
  approved: boolean;
  approveCount: number;
  rejectCount: number;
  totalVotes: number;
  requiredVotes: number;
  decidedAt: Date;
  nextPhase: 'mission' | 'teamSelection' | 'evilVictory';
  nextLeaderIndex?: number;
}

export interface VotingPlayer {
  id: string;
  name: string;
  hasVoted: boolean;
  isOnline: boolean;
  avatar?: string;
}

export interface VotingProgress {
  votedPlayers: VotingPlayer[];
  remainingPlayers: VotingPlayer[];
  totalPlayers: number;
  votesReceived: number;
  percentage: number;
}

export interface RejectionTracker {
  currentRejections: number;
  maxRejections: number;
  isNearLimit: boolean;
  isCritical: boolean;
  remainingAttempts: number;
}

export interface VotingGameState {
  session: VotingSession;
  progress: VotingProgress;
  rejectionTracker: RejectionTracker;
  currentPlayerVote?: VoteChoice;
  canChangeVote: boolean;
  timeRemaining: number;
  isRevealing: boolean;
}

export interface VotingValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface VotingStats {
  totalVotingSessions: number;
  averageVoteTime: number;
  approvalRate: number;
  rejectionsByRound: number[];
  playerVotingPatterns: Record<string, {
    approveCount: number;
    rejectCount: number;
    averageResponseTime: number;
  }>;
}

// Vote submission payload
export interface VoteSubmission {
  playerId: string;
  sessionId: string;
  choice: VoteChoice;
  submittedAt: Date;
}

// Vote change payload
export interface VoteChange {
  playerId: string;
  sessionId: string;
  newChoice: VoteChoice;
  changedAt: Date;
}

// Real-time voting events
export interface VotingEvents {
  'vote:submitted': {
    playerId: string;
    playerName: string;
    hasVoted: boolean;
    progress: VotingProgress;
  };
  'vote:changed': {
    playerId: string;
    playerName: string;
    progress: VotingProgress;
  };
  'vote:deadline': {
    timeRemaining: number;
    isUrgent: boolean;
  };
  'vote:results': {
    result: VotingResult;
    votes: Vote[];
    nextPhase: string;
  };
  'vote:evil-victory': {
    reason: 'max-rejections-reached';
    rejectionCount: number;
  };
}

// Default voting configuration
export const VOTING_CONFIG = {
  VOTING_DEADLINE_SECONDS: 60,
  MAX_REJECTIONS_PER_ROUND: 5,
  REVEAL_COUNTDOWN_SECONDS: 3,
  VOTE_CHANGE_DEADLINE_SECONDS: 5,
  CRITICAL_REJECTION_THRESHOLD: 4,
  NEAR_LIMIT_THRESHOLD: 3,
} as const;

// Voting result messages
export const VOTING_MESSAGES = {
  APPROVED: "Mission team approved! Prepare for the mission.",
  REJECTED: "Mission team rejected. Leadership passes to the next player.",
  EVIL_VICTORY: "Evil team wins! Five mission proposals have been rejected.",
  VOTING_ACTIVE: "Cast your vote on the proposed mission team.",
  WAITING_FOR_VOTES: "Waiting for all players to vote...",
  DEADLINE_APPROACHING: "Voting deadline approaching! Cast your vote now.",
  VOTE_SUBMITTED: "Your vote has been submitted successfully.",
  VOTE_CHANGED: "Your vote has been changed successfully.",
} as const;
