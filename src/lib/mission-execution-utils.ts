import type { MissionVotingSession, MissionExecutionState, MissionResult, MissionVoteOption, MissionTeamMember, MissionContext, VotingProgress, GameImpact, ResultAnimation } from '~/types/mission-execution';
import { MISSION_EXECUTION_CONFIG } from '~/types/mission-execution';

/**
 * Creates mission vote options based on player role
 */
export function createMissionVoteOptions(playerRole: 'good' | 'evil'): MissionVoteOption[] {
  const baseOptions: MissionVoteOption[] = [
    {
      value: 'success',
      label: 'Vote Success',
      description: 'Make the mission succeed',
      available: true,
      style: 'success',
      icon: '⚔️'
    },
    {
      value: 'failure',
      label: 'Vote Failure',
      description: 'Make the mission fail',
      available: playerRole === 'evil',
      style: 'failure',
      icon: '🗡️'
    }
  ];

  return baseOptions;
}

/**
 * Creates mission context based on mission number and game state
 */
export function createMissionContext(
  missionNumber: number,
  playerCount: number,
  currentWins: { good: number; evil: number }
): MissionContext {
  const failVotesRequired = missionNumber === 4 && playerCount >= 7 ? 2 : 1;
  const requiresTwoFails = failVotesRequired === 2;
  
  let stakes: MissionContext['stakes'] = 'medium';
  if (missionNumber >= 4) stakes = 'critical';
  else if (missionNumber >= 3) stakes = 'high';
  
  // Increase stakes if either team is close to winning
  if (currentWins.good >= 2 || currentWins.evil >= 2) {
    stakes = 'critical';
  }

  return {
    missionNumber,
    totalMissions: 5,
    requiresTwoFails,
    failVotesRequired,
    missionDescription: getMissionDescription(missionNumber, requiresTwoFails),
    consequenceDescription: getConsequenceDescription(missionNumber, currentWins),
    stakes
  };
}

/**
 * Calculates voting progress
 */
export function calculateVotingProgress(
  votesSubmitted: number,
  totalVotes: number,
  timeRemaining?: number
): VotingProgress {
  return {
    votesSubmitted,
    totalVotes,
    percentageComplete: Math.round((votesSubmitted / totalVotes) * 100),
    timeRemaining,
    isComplete: votesSubmitted >= totalVotes
  };
}

/**
 * Validates mission vote
 */
export function validateMissionVote(
  playerId: string,
  vote: 'success' | 'failure',
  session: MissionVotingSession,
  playerRole: 'good' | 'evil'
): { isValid: boolean; error?: string } {
  // Check if mission is still active
  if (session.isComplete) {
    return { isValid: false, error: 'Mission voting has ended' };
  }

  // Check if player is on the team
  if (!session.teamMembers.includes(playerId)) {
    return { isValid: false, error: 'You are not on this mission team' };
  }

  // Check if player has already voted
  if (session.votes.some(v => v.playerId === playerId)) {
    return { isValid: false, error: 'You have already voted on this mission' };
  }

  // Check if good players are voting for failure
  if (playerRole === 'good' && vote === 'failure') {
    return { isValid: false, error: 'Good players cannot vote for mission failure' };
  }

  return { isValid: true };
}

/**
 * Calculates mission result from votes
 */
export function calculateMissionResult(
  session: MissionVotingSession,
  gameState: { goodWins: number; evilWins: number }
): MissionResult {
  const failVotes = session.votes.filter(v => v.vote === 'failure').length;
  const successVotes = session.votes.filter(v => v.vote === 'success').length;
  
  const outcome = failVotes >= session.failVotesRequired ? 'failure' : 'success';
  
  // Calculate game impact
  const newGoodWins = outcome === 'success' ? gameState.goodWins + 1 : gameState.goodWins;
  const newEvilWins = outcome === 'failure' ? gameState.evilWins + 1 : gameState.evilWins;
  
  const isGameOver = newGoodWins >= 3 || newEvilWins >= 3;
  const winner = isGameOver ? (newGoodWins >= 3 ? 'good' : 'evil') : undefined;
  
  let nextPhase: GameImpact['nextPhase'] = 'mission-selection';
  if (isGameOver) {
    nextPhase = newGoodWins >= 3 ? 'assassin-attempt' : 'game-over';
  }

  const gameImpact: GameImpact = {
    goodTeamWins: newGoodWins,
    evilTeamWins: newEvilWins,
    isGameOver,
    winner,
    nextPhase
  };

  const animations = createResultAnimations(outcome, session.missionNumber, isGameOver);

  return {
    outcome,
    votes: {
      success: successVotes,
      failure: failVotes
    },
    failVotesRequired: session.failVotesRequired,
    gameImpact,
    animations
  };
}

/**
 * Creates team members data for display
 */
export function createMissionTeamMembers(
  teamMemberIds: string[],
  playerNames: Record<string, string>,
  votedPlayers: string[],
  currentPlayerId: string
): MissionTeamMember[] {
  return teamMemberIds.map(playerId => ({
    playerId,
    playerName: playerNames[playerId] || 'Unknown Player',
    hasVoted: votedPlayers.includes(playerId),
    isCurrentPlayer: playerId === currentPlayerId
  }));
}

/**
 * Determines if voting should auto-complete
 */
export function shouldAutoCompleteVoting(session: MissionVotingSession): boolean {
  return session.votes.length >= session.teamMembers.length;
}

/**
 * Gets mission description based on number and special rules
 */
function getMissionDescription(missionNumber: number, requiresTwoFails: boolean): string {
  const baseDescription = `Mission ${missionNumber}: Navigate the challenges and complete your objective.`;
  
  if (requiresTwoFails) {
    return `${baseDescription} This mission requires TWO failure votes to fail.`;
  }
  
  return baseDescription;
}

/**
 * Gets consequence description based on current game state
 */
function getConsequenceDescription(
  missionNumber: number,
  currentWins: { good: number; evil: number }
): string {
  const goodWinsNeeded = 3 - currentWins.good;
  const evilWinsNeeded = 3 - currentWins.evil;
  
  if (goodWinsNeeded === 1 && evilWinsNeeded === 1) {
    return 'CRITICAL: This mission determines the fate of the realm!';
  }
  
  if (goodWinsNeeded === 1) {
    return 'SUCCESS: Victory will trigger the Assassin\'s final gambit!';
  }
  
  if (evilWinsNeeded === 1) {
    return 'FAILURE: The forces of evil will claim victory!';
  }
  
  return `Success advances the good cause. Failure aids the forces of darkness.`;
}

/**
 * Creates result animations based on outcome and context
 */
function createResultAnimations(
  outcome: 'success' | 'failure',
  missionNumber: number,
  isGameOver: boolean
): ResultAnimation[] {
  const baseAnimations: ResultAnimation[] = [
    {
      type: 'vote-reveal',
      delay: MISSION_EXECUTION_CONFIG.REVEAL_DELAYS.VOTE_REVEAL,
      duration: MISSION_EXECUTION_CONFIG.ANIMATION_DURATIONS.RESULT_REVEAL,
      intensity: 'normal'
    },
    {
      type: 'calculation',
      delay: MISSION_EXECUTION_CONFIG.REVEAL_DELAYS.CALCULATION,
      duration: MISSION_EXECUTION_CONFIG.ANIMATION_DURATIONS.RESULT_REVEAL,
      intensity: 'normal'
    },
    {
      type: 'outcome',
      delay: MISSION_EXECUTION_CONFIG.REVEAL_DELAYS.OUTCOME,
      duration: MISSION_EXECUTION_CONFIG.ANIMATION_DURATIONS.OUTCOME_EXPLOSION,
      intensity: isGameOver ? 'explosive' : 'dramatic'
    },
    {
      type: 'impact',
      delay: MISSION_EXECUTION_CONFIG.REVEAL_DELAYS.IMPACT,
      duration: MISSION_EXECUTION_CONFIG.ANIMATION_DURATIONS.GAME_IMPACT,
      intensity: isGameOver ? 'explosive' : 'normal'
    }
  ];

  // Enhance animations for critical missions
  if (missionNumber >= 4 || isGameOver) {
    baseAnimations.forEach(animation => {
      if (animation.intensity === 'normal') {
        animation.intensity = 'dramatic';
      }
    });
  }

  return baseAnimations;
}
