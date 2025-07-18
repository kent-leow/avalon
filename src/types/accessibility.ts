/**
 * Accessibility Types
 * 
 * TypeScript definitions for accessibility features and WCAG 2.1 AA compliance
 */

export interface AccessibilitySettings {
  screenReaderEnabled: boolean;
  highContrastMode: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
  textScale: 100 | 125 | 150 | 200;
  focusIndicatorStyle: 'default' | 'high-contrast' | 'large';
  alternativeInputs: InputMethod[];
  audioDescriptions: boolean;
  autoPlay: boolean;
  announcements: boolean;
  isInitialized?: boolean;
}

export interface AccessibilityPreset {
  id: string;
  name: string;
  description: string;
  settings: AccessibilitySettings;
  category: 'vision' | 'hearing' | 'motor' | 'cognitive' | 'custom';
}

export interface AccessibilityAnnouncement {
  id: string;
  message: string;
  priority: 'polite' | 'assertive';
  timestamp: number;
  category: 'game-state' | 'user-action' | 'system' | 'error';
}

export interface AccessibilityInteraction {
  id: string;
  type: 'keyboard' | 'screen-reader' | 'voice' | 'switch' | 'eye-tracking';
  element: string;
  action: string;
  timestamp: number;
  success: boolean;
}

export interface AccessibilityRecommendation {
  id: string;
  type: 'settings' | 'feature' | 'hardware' | 'software';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  settings?: Partial<AccessibilitySettings>;
}

export interface AccessibilityContext {
  settings: AccessibilitySettings;
  presets: AccessibilityPreset[];
  announcements: AccessibilityAnnouncement[];
  interactions: AccessibilityInteraction[];
  recommendations: AccessibilityRecommendation[];
}

export interface AccessibilityConfig {
  wcagLevel: 'AA' | 'AAA';
  enabledFeatures: AccessibilityFeature[];
  defaultSettings: AccessibilitySettings;
  presets: AccessibilityPreset[];
  announcements: {
    gameState: boolean;
    userActions: boolean;
    systemMessages: boolean;
    errors: boolean;
  };
  testing: {
    axeCore: boolean;
    keyboardNav: boolean;
    screenReader: boolean;
    colorContrast: boolean;
  };
}

export interface AccessibilityState {
  isInitialized: boolean;
  settings: AccessibilitySettings;
  config: AccessibilityConfig;
  systemPreferences: {
    prefersReducedMotion: boolean;
    prefersHighContrast: boolean;
    prefersLargeText: boolean;
    screenReaderDetected: boolean;
  };
  currentFocus: HTMLElement | null;
  announcements: AccessibilityAnnouncement[];
  interactions: AccessibilityInteraction[];
  compliance: {
    wcagLevel: 'AA' | 'AAA';
    testResults: AccessibilityTestResult[];
    lastAudit: Date;
  };
}

export interface AccessibilityTestResult {
  id: string;
  rule: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  helpUrl: string;
  nodes: {
    target: string;
    html: string;
    failureSummary: string;
  }[];
}

export interface ScreenReaderConfig {
  enabled: boolean;
  liveRegions: {
    polite: boolean;
    assertive: boolean;
    off: boolean;
  };
  announcements: {
    gameState: boolean;
    userActions: boolean;
    navigation: boolean;
    errors: boolean;
  };
  verbosity: 'minimal' | 'standard' | 'verbose';
}

export interface KeyboardNavigationConfig {
  enabled: boolean;
  skipLinks: boolean;
  focusManagement: 'automatic' | 'manual';
  customShortcuts: boolean;
  shortcuts: {
    [key: string]: string;
  };
  focusIndicator: {
    style: 'default' | 'high-contrast' | 'large';
    color: string;
    width: number;
    offset: number;
  };
}

export interface HighContrastConfig {
  enabled: boolean;
  level: 'AA' | 'AAA';
  colors: {
    background: string;
    text: string;
    link: string;
    visited: string;
    focus: string;
    success: string;
    error: string;
    warning: string;
  };
  customColors: boolean;
}

export interface AlternativeInputConfig {
  enabled: boolean;
  methods: InputMethod[];
  voice: {
    enabled: boolean;
    language: string;
    commands: { [key: string]: string };
  };
  switch: {
    enabled: boolean;
    switches: number;
    scanSpeed: number;
    scanMode: 'automatic' | 'manual';
  };
  eyeTracking: {
    enabled: boolean;
    calibration: boolean;
    dwellTime: number;
  };
}

export type InputMethod = 'keyboard' | 'voice' | 'switch' | 'eye-tracking' | 'head-tracking' | 'breath-control';

export type AccessibilityFeature = 
  | 'screen-reader'
  | 'keyboard-navigation'
  | 'high-contrast'
  | 'reduced-motion'
  | 'text-scaling'
  | 'focus-indicators'
  | 'alternative-inputs'
  | 'audio-descriptions'
  | 'skip-links'
  | 'live-regions';

export type AccessibilityEvent = 
  | 'settings-changed'
  | 'focus-changed'
  | 'announcement'
  | 'interaction'
  | 'test-result'
  | 'compliance-check';

// Default configurations
export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  screenReaderEnabled: false,
  highContrastMode: false,
  keyboardNavigation: true,
  reducedMotion: false,
  textScale: 100,
  focusIndicatorStyle: 'default',
  alternativeInputs: [],
  audioDescriptions: false,
  autoPlay: false,
  announcements: true,
};

export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  wcagLevel: 'AA',
  enabledFeatures: [
    'screen-reader',
    'keyboard-navigation',
    'high-contrast',
    'reduced-motion',
    'text-scaling',
    'focus-indicators',
    'skip-links',
    'live-regions',
  ],
  defaultSettings: DEFAULT_ACCESSIBILITY_SETTINGS,
  presets: [],
  announcements: {
    gameState: true,
    userActions: true,
    systemMessages: true,
    errors: true,
  },
  testing: {
    axeCore: true,
    keyboardNav: true,
    screenReader: true,
    colorContrast: true,
  },
};

// WCAG 2.1 AA/AAA Compliance Constants
export const WCAG_COMPLIANCE = {
  AA: {
    contrastRatio: 4.5,
    largeTextRatio: 3.0,
    focusIndicatorWidth: 2,
    touchTargetSize: 44,
    textSpacing: 1.5,
  },
  AAA: {
    contrastRatio: 7.0,
    largeTextRatio: 4.5,
    focusIndicatorWidth: 3,
    touchTargetSize: 44,
    textSpacing: 1.5,
  },
};

export const HIGH_CONTRAST_COLORS = {
  background: '#000000',
  text: '#ffffff',
  link: '#0000ff',
  visited: '#800080',
  focus: '#ffff00',
  success: '#00ff00',
  error: '#ff0000',
  warning: '#ffff00',
};

export const ACCESSIBILITY_PRESETS: AccessibilityPreset[] = [
  {
    id: 'vision-impaired',
    name: 'Vision Impaired',
    description: 'Optimized for users with visual impairments',
    category: 'vision',
    settings: {
      ...DEFAULT_ACCESSIBILITY_SETTINGS,
      screenReaderEnabled: true,
      highContrastMode: true,
      textScale: 150,
      focusIndicatorStyle: 'high-contrast',
      announcements: true,
    },
  },
  {
    id: 'motor-impaired',
    name: 'Motor Impaired',
    description: 'Optimized for users with motor impairments',
    category: 'motor',
    settings: {
      ...DEFAULT_ACCESSIBILITY_SETTINGS,
      keyboardNavigation: true,
      focusIndicatorStyle: 'large',
      alternativeInputs: ['voice', 'switch'],
      reducedMotion: true,
    },
  },
  {
    id: 'cognitive-support',
    name: 'Cognitive Support',
    description: 'Optimized for users with cognitive impairments',
    category: 'cognitive',
    settings: {
      ...DEFAULT_ACCESSIBILITY_SETTINGS,
      reducedMotion: true,
      textScale: 125,
      autoPlay: false,
      announcements: true,
    },
  },
  {
    id: 'hearing-impaired',
    name: 'Hearing Impaired',
    description: 'Optimized for users with hearing impairments',
    category: 'hearing',
    settings: {
      ...DEFAULT_ACCESSIBILITY_SETTINGS,
      audioDescriptions: true,
      announcements: true,
      textScale: 125,
    },
  },
];

export const KEYBOARD_SHORTCUTS = {
  'Alt+1': 'Skip to main content',
  'Alt+2': 'Skip to navigation',
  'Alt+3': 'Skip to game area',
  'Alt+4': 'Skip to settings',
  'Alt+H': 'Go to home',
  'Alt+G': 'Go to game',
  'Alt+S': 'Open settings',
  'Alt+A': 'Open accessibility settings',
  'Escape': 'Close modal/dialog',
  'Space': 'Activate button/select',
  'Enter': 'Activate button/link',
  'Tab': 'Next focusable element',
  'Shift+Tab': 'Previous focusable element',
  'Arrow Keys': 'Navigate within component',
};

export const ARIA_LABELS = {
  game: {
    board: 'Game board',
    players: 'Player list',
    missions: 'Mission tracker',
    votes: 'Voting area',
    roles: 'Role information',
    actions: 'Available actions',
  },
  navigation: {
    main: 'Main navigation',
    breadcrumb: 'Breadcrumb navigation',
    pagination: 'Pagination navigation',
    tabs: 'Tab navigation',
  },
  regions: {
    main: 'Main content',
    complementary: 'Complementary content',
    navigation: 'Navigation',
    banner: 'Banner',
    contentinfo: 'Content information',
    search: 'Search',
    form: 'Form',
    region: 'Region',
  },
  states: {
    expanded: 'Expanded',
    collapsed: 'Collapsed',
    selected: 'Selected',
    current: 'Current',
    disabled: 'Disabled',
    hidden: 'Hidden',
    invalid: 'Invalid',
    required: 'Required',
  },
};
