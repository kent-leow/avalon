/**
 * Game Rules Reference Types
 * 
 * Comprehensive type definitions for the game rules reference system,
 * including rule content, search functionality, and interactive help.
 */

export type RuleSection = 
  | 'overview'
  | 'characters'
  | 'missions'
  | 'voting'
  | 'winning'
  | 'strategies'
  | 'advanced';

export type RuleSearchResultType = 
  | 'rule'
  | 'character'
  | 'mission'
  | 'strategy'
  | 'example';

export type HelpContextType = 
  | 'lobby'
  | 'role-reveal'
  | 'mission-proposal'
  | 'voting'
  | 'mission-execution'
  | 'assassin-attempt'
  | 'game-results';

export type CharacterType = 
  | 'merlin'
  | 'percival'
  | 'loyal-servant'
  | 'assassin'
  | 'morgana'
  | 'mordred'
  | 'oberon'
  | 'evil-servant';

export interface RuleContent {
  id: string;
  title: string;
  content: string;
  section: RuleSection;
  tags: string[];
  examples?: RuleExample[];
  diagrams?: RuleDiagram[];
  relatedRules?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: string;
}

export interface RuleExample {
  id: string;
  title: string;
  description: string;
  scenario: string;
  solution: string;
  interactive: boolean;
  playerCount?: number;
  characters?: CharacterType[];
}

export interface RuleDiagram {
  id: string;
  title: string;
  type: 'flowchart' | 'relationship' | 'timeline' | 'matrix';
  description: string;
  svgContent: string;
  interactive: boolean;
  clickableAreas?: DiagramClickableArea[];
}

export interface DiagramClickableArea {
  id: string;
  coordinates: { x: number; y: number; width: number; height: number };
  tooltip: string;
  action: DiagramAction;
}

export interface DiagramAction {
  type: 'highlight' | 'expand' | 'navigate' | 'modal';
  target: string;
  data?: Record<string, any>;
}

export interface RuleSearchResult {
  id: string;
  title: string;
  content: string;
  type: RuleSearchResultType;
  section: RuleSection;
  relevanceScore: number;
  highlight: string;
  breadcrumb: string[];
}

export interface RuleSearchState {
  query: string;
  results: RuleSearchResult[];
  isSearching: boolean;
  selectedIndex: number;
  filters: RuleSearchFilters;
  suggestions: string[];
}

export interface RuleSearchFilters {
  sections: RuleSection[];
  types: RuleSearchResultType[];
  difficulty: ('beginner' | 'intermediate' | 'advanced')[];
  playerCount?: number;
  characters?: CharacterType[];
}

export interface ContextualHelp {
  id: string;
  context: HelpContextType;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  trigger: HelpTrigger;
  displayConfig: HelpDisplayConfig;
  conditions?: HelpCondition[];
}

export interface HelpTrigger {
  type: 'automatic' | 'manual' | 'conditional';
  delay?: number;
  repeatConfig?: {
    maxRepeats: number;
    intervalDays: number;
  };
}

export interface HelpDisplayConfig {
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  animation: 'fade' | 'slide' | 'bounce' | 'pulse';
  duration: number;
  dismissible: boolean;
  hasCloseButton: boolean;
  showArrow: boolean;
}

export interface HelpCondition {
  type: 'gamePhase' | 'playerCount' | 'characterPresent' | 'userAction';
  operator: 'equals' | 'greaterThan' | 'lessThan' | 'contains' | 'not';
  value: any;
}

export interface MissionRequirement {
  playerCount: number;
  missions: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  twoFailRule: boolean; // Mission 4 requires 2 fails for 7+ players
}

export interface CharacterAbility {
  character: CharacterType;
  name: string;
  description: string;
  canSee: CharacterType[];
  canNotSee: CharacterType[];
  visibleTo: CharacterType[];
  hiddenFrom: CharacterType[];
  specialAbilities: string[];
  restrictions: string[];
  strategicTips: string[];
}

export interface GameRulesState {
  isOpen: boolean;
  activeSection: RuleSection;
  searchState: RuleSearchState;
  contextualHelp: ContextualHelp[];
  userProgress: RuleProgress;
  offlineMode: boolean;
  preferences: RulePreferences;
}

export interface RuleProgress {
  sectionsRead: RuleSection[];
  examplesCompleted: string[];
  charactersStudied: CharacterType[];
  totalTimeSpent: number;
  lastAccessed: string;
}

export interface RulePreferences {
  defaultSection: RuleSection;
  showContextualHelp: boolean;
  helpFrequency: 'minimal' | 'normal' | 'verbose';
  autoExpandDiagrams: boolean;
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
  colorBlindMode: boolean;
}

export interface RulesFloatingButton {
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size: 'small' | 'medium' | 'large';
  hasNotification: boolean;
  notificationCount?: number;
  contextBadge?: HelpContextType;
}

// Mission requirements data
export const MISSION_REQUIREMENTS: MissionRequirement[] = [
  {
    playerCount: 5,
    missions: { 1: 2, 2: 3, 3: 2, 4: 3, 5: 3 },
    twoFailRule: false
  },
  {
    playerCount: 6,
    missions: { 1: 2, 2: 3, 3: 4, 4: 3, 5: 4 },
    twoFailRule: false
  },
  {
    playerCount: 7,
    missions: { 1: 2, 2: 3, 3: 3, 4: 4, 5: 4 },
    twoFailRule: true
  },
  {
    playerCount: 8,
    missions: { 1: 3, 2: 4, 3: 4, 4: 5, 5: 5 },
    twoFailRule: true
  },
  {
    playerCount: 9,
    missions: { 1: 3, 2: 4, 3: 4, 4: 5, 5: 5 },
    twoFailRule: true
  },
  {
    playerCount: 10,
    missions: { 1: 3, 2: 4, 3: 4, 4: 5, 5: 5 },
    twoFailRule: true
  }
];

// Character abilities data
export const CHARACTER_ABILITIES: CharacterAbility[] = [
  {
    character: 'merlin',
    name: 'Merlin',
    description: 'The wise wizard who can see the forces of evil',
    canSee: ['assassin', 'morgana', 'evil-servant'],
    canNotSee: ['mordred'],
    visibleTo: ['percival'],
    hiddenFrom: ['mordred'],
    specialAbilities: [
      'Sees all evil characters except Mordred',
      'Must guide good players subtly without revealing identity',
      'Primary target for the Assassin'
    ],
    restrictions: [
      'Cannot reveal role information directly',
      'Must balance helpful guidance with self-preservation',
      'Cannot vote on missions they propose'
    ],
    strategicTips: [
      'Give subtle hints about evil players',
      'Avoid being too obvious about your knowledge',
      'Try to mislead the Assassin about your identity'
    ]
  },
  {
    character: 'percival',
    name: 'Percival',
    description: 'The noble knight who can identify Merlin and Morgana',
    canSee: ['merlin', 'morgana'],
    canNotSee: [],
    visibleTo: [],
    hiddenFrom: [],
    specialAbilities: [
      'Sees both Merlin and Morgana but cannot distinguish between them',
      'Must deduce which is which through gameplay',
      'Should protect Merlin from the Assassin'
    ],
    restrictions: [
      'Cannot directly identify Merlin',
      'Must be careful not to reveal Merlin inadvertently'
    ],
    strategicTips: [
      'Watch voting patterns to identify Merlin',
      'Protect both Merlin and Morgana until certain',
      'Help Merlin without revealing your knowledge'
    ]
  },
  {
    character: 'loyal-servant',
    name: 'Loyal Servant of Arthur',
    description: 'A faithful servant dedicated to completing missions',
    canSee: [],
    canNotSee: [],
    visibleTo: [],
    hiddenFrom: [],
    specialAbilities: [
      'No special knowledge',
      'Must rely on deduction and observation',
      'Should support mission success'
    ],
    restrictions: [
      'No special information',
      'Must trust other good players'
    ],
    strategicTips: [
      'Watch for suspicious voting patterns',
      'Support players who seem to have good information',
      'Be wary of players who seem to know too much'
    ]
  },
  {
    character: 'assassin',
    name: 'The Assassin',
    description: 'The deadly killer who can eliminate Merlin',
    canSee: ['morgana', 'mordred', 'evil-servant'],
    canNotSee: ['oberon'],
    visibleTo: ['merlin', 'morgana', 'mordred', 'evil-servant'],
    hiddenFrom: ['oberon'],
    specialAbilities: [
      'Can attempt to kill Merlin if good wins three missions',
      'Sees all evil players except Oberon',
      'Must identify Merlin to secure evil victory'
    ],
    restrictions: [
      'Only gets one assassination attempt',
      'Must coordinate with other evil players'
    ],
    strategicTips: [
      'Watch for players with too much information',
      'Coordinate with other evil players',
      'Try to make Merlin reveal themselves'
    ]
  },
  {
    character: 'morgana',
    name: 'Morgana',
    description: 'The sorceress who appears as Merlin to Percival',
    canSee: ['assassin', 'mordred', 'evil-servant'],
    canNotSee: ['oberon'],
    visibleTo: ['merlin', 'percival', 'assassin', 'mordred', 'evil-servant'],
    hiddenFrom: ['oberon'],
    specialAbilities: [
      'Appears as Merlin to Percival',
      'Can confuse Percival about Merlin\'s identity',
      'Sees all evil players except Oberon'
    ],
    restrictions: [
      'Must act suspiciously to confuse Percival',
      'Cannot be too obvious about being evil'
    ],
    strategicTips: [
      'Act like Merlin to confuse Percival',
      'Give false information subtly',
      'Coordinate with other evil players'
    ]
  },
  {
    character: 'mordred',
    name: 'Mordred',
    description: 'The dark knight hidden from Merlin\'s sight',
    canSee: ['assassin', 'morgana', 'evil-servant'],
    canNotSee: ['oberon'],
    visibleTo: ['assassin', 'morgana', 'evil-servant'],
    hiddenFrom: ['merlin', 'oberon'],
    specialAbilities: [
      'Hidden from Merlin\'s sight',
      'Can operate without Merlin\'s knowledge',
      'Sees all evil players except Oberon'
    ],
    restrictions: [
      'Must be careful not to reveal evil nature',
      'Cannot rely on Merlin\'s misdirection'
    ],
    strategicTips: [
      'Act like a loyal servant',
      'Support missions strategically',
      'Coordinate secretly with other evil players'
    ]
  },
  {
    character: 'oberon',
    name: 'Oberon',
    description: 'The hidden evil who operates alone',
    canSee: [],
    canNotSee: [],
    visibleTo: [],
    hiddenFrom: ['merlin', 'assassin', 'morgana', 'mordred', 'evil-servant'],
    specialAbilities: [
      'Does not see other evil players',
      'Other evil players do not see Oberon',
      'Must identify evil players through gameplay'
    ],
    restrictions: [
      'No knowledge of other evil players',
      'Must work independently'
    ],
    strategicTips: [
      'Watch for suspicious behavior',
      'Coordinate through failed missions',
      'Be careful not to sabotage evil plans'
    ]
  },
  {
    character: 'evil-servant',
    name: 'Minion of Mordred',
    description: 'A loyal servant of the forces of evil',
    canSee: ['assassin', 'morgana', 'mordred'],
    canNotSee: ['oberon'],
    visibleTo: ['merlin', 'assassin', 'morgana', 'mordred'],
    hiddenFrom: ['oberon'],
    specialAbilities: [
      'Sees all evil players except Oberon',
      'Must support evil victory',
      'Can fail missions when selected'
    ],
    restrictions: [
      'Must coordinate with other evil players',
      'Cannot reveal evil nature'
    ],
    strategicTips: [
      'Support evil players subtly',
      'Fail missions when safe to do so',
      'Help identify Merlin for the Assassin'
    ]
  }
];

// Search configuration
export const SEARCH_CONFIG = {
  MAX_RESULTS: 10,
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  HIGHLIGHT_TAG: '<mark>',
  HIGHLIGHT_END_TAG: '</mark>',
  RELEVANCE_THRESHOLD: 0.3
};

// Help system configuration
export const HELP_CONFIG = {
  AUTO_HELP_DELAY: 2000,
  HELP_DISPLAY_DURATION: 5000,
  MAX_HELP_REPEATS: 3,
  HELP_INTERVAL_DAYS: 7
};
