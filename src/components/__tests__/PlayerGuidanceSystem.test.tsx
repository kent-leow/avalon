import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { PlayerGuidanceSystem } from '~/components/PlayerGuidanceSystem';
import { PlayerGuidanceProvider } from '~/context/PlayerGuidanceContext';
import type { Role } from '~/types/roles';

// Mock the hook
jest.mock('~/hooks/usePlayerGuidance', () => ({
  usePlayerGuidance: () => ({
    guidanceState: {
      isGuidanceActive: true,
      preferences: {
        level: 'beginner',
        showTooltips: true,
        showStrategicHints: true,
        showActionPreviews: true,
        showActionIndicators: true,
        showStepByStep: true,
        autoAdvance: false,
      },
      activeTooltip: null,
      activeHints: [],
      completedSteps: [],
      currentGuidanceFlow: null,
      interactionHistory: [],
      guidanceProgress: {},
    },
    availableActions: [],
    recommendations: [],
    currentTooltip: null,
    currentActionPreview: null,
    toggleGuidance: jest.fn(),
    dismissHint: jest.fn(),
    showTooltip: jest.fn(),
    hideTooltip: jest.fn(),
    startGuidanceFlow: jest.fn(),
    updatePreferences: jest.fn(),
    needsGuidance: jest.fn(),
    getContextualHelp: jest.fn(),
  }),
}));

const mockRole: Role = {
  id: 'loyal-servant',
  name: 'Loyal Servant',
  team: 'good',
  description: 'A loyal servant of Arthur',
  abilities: [],
  seesEvil: false,
  seenByMerlin: false,
  isAssassin: false,
};

describe('PlayerGuidanceSystem', () => {
  it('renders without crashing', () => {
    render(
      <PlayerGuidanceProvider>
        <PlayerGuidanceSystem 
          gameState={undefined} 
          playerId="test-player" 
          playerRole={mockRole}
        >
          <div>Test content</div>
        </PlayerGuidanceSystem>
      </PlayerGuidanceProvider>
    );
    
    expect(screen.getByText('Test content')).toBeDefined();
  });

  it('renders guidance controls when guidance is active', () => {
    render(
      <PlayerGuidanceProvider>
        <PlayerGuidanceSystem 
          gameState={undefined} 
          playerId="test-player" 
          playerRole={mockRole}
        >
          <div>Test content</div>
        </PlayerGuidanceSystem>
      </PlayerGuidanceProvider>
    );
    
    // Should show guidance toggle button
    expect(screen.getByTitle('Disable Guidance')).toBeDefined();
  });
});
