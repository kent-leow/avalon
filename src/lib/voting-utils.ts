import type { 
  VotingSession, 
  VotingResult, 
  VotingProgress, 
  VotingPlayer, 
  RejectionTracker, 
  VotingValidation,
  VoteChoice,
  Vote,
  VotingGameState 
} from "~/types/voting";
import { VOTING_CONFIG } from "~/types/voting";

/**
 * Calculate voting progress from current votes
 */
export function calculateVotingProgress(
  votes: Vote[],
  allPlayers: Array<{ id: string; name: string; isOnline: boolean }>
): VotingProgress {
  const votedPlayerIds = new Set(votes.map(v => v.playerId));
  
  const votedPlayers: VotingPlayer[] = allPlayers
    .filter(p => votedPlayerIds.has(p.id))
    .map(p => ({
      id: p.id,
      name: p.name,
      hasVoted: true,
      isOnline: p.isOnline,
    }));

  const remainingPlayers: VotingPlayer[] = allPlayers
    .filter(p => !votedPlayerIds.has(p.id))
    .map(p => ({
      id: p.id,
      name: p.name,
      hasVoted: false,
      isOnline: p.isOnline,
    }));

  const totalPlayers = allPlayers.length;
  const votesReceived = votes.length;
  const percentage = totalPlayers > 0 ? (votesReceived / totalPlayers) * 100 : 0;

  return {
    votedPlayers,
    remainingPlayers,
    totalPlayers,
    votesReceived,
    percentage,
  };
}

/**
 * Calculate rejection tracker state
 */
export function calculateRejectionTracker(
  currentRejections: number,
  maxRejections: number = VOTING_CONFIG.MAX_REJECTIONS_PER_ROUND
): RejectionTracker {
  const remainingAttempts = maxRejections - currentRejections;
  const isNearLimit = currentRejections >= VOTING_CONFIG.NEAR_LIMIT_THRESHOLD;
  const isCritical = currentRejections >= VOTING_CONFIG.CRITICAL_REJECTION_THRESHOLD;

  return {
    currentRejections,
    maxRejections,
    isNearLimit,
    isCritical,
    remainingAttempts,
  };
}

/**
 * Calculate voting results from votes
 */
export function calculateVotingResults(
  votes: Vote[],
  requiredVotes: number,
  currentRejections: number,
  currentLeaderIndex: number,
  totalPlayers: number
): VotingResult {
  const approveCount = votes.filter(v => v.choice === 'approve').length;
  const rejectCount = votes.filter(v => v.choice === 'reject').length;
  const totalVotes = votes.length;
  
  // Mission is approved if majority approve
  const approved = approveCount > rejectCount;
  
  let nextPhase: 'mission' | 'teamSelection' | 'evilVictory';
  let nextLeaderIndex: number | undefined;

  if (approved) {
    nextPhase = 'mission';
  } else {
    // Check if this rejection causes evil victory
    const newRejectionCount = currentRejections + 1;
    if (newRejectionCount >= VOTING_CONFIG.MAX_REJECTIONS_PER_ROUND) {
      nextPhase = 'evilVictory';
    } else {
      nextPhase = 'teamSelection';
      nextLeaderIndex = (currentLeaderIndex + 1) % totalPlayers;
    }
  }

  return {
    approved,
    approveCount,
    rejectCount,
    totalVotes,
    requiredVotes,
    decidedAt: new Date(),
    nextPhase,
    nextLeaderIndex,
  };
}

/**
 * Validate voting session
 */
export function validateVotingSession(
  session: VotingSession,
  playerId: string,
  newChoice: VoteChoice
): VotingValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if session is active
  if (session.status !== 'active') {
    errors.push(`Cannot vote in ${session.status} session`);
  }

  // Check if deadline has passed
  if (new Date() > session.deadline) {
    errors.push('Voting deadline has passed');
  }

  // Check if player has already voted (for submission, not change)
  const existingVote = session.votes.find(v => v.playerId === playerId);
  if (existingVote) {
    warnings.push('This will change your existing vote');
  }

  // Check if choice is valid
  if (!['approve', 'reject'].includes(newChoice)) {
    errors.push('Invalid vote choice');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if all players have voted
 */
export function areAllPlayersVoted(
  votes: Vote[],
  totalPlayers: number
): boolean {
  return votes.length >= totalPlayers;
}

/**
 * Calculate time remaining in voting session
 */
export function calculateTimeRemaining(deadline: Date): number {
  const now = new Date();
  const remaining = deadline.getTime() - now.getTime();
  return Math.max(0, Math.floor(remaining / 1000));
}

/**
 * Check if voting deadline is approaching
 */
export function isDeadlineApproaching(
  deadline: Date,
  urgentThreshold: number = 10
): boolean {
  const timeRemaining = calculateTimeRemaining(deadline);
  return timeRemaining <= urgentThreshold && timeRemaining > 0;
}

/**
 * Get the next leader index after rejection
 */
export function getNextLeaderIndex(
  currentLeaderIndex: number,
  totalPlayers: number
): number {
  return (currentLeaderIndex + 1) % totalPlayers;
}

/**
 * Check if player can change their vote
 */
export function canPlayerChangeVote(
  session: VotingSession,
  playerId: string
): boolean {
  const now = new Date();
  const deadline = session.deadline;
  const changeDeadline = new Date(deadline.getTime() - (VOTING_CONFIG.VOTE_CHANGE_DEADLINE_SECONDS * 1000));
  
  return now < changeDeadline && session.status === 'active';
}

/**
 * Format vote counts for display
 */
export function formatVoteCounts(result: VotingResult): string {
  return `${result.approveCount} Approve, ${result.rejectCount} Reject`;
}

/**
 * Get voting result message
 */
export function getVotingResultMessage(
  result: VotingResult,
  rejectionCount: number
): string {
  if (result.nextPhase === 'evilVictory') {
    return `Evil team wins! ${rejectionCount} proposals rejected.`;
  }
  
  if (result.approved) {
    return `Mission team approved! (${result.approveCount}-${result.rejectCount})`;
  }
  
  return `Mission team rejected. (${result.approveCount}-${result.rejectCount})`;
}

/**
 * Create mock voting data for development
 */
export function createMockVotingSession(
  missionId: string,
  proposedTeam: string[],
  proposalNumber: number = 1
): VotingSession {
  const now = new Date();
  const deadline = new Date(now.getTime() + (VOTING_CONFIG.VOTING_DEADLINE_SECONDS * 1000));
  
  return {
    id: `voting-${missionId}-${proposalNumber}`,
    missionId,
    roundId: `round-${proposalNumber}`,
    proposedTeam,
    proposalNumber,
    startedAt: now,
    deadline,
    status: 'active',
    votes: [],
  };
}

/**
 * Mock voting data for development and testing
 */
export const mockVotingData = {
  session: createMockVotingSession('mission-1', ['player-1', 'player-2', 'player-3']),
  players: [
    { id: 'player-1', name: 'Arthur', isOnline: true },
    { id: 'player-2', name: 'Merlin', isOnline: true },
    { id: 'player-3', name: 'Percival', isOnline: true },
    { id: 'player-4', name: 'Morgana', isOnline: true },
    { id: 'player-5', name: 'Mordred', isOnline: true },
    { id: 'player-6', name: 'Assassin', isOnline: true },
    { id: 'player-7', name: 'Oberon', isOnline: true },
  ],
  proposedTeam: [
    { id: 'player-1', name: 'Arthur', role: 'servant' },
    { id: 'player-2', name: 'Merlin', role: 'merlin' },
    { id: 'player-3', name: 'Percival', role: 'percival' },
  ],
  currentRejections: 2,
  currentPlayer: 'player-4',
};
