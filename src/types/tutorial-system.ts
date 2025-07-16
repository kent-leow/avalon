/**
 * Interactive Tutorial System Types
 * 
 * Comprehensive type definitions for the interactive tutorial system including
 * progressive learning, character-specific tutorials, and practice scenarios.
 */

export type TutorialLevel = 'beginner' | 'intermediate' | 'advanced' | 'master';

export type TutorialPhase = 
  | 'introduction'
  | 'room-creation'
  | 'character-roles'
  | 'mission-proposal'
  | 'voting-mechanics'
  | 'mission-execution'
  | 'assassin-attempt'
  | 'game-results'
  | 'strategy-guide';

export type TutorialStepType = 
  | 'explanation'
  | 'demonstration'
  | 'interaction'
  | 'practice'
  | 'quiz'
  | 'reflection';

export type CharacterTutorialType = 
  | 'merlin'
  | 'evil'
  | 'percival'
  | 'assassin'
  | 'good-generic'
  | 'evil-generic';

export type TutorialProgress = 
  | 'not-started'
  | 'in-progress'
  | 'completed'
  | 'mastered';

export type TutorialMode = 'guided' | 'practice' | 'challenge' | 'free-play';

export type TutorialActionType = 
  | 'click'
  | 'hover'
  | 'select'
  | 'drag'
  | 'type'
  | 'wait'
  | 'observe';

export type TutorialFeedbackType = 'success' | 'error' | 'warning' | 'info' | 'tip';

export type TutorialAchievementType = 
  | 'first-steps'
  | 'role-master'
  | 'strategy-student'
  | 'practice-champion'
  | 'tutorial-complete'
  | 'helping-hand'
  | 'quick-learner'
  | 'perfectionist';

// Main Tutorial System Interface
export interface TutorialSystem {
  id: string;
  playerId: string;
  currentTutorial: Tutorial | null;
  progress: TutorialProgress;
  completedTutorials: string[];
  achievements: TutorialAchievement[];
  settings: TutorialSettings;
  statistics: TutorialStatistics;
  lastAccessedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Tutorial Definition
export interface Tutorial {
  id: string;
  title: string;
  description: string;
  level: TutorialLevel;
  phase: TutorialPhase;
  characterType?: CharacterTutorialType;
  estimatedDuration: number; // in minutes
  prerequisites: string[];
  steps: TutorialStep[];
  objectives: TutorialObjective[];
  resources: TutorialResource[];
  tags: string[];
  difficulty: number; // 1-10
  isOptional: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
}

// Tutorial Step
export interface TutorialStep {
  id: string;
  order: number;
  type: TutorialStepType;
  title: string;
  content: string;
  instructions: string;
  actions: TutorialAction[];
  validation: TutorialValidation;
  hints: TutorialHint[];
  feedback: TutorialFeedback[];
  duration: number; // expected time in seconds
  isSkippable: boolean;
  requiredForCompletion: boolean;
  resources: TutorialResource[];
  nextStepConditions: TutorialCondition[];
  metadata: Record<string, any>;
}

// Tutorial Action
export interface TutorialAction {
  id: string;
  type: TutorialActionType;
  target: string; // CSS selector or element ID
  value?: string;
  description: string;
  isRequired: boolean;
  timeoutMs?: number;
  retryable: boolean;
  validation: TutorialValidation;
  feedback: TutorialFeedback;
  animation?: TutorialAnimation;
  metadata: Record<string, any>;
}

// Tutorial Validation
export interface TutorialValidation {
  type: 'element-exists' | 'element-visible' | 'element-text' | 'element-value' | 'custom';
  selector?: string;
  expectedValue?: string;
  customValidator?: string; // function name
  errorMessage: string;
  timeout: number;
  retryAttempts: number;
  metadata: Record<string, any>;
}

// Tutorial Hint
export interface TutorialHint {
  id: string;
  trigger: TutorialHintTrigger;
  content: string;
  type: 'tooltip' | 'popup' | 'highlight' | 'arrow' | 'callout';
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  priority: number;
  showAfterMs: number;
  autoHideMs?: number;
  dismissible: boolean;
  persistent: boolean;
  metadata: Record<string, any>;
}

// Tutorial Hint Trigger
export interface TutorialHintTrigger {
  type: 'time' | 'interaction' | 'error' | 'inactivity' | 'condition';
  value?: string | number;
  condition?: TutorialCondition;
  metadata: Record<string, any>;
}

// Tutorial Feedback
export interface TutorialFeedback {
  id: string;
  type: TutorialFeedbackType;
  message: string;
  title?: string;
  duration?: number;
  showAnimation?: boolean;
  sound?: string;
  metadata: Record<string, any>;
}

// Tutorial Condition
export interface TutorialCondition {
  type: 'element-state' | 'game-state' | 'timer' | 'interaction' | 'custom';
  target?: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than' | 'exists' | 'not-exists';
  value?: any;
  customCondition?: string; // function name
  metadata: Record<string, any>;
}

// Tutorial Objective
export interface TutorialObjective {
  id: string;
  title: string;
  description: string;
  type: 'learn' | 'practice' | 'demonstrate' | 'complete';
  isRequired: boolean;
  points: number;
  completed: boolean;
  completedAt?: string;
  attempts: number;
  metadata: Record<string, any>;
}

// Tutorial Resource
export interface TutorialResource {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'link' | 'interactive';
  title: string;
  url: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  size?: number;
  metadata: Record<string, any>;
}

// Tutorial Animation
export interface TutorialAnimation {
  type: 'highlight' | 'pulse' | 'shake' | 'bounce' | 'fade' | 'slide' | 'zoom' | 'spin';
  duration: number;
  delay?: number;
  iterations?: number;
  direction?: 'normal' | 'reverse' | 'alternate';
  easing?: string;
  metadata: Record<string, any>;
}

// Tutorial Achievement
export interface TutorialAchievement {
  id: string;
  type: TutorialAchievementType;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  requirements: TutorialAchievementRequirement[];
  rewards: TutorialReward[];
  metadata: Record<string, any>;
}

// Tutorial Achievement Requirement
export interface TutorialAchievementRequirement {
  type: 'complete-tutorial' | 'perfect-score' | 'time-limit' | 'streak' | 'practice-sessions';
  value: string | number;
  description: string;
  completed: boolean;
  metadata: Record<string, any>;
}

// Tutorial Reward
export interface TutorialReward {
  type: 'badge' | 'title' | 'avatar' | 'theme' | 'feature-unlock';
  value: string;
  description: string;
  unlocked: boolean;
  metadata: Record<string, any>;
}

// Tutorial Settings
export interface TutorialSettings {
  autoPlay: boolean;
  showHints: boolean;
  skipAnimations: boolean;
  audioEnabled: boolean;
  speechEnabled: boolean;
  highContrastMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  animationSpeed: 'slow' | 'normal' | 'fast';
  hintFrequency: 'minimal' | 'normal' | 'frequent';
  difficultyPreference: TutorialLevel;
  preferredLanguage: string;
  accessibilityMode: boolean;
  metadata: Record<string, any>;
}

// Tutorial Statistics
export interface TutorialStatistics {
  totalTutorialsCompleted: number;
  totalTimeSpent: number; // in seconds
  averageCompletionTime: number;
  achievementsUnlocked: number;
  perfectScores: number;
  hintsUsed: number;
  retriesAttempted: number;
  sessionsStarted: number;
  lastSessionDuration: number;
  favoriteCharacterType?: CharacterTutorialType;
  strongestPhase?: TutorialPhase;
  improvementAreas: string[];
  completionStreak: number;
  metadata: Record<string, any>;
}

// Tutorial State
export interface TutorialState {
  isActive: boolean;
  currentTutorial: Tutorial | null;
  currentStep: TutorialStep | null;
  stepProgress: number;
  totalSteps: number;
  completedSteps: string[];
  skippedSteps: string[];
  startedAt?: string;
  pausedAt?: string;
  lastInteraction?: string;
  errors: TutorialError[];
  context: TutorialContext;
  metadata: Record<string, any>;
}

// Tutorial Error
export interface TutorialError {
  id: string;
  type: 'validation' | 'timeout' | 'interaction' | 'system' | 'user';
  message: string;
  stepId: string;
  actionId?: string;
  timestamp: string;
  resolved: boolean;
  metadata: Record<string, any>;
}

// Tutorial Context
export interface TutorialContext {
  gamePhase?: string;
  playerRole?: string;
  roomCode?: string;
  playerCount?: number;
  missionNumber?: number;
  isHost?: boolean;
  gameState?: Record<string, any>;
  uiState?: Record<string, any>;
  metadata: Record<string, any>;
}

// Practice Mode Types
export interface PracticeSession {
  id: string;
  type: 'scenario' | 'free-play' | 'challenge' | 'guided';
  title: string;
  description: string;
  scenario: PracticeScenario;
  participants: PracticeParticipant[];
  settings: PracticeSettings;
  progress: PracticeProgress;
  results: PracticeResults;
  startedAt: string;
  completedAt?: string;
  metadata: Record<string, any>;
}

// Practice Scenario
export interface PracticeScenario {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  playerCount: number;
  missionNumber?: number;
  phase: TutorialPhase;
  objectives: string[];
  setup: PracticeSetup;
  constraints: PracticeConstraint[];
  aiPlayers: PracticeAIPlayer[];
  successCriteria: PracticeSuccessCriteria;
  metadata: Record<string, any>;
}

// Practice Setup
export interface PracticeSetup {
  gameState: Record<string, any>;
  playerRoles: Record<string, string>;
  missionHistory: any[];
  votingHistory: any[];
  gamePhase: string;
  currentMission?: number;
  currentLeader?: string;
  metadata: Record<string, any>;
}

// Practice Constraint
export interface PracticeConstraint {
  type: 'time-limit' | 'action-limit' | 'information-limit' | 'role-restriction';
  value: number | string;
  description: string;
  enforced: boolean;
  metadata: Record<string, any>;
}

// Practice AI Player
export interface PracticeAIPlayer {
  id: string;
  name: string;
  role: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  personality: 'aggressive' | 'cautious' | 'balanced' | 'unpredictable';
  strategies: string[];
  behaviorPatterns: PracticeBehaviorPattern[];
  metadata: Record<string, any>;
}

// Practice Behavior Pattern
export interface PracticeBehaviorPattern {
  situation: string;
  action: string;
  probability: number;
  conditions: Record<string, any>;
  metadata: Record<string, any>;
}

// Practice Participant
export interface PracticeParticipant {
  id: string;
  name: string;
  role: string;
  isHuman: boolean;
  isActive: boolean;
  performance: PracticePerformance;
  metadata: Record<string, any>;
}

// Practice Performance
export interface PracticePerformance {
  score: number;
  accuracy: number;
  decisionsCorrect: number;
  decisionsTotal: number;
  timeToDecision: number;
  hintsUsed: number;
  mistakesMade: number;
  improvementAreas: string[];
  metadata: Record<string, any>;
}

// Practice Settings
export interface PracticeSettings {
  allowHints: boolean;
  allowUndo: boolean;
  allowPause: boolean;
  showExplanations: boolean;
  highlightOptimalMoves: boolean;
  aiDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  timeLimit?: number;
  autoAdvance: boolean;
  metadata: Record<string, any>;
}

// Practice Progress
export interface PracticeProgress {
  currentPhase: string;
  phasesCompleted: string[];
  objectivesCompleted: string[];
  decisionsCorrect: number;
  decisionsTotal: number;
  hintsUsed: number;
  timeElapsed: number;
  metadata: Record<string, any>;
}

// Practice Results
export interface PracticeResults {
  completed: boolean;
  success: boolean;
  score: number;
  accuracy: number;
  timeToComplete: number;
  objectivesAchieved: string[];
  mistakesMade: PracticeMistake[];
  recommendations: string[];
  nextSuggestions: string[];
  performance: PracticePerformance;
  metadata: Record<string, any>;
}

// Practice Mistake
export interface PracticeMistake {
  id: string;
  type: 'strategic' | 'tactical' | 'informational' | 'timing';
  description: string;
  phase: string;
  impact: 'low' | 'medium' | 'high';
  correction: string;
  preventionTip: string;
  metadata: Record<string, any>;
}

// Practice Success Criteria
export interface PracticeSuccessCriteria {
  winCondition: boolean;
  minScore: number;
  maxTime?: number;
  maxMistakes?: number;
  requiredObjectives: string[];
  optionalObjectives: string[];
  metadata: Record<string, any>;
}

// Contextual Help Types
export interface ContextualHelp {
  id: string;
  title: string;
  icon: string;
  trigger: ContextualHelpTrigger;
  content: ContextualHelpContent;
  conditions: ContextualHelpCondition[];
  display: ContextualHelpDisplay;
  priority: number;
  frequency: 'once' | 'session' | 'always';
  lastShown?: string;
  timesShown: number;
  dismissed: boolean;
  actions: ContextualHelpAction[];
  relatedTutorials: string[];
  metadata: Record<string, any>;
}

// Contextual Help Trigger
export interface ContextualHelpTrigger {
  type: 'page-load' | 'element-hover' | 'element-click' | 'timer' | 'game-state' | 'user-action';
  selector?: string;
  delay?: number;
  condition?: string;
  metadata: Record<string, any>;
}

// Contextual Help Content
export interface ContextualHelpContent {
  title: string;
  text: string;
  message: string;
  type: 'tip' | 'warning' | 'info' | 'success' | 'tutorial-link';
  icon?: string;
  steps?: string[];
  tips?: string[];
  warnings?: string[];
  actions?: ContextualHelpAction[];
  resources?: TutorialResource[];
  metadata: Record<string, any>;
}

// Contextual Help Action
export interface ContextualHelpAction {
  id: string;
  label: string;
  type: 'button' | 'link' | 'tutorial' | 'dismiss';
  action: string;
  target?: string;
  style?: 'primary' | 'secondary' | 'danger' | 'success';
  handler: () => void;
  metadata: Record<string, any>;
}

// Contextual Help Condition
export interface ContextualHelpCondition {
  type: 'user-level' | 'game-phase' | 'tutorial-progress' | 'setting' | 'custom';
  operator: 'equals' | 'not-equals' | 'greater-than' | 'less-than' | 'contains' | 'exists';
  value: any;
  metadata: Record<string, any>;
}

// Contextual Help Display
export interface ContextualHelpDisplay {
  type: 'tooltip' | 'popover' | 'modal' | 'banner' | 'sidebar' | 'overlay';
  position: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'auto';
  size: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'auto';
  animation: 'fade' | 'slide' | 'bounce' | 'none';
  persistent: boolean;
  closable: boolean;
  metadata: Record<string, any>;
}

// Tutorial Navigation
export interface TutorialNavigation {
  canGoBack: boolean;
  canGoForward: boolean;
  canSkip: boolean;
  canPause: boolean;
  canRestart: boolean;
  canExit: boolean;
  showProgress: boolean;
  showStepNumbers: boolean;
  allowJumpToStep: boolean;
  metadata: Record<string, any>;
}

// Tutorial Theme
export interface TutorialTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  successColor: string;
  errorColor: string;
  warningColor: string;
  borderRadius: string;
  fontSize: string;
  fontFamily: string;
  spacing: string;
  shadows: boolean;
  animations: boolean;
  metadata: Record<string, any>;
}

// Configuration Constants
export const DEFAULT_TUTORIAL_SETTINGS: TutorialSettings = {
  autoPlay: false,
  showHints: true,
  skipAnimations: false,
  audioEnabled: true,
  speechEnabled: false,
  highContrastMode: false,
  fontSize: 'medium',
  animationSpeed: 'normal',
  hintFrequency: 'normal',
  difficultyPreference: 'beginner',
  preferredLanguage: 'en',
  accessibilityMode: false,
  metadata: {}
};

export const DEFAULT_PRACTICE_SETTINGS: PracticeSettings = {
  allowHints: true,
  allowUndo: true,
  allowPause: true,
  showExplanations: true,
  highlightOptimalMoves: false,
  aiDifficulty: 'medium',
  autoAdvance: false,
  metadata: {}
};

export const TUTORIAL_LEVELS: Record<TutorialLevel, { name: string; description: string; difficulty: number }> = {
  beginner: {
    name: 'Beginner',
    description: 'Learn basic game mechanics and rules',
    difficulty: 1
  },
  intermediate: {
    name: 'Intermediate',
    description: 'Understand strategy and role interactions',
    difficulty: 2
  },
  advanced: {
    name: 'Advanced',
    description: 'Master psychological gameplay and deception',
    difficulty: 3
  },
  master: {
    name: 'Master',
    description: 'Tournament-level strategies and techniques',
    difficulty: 4
  }
};

export const TUTORIAL_PHASES: Record<TutorialPhase, { name: string; description: string; order: number }> = {
  introduction: {
    name: 'Introduction',
    description: 'Welcome to Avalon',
    order: 1
  },
  'room-creation': {
    name: 'Room Creation',
    description: 'Creating and joining game rooms',
    order: 2
  },
  'character-roles': {
    name: 'Character Roles',
    description: 'Understanding roles and abilities',
    order: 3
  },
  'mission-proposal': {
    name: 'Mission Proposal',
    description: 'Selecting team members',
    order: 4
  },
  'voting-mechanics': {
    name: 'Voting Mechanics',
    description: 'Approving or rejecting teams',
    order: 5
  },
  'mission-execution': {
    name: 'Mission Execution',
    description: 'Playing mission cards',
    order: 6
  },
  'assassin-attempt': {
    name: 'Assassin Attempt',
    description: 'Final evil victory chance',
    order: 7
  },
  'game-results': {
    name: 'Game Results',
    description: 'Understanding victory conditions',
    order: 8
  },
  'strategy-guide': {
    name: 'Strategy Guide',
    description: 'Advanced tactics and tips',
    order: 9
  }
};

export const CHARACTER_TUTORIALS: Record<CharacterTutorialType, { name: string; description: string; difficulty: number }> = {
  'good-generic': {
    name: 'Good Team Member',
    description: 'Playing as a loyal servant of Arthur',
    difficulty: 1
  },
  'evil-generic': {
    name: 'Evil Team Member',
    description: 'Playing as a minion of Mordred',
    difficulty: 2
  },
  merlin: {
    name: 'Merlin',
    description: 'Guiding good while staying hidden',
    difficulty: 4
  },
  percival: {
    name: 'Percival',
    description: 'Protecting Merlin and analyzing information',
    difficulty: 3
  },
  assassin: {
    name: 'Assassin',
    description: 'Identifying and eliminating Merlin',
    difficulty: 4
  },
  evil: {
    name: 'Evil Team Strategy',
    description: 'Coordination and deception tactics',
    difficulty: 3
  }
};

export const ACHIEVEMENT_TYPES: Record<TutorialAchievementType, { name: string; description: string; points: number }> = {
  'first-steps': {
    name: 'First Steps',
    description: 'Complete your first tutorial',
    points: 10
  },
  'role-master': {
    name: 'Role Master',
    description: 'Complete tutorials for all character types',
    points: 100
  },
  'strategy-student': {
    name: 'Strategy Student',
    description: 'Complete intermediate and advanced tutorials',
    points: 50
  },
  'practice-champion': {
    name: 'Practice Champion',
    description: 'Win 10 practice scenarios',
    points: 75
  },
  'tutorial-complete': {
    name: 'Tutorial Complete',
    description: 'Complete all available tutorials',
    points: 200
  },
  'helping-hand': {
    name: 'Helping Hand',
    description: 'Use contextual help system effectively',
    points: 25
  },
  'quick-learner': {
    name: 'Quick Learner',
    description: 'Complete tutorials faster than average',
    points: 40
  },
  'perfectionist': {
    name: 'Perfectionist',
    description: 'Complete tutorials without making mistakes',
    points: 60
  }
};

export const FEEDBACK_TYPES: Record<TutorialFeedbackType, { icon: string; color: string; duration: number }> = {
  success: {
    icon: '✓',
    color: '#10B981',
    duration: 3000
  },
  error: {
    icon: '✗',
    color: '#EF4444',
    duration: 5000
  },
  warning: {
    icon: '⚠',
    color: '#F59E0B',
    duration: 4000
  },
  info: {
    icon: 'ℹ',
    color: '#3B82F6',
    duration: 3000
  },
  tip: {
    icon: '💡',
    color: '#8B5CF6',
    duration: 4000
  }
};

// Additional Types for Contextual Help System
export interface HelpTrigger {
  element: HTMLElement;
  context: HelpContext;
}

export interface HelpContent {
  text?: string;
  steps?: string[];
  tips?: string[];
  warnings?: string[];
}

export interface HelpContext {
  gamePhase?: string;
  playerRole?: string;
  roomCode?: string;
  playerCount?: number;
  missionNumber?: number;
  isHost?: boolean;
  currentAction?: string;
  uiElement?: string;
  metadata: Record<string, any>;
}

export interface GameState {
  phase: string;
  playerRole?: string;
  roomCode?: string;
  playerCount?: number;
  missionNumber?: number;
  isHost?: boolean;
  currentLeader?: string;
  votingInProgress?: boolean;
  missionInProgress?: boolean;
  gameComplete?: boolean;
  metadata: Record<string, any>;
}

export const ANIMATION_PRESETS: Record<string, Partial<TutorialAnimation>> = {
  highlight: {
    type: 'highlight',
    duration: 1000,
    iterations: 3,
    direction: 'alternate'
  },
  pulse: {
    type: 'pulse',
    duration: 800,
    iterations: 2
  },
  shake: {
    type: 'shake',
    duration: 500,
    iterations: 2
  },
  bounce: {
    type: 'bounce',
    duration: 600,
    iterations: 1
  }
};
