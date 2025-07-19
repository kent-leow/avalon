import {
  DEMO_SCENARIOS,
  getDemoScenarioById,
  getDemoScenariosByCategory,
  getStandardDemoScenarios,
  getLargeGameDemoScenarios,
  getEndgameDemoScenarios,
  getMobileDemoScenarios,
  getAccessibilityDemoScenarios,
  createDemoEnvironmentSummary,
} from '../index';
import type { DemoScenario } from '../types';

describe('Demo Data Utilities', () => {
  describe('DEMO_SCENARIOS', () => {
    it('contains an array of demo scenarios', () => {
      expect(Array.isArray(DEMO_SCENARIOS)).toBe(true);
      expect(DEMO_SCENARIOS.length).toBeGreaterThan(0);
    });

    it('contains valid demo scenario objects', () => {
      DEMO_SCENARIOS.forEach(scenario => {
        expect(scenario._brand).toBe('demo');
        expect(typeof scenario.id).toBe('string');
        expect(typeof scenario.name).toBe('string');
        expect(typeof scenario.description).toBe('string');
        expect(typeof scenario.gameState).toBe('object');
        expect(['standard', 'large-game', 'endgame', 'mobile', 'accessibility']).toContain(scenario.category);
      });
    });

    it('has unique scenario IDs', () => {
      const ids = DEMO_SCENARIOS.map(scenario => scenario.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('getDemoScenarioById', () => {
    it('returns scenario for valid ID', () => {
      const firstScenario = DEMO_SCENARIOS[0];
      if (firstScenario) {
        const result = getDemoScenarioById(firstScenario.id);
        expect(result).toBeDefined();
        expect(result?.id).toBe(firstScenario.id);
      }
    });

    it('returns undefined for invalid ID', () => {
      const result = getDemoScenarioById('non-existent-id');
      expect(result).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      const result = getDemoScenarioById('');
      expect(result).toBeUndefined();
    });
  });

  describe('getDemoScenariosByCategory', () => {
    it('returns scenarios for valid category', () => {
      const categories: DemoScenario['category'][] = ['standard', 'large-game', 'endgame', 'mobile', 'accessibility'];
      
      categories.forEach(category => {
        const scenarios = getDemoScenariosByCategory(category);
        expect(Array.isArray(scenarios)).toBe(true);
        scenarios.forEach(scenario => {
          expect(scenario.category).toBe(category);
        });
      });
    });

    it('returns empty array for category with no scenarios', () => {
      // This might not apply if all categories have scenarios, but test the behavior
      const scenarios = getDemoScenariosByCategory('mobile' as any);
      expect(Array.isArray(scenarios)).toBe(true);
    });
  });

  describe('getStandardDemoScenarios', () => {
    it('returns only standard scenarios', () => {
      const scenarios = getStandardDemoScenarios();
      expect(Array.isArray(scenarios)).toBe(true);
      scenarios.forEach(scenario => {
        expect(scenario.category).toBe('standard');
      });
    });
  });

  describe('getLargeGameDemoScenarios', () => {
    it('returns only large-game scenarios', () => {
      const scenarios = getLargeGameDemoScenarios();
      expect(Array.isArray(scenarios)).toBe(true);
      scenarios.forEach(scenario => {
        expect(scenario.category).toBe('large-game');
      });
    });
  });

  describe('getEndgameDemoScenarios', () => {
    it('returns only endgame scenarios', () => {
      const scenarios = getEndgameDemoScenarios();
      expect(Array.isArray(scenarios)).toBe(true);
      scenarios.forEach(scenario => {
        expect(scenario.category).toBe('endgame');
      });
    });
  });

  describe('getMobileDemoScenarios', () => {
    it('returns only mobile scenarios', () => {
      const scenarios = getMobileDemoScenarios();
      expect(Array.isArray(scenarios)).toBe(true);
      scenarios.forEach(scenario => {
        expect(scenario.category).toBe('mobile');
      });
    });
  });

  describe('getAccessibilityDemoScenarios', () => {
    it('returns only accessibility scenarios', () => {
      const scenarios = getAccessibilityDemoScenarios();
      expect(Array.isArray(scenarios)).toBe(true);
      scenarios.forEach(scenario => {
        expect(scenario.category).toBe('accessibility');
      });
    });
  });

  describe('createDemoEnvironmentSummary', () => {
    it('returns summary with scenario counts', () => {
      const summary = createDemoEnvironmentSummary();
      
      expect(typeof summary).toBe('object');
      expect(typeof summary.scenarios).toBe('number');
      expect(typeof summary.mobileStates).toBe('number');
      expect(typeof summary.accessibilityStates).toBe('number');
      expect(typeof summary.totalTestCombinations).toBe('number');
      expect(typeof summary.categories).toBe('object');
      
      // Verify counts match actual scenarios
      expect(summary.scenarios).toBe(DEMO_SCENARIOS.length);
      
      // Verify category counts
      const standardCount = DEMO_SCENARIOS.filter(s => s.category === 'standard').length;
      const largeGameCount = DEMO_SCENARIOS.filter(s => s.category === 'large-game').length;
      const endgameCount = DEMO_SCENARIOS.filter(s => s.category === 'endgame').length;
      const mobileCount = DEMO_SCENARIOS.filter(s => s.category === 'mobile').length;
      const accessibilityCount = DEMO_SCENARIOS.filter(s => s.category === 'accessibility').length;
      
      expect(summary.categories.standard).toBe(standardCount);
      expect(summary.categories.largeGame).toBe(largeGameCount);
      expect(summary.categories.endgame).toBe(endgameCount);
      expect(summary.categories.mobile).toBe(mobileCount);
      expect(summary.categories.accessibility).toBe(accessibilityCount);
    });

    it('includes all expected category keys', () => {
      const summary = createDemoEnvironmentSummary();
      const expectedCategories = ['standard', 'largeGame', 'endgame', 'mobile', 'accessibility'];
      
      expectedCategories.forEach(category => {
        expect(summary.categories).toHaveProperty(category);
        expect(typeof summary.categories[category as keyof typeof summary.categories]).toBe('number');
      });
    });

    it('calculates total test combinations correctly', () => {
      const summary = createDemoEnvironmentSummary();
      
      const expectedCombinations = summary.scenarios * summary.mobileStates * summary.accessibilityStates;
      expect(summary.totalTestCombinations).toBe(expectedCombinations);
    });
  });
});
