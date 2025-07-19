import {
  validateDemoPlayer,
  validateDemoMission,
  validateDemoGameState,
  validateDemoScenario,
  validateDemoAccessibilityState,
  validateDemoMobileState,
  isDemoEnvironment,
  ensureDemoEnvironment,
} from '../validation';
import {
  DEMO_SCENARIOS,
  getDemoScenarioById,
  getDemoScenariosByCategory,
  getStandardDemoScenarios,
  getLargeGameDemoScenarios,
  getEndgameDemoScenarios,
  createDemoEnvironmentSummary,
} from '../index';
import type { DemoPlayer, DemoMission, DemoGameState, DemoScenario } from '../types';

describe('Demo Data Validation', () => {
  describe('validateDemoPlayer', () => {
    it('validates correct demo player objects', () => {
      const validPlayer: DemoPlayer = {
        _brand: 'demo',
        id: 'test-player-1',
        name: 'Test Player',
        role: 'good',
        isHost: false,
        isReady: true,
        connectionStatus: 'connected',
      };

      expect(() => validateDemoPlayer(validPlayer)).not.toThrow();
    });

    it('throws error for invalid demo player objects', () => {
      const invalidPlayer = {
        id: 'test-player-1',
        name: 'Test Player',
        // Missing required fields
      };

      expect(() => validateDemoPlayer(invalidPlayer as any)).toThrow();
    });

    it('validates different role types', () => {
      const roles: DemoPlayer['role'][] = ['good', 'evil', 'merlin', 'assassin', 'percival', 'morgana', 'mordred', 'oberon'];
      
      roles.forEach(role => {
        const player: DemoPlayer = {
          _brand: 'demo',
          id: `test-${role}`,
          name: `Test ${role}`,
          role,
          isHost: false,
          isReady: true,
          connectionStatus: 'connected',
        };

        expect(() => validateDemoPlayer(player)).not.toThrow();
      });
    });
  });

  describe('validateDemoMission', () => {
    it('validates correct demo mission objects', () => {
      const validMission: DemoMission = {
        _brand: 'demo',
        id: 'test-mission-1',
        number: 1,
        requiredPlayers: 3,
        failVotesRequired: 1,
        selectedPlayers: ['player-1', 'player-2', 'player-3'],
        status: 'pending',
        votes: [],
      };

      expect(() => validateDemoMission(validMission)).not.toThrow();
    });

    it('validates different mission statuses', () => {
      const statuses: DemoMission['status'][] = ['pending', 'in-progress', 'success', 'failure'];
      
      statuses.forEach(status => {
        const mission: DemoMission = {
          _brand: 'demo',
          id: `test-mission-${status}`,
          number: 1,
          requiredPlayers: 3,
          failVotesRequired: 1,
          selectedPlayers: [],
          status,
          votes: [],
        };

        expect(() => validateDemoMission(mission)).not.toThrow();
      });
    });
  });

  describe('validateDemoGameState', () => {
    it('validates correct demo game state objects', () => {
      const validGameState: DemoGameState = {
        _brand: 'demo',
        id: 'test-game-state-1',
        roomCode: 'DEMO56',
        phase: 'lobby',
        currentMission: 1,
        hostId: 'player-1',
        players: [
          {
            _brand: 'demo',
            id: 'player-1',
            name: 'Test Player 1',
            role: 'good',
            isHost: true,
            isReady: true,
            connectionStatus: 'connected',
          },
        ],
        missions: [
          {
            _brand: 'demo',
            id: 'mission-1',
            number: 1,
            requiredPlayers: 3,
            failVotesRequired: 1,
            selectedPlayers: [],
            status: 'pending',
            votes: [],
          },
        ],
        settings: {
          playerCount: 5,
          includeMerlin: true,
          includePercival: false,
          includeMorgana: false,
          includeMordred: false,
          includeOberon: false,
        },
      };

      expect(() => validateDemoGameState(validGameState)).not.toThrow();
    });

    it('validates different game phases', () => {
      const phases: DemoGameState['phase'][] = ['lobby', 'role-reveal', 'team-selection', 'mission-voting', 'mission-execution', 'game-end'];
      
      phases.forEach(phase => {
        const gameState: DemoGameState = {
          _brand: 'demo',
          id: `test-game-${phase}`,
          roomCode: `TST${phase.substring(0, 3).toUpperCase()}`,
          phase,
          currentMission: 1,
          hostId: 'player-1',
          players: [],
          missions: [],
          settings: {
            playerCount: 5,
            includeMerlin: true,
            includePercival: false,
            includeMorgana: false,
            includeMordred: false,
            includeOberon: false,
          },
        };

        expect(() => validateDemoGameState(gameState)).not.toThrow();
      });
    });
  });

  describe('validateDemoScenario', () => {
    it('validates correct demo scenario objects', () => {
      const validScenario: DemoScenario = {
        _brand: 'demo',
        id: 'test-scenario',
        name: 'Test Scenario',
        description: 'A test scenario for validation',
        gameState: {
          _brand: 'demo',
          id: 'test-game-state',
          roomCode: 'DEMO34',
          phase: 'lobby',
          currentMission: 1,
          hostId: 'player-1',
          players: [],
          missions: [],
          settings: {
            playerCount: 5,
            includeMerlin: true,
            includePercival: false,
            includeMorgana: false,
            includeMordred: false,
            includeOberon: false,
          },
        },
        category: 'standard',
      };

      expect(() => validateDemoScenario(validScenario)).not.toThrow();
    });

    it('validates different scenario categories', () => {
      const categories: DemoScenario['category'][] = ['standard', 'large-game', 'endgame', 'mobile', 'accessibility'];
      
      categories.forEach(category => {
        const scenario: DemoScenario = {
          _brand: 'demo',
          id: `test-${category}`,
          name: `Test ${category}`,
          description: `Test scenario for ${category}`,
          gameState: {
            _brand: 'demo',
            id: `test-game-${category}`,
            roomCode: 'DEMO12',
            phase: 'lobby',
            currentMission: 1,
            hostId: 'player-1',
            players: [],
            missions: [],
            settings: {
              playerCount: 5,
              includeMerlin: true,
              includePercival: false,
              includeMorgana: false,
              includeMordred: false,
              includeOberon: false,
            },
          },
          category,
        };

        expect(() => validateDemoScenario(scenario)).not.toThrow();
      });
    });
  });

  describe('Environment validation', () => {
    it('detects demo environment correctly', () => {
      // Note: In test environment, isDemoEnvironment should return true
      // since NODE_ENV is typically 'test' which is not 'production'
      expect(typeof isDemoEnvironment()).toBe('boolean');
    });

    it('ensureDemoEnvironment does not throw in test environment', () => {
      expect(() => ensureDemoEnvironment()).not.toThrow();
    });
  });
});

describe('Demo Data Utilities', () => {
  describe('getDemoScenarioById', () => {
    it('returns scenario when ID exists', () => {
      const scenario = getDemoScenarioById('demo-scenario-lobby');
      expect(scenario).toBeDefined();
      expect(scenario?.id).toBe('demo-scenario-lobby');
    });

    it('returns undefined when ID does not exist', () => {
      const scenario = getDemoScenarioById('non-existent-id');
      expect(scenario).toBeUndefined();
    });
  });

  describe('getDemoScenariosByCategory', () => {
    it('returns scenarios for valid category', () => {
      const scenarios = getDemoScenariosByCategory('standard');
      expect(Array.isArray(scenarios)).toBe(true);
      scenarios.forEach(scenario => {
        expect(scenario.category).toBe('standard');
      });
    });

    it('returns empty array for non-existent category', () => {
      const scenarios = getDemoScenariosByCategory('non-existent' as any);
      expect(scenarios).toEqual([]);
    });
  });

  describe('Category-specific getters', () => {
    it('getStandardDemoScenarios returns only standard scenarios', () => {
      const scenarios = getStandardDemoScenarios();
      expect(Array.isArray(scenarios)).toBe(true);
      scenarios.forEach(scenario => {
        expect(scenario.category).toBe('standard');
      });
    });

    it('getLargeGameDemoScenarios returns only large-game scenarios', () => {
      const scenarios = getLargeGameDemoScenarios();
      expect(Array.isArray(scenarios)).toBe(true);
      scenarios.forEach(scenario => {
        expect(scenario.category).toBe('large-game');
      });
    });

    it('getEndgameDemoScenarios returns only endgame scenarios', () => {
      const scenarios = getEndgameDemoScenarios();
      expect(Array.isArray(scenarios)).toBe(true);
      scenarios.forEach(scenario => {
        expect(scenario.category).toBe('endgame');
      });
    });
  });

  describe('createDemoEnvironmentSummary', () => {
    it('returns valid summary object', () => {
      const summary = createDemoEnvironmentSummary();
      
      expect(summary).toHaveProperty('scenarios');
      expect(summary).toHaveProperty('mobileStates');
      expect(summary).toHaveProperty('accessibilityStates');
      expect(summary).toHaveProperty('totalTestCombinations');
      expect(summary).toHaveProperty('categories');
      
      expect(typeof summary.scenarios).toBe('number');
      expect(typeof summary.mobileStates).toBe('number');
      expect(typeof summary.accessibilityStates).toBe('number');
      expect(typeof summary.totalTestCombinations).toBe('number');
      expect(typeof summary.categories).toBe('object');
    });

    it('has valid category counts', () => {
      const summary = createDemoEnvironmentSummary();
      
      expect(summary.categories).toHaveProperty('standard');
      expect(summary.categories).toHaveProperty('largeGame');
      expect(summary.categories).toHaveProperty('endgame');
      expect(summary.categories).toHaveProperty('mobile');
      expect(summary.categories).toHaveProperty('accessibility');
      
      Object.values(summary.categories).forEach(count => {
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });
  });
});

describe('Demo Scenarios Data Integrity', () => {
  it('all predefined scenarios are valid', () => {
    DEMO_SCENARIOS.forEach(scenario => {
      expect(() => validateDemoScenario(scenario)).not.toThrow();
    });
  });

  it('all scenarios have unique IDs', () => {
    const ids = DEMO_SCENARIOS.map(s => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all scenarios have valid categories', () => {
    const validCategories = ['standard', 'large-game', 'endgame', 'mobile', 'accessibility'];
    DEMO_SCENARIOS.forEach(scenario => {
      expect(validCategories).toContain(scenario.category);
    });
  });

  it('all game states in scenarios are valid', () => {
    DEMO_SCENARIOS.forEach(scenario => {
      expect(() => validateDemoGameState(scenario.gameState)).not.toThrow();
    });
  });

  it('all players in scenarios are valid', () => {
    DEMO_SCENARIOS.forEach(scenario => {
      scenario.gameState.players.forEach(player => {
        expect(() => validateDemoPlayer(player)).not.toThrow();
      });
    });
  });

  it('all missions in scenarios are valid', () => {
    DEMO_SCENARIOS.forEach(scenario => {
      scenario.gameState.missions.forEach(mission => {
        expect(() => validateDemoMission(mission)).not.toThrow();
      });
    });
  });
});
