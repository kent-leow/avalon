import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DemoIndicator, DemoBanner } from '~/components/features/demo/DemoIndicator';
import { DEMO_SCENARIOS, getDemoScenarioById, createDemoEnvironmentSummary } from '~/data/demo';

// Mock Next.js components
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('next/navigation', () => ({
  usePathname: () => '/demo',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe('Demo Data Integration Tests', () => {
  describe('DEMO_SCENARIOS integration', () => {
    it('should have valid demo scenarios that can be used in components', () => {
      expect(DEMO_SCENARIOS.length).toBeGreaterThan(0);
      
      // Test that scenarios have the required fields for UI display
      DEMO_SCENARIOS.forEach(scenario => {
        expect(scenario.name).toBeTruthy();
        expect(scenario.description).toBeTruthy();
        expect(scenario.gameState).toBeTruthy();
        expect(scenario.category).toBeTruthy();
      });
    });

    it('should provide scenarios that can be retrieved by ID', () => {
      const firstScenario = DEMO_SCENARIOS[0];
      if (firstScenario) {
        const retrievedScenario = getDemoScenarioById(firstScenario.id);
        expect(retrievedScenario).toEqual(firstScenario);
      }
    });

    it('should have scenarios with valid game states for rendering', () => {
      DEMO_SCENARIOS.forEach(scenario => {
        expect(scenario.gameState.roomCode).toMatch(/^[A-Z0-9]{6}$/);
        expect(scenario.gameState.phase).toBeTruthy();
        expect(Array.isArray(scenario.gameState.players)).toBe(true);
        expect(Array.isArray(scenario.gameState.missions)).toBe(true);
        expect(scenario.gameState.settings).toBeTruthy();
      });
    });
  });

  describe('Demo Environment Summary integration', () => {
    it('should provide environment summary for dashboard display', () => {
      const summary = createDemoEnvironmentSummary();
      
      expect(typeof summary.scenarios).toBe('number');
      expect(typeof summary.mobileStates).toBe('number');
      expect(typeof summary.accessibilityStates).toBe('number');
      expect(typeof summary.totalTestCombinations).toBe('number');
      expect(typeof summary.categories).toBe('object');
      
      // Should have counts for all categories
      expect(summary.categories.standard).toBeGreaterThanOrEqual(0);
      expect(summary.categories.largeGame).toBeGreaterThanOrEqual(0);
      expect(summary.categories.endgame).toBeGreaterThanOrEqual(0);
      expect(summary.categories.mobile).toBeGreaterThanOrEqual(0);
      expect(summary.categories.accessibility).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Demo Components with Demo Data integration', () => {
    it('should render DemoIndicator without errors', () => {
      render(<DemoIndicator />);
      expect(screen.getByText('DEMO')).toBeInTheDocument();
    });

    it('should render DemoBanner with interactive functionality', async () => {
      const onDismiss = jest.fn();
      
      render(<DemoBanner onDismiss={onDismiss} />);
      
      expect(screen.getByText(/Demo Mode Active/)).toBeInTheDocument();
      
      const closeButton = screen.getByText('×');
      closeButton.click();
      
      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle demo environment state properly', () => {
      // Test that components can access demo environment
      render(<DemoIndicator />);
      
      // Demo indicator should be visible since we're in test environment
      expect(screen.getByText('DEMO')).toBeInTheDocument();
    });
  });

  describe('Demo Data Consistency', () => {
    it('should have consistent data structure across all scenarios', () => {
      DEMO_SCENARIOS.forEach(scenario => {
        // All scenarios should have consistent structure
        expect(scenario._brand).toBe('demo');
        expect(typeof scenario.id).toBe('string');
        expect(typeof scenario.name).toBe('string');
        expect(typeof scenario.description).toBe('string');
        expect(scenario.gameState._brand).toBe('demo');
        
        // Game state should have consistent required fields
        expect(typeof scenario.gameState.roomCode).toBe('string');
        expect(scenario.gameState.roomCode).toHaveLength(6);
        expect(typeof scenario.gameState.phase).toBe('string');
        
        // Players array should be valid
        expect(Array.isArray(scenario.gameState.players)).toBe(true);
        scenario.gameState.players.forEach(player => {
          expect(player._brand).toBe('demo');
          expect(typeof player.id).toBe('string');
          expect(typeof player.name).toBe('string');
          expect(typeof player.role).toBe('string');
          expect(typeof player.isHost).toBe('boolean');
          expect(typeof player.isReady).toBe('boolean');
          expect(['connected', 'disconnected', 'reconnecting']).toContain(player.connectionStatus);
        });
        
        // Missions array should be valid
        expect(Array.isArray(scenario.gameState.missions)).toBe(true);
        scenario.gameState.missions.forEach(mission => {
          expect(mission._brand).toBe('demo');
          expect(typeof mission.id).toBe('string');
          expect(typeof mission.number).toBe('number');
          expect(mission.number).toBeGreaterThanOrEqual(1);
          expect(mission.number).toBeLessThanOrEqual(5);
          expect(typeof mission.requiredPlayers).toBe('number');
          expect(['pending', 'in-progress', 'success', 'failure']).toContain(mission.status);
          expect(Array.isArray(mission.selectedPlayers)).toBe(true);
          expect(Array.isArray(mission.votes)).toBe(true);
        });
        
        // Settings should be valid
        expect(typeof scenario.gameState.settings).toBe('object');
        expect(typeof scenario.gameState.settings.playerCount).toBe('number');
        expect(typeof scenario.gameState.settings.includeMerlin).toBe('boolean');
      });
    });

    it('should have valid category distribution', () => {
      const categories = ['standard', 'large-game', 'endgame', 'mobile', 'accessibility'];
      const categoryCounts = categories.map(category => 
        DEMO_SCENARIOS.filter(s => s.category === category).length
      );
      
      // Should have at least some scenarios (not necessarily in every category)
      const totalScenarios = categoryCounts.reduce((sum, count) => sum + count, 0);
      expect(totalScenarios).toBe(DEMO_SCENARIOS.length);
      expect(totalScenarios).toBeGreaterThan(0);
    });

    it('should have unique scenario IDs across all scenarios', () => {
      const ids = DEMO_SCENARIOS.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique room codes across all scenarios', () => {
      const roomCodes = DEMO_SCENARIOS.map(s => s.gameState.roomCode);
      const uniqueRoomCodes = new Set(roomCodes);
      expect(uniqueRoomCodes.size).toBe(roomCodes.length);
    });
  });
});
