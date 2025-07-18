import { 
  type TooltipContent, 
  type StrategyHint, 
  type GuidanceStep, 
  type GuidancePreferences,
  type GuidanceState,
  type GameAction,
  type HintCondition
} from '~/types/player-guidance';

// Mock tooltip content for different game elements
export const TOOLTIP_CONTENT: Record<string, TooltipContent> = {
  'mission-select': {
    id: 'mission-select',
    title: 'Select Mission Team',
    description: 'Choose players for the mission team. Consider their loyalty and behavior.',
    actionRequired: 'Select players for the mission'
  },
  'vote-proposal': {
    id: 'vote-proposal',
    title: 'Vote on Team Proposal',
    description: 'Approve or reject the proposed mission team.',
    actionRequired: 'Vote on the proposal'
  },
  'mission-action': {
    id: 'mission-action',
    title: 'Execute Mission',
    description: 'Choose to succeed or fail the mission based on your role.',
    actionRequired: 'Choose mission outcome'
  },
  'assassin-attempt': {
    id: 'assassin-attempt',
    title: 'Assassin Attempt',
    description: 'The assassin must identify and eliminate Merlin to win.',
    actionRequired: 'Target a player'
  },
  'character-reveal': {
    id: 'character-reveal',
    title: 'Character Information',
    description: 'Review your character abilities and team affiliations.',
    actionRequired: 'Understand your role'
  }
};

// Mock strategy hints for different game phases
export const STRATEGY_HINTS: StrategyHint[] = [
  {
    id: 'loyal-team-selection',
    type: 'strategy',
    title: 'Team Selection Strategy',
    content: 'As a loyal servant, try to propose balanced teams with players you trust.',
    priority: 'medium',
    conditions: [
      { type: 'role', value: 'loyal', operator: 'equals' },
      { type: 'phase', value: 'mission-selection', operator: 'equals' }
    ]
  },
  {
    id: 'evil-infiltration',
    type: 'strategy',
    title: 'Evil Infiltration',
    content: 'As an evil minion, try to get on mission teams without being obvious.',
    priority: 'high',
    conditions: [
      { type: 'role', value: 'evil', operator: 'equals' },
      { type: 'phase', value: 'mission-selection', operator: 'equals' }
    ]
  },
  {
    id: 'voting-analysis',
    type: 'reminder',
    title: 'Voting Patterns',
    content: 'Pay attention to who votes for which teams - it reveals information.',
    priority: 'medium',
    conditions: [
      { type: 'phase', value: 'voting', operator: 'equals' }
    ]
  },
  {
    id: 'mission-secrecy',
    type: 'action',
    title: 'Mission Secrecy',
    content: 'Keep your mission actions secret to avoid revealing your role.',
    priority: 'high',
    conditions: [
      { type: 'phase', value: 'mission-execution', operator: 'equals' }
    ]
  },
  {
    id: 'merlin-protection',
    type: 'strategy',
    title: 'Protect Merlin',
    content: 'If you\'re Merlin, avoid being too obvious about your knowledge.',
    priority: 'high',
    conditions: [
      { type: 'role', value: 'merlin', operator: 'equals' }
    ]
  }
];

// Mock guidance flows for different scenarios
export const GUIDANCE_FLOWS: Record<string, GuidanceStep[]> = {
  'new-player-tutorial': [
    {
      id: 'welcome',
      title: 'Welcome to Avalon',
      description: 'This tutorial will guide you through your first game',
      target: 'game-board',
      action: 'highlight',
      optional: false
    },
    {
      id: 'character-intro',
      title: 'Your Character',
      description: 'First, let\'s look at your character card',
      target: 'character-card',
      action: 'click',
      optional: false
    },
    {
      id: 'game-phase',
      title: 'Game Phases',
      description: 'The game progresses through different phases',
      target: 'phase-indicator',
      action: 'highlight',
      optional: false
    },
    {
      id: 'mission-basics',
      title: 'Mission Basics',
      description: 'Missions are the core of the game',
      target: 'mission-board',
      action: 'highlight',
      optional: false
    }
  ],
  'team-selection-help': [
    {
      id: 'selection-basics',
      title: 'Team Selection',
      description: 'Click on players to add them to your team',
      target: 'player-list',
      action: 'highlight',
      optional: false
    },
    {
      id: 'team-size',
      title: 'Team Size',
      description: 'Each mission requires a specific number of players',
      target: 'team-size-indicator',
      action: 'highlight',
      optional: false
    },
    {
      id: 'confirm-team',
      title: 'Confirm Selection',
      description: 'Review your team and confirm your selection',
      target: 'confirm-button',
      action: 'click',
      optional: false
    }
  ]
};

// Mock phase descriptions
export const PHASE_DESCRIPTIONS: Record<string, string> = {
  'character-reveal': 'Players learn their characters and see team information',
  'mission-selection': 'The leader selects players for the mission team',
  'team-voting': 'All players vote to approve or reject the proposed team',
  'mission-execution': 'Selected players secretly choose to succeed or fail',
  'mission-results': 'The mission outcome is revealed to all players',
  'assassin-attempt': 'The assassin attempts to identify and eliminate Merlin',
  'game-end': 'The game concludes with victory for either good or evil'
};

// Mock beginner reminders
export const BEGINNER_REMINDERS: Record<string, string> = {
  'remember-role': 'Remember your role and team affiliation',
  'watch-behavior': 'Pay attention to other players\' behavior and voting patterns',
  'mission-outcomes': 'Mission results provide important information about team composition',
  'discussion-phase': 'Use discussion time to share information and build trust',
  'voting-importance': 'Every vote matters - think carefully before voting'
};

// Mock quick tips
export const QUICK_TIPS: Record<string, string> = {
  'team-balance': 'Good teams need the right balance of trusted players',
  'voting-patterns': 'Consistent voting patterns can reveal player affiliations',
  'mission-failures': 'Multiple mission failures often indicate evil infiltration',
  'discussion-value': 'Quality discussion leads to better team decisions',
  'endgame-awareness': 'Be aware of how close each side is to victory'
};

// Mock role-specific hints
export const ROLE_SPECIFIC_HINTS: Record<string, string[]> = {
  'merlin': [
    'You know the evil players, but don\'t be too obvious',
    'Help good players without revealing your identity',
    'Be careful not to stare at evil players during reveals'
  ],
  'percival': [
    'You see Merlin and Morgana, but don\'t know which is which',
    'Watch for subtle clues about who the real Merlin is',
    'Protect the player you think is Merlin'
  ],
  'loyal-servant': [
    'You must identify evil players through behavior and voting',
    'Trust players who consistently support good teams',
    'Pay attention to mission results and team compositions'
  ],
  'morgana': [
    'You appear as Merlin to Percival - use this to your advantage',
    'Try to mislead good players while appearing helpful',
    'Coordinate with other evil players subtly'
  ],
  'assassin': [
    'Your goal is to identify and eliminate Merlin',
    'Pay attention to who seems to know too much',
    'Use failed missions as opportunities to gather information'
  ],
  'evil-minion': [
    'You know your evil teammates but must act independently',
    'Try to get on mission teams without being obvious',
    'Use voting and discussion to sow doubt among good players'
  ]
};

// Mock action consequences
export const ACTION_CONSEQUENCES: Record<string, string> = {
  'propose-team': 'Other players will analyze your team selection for clues about your role',
  'vote-approve': 'Approving a team suggests you trust the selected players',
  'vote-reject': 'Rejecting a team indicates suspicion about team composition',
  'succeed-mission': 'Mission success helps good players and reveals loyalty',
  'fail-mission': 'Mission failure helps evil players but may expose you',
  'target-player': 'Assassination attempts end the game immediately if successful'
};

// Mock context-sensitive help
export const CONTEXT_SENSITIVE_HELP: Record<string, string> = {
  'first-mission': 'The first mission is crucial for establishing trust patterns',
  'multiple-failures': 'Multiple mission failures suggest evil infiltration',
  'close-to-victory': 'When close to victory, be extra careful about team selection',
  'assassination-phase': 'The assassin is trying to identify Merlin',
  'heated-discussion': 'Intense discussions often reveal important information'
};

// Mock guidance messages
export const GUIDANCE_MESSAGES: Record<string, string> = {
  'welcome': 'Welcome to Avalon! Let me help you learn the game.',
  'phase-change': 'The game phase has changed. Here\'s what you need to know.',
  'action-required': 'It\'s your turn to take action. Here are your options.',
  'strategy-tip': 'Here\'s a strategic tip for your current situation.',
  'warning': 'Be careful! This action could have significant consequences.',
  'game-end': 'The game has ended. Let\'s review what happened.'
};

// Default guidance preferences
export const DEFAULT_GUIDANCE_PREFERENCES: GuidancePreferences = {
  level: 'intermediate',
  showTooltips: true,
  showStrategicHints: true,
  showActionPreviews: true,
  showActionIndicators: true,
  showStepByStep: true,
  autoAdvance: false
};

// Default guidance state
export const DEFAULT_GUIDANCE_STATE: GuidanceState = {
  preferences: DEFAULT_GUIDANCE_PREFERENCES,
  activeTooltip: null,
  activeHints: [],
  completedSteps: [],
  currentGuidanceFlow: null,
  interactionHistory: [],
  isGuidanceActive: true,
  guidanceProgress: {}
};
