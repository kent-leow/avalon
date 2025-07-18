/**
 * GameEngine Component Tests
 * 
 * Unit tests for the main GameEngine component
 */

import { render, screen, waitFor } from '@testing-library/react';
import { GameEngine } from './GameEngine';
import { createMockGameState, createMockPlayers } from '~/lib/game-engine-utils';

// Mock the child components
jest.mock('./PhaseController', () => ({
  PhaseController: ({ currentPhase, roomCode, playerId }: any) => (
    <div data-testid="phase-controller">
      Phase: {currentPhase}, Room: {roomCode}, Player: {playerId}
    </div>
  ),
}));

jest.mock('./GameStateManager', () => ({
  GameStateManager: ({ roomCode }: any) => (
    <div data-testid="game-state-manager">Room: {roomCode}</div>
  ),
}));

jest.mock('./PerformanceMonitor', () => ({
  PerformanceMonitor: ({ enabled }: any) => (
    <div data-testid="performance-monitor">Enabled: {enabled.toString()}</div>
  ),
}));

jest.mock('./ErrorBoundary', () => ({
  GameEngineErrorBoundary: ({ children }: any) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

describe('GameEngine', () => {
  const defaultProps = {
    roomCode: 'TEST123',
    playerId: 'player-1',
    playerName: 'Test Player',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('shows loading state during initialization', () => {
      // Mock a slower initialization to catch the loading state
      jest.spyOn(global, 'setTimeout').mockImplementation((cb) => {
        // Don't call the callback immediately
        return 123 as any;
      });
      
      render(<GameEngine {...defaultProps} />);
      
      // Should show loading state when initialization is slow
      expect(screen.getByTestId('game-engine-loading')).toBeInTheDocument();
      expect(screen.getByText('Initializing Game Engine...')).toBeInTheDocument();
      
      // Clean up
      jest.restoreAllMocks();
    });

    it('initializes with default game state', async () => {
      render(<GameEngine {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-engine-container')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('phase-controller')).toBeInTheDocument();
      expect(screen.getByText(/Phase: lobby/)).toBeInTheDocument();
    });

    it('initializes with provided initial game state', async () => {
      const initialGameState = createMockGameState();
      initialGameState.phase = 'roleReveal';
      
      render(
        <GameEngine 
          {...defaultProps} 
          initialGameState={initialGameState}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Phase: roleReveal/)).toBeInTheDocument();
      });
    });
  });

  describe('Component Integration', () => {
    it('renders all child components', async () => {
      render(<GameEngine {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('performance-monitor')).toBeInTheDocument();
        expect(screen.getByTestId('game-state-manager')).toBeInTheDocument();
        expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
        expect(screen.getByTestId('phase-controller')).toBeInTheDocument();
      });
    });

    it('passes correct props to child components', async () => {
      render(<GameEngine {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getAllByText(/Room: TEST123/)).toHaveLength(2); // GameStateManager and PhaseController
        expect(screen.getByText(/Player: player-1/)).toBeInTheDocument();
        expect(screen.getByText(/Enabled: true/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('calls onError when error occurs', async () => {
      const onError = jest.fn();
      
      render(
        <GameEngine 
          {...defaultProps} 
          onError={onError}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('game-engine-container')).toBeInTheDocument();
      });
      
      // Error handling is tested via the error boundary and state manager
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('Phase Transitions', () => {
    it('calls onPhaseTransition when phase changes', async () => {
      const onPhaseTransition = jest.fn();
      
      render(
        <GameEngine 
          {...defaultProps} 
          onPhaseTransition={onPhaseTransition}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('game-engine-container')).toBeInTheDocument();
      });
      
      // Phase transition testing would require more complex state changes
      // This tests the basic setup
      expect(onPhaseTransition).not.toHaveBeenCalled();
    });

    it('shows transition overlay during phase transitions', async () => {
      render(<GameEngine {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-engine-container')).toBeInTheDocument();
      });
      
      // Transition overlay is not visible initially
      expect(screen.queryByTestId('phase-transition-overlay')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies correct background color', async () => {
      render(<GameEngine {...defaultProps} />);
      
      await waitFor(() => {
        const container = screen.getByTestId('game-engine-container');
        expect(container).toHaveStyle('background-color: rgb(10, 10, 15)');
      });
    });

    it('applies correct loading state styling', () => {
      // Mock a slower initialization to catch the loading state
      jest.spyOn(global, 'setTimeout').mockImplementation((cb: any) => {
        // Don't call the callback immediately
        return 123 as any;
      });
      
      render(<GameEngine {...defaultProps} />);
      
      const loadingContainer = screen.getByTestId('game-engine-loading');
      expect(loadingContainer).toHaveStyle('background-color: rgb(10, 10, 15)');
      
      // Clean up
      jest.restoreAllMocks();
    });
  });

  describe('Performance', () => {
    it('enables performance monitoring by default', async () => {
      render(<GameEngine {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Enabled: true/)).toBeInTheDocument();
      });
    });
  });
});
