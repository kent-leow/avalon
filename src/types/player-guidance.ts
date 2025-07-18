import { type GameState, type GamePhase } from '~/types/game-state';
import { type Role } from '~/types/roles';

export interface GuidanceInteraction {
  id: string;
  type: 'tooltip_viewed' | 'hint_dismissed' | 'action_previewed' | 'guidance_completed' | 'action_taken';
  playerId: string;
  content: string;
  timestamp: number;
  details?: Record<string, any>;
}

export interface TooltipContent {
  id: string;
  title: string;
  description: string;
  actionRequired?: string;
  relatedActions?: GameAction[];
}

export interface StrategyHint {
  id: string;
  type: 'action' | 'strategy' | 'reminder';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  conditions: HintCondition[];
}

export interface GuidanceStep {
  id: string;
  title: string;
  description: string;
  target: string;
  action: 'highlight' | 'click' | 'wait';
  optional: boolean;
}

export interface ActionPreview {
  action: GameAction;
  description: string;
  consequences: string[];
  risks: string[];
  requirements: string[];
}

export interface HintCondition {
  type: 'phase' | 'role' | 'gamestate' | 'playerstate';
  value: any;
  operator: 'equals' | 'contains' | 'greaterthan' | 'lessthan';
}

export interface GameAction {
  id: string;
  type: 'vote' | 'select' | 'propose' | 'execute' | 'assassinate';
  label: string;
  description: string;
  available: boolean;
  requirements: string[];
  consequences: string[];
}

export interface GuidanceRecommendation {
  id: string;
  type: 'action' | 'strategy' | 'reminder';
  title: string;
  content: string;
  priority: number;
  expiresAt?: number;
}

export interface GuidancePreferences {
  level: 'beginner' | 'intermediate' | 'advanced';
  showTooltips: boolean;
  showStrategicHints: boolean;
  showActionPreviews: boolean;
  showActionIndicators: boolean;
  showStepByStep: boolean;
  autoAdvance: boolean;
}

export interface GuidanceState {
  preferences: GuidancePreferences;
  activeTooltip: string | null;
  activeHints: StrategyHint[];
  completedSteps: string[];
  currentGuidanceFlow: string | null;
  interactionHistory: GuidanceInteraction[];
  isGuidanceActive: boolean;
  guidanceProgress: Record<string, number>;
}

export interface GuidanceConfig {
  tooltipDelay: number;
  hintDuration: number;
  maxSimultaneousHints: number;
  enableAnalytics: boolean;
  adaptiveGuidance: boolean;
}

export type GuidanceLevel = 'beginner' | 'intermediate' | 'advanced';
export type GuidanceType = 'action' | 'strategy' | 'reminder';
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type HintPriority = 'low' | 'medium' | 'high';
export type InteractionType = 'tooltip_viewed' | 'hint_dismissed' | 'action_previewed' | 'guidance_completed';

export const DEFAULT_GUIDANCE_CONFIG: GuidanceConfig = {
  tooltipDelay: 500,
  hintDuration: 5000,
  maxSimultaneousHints: 3,
  enableAnalytics: true,
  adaptiveGuidance: true,
};

export const DEFAULT_GUIDANCE_PREFERENCES: GuidancePreferences = {
  level: 'beginner',
  showTooltips: true,
  showStrategicHints: true,
  showActionPreviews: true,
  showActionIndicators: true,
  showStepByStep: true,
  autoAdvance: false,
};

export const GUIDANCE_COLORS = {
  background: '#0a0a0f',
  primary: '#1a1a2e',
  elevated: '#252547',
  interactive: '#3d3d7a',
  success: '#22c55e',
  info: '#3b82f6',
  warning: '#f59e0b',
  special: '#8b5cf6',
} as const;

export const GUIDANCE_ANIMATIONS = {
  tooltipEnter: 'transition-all duration-200 ease-in-out',
  tooltipExit: 'transition-all duration-150 ease-in-out',
  hintSlideIn: 'transition-transform duration-300 ease-out',
  indicatorPulse: 'animate-pulse',
  overlayFade: 'transition-opacity duration-200',
} as const;
