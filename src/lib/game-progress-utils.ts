import type { GameProgress, GamePhase, MissionResult, ScoreTracker, PlayerStatus, PlayerActivity, GameTimer, PhaseHistoryEntry, VoteHistoryEntry, TeamComposition, GameMetrics, ProgressFilter } from '~/types/game-progress';
import { GAME_PROGRESS_CONFIG } from '~/types/game-progress';

/**
 * Creates a game phase object with progress calculation
 */
export function createGamePhase(
  phaseId: string,
  currentPhase: string,
  startTime?: Date,
  estimatedDuration?: number
): GamePhase {
  const isActive = phaseId === currentPhase;
  const isCompleted = getPhaseOrder(phaseId) < getPhaseOrder(currentPhase);
  
  let progressPercentage = 0;
  if (isCompleted) {
    progressPercentage = 100;
  } else if (isActive && startTime && estimatedDuration) {
    const elapsed = Date.now() - startTime.getTime();
    progressPercentage = Math.min((elapsed / estimatedDuration) * 100, 100);
  }

  return {
    id: phaseId,
    name: GAME_PROGRESS_CONFIG.PHASE_NAMES[phaseId as keyof typeof GAME_PROGRESS_CONFIG.PHASE_NAMES] || phaseId,
    description: GAME_PROGRESS_CONFIG.PHASE_DESCRIPTIONS[phaseId as keyof typeof GAME_PROGRESS_CONFIG.PHASE_DESCRIPTIONS] || '',
    status: isCompleted ? 'completed' : isActive ? 'active' : 'upcoming',
    estimatedDuration,
    startTime,
    progressPercentage: Math.round(progressPercentage)
  };
}

/**
 * Calculates the score tracker from mission results
 */
export function calculateScoreTracker(
  missionResults: MissionResult[],
  totalMissions: number = 5
): ScoreTracker {
  const goodTeamWins = missionResults.filter(m => m.outcome === 'success').length;
  const evilTeamWins = missionResults.filter(m => m.outcome === 'failure').length;
  
  const isGameComplete = goodTeamWins >= 3 || evilTeamWins >= 3;
  let winner: 'good' | 'evil' | undefined;
  let winCondition: string | undefined;
  
  if (isGameComplete) {
    winner = goodTeamWins >= 3 ? 'good' : 'evil';
    winCondition = goodTeamWins >= 3 
      ? 'Good team completed 3 missions successfully'
      : 'Evil team sabotaged 3 missions';
  }

  return {
    goodTeamWins,
    evilTeamWins,
    totalMissions,
    isGameComplete,
    winner,
    winCondition
  };
}

/**
 * Creates player activity status
 */
export function createPlayerActivity(
  type: keyof typeof GAME_PROGRESS_CONFIG.ACTIVITY_DESCRIPTIONS,
  progress?: number,
  timeRemaining?: number,
  isBlocked?: boolean
): PlayerActivity {
  return {
    type,
    description: GAME_PROGRESS_CONFIG.ACTIVITY_DESCRIPTIONS[type],
    progress,
    timeRemaining,
    isBlocked: isBlocked || false
  };
}

/**
 * Calculates game timer with warning states
 */
export function createGameTimer(
  totalTime: number,
  remainingTime: number,
  label: string,
  isActive: boolean = true
): GameTimer {
  return {
    totalTime,
    remainingTime,
    isActive,
    warningThreshold: GAME_PROGRESS_CONFIG.TIMER_THRESHOLDS.WARNING,
    urgentThreshold: GAME_PROGRESS_CONFIG.TIMER_THRESHOLDS.URGENT,
    label
  };
}

/**
 * Determines timer state based on remaining time
 */
export function getTimerState(timer: GameTimer): 'normal' | 'warning' | 'urgent' {
  if (timer.remainingTime <= timer.urgentThreshold) {
    return 'urgent';
  }
  if (timer.remainingTime <= timer.warningThreshold) {
    return 'warning';
  }
  return 'normal';
}

/**
 * Formats time duration for display
 */
export function formatTimeRemaining(milliseconds: number): string {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${seconds}s`;
}

/**
 * Calculates progress percentage for current phase
 */
export function calculatePhaseProgress(
  startTime: Date,
  estimatedDuration: number,
  currentTime: Date = new Date()
): number {
  const elapsed = currentTime.getTime() - startTime.getTime();
  const percentage = (elapsed / estimatedDuration) * 100;
  return Math.min(Math.max(percentage, 0), 100);
}

/**
 * Filters vote history based on criteria
 */
export function filterVoteHistory(
  history: VoteHistoryEntry[],
  filter: ProgressFilter
): VoteHistoryEntry[] {
  return history.filter(entry => {
    if (filter.round && entry.round !== filter.round) return false;
    if (filter.outcome && entry.result !== filter.outcome) return false;
    if (filter.timeRange) {
      const entryTime = entry.timestamp.getTime();
      const startTime = filter.timeRange.start.getTime();
      const endTime = filter.timeRange.end.getTime();
      if (entryTime < startTime || entryTime > endTime) return false;
    }
    if (filter.player) {
      const hasPlayer = entry.votes.some(vote => vote.playerId === filter.player);
      if (!hasPlayer) return false;
    }
    return true;
  });
}

/**
 * Calculates game metrics for analytics
 */
export function calculateGameMetrics(
  phaseHistory: PhaseHistoryEntry[],
  playerIds: string[]
): GameMetrics {
  const totalGameTime = phaseHistory.reduce((sum, entry) => sum + entry.duration, 0);
  const averagePhaseTime = phaseHistory.length > 0 ? totalGameTime / phaseHistory.length : 0;
  
  const playerParticipation: Record<string, number> = {};
  const decisionAccuracy: Record<string, number> = {};
  
  playerIds.forEach(playerId => {
    const participationCount = phaseHistory.filter(entry => 
      entry.participants.includes(playerId)
    ).length;
    playerParticipation[playerId] = phaseHistory.length > 0 ? participationCount / phaseHistory.length : 0;
    
    // Simplified accuracy calculation - can be enhanced based on game rules
    decisionAccuracy[playerId] = Math.random() * 0.3 + 0.7; // Placeholder
  });
  
  const leadershipRotation = phaseHistory
    .filter(entry => entry.phase === 'mission-selection')
    .map(entry => entry.participants[0])
    .filter((leader): leader is string => Boolean(leader));

  return {
    averagePhaseTime,
    totalGameTime,
    playerParticipation,
    decisionAccuracy,
    leadershipRotation
  };
}

/**
 * Determines if a player is currently active
 */
export function isPlayerActive(activity: PlayerActivity): boolean {
  return activity.type !== 'idle' && activity.type !== 'waiting';
}

/**
 * Gets the next leader in rotation
 */
export function getNextLeader(currentLeader: string, playerIds: string[]): string {
  const currentIndex = playerIds.indexOf(currentLeader);
  const nextIndex = (currentIndex + 1) % playerIds.length;
  return playerIds[nextIndex] ?? playerIds[0] ?? '';
}

/**
 * Checks if mission requirements are met
 */
export function validateMissionRequirements(
  missionNumber: number,
  playerCount: number,
  selectedTeamSize: number
): { isValid: boolean; error?: string } {
  const requiredTeamSizes: Record<number, Record<number, number>> = {
    5: { 1: 2, 2: 3, 3: 2, 4: 3, 5: 3 },
    6: { 1: 2, 2: 3, 3: 4, 4: 3, 5: 4 },
    7: { 1: 2, 2: 3, 3: 3, 4: 4, 5: 4 },
    8: { 1: 3, 2: 4, 3: 4, 4: 5, 5: 5 },
    9: { 1: 3, 2: 4, 3: 4, 4: 5, 5: 5 },
    10: { 1: 3, 2: 4, 3: 4, 4: 5, 5: 5 }
  };
  
  const requiredSize = requiredTeamSizes[playerCount]?.[missionNumber];
  if (!requiredSize) {
    return { isValid: false, error: 'Invalid mission or player count' };
  }
  
  if (selectedTeamSize !== requiredSize) {
    return { 
      isValid: false, 
      error: `Mission ${missionNumber} requires ${requiredSize} team members`
    };
  }
  
  return { isValid: true };
}

/**
 * Gets phase order for comparison
 */
function getPhaseOrder(phase: string): number {
  const phaseOrder = [
    'mission-selection',
    'voting',
    'mission-execution',
    'assassin-attempt',
    'game-over'
  ];
  return phaseOrder.indexOf(phase);
}

/**
 * Creates a progress summary for quick overview
 */
export function createProgressSummary(progress: GameProgress): string {
  const { currentRound, totalRounds, currentPhase, scoreTracker } = progress;
  
  if (scoreTracker.isGameComplete) {
    return `Game Complete - ${scoreTracker.winner === 'good' ? 'Good' : 'Evil'} Team Wins!`;
  }
  
  const phaseName = GAME_PROGRESS_CONFIG.PHASE_NAMES[currentPhase.id as keyof typeof GAME_PROGRESS_CONFIG.PHASE_NAMES];
  return `Round ${currentRound}/${totalRounds} - ${phaseName}`;
}

/**
 * Checks if player can perform action in current phase
 */
export function canPlayerAct(
  playerId: string,
  currentPhase: string,
  currentLeader: string,
  selectedTeam: string[] = []
): boolean {
  switch (currentPhase) {
    case 'mission-selection':
      return playerId === currentLeader;
    case 'voting':
      return true; // All players can vote
    case 'mission-execution':
      return selectedTeam.includes(playerId);
    case 'assassin-attempt':
      // Simplified - in real game, only assassin can act
      return true;
    default:
      return false;
  }
}
