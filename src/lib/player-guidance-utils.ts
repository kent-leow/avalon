import { type GameState, type GamePhase } from '~/types/game-state';
import { type Role } from '~/types/roles';
import {
  type GuidanceInteraction,
  type TooltipContent,
  type StrategyHint,
  type GuidanceStep,
  type ActionPreview,
  type HintCondition,
  type GameAction,
  type GuidanceRecommendation,
  type GuidancePreferences,
  type GuidanceState,
  type GuidanceConfig,
  type GuidanceLevel,
  DEFAULT_GUIDANCE_CONFIG,
  DEFAULT_GUIDANCE_PREFERENCES,
} from '~/types/player-guidance';

// Mock data generators
export const createMockGuidanceInteraction = (
  type: GuidanceInteraction['type'],
  playerId: string,
  content: string
): GuidanceInteraction => ({
  id: `${type}-${playerId}-${Date.now()}`,
  type,
  playerId,
  content,
  timestamp: Date.now(),
});

export const createMockTooltipContent = (
  title: string,
  description: string
): TooltipContent => ({
  id: `tooltip-${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
  title,
  description,
  actionRequired: 'Click to continue',
});

export const createMockStrategyHint = (
  id = 'hint1',
  type: StrategyHint['type'] = 'action'
): StrategyHint => ({
  id,
  type,
  title: 'Mock Strategy Hint',
  content: 'This is a mock strategy hint for testing purposes.',
  priority: 'medium',
  conditions: [],
});

export const createMockGuidanceStep = (
  id = 'step1',
  title = 'Mock Step'
): GuidanceStep => ({
  id,
  title,
  description: 'Mock step description',
  target: 'mock-target',
  action: 'highlight',
  optional: false,
});

export const createMockActionPreview = (
  actionId = 'action1'
): ActionPreview => ({
  action: {
    id: actionId,
    type: 'vote',
    label: 'Mock Action',
    description: 'Mock action description',
    available: true,
    requirements: [],
    consequences: [],
  },
  description: 'Mock action preview',
  consequences: ['Mock consequence 1', 'Mock consequence 2'],
  risks: ['Mock risk 1'],
  requirements: ['Mock requirement 1'],
});

// Guidance utility functions
export const validateGuidanceLevel = (level: string): GuidanceLevel => {
  const validLevels: GuidanceLevel[] = ['beginner', 'intermediate', 'advanced'];
  return validLevels.includes(level as GuidanceLevel) ? level as GuidanceLevel : 'beginner';
};

export const shouldShowTooltip = (
  preferences: GuidancePreferences,
  context: { phase: GamePhase; playerRole?: Role }
): boolean => {
  if (!preferences.showTooltips) return false;
  
  // More tooltips for beginners
  if (preferences.level === 'beginner') return true;
  
  // Contextual tooltips for intermediate/advanced
  if (context.phase === 'lobby' || context.phase === 'roleReveal') {
    return preferences.level === 'intermediate';
  }
  
  return false;
};

export const shouldShowStrategyHint = (
  preferences: GuidancePreferences,
  hint: StrategyHint,
  gameState: GameState
): boolean => {
  if (!preferences.showStrategicHints) return false;
  
  // Check hint conditions
  const conditionsMet = hint.conditions.every(condition => 
    evaluateHintCondition(condition, gameState)
  );
  
  if (!conditionsMet) return false;
  
  // Filter by guidance level
  switch (preferences.level) {
    case 'beginner':
      return hint.type === 'action' || hint.type === 'reminder';
    case 'intermediate':
      return hint.type !== 'strategy' || hint.priority === 'high';
    case 'advanced':
      return hint.priority === 'high';
    default:
      return true;
  }
};

export const evaluateHintCondition = (
  condition: HintCondition,
  gameState: GameState
): boolean => {
  switch (condition.type) {
    case 'phase':
      return condition.operator === 'equals' 
        ? gameState.phase === condition.value
        : gameState.phase !== condition.value;
    case 'gamestate':
      // Mock evaluation for game state conditions
      return true;
    default:
      return true;
  }
};

export const getAvailableActions = (
  gameState: GameState,
  playerId: string,
  playerRole?: Role
): GameAction[] => {
  const baseActions: GameAction[] = [];
  
  switch (gameState.phase) {
    case 'lobby':
      baseActions.push({
        id: 'ready',
        type: 'select',
        label: 'Mark Ready',
        description: 'Mark yourself as ready to start the game',
        available: true,
        requirements: [],
        consequences: ['Game may start when all players are ready'],
      });
      break;
    case 'voting':
      baseActions.push({
        id: 'vote_approve',
        type: 'vote',
        label: 'Approve',
        description: 'Vote to approve the current team proposal',
        available: true,
        requirements: [],
        consequences: ['Team proceeds to mission if majority approves'],
      });
      baseActions.push({
        id: 'vote_reject',
        type: 'vote',
        label: 'Reject',
        description: 'Vote to reject the current team proposal',
        available: true,
        requirements: [],
        consequences: ['New team proposal needed if majority rejects'],
      });
      break;
    case 'missionSelect':
      if (playerRole && isCurrentLeader(playerId, gameState)) {
        baseActions.push({
          id: 'select_team',
          type: 'select',
          label: 'Select Team',
          description: 'Choose team members for the mission',
          available: true,
          requirements: ['Must be the current leader'],
          consequences: ['Selected team will vote on mission'],
        });
      }
      break;
    default:
      break;
  }
  
  return baseActions;
};

export const isCurrentLeader = (playerId: string, gameState: GameState): boolean => {
  // Mock implementation - in real game, this would check actual leader index
  return gameState.leaderIndex === 0; // Simplified for mock
};

export const getGuidanceRecommendations = (
  gameState: GameState,
  playerId: string,
  playerRole?: Role,
  preferences?: GuidancePreferences
): GuidanceRecommendation[] => {
  const recommendations: GuidanceRecommendation[] = [];
  
  // Phase-specific recommendations
  switch (gameState.phase) {
    case 'lobby':
      recommendations.push({
        id: 'lobby_wait',
        type: 'reminder',
        title: 'Waiting for Players',
        content: 'Wait for all players to join and mark themselves ready.',
        priority: 1,
      });
      break;
    case 'roleReveal':
      recommendations.push({
        id: 'role_reveal_read',
        type: 'action',
        title: 'Read Your Role',
        content: 'Take time to understand your role and objectives.',
        priority: 2,
      });
      break;
    case 'voting':
      recommendations.push({
        id: 'voting_consider',
        type: 'strategy',
        title: 'Consider Team Composition',
        content: 'Think about whether this team composition serves your objectives.',
        priority: 3,
      });
      break;
    default:
      break;
  }
  
  return recommendations;
};

export const calculateGuidanceProgress = (
  interactions: GuidanceInteraction[],
  totalSteps: number
): number => {
  const completedSteps = interactions.filter(
    interaction => interaction.type === 'guidance_completed'
  ).length;
  
  return Math.min(completedSteps / totalSteps, 1);
};

export const formatGuidanceMessage = (
  message: string,
  context: { playerName?: string; phase?: GamePhase }
): string => {
  let formatted = message;
  
  if (context.playerName) {
    formatted = formatted.replace('{playerName}', context.playerName);
  }
  
  if (context.phase) {
    formatted = formatted.replace('{phase}', context.phase);
  }
  
  return formatted;
};

export const mergeGuidancePreferences = (
  current: Partial<GuidancePreferences>,
  defaults: GuidancePreferences = DEFAULT_GUIDANCE_PREFERENCES
): GuidancePreferences => ({
  ...defaults,
  ...current,
});

export const createGuidanceState = (
  preferences: GuidancePreferences = DEFAULT_GUIDANCE_PREFERENCES
): GuidanceState => ({
  preferences,
  activeTooltip: null,
  activeHints: [],
  completedSteps: [],
  currentGuidanceFlow: null,
  interactionHistory: [],
  isGuidanceActive: true,
  guidanceProgress: {},
});

export const shouldShowActionPreview = (
  action: GameAction,
  preferences: GuidancePreferences,
  gameState: GameState
): boolean => {
  if (!preferences.showActionPreviews) return false;
  
  // Always show previews for critical actions
  if (action.type === 'assassinate' || action.consequences.length > 2) {
    return true;
  }
  
  // Show more previews for beginners
  if (preferences.level === 'beginner') {
    return action.type === 'vote' || action.type === 'select';
  }
  
  return false;
};

export const getTooltipPlacement = (
  targetElement: HTMLElement | null,
  containerElement: HTMLElement | null
): 'top' | 'bottom' | 'left' | 'right' => {
  if (!targetElement || !containerElement) return 'top';
  
  const targetRect = targetElement.getBoundingClientRect();
  const containerRect = containerElement.getBoundingClientRect();
  
  // Simple placement logic - prefer top if there's space
  if (targetRect.top - containerRect.top > 100) {
    return 'top';
  }
  
  if (containerRect.bottom - targetRect.bottom > 100) {
    return 'bottom';
  }
  
  if (targetRect.left - containerRect.left > 200) {
    return 'left';
  }
  
  return 'right';
};

export const trackGuidanceInteraction = (
  interaction: GuidanceInteraction,
  config: GuidanceConfig = DEFAULT_GUIDANCE_CONFIG
): void => {
  if (!config.enableAnalytics) return;
  
  // In real implementation, this would send to analytics
  console.log('Guidance interaction tracked:', interaction);
};

export const adaptGuidanceLevel = (
  currentLevel: GuidanceLevel,
  interactions: GuidanceInteraction[],
  config: GuidanceConfig = DEFAULT_GUIDANCE_CONFIG
): GuidanceLevel => {
  if (!config.adaptiveGuidance) return currentLevel;
  
  // Simple adaptation logic based on interaction patterns
  const recentInteractions = interactions.filter(
    interaction => Date.now() - interaction.timestamp < 300000 // 5 minutes
  );
  
  const tooltipViews = recentInteractions.filter(
    interaction => interaction.type === 'tooltip_viewed'
  ).length;
  
  const hintsDishmissed = recentInteractions.filter(
    interaction => interaction.type === 'hint_dismissed'
  ).length;
  
  // If user is dismissing many hints, they might want less guidance
  if (hintsDishmissed > 3 && currentLevel === 'beginner') {
    return 'intermediate';
  }
  
  if (hintsDishmissed > 5 && currentLevel === 'intermediate') {
    return 'advanced';
  }
  
  return currentLevel;
};

// Constants for guidance content
export const GUIDANCE_PHASES = {
  LOBBY: 'lobby',
  ROLE_REVEAL: 'roleReveal',
  VOTING: 'voting',
  MISSION_SELECT: 'missionSelect',
  MISSION_VOTE: 'missionVote',
  MISSION_RESULT: 'missionResult',
  ASSASSIN_ATTEMPT: 'assassinAttempt',
  GAME_OVER: 'gameOver',
} as const;

export const TOOLTIP_DELAYS = {
  INSTANT: 0,
  QUICK: 200,
  NORMAL: 500,
  SLOW: 1000,
} as const;

export const HINT_DURATIONS = {
  BRIEF: 3000,
  NORMAL: 5000,
  EXTENDED: 8000,
  PERSISTENT: -1,
} as const;
