import type { DemoScenario } from './types';
import { validateDemoScenario, ensureDemoEnvironment } from './validation';
import {
  DEMO_LOBBY_STATE,
  DEMO_TEAM_SELECTION_STATE,
  DEMO_MISSION_VOTING_STATE,
  DEMO_ASSASSINATION_STATE,
  DEMO_LARGE_GAME_STATE,
  DEMO_DISCONNECTION_STATE,
} from './game';
import {
  DEMO_MOBILE_IPHONE_SE,
  DEMO_MOBILE_LANDSCAPE,
  DEMO_TABLET_IPAD_AIR,
  DEMO_DESKTOP_STANDARD,
  ALL_MOBILE_DEMO_STATES,
} from './mobile';
import {
  DEMO_ACCESSIBILITY_DEFAULT,
  DEMO_ACCESSIBILITY_HIGH_CONTRAST,
  DEMO_ACCESSIBILITY_SCREEN_READER_FULL,
  DEMO_ACCESSIBILITY_ALL_ENABLED,
  ALL_ACCESSIBILITY_DEMO_STATES,
} from './accessibility';

/**
 * Central index for all demo data
 * Provides easy access to all demo scenarios, game states, mobile states, and accessibility states
 */

ensureDemoEnvironment();

/**
 * Demo scenarios combining game states with descriptive metadata
 */
export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    _brand: 'demo',
    id: 'demo-scenario-lobby',
    name: 'Lobby - Players Joining',
    description: 'Standard 5-player game lobby with players joining and getting ready',
    gameState: DEMO_LOBBY_STATE,
    category: 'standard',
  },
  {
    _brand: 'demo',
    id: 'demo-scenario-team-selection',
    name: 'Team Selection Phase',
    description: 'Game in progress where the leader must select a team for the mission',
    gameState: DEMO_TEAM_SELECTION_STATE,
    category: 'standard',
  },
  {
    _brand: 'demo',
    id: 'demo-scenario-mission-voting',
    name: 'Mission Voting Phase',
    description: 'Selected players voting on mission success or failure',
    gameState: DEMO_MISSION_VOTING_STATE,
    category: 'standard',
  },
  {
    _brand: 'demo',
    id: 'demo-scenario-assassination',
    name: 'Assassination Phase',
    description: 'Endgame scenario where evil team can assassinate Merlin to win',
    gameState: DEMO_ASSASSINATION_STATE,
    category: 'endgame',
  },
  {
    _brand: 'demo',
    id: 'demo-scenario-large-game',
    name: 'Large Game (10 Players)',
    description: '10-player game with all special roles enabled',
    gameState: DEMO_LARGE_GAME_STATE,
    category: 'large-game',
  },
  {
    _brand: 'demo',
    id: 'demo-scenario-disconnection',
    name: 'Player Disconnection',
    description: 'Game state with players experiencing connection issues',
    gameState: DEMO_DISCONNECTION_STATE,
    category: 'standard',
  },
];

/**
 * Export all demo data collections
 */
export {
  // Game states
  DEMO_LOBBY_STATE,
  DEMO_TEAM_SELECTION_STATE,
  DEMO_MISSION_VOTING_STATE,
  DEMO_ASSASSINATION_STATE,
  DEMO_LARGE_GAME_STATE,
  DEMO_DISCONNECTION_STATE,
  
  // Mobile states
  DEMO_MOBILE_IPHONE_SE,
  DEMO_MOBILE_LANDSCAPE,
  DEMO_TABLET_IPAD_AIR,
  DEMO_DESKTOP_STANDARD,
  ALL_MOBILE_DEMO_STATES,
  
  // Accessibility states
  DEMO_ACCESSIBILITY_DEFAULT,
  DEMO_ACCESSIBILITY_HIGH_CONTRAST,
  DEMO_ACCESSIBILITY_SCREEN_READER_FULL,
  DEMO_ACCESSIBILITY_ALL_ENABLED,
  ALL_ACCESSIBILITY_DEMO_STATES,
};

/**
 * Export utility functions from sub-modules
 */
export {
  // Mobile utilities
  getMobileStateByDevice,
  getMobileStateByOrientation,
  getTouchEnabledStates,
  getSmallScreenStates,
  getMediumScreenStates,
  getLargeScreenStates,
} from './mobile';

export {
  // Accessibility utilities
  getAccessibilityStatesByFeature,
  getHighContrastStates,
  getLargeTextStates,
  getScreenReaderStates,
  getKeyboardNavigationStates,
  getReducedMotionStates,
  hasMultipleAccessibilityFeatures,
  getComprehensiveAccessibilityStates,
} from './accessibility';

/**
 * Export validation functions
 */
export {
  validateDemoPlayer,
  validateDemoMission,
  validateDemoGameState,
  validateDemoScenario,
  validateDemoAccessibilityState,
  validateDemoMobileState,
  isDemoEnvironment,
  ensureDemoEnvironment,
} from './validation';

/**
 * Export types
 */
export type {
  DemoPlayer,
  DemoMission,
  DemoGameState,
  DemoScenario,
  DemoAccessibilityState,
  DemoMobileState,
} from './types';

/**
 * Get scenario by ID
 */
export function getDemoScenarioById(id: string): DemoScenario | undefined {
  return DEMO_SCENARIOS.find(scenario => scenario.id === id);
}

/**
 * Get scenarios by category
 */
export function getDemoScenariosByCategory(category: DemoScenario['category']): DemoScenario[] {
  return DEMO_SCENARIOS.filter(scenario => scenario.category === category);
}

/**
 * Get all standard scenarios
 */
export function getStandardDemoScenarios(): DemoScenario[] {
  return getDemoScenariosByCategory('standard');
}

/**
 * Get all large game scenarios
 */
export function getLargeGameDemoScenarios(): DemoScenario[] {
  return getDemoScenariosByCategory('large-game');
}

/**
 * Get all endgame scenarios
 */
export function getEndgameDemoScenarios(): DemoScenario[] {
  return getDemoScenariosByCategory('endgame');
}

/**
 * Get all mobile-optimized scenarios
 */
export function getMobileDemoScenarios(): DemoScenario[] {
  return getDemoScenariosByCategory('mobile');
}

/**
 * Get all accessibility-focused scenarios
 */
export function getAccessibilityDemoScenarios(): DemoScenario[] {
  return getDemoScenariosByCategory('accessibility');
}

/**
 * Create a demo environment summary for testing reports
 */
export function createDemoEnvironmentSummary() {
  return {
    scenarios: DEMO_SCENARIOS.length,
    mobileStates: ALL_MOBILE_DEMO_STATES.length,
    accessibilityStates: ALL_ACCESSIBILITY_DEMO_STATES.length,
    totalTestCombinations: DEMO_SCENARIOS.length * ALL_MOBILE_DEMO_STATES.length * ALL_ACCESSIBILITY_DEMO_STATES.length,
    categories: {
      standard: getStandardDemoScenarios().length,
      largeGame: getLargeGameDemoScenarios().length,
      endgame: getEndgameDemoScenarios().length,
      mobile: getMobileDemoScenarios().length,
      accessibility: getAccessibilityDemoScenarios().length,
    },
  };
}

// Validate all demo scenarios
DEMO_SCENARIOS.forEach(validateDemoScenario);
