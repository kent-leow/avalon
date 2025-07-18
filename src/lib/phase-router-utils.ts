/**
 * Phase Router Utility Functions
 * 
 * Utility functions for the dynamic phase router system, including phase validation,
 * transition management, component loading, and error handling.
 */

import type { 
  GamePhase, 
  GameState 
} from '~/types/game-state';
import type { 
  PhaseRouterError, 
  PhaseRouterState, 
  PhaseTransitionOptions,
  PhaseComponentMap,
  PhaseRouterConfig,
  PhaseRouterMetrics
} from '~/types/dynamic-phase-router';
import type { Player } from '~/types/room';

/**
 * Create a phase router error
 */
export function createPhaseRouterError(
  code: PhaseRouterError['code'],
  message: string,
  phase: GamePhase,
  recoverable: boolean = true,
  metadata?: Record<string, any>
): PhaseRouterError {
  return {
    code,
    message,
    phase,
    recoverable,
    metadata,
  };
}

/**
 * Validate if a phase transition is allowed
 */
export function isPhaseTransitionAllowed(
  currentPhase: GamePhase,
  targetPhase: GamePhase,
  gameState: GameState,
  players: Player[]
): boolean {
  // Phase transition validation logic
  const phaseOrder: GamePhase[] = [
    'lobby',
    'roleReveal',
    'missionSelect',
    'voting',
    'missionVote',
    'missionResult',
    'assassinAttempt',
    'gameOver'
  ];

  const currentIndex = phaseOrder.indexOf(currentPhase);
  const targetIndex = phaseOrder.indexOf(targetPhase);

  // Allow backward transitions for debugging/recovery
  if (targetIndex < currentIndex) {
    return true;
  }

  // Allow forward transitions based on game state
  switch (currentPhase) {
    case 'lobby':
      return targetPhase === 'roleReveal' && players.length >= 5;
    case 'roleReveal':
      return targetPhase === 'missionSelect';
    case 'missionSelect':
      return targetPhase === 'voting';
    case 'voting':
      return targetPhase === 'missionVote' || targetPhase === 'missionSelect';
    case 'missionVote':
      return targetPhase === 'missionResult';
    case 'missionResult':
      return targetPhase === 'missionSelect' || targetPhase === 'assassinAttempt' || targetPhase === 'gameOver';
    case 'assassinAttempt':
      return targetPhase === 'gameOver';
    case 'gameOver':
      return targetPhase === 'lobby';
    default:
      return false;
  }
}

/**
 * Simple phase transition validation for hooks
 */
export function validatePhaseTransition(fromPhase: GamePhase, toPhase: GamePhase): {
  isValid: boolean;
  reason?: string;
} {
  // Define valid transitions
  const validTransitions: Record<GamePhase, GamePhase[]> = {
    'lobby': ['roleReveal', 'gameOver'],
    'roleReveal': ['voting', 'missionSelect', 'gameOver'],
    'voting': ['missionSelect', 'missionVote', 'gameOver'],
    'missionSelect': ['voting', 'missionVote', 'gameOver'],
    'missionVote': ['missionResult', 'gameOver'],
    'missionResult': ['voting', 'missionSelect', 'assassinAttempt', 'gameOver'],
    'assassinAttempt': ['gameOver'],
    'gameOver': ['lobby'],
  };

  const allowedTransitions = validTransitions[fromPhase];
  if (!allowedTransitions) {
    return {
      isValid: false,
      reason: `No transitions defined for phase: ${fromPhase}`,
    };
  }

  if (!allowedTransitions.includes(toPhase)) {
    return {
      isValid: false,
      reason: `Transition from ${fromPhase} to ${toPhase} is not allowed`,
    };
  }

  return { isValid: true };
}

/**
 * Get valid phases for the current game state
 */
export function getValidPhases(
  currentPhase: GamePhase,
  gameState: GameState,
  players: Player[]
): GamePhase[] {
  const allPhases: GamePhase[] = [
    'lobby',
    'roleReveal',
    'missionSelect',
    'voting',
    'missionVote',
    'missionResult',
    'assassinAttempt',
    'gameOver'
  ];

  return allPhases.filter(phase => 
    isPhaseTransitionAllowed(currentPhase, phase, gameState, players)
  );
}

/**
 * Calculate transition direction
 */
export function getTransitionDirection(
  currentPhase: GamePhase,
  targetPhase: GamePhase
): 'forward' | 'backward' {
  const phaseOrder: GamePhase[] = [
    'lobby',
    'roleReveal',
    'missionSelect',
    'voting',
    'missionVote',
    'missionResult',
    'assassinAttempt',
    'gameOver'
  ];

  const currentIndex = phaseOrder.indexOf(currentPhase);
  const targetIndex = phaseOrder.indexOf(targetPhase);

  return targetIndex > currentIndex ? 'forward' : 'backward';
}

/**
 * Get transition options for a phase change
 */
export function getTransitionOptions(
  currentPhase: GamePhase,
  targetPhase: GamePhase,
  direction: 'forward' | 'backward'
): PhaseTransitionOptions {
  // Different transition types based on phase change
  let type: PhaseTransitionOptions['type'] = 'fade';
  let duration = 400;

  // Dramatic transitions for key moments
  if (currentPhase === 'roleReveal' || targetPhase === 'roleReveal') {
    type = 'flip';
    duration = 600;
  } else if (currentPhase === 'assassinAttempt' || targetPhase === 'assassinAttempt') {
    type = 'scale';
    duration = 500;
  } else if (direction === 'forward') {
    type = 'slide';
    duration = 500;
  }

  return {
    type,
    duration,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    direction,
  };
}

/**
 * Create default phase router state
 */
export function createDefaultPhaseRouterState(
  initialPhase: GamePhase = 'lobby'
): PhaseRouterState {
  return {
    currentPhase: initialPhase,
    previousPhase: null,
    isTransitioning: false,
    isLoading: false,
    error: null,
    transitionStartTime: null,
    loadedComponents: new Map(),
    navigationBlocked: false,
  };
}

/**
 * Create default phase router configuration
 */
export function createDefaultPhaseRouterConfig(): PhaseRouterConfig {
  return {
    enableTransitions: true,
    transitionDuration: 400,
    enableNavigationGuard: true,
    enableCaching: true,
    enablePreloading: true,
    maxRetries: 3,
    timeoutMs: 10000,
  };
}

/**
 * Create phase component map with lazy loading
 */
export function createPhaseComponentMap(): PhaseComponentMap {
  return {
    lobby: () => import('~/components/game-engine/PhaseController').then(m => m.PhaseController),
    roleReveal: () => import('~/components/game-engine/PhaseController').then(m => m.PhaseController),
    missionSelect: () => import('~/components/game-engine/PhaseController').then(m => m.PhaseController),
    voting: () => import('~/components/game-engine/PhaseController').then(m => m.PhaseController),
    missionVote: () => import('~/components/game-engine/PhaseController').then(m => m.PhaseController),
    missionResult: () => import('~/components/game-engine/PhaseController').then(m => m.PhaseController),
    assassinAttempt: () => import('~/components/game-engine/PhaseController').then(m => m.PhaseController),
    gameOver: () => import('~/components/game-engine/PhaseController').then(m => m.PhaseController),
  };
}

/**
 * Format phase name for display
 */
export function formatPhaseDisplayName(phase: GamePhase): string {
  const phaseNames: Record<GamePhase, string> = {
    lobby: 'Lobby',
    roleReveal: 'Role Reveal',
    missionSelect: 'Mission Selection',
    voting: 'Team Voting',
    missionVote: 'Mission Vote',
    missionResult: 'Mission Result',
    assassinAttempt: 'Assassin Attempt',
    gameOver: 'Game Over',
  };

  return phaseNames[phase] || phase;
}

/**
 * Get phase description for accessibility
 */
export function getPhaseDescription(phase: GamePhase): string {
  const descriptions: Record<GamePhase, string> = {
    lobby: 'Players are waiting in the lobby',
    roleReveal: 'Players are learning their roles',
    missionSelect: 'The leader is selecting team members',
    voting: 'Players are voting on the proposed team',
    missionVote: 'Team members are voting on the mission',
    missionResult: 'Mission results are being revealed',
    assassinAttempt: 'The assassin is making their attempt',
    gameOver: 'The game has ended',
  };

  return descriptions[phase] || `Current phase: ${phase}`;
}

/**
 * Create initial phase router metrics
 */
export function createInitialPhaseRouterMetrics(): PhaseRouterMetrics {
  return {
    transitionTime: 0,
    loadingTime: 0,
    errorCount: 0,
    componentCacheHits: 0,
    componentCacheMisses: 0,
    lastTransitionTimestamp: 0,
  };
}

/**
 * Validate phase router state
 */
export function validatePhaseRouterState(
  state: PhaseRouterState,
  gameState: GameState,
  players: Player[]
): PhaseRouterError | null {
  // Check if current phase is valid
  if (!state.currentPhase) {
    return createPhaseRouterError(
      'INVALID_PHASE',
      'Current phase is not defined',
      state.currentPhase,
      true
    );
  }

  // Check if phase transition is allowed
  if (state.previousPhase && !isPhaseTransitionAllowed(
    state.previousPhase,
    state.currentPhase,
    gameState,
    players
  )) {
    return createPhaseRouterError(
      'TRANSITION_FAILED',
      `Transition from ${state.previousPhase} to ${state.currentPhase} is not allowed`,
      state.currentPhase,
      true
    );
  }

  return null;
}

/**
 * Get loading message for phase
 */
export function getLoadingMessage(
  phase: GamePhase,
  loadingType: 'transition' | 'component' | 'validation'
): string {
  const phaseDisplayName = formatPhaseDisplayName(phase);
  
  switch (loadingType) {
    case 'transition':
      return `Transitioning to ${phaseDisplayName}...`;
    case 'component':
      return `Loading ${phaseDisplayName}...`;
    case 'validation':
      return `Validating ${phaseDisplayName}...`;
    default:
      return `Processing ${phaseDisplayName}...`;
  }
}

/**
 * Check if phase requires navigation guard
 */
export function shouldBlockNavigation(
  phase: GamePhase,
  gameState: GameState
): boolean {
  // Block navigation during active gameplay phases
  const activePhases: GamePhase[] = [
    'missionSelect',
    'voting',
    'missionVote',
    'assassinAttempt'
  ];

  return activePhases.includes(phase);
}

/**
 * Create mock phase router state for testing
 */
export function createMockPhaseRouterState(
  overrides: Partial<PhaseRouterState> = {}
): PhaseRouterState {
  return {
    ...createDefaultPhaseRouterState(),
    ...overrides,
  };
}
