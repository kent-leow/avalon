/**
 * Assassin Attempt Utility Functions
 * 
 * Utility functions for managing assassin attempts, strategic analysis,
 * and game conclusion logic.
 */

import type {
  AssassinAttempt,
  AssassinPlayer,
  AssassinTarget,
  StrategyInfo,
  GameContext,
  AssassinPhase,
  AssassinTimer,
  AssassinResult,
  RevealSequence,
  RevealStage,
  BehaviorAnalysis,
  VotingBehavior,
  TeamBehavior,
  MissionParticipation,
  TargetHint,
  MerlinClue,
  BehavioralInsight,
  TimerState,
  AssassinOutcome,
} from '~/types/assassin-attempt';

import { ASSASSIN_CONFIG } from '~/types/assassin-attempt';

/**
 * Create an assassin attempt with initial state
 */
export function createAssassinAttempt(
  assassin: AssassinPlayer,
  targets: AssassinTarget[],
  gameContext: GameContext
): AssassinAttempt {
  return {
    assassin,
    targets,
    strategicInfo: generateStrategyInfo(targets, gameContext),
    gameContext,
    phase: createAssassinPhase('reveal'),
    timer: createAssassinTimer(ASSASSIN_CONFIG.DECISION_TIME),
    selectedTarget: undefined,
    result: undefined,
  };
}

/**
 * Create assassin phase with progress tracking
 */
export function createAssassinPhase(phase: AssassinPhase['phase']): AssassinPhase {
  return {
    phase,
    startTime: new Date(),
    duration: 0,
    isActive: true,
    progress: 0,
  };
}

/**
 * Create assassin timer with warning thresholds
 */
export function createAssassinTimer(totalTime: number): AssassinTimer {
  return {
    timeRemaining: totalTime,
    totalTime,
    isRunning: true,
    isWarning: false,
    isCritical: false,
  };
}

/**
 * Update assassin timer and determine state
 */
export function updateAssassinTimer(timer: AssassinTimer, deltaTime: number): AssassinTimer {
  const timeRemaining = Math.max(0, timer.timeRemaining - deltaTime);
  
  return {
    ...timer,
    timeRemaining,
    isRunning: timeRemaining > 0,
    isWarning: timeRemaining <= ASSASSIN_CONFIG.WARNING_THRESHOLD && timeRemaining > ASSASSIN_CONFIG.CRITICAL_THRESHOLD,
    isCritical: timeRemaining <= ASSASSIN_CONFIG.CRITICAL_THRESHOLD && timeRemaining > 0,
  };
}

/**
 * Get timer state for styling
 */
export function getTimerState(timer: AssassinTimer): TimerState {
  if (timer.timeRemaining <= 0) return 'expired';
  if (timer.isCritical) return 'critical';
  if (timer.isWarning) return 'warning';
  return 'normal';
}

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(timeMs: number): string {
  const minutes = Math.floor(timeMs / 60000);
  const seconds = Math.floor((timeMs % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Generate strategic information for assassin
 */
export function generateStrategyInfo(
  targets: AssassinTarget[],
  gameContext: GameContext
): StrategyInfo {
  return {
    missionTimeline: generateMissionTimeline(gameContext),
    votingPatterns: generateVotingPatterns(targets),
    teamCompositions: generateTeamCompositions(gameContext),
    behavioralInsights: generateBehavioralInsights(targets),
    merlinClues: generateMerlinClues(targets),
  };
}

/**
 * Generate mission timeline summary
 */
export function generateMissionTimeline(gameContext: GameContext): StrategyInfo['missionTimeline'] {
  return gameContext.missionResults.map((result, index) => ({
    missionNumber: index + 1,
    teamMembers: [], // Would be populated from actual game data
    result,
    voteResults: [], // Would be populated from actual vote data
    keyEvents: [`Mission ${index + 1} ${result === 'success' ? 'succeeded' : 'failed'}`],
  }));
}

/**
 * Generate voting patterns analysis
 */
export function generateVotingPatterns(targets: AssassinTarget[]): StrategyInfo['votingPatterns'] {
  return targets.map((target) => ({
    playerId: target.id,
    consistency: target.behavior.votingPattern.consistency,
    approvalTendency: target.behavior.votingPattern.approveRateSuccess,
    goodAlignment: target.behavior.votingPattern.consistency * 0.8,
  }));
}

/**
 * Generate team composition analysis
 */
export function generateTeamCompositions(gameContext: GameContext): StrategyInfo['teamCompositions'] {
  return gameContext.missionResults.map((result, index) => ({
    missionNumber: index + 1,
    members: [], // Would be populated from actual team data
    outcome: result,
    goodPlayers: result === 'success' ? 3 : 2, // Estimated based on outcome
    evilPlayers: result === 'success' ? 0 : 1, // Estimated based on outcome
  }));
}

/**
 * Generate behavioral insights
 */
export function generateBehavioralInsights(targets: AssassinTarget[]): BehavioralInsight[] {
  return targets.flatMap((target) => 
    target.hints.map((hint) => ({
      playerId: target.id,
      type: hint.type === 'voting' ? 'knowledge' : 'influence',
      description: hint.description,
      strength: hint.strength,
      merlinRelevance: hint.pointsToMerlin ? hint.strength * 0.8 : hint.strength * 0.3,
    }))
  );
}

/**
 * Generate Merlin identification clues
 */
export function generateMerlinClues(targets: AssassinTarget[]): MerlinClue[] {
  const merlinTarget = targets.find(t => t.isMerlin);
  
  if (!merlinTarget) return [];
  
  return [
    {
      type: 'voting-knowledge',
      description: 'Player showed unusual voting knowledge on failed missions',
      suspectedPlayers: [merlinTarget.id],
      confidence: 0.7,
      evidence: ['Voted against teams that later failed', 'Showed strategic voting patterns'],
    },
    {
      type: 'team-guidance',
      description: 'Player influenced team selections without being leader',
      suspectedPlayers: [merlinTarget.id],
      confidence: 0.6,
      evidence: ['Subtle influence on team composition', 'Strategic positioning'],
    },
    {
      type: 'subtle-influence',
      description: 'Player provided strategic guidance without revealing knowledge',
      suspectedPlayers: [merlinTarget.id],
      confidence: 0.8,
      evidence: ['Guided discussions toward good outcomes', 'Avoided direct confrontation'],
    },
  ];
}

/**
 * Calculate behavior analysis for a target
 */
export function calculateBehaviorAnalysis(
  missionHistory: any[], // Would be actual mission data
  voteHistory: any[] // Would be actual vote data
): BehaviorAnalysis {
  return {
    votingPattern: {
      approveRateSuccess: 0.8,
      approveRateFailed: 0.2,
      consistency: 0.7,
      followsMajority: false,
    },
    teamBehavior: {
      timesSelected: 3,
      timesAvoided: 2,
      playerPreferences: [],
      avoidancePatterns: [],
    },
    missionParticipation: {
      totalMissions: 3,
      successfulMissions: 3,
      failedMissions: 0,
      successRate: 1.0,
    },
    suspicionLevel: 3,
  };
}

/**
 * Generate target hints based on behavior
 */
export function generateTargetHints(target: AssassinTarget): TargetHint[] {
  const hints: TargetHint[] = [];
  
  if (target.behavior.votingPattern.consistency > 0.7) {
    hints.push({
      type: 'voting',
      description: 'Consistent voting pattern suggests strategic knowledge',
      strength: 4,
      pointsToMerlin: target.isMerlin,
    });
  }
  
  if (target.behavior.missionParticipation.successRate > 0.8) {
    hints.push({
      type: 'mission-outcome',
      description: 'High mission success rate when participating',
      strength: 3,
      pointsToMerlin: target.isMerlin,
    });
  }
  
  if (target.behavior.teamBehavior.timesSelected > 2) {
    hints.push({
      type: 'team-selection',
      description: 'Frequently selected for important missions',
      strength: 2,
      pointsToMerlin: target.isMerlin,
    });
  }
  
  return hints;
}

/**
 * Process assassin attempt and determine outcome
 */
export function processAssassinAttempt(
  attempt: AssassinAttempt,
  targetId: string
): AssassinResult {
  const target = attempt.targets.find(t => t.id === targetId);
  if (!target) {
    throw new Error('Invalid target selected');
  }
  
  const wasCorrect = target.isMerlin;
  const gameOutcome: AssassinOutcome = wasCorrect ? 'evil-wins' : 'good-wins';
  
  return {
    targetId,
    wasCorrect,
    gameOutcome,
    timestamp: new Date(),
    decisionDuration: ASSASSIN_CONFIG.DECISION_TIME - attempt.timer.timeRemaining,
    revealSequence: createRevealSequence(wasCorrect),
  };
}

/**
 * Create reveal sequence for dramatic effect
 */
export function createRevealSequence(wasCorrect: boolean): RevealSequence {
  const stages: RevealStage[] = [
    {
      type: 'pause',
      duration: ASSASSIN_CONFIG.REVEAL_PAUSE_DURATION,
      description: 'Dramatic pause before reveal',
      effects: ['heartbeat', 'screen-darken'],
      isActive: true,
    },
    {
      type: 'target-reveal',
      duration: 2000,
      description: 'Reveal selected target',
      effects: ['spotlight', 'target-highlight'],
      isActive: false,
    },
    {
      type: 'role-reveal',
      duration: 2000,
      description: 'Reveal target\'s true role',
      effects: ['card-flip', 'role-glow'],
      isActive: false,
    },
    {
      type: 'outcome-reveal',
      duration: 2000,
      description: 'Reveal game outcome',
      effects: ['outcome-flash', 'dramatic-text'],
      isActive: false,
    },
    {
      type: 'celebration',
      duration: 2000,
      description: wasCorrect ? 'Evil team celebration' : 'Good team celebration',
      effects: wasCorrect ? ['dark-victory', 'evil-laugh'] : ['holy-light', 'good-cheer'],
      isActive: false,
    },
  ];
  
  return {
    stages,
    currentStage: 0,
    isComplete: false,
    duration: stages.reduce((total, stage) => total + stage.duration, 0),
  };
}

/**
 * Advance reveal sequence to next stage
 */
export function advanceRevealSequence(sequence: RevealSequence): RevealSequence {
  const newSequence = { ...sequence };
  
  if (newSequence.currentStage < newSequence.stages.length - 1) {
    const currentStage = newSequence.stages[newSequence.currentStage];
    const nextStage = newSequence.stages[newSequence.currentStage + 1];
    
    if (currentStage) {
      currentStage.isActive = false;
    }
    
    newSequence.currentStage++;
    
    if (nextStage) {
      nextStage.isActive = true;
    }
  } else {
    newSequence.isComplete = true;
    const currentStage = newSequence.stages[newSequence.currentStage];
    if (currentStage) {
      currentStage.isActive = false;
    }
  }
  
  return newSequence;
}

/**
 * Get current reveal stage
 */
export function getCurrentRevealStage(sequence: RevealSequence): RevealStage | null {
  return sequence.stages[sequence.currentStage] || null;
}

/**
 * Check if assassin can make selection
 */
export function canMakeSelection(attempt: AssassinAttempt): boolean {
  return (
    attempt.phase.phase === 'selection' &&
    attempt.timer.timeRemaining > 0 &&
    !attempt.assassin.hasDecided
  );
}

/**
 * Check if selection is valid
 */
export function validateSelection(attempt: AssassinAttempt, targetId: string): boolean {
  return (
    canMakeSelection(attempt) &&
    attempt.targets.some(t => t.id === targetId) &&
    targetId !== attempt.assassin.id
  );
}

/**
 * Get target by ID
 */
export function getTargetById(attempt: AssassinAttempt, targetId: string): AssassinTarget | null {
  return attempt.targets.find(t => t.id === targetId) || null;
}

/**
 * Calculate phase progress
 */
export function calculatePhaseProgress(phase: AssassinPhase): number {
  const elapsed = Date.now() - phase.startTime.getTime();
  const duration = phase.duration || ASSASSIN_CONFIG.DECISION_TIME;
  return Math.min(1, elapsed / duration);
}

/**
 * Get next phase after current
 */
export function getNextPhase(currentPhase: AssassinPhase['phase']): AssassinPhase['phase'] {
  switch (currentPhase) {
    case 'reveal':
      return 'selection';
    case 'selection':
      return 'confirmation';
    case 'confirmation':
      return 'result';
    case 'result':
      return 'result'; // Final phase
    default:
      return 'reveal';
  }
}

/**
 * Create mock assassin attempt for testing
 */
export function createMockAssassinAttempt(): AssassinAttempt {
  const mockTargets: AssassinTarget[] = [
    {
      id: 'player1',
      name: 'Alice',
      avatar: '👑',
      actualRole: 'merlin',
      isMerlin: true,
      hints: [
        {
          type: 'voting',
          description: 'Showed strategic voting knowledge',
          strength: 4,
          pointsToMerlin: true,
        },
        {
          type: 'behavior',
          description: 'Guided team selections subtly',
          strength: 3,
          pointsToMerlin: true,
        },
      ],
      behavior: {
        votingPattern: {
          approveRateSuccess: 0.9,
          approveRateFailed: 0.1,
          consistency: 0.8,
          followsMajority: false,
        },
        teamBehavior: {
          timesSelected: 3,
          timesAvoided: 1,
          playerPreferences: ['player2', 'player3'],
          avoidancePatterns: ['player5'],
        },
        missionParticipation: {
          totalMissions: 3,
          successfulMissions: 3,
          failedMissions: 0,
          successRate: 1.0,
        },
        suspicionLevel: 4,
      },
    },
    {
      id: 'player2',
      name: 'Bob',
      avatar: '🛡️',
      actualRole: 'percival',
      isMerlin: false,
      hints: [
        {
          type: 'voting',
          description: 'Defensive voting pattern',
          strength: 2,
          pointsToMerlin: false,
        },
      ],
      behavior: {
        votingPattern: {
          approveRateSuccess: 0.7,
          approveRateFailed: 0.3,
          consistency: 0.6,
          followsMajority: true,
        },
        teamBehavior: {
          timesSelected: 2,
          timesAvoided: 2,
          playerPreferences: ['player1'],
          avoidancePatterns: [],
        },
        missionParticipation: {
          totalMissions: 2,
          successfulMissions: 2,
          failedMissions: 0,
          successRate: 1.0,
        },
        suspicionLevel: 2,
      },
    },
    {
      id: 'player3',
      name: 'Charlie',
      avatar: '⚔️',
      actualRole: 'loyal-servant',
      isMerlin: false,
      hints: [
        {
          type: 'team-selection',
          description: 'Reliable team member',
          strength: 1,
          pointsToMerlin: false,
        },
      ],
      behavior: {
        votingPattern: {
          approveRateSuccess: 0.8,
          approveRateFailed: 0.4,
          consistency: 0.5,
          followsMajority: true,
        },
        teamBehavior: {
          timesSelected: 3,
          timesAvoided: 1,
          playerPreferences: [],
          avoidancePatterns: [],
        },
        missionParticipation: {
          totalMissions: 3,
          successfulMissions: 2,
          failedMissions: 1,
          successRate: 0.67,
        },
        suspicionLevel: 1,
      },
    },
  ];
  
  const assassin: AssassinPlayer = {
    id: 'player4',
    name: 'Diana',
    avatar: '🗡️',
    role: 'assassin',
    hasDecided: false,
  };
  
  const gameContext: GameContext = {
    round: 5,
    missionResults: ['success', 'failure', 'success', 'success'],
    goodWins: 3,
    evilWins: 1,
    totalPlayers: 5,
    gameDuration: 1800000, // 30 minutes
    currentLeader: 'player1',
  };
  
  return createAssassinAttempt(assassin, mockTargets, gameContext);
}
