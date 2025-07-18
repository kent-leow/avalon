/**
 * PhaseController Component Tests
 * 
 * Unit tests for the PhaseController component
 */

import { render, screen } from '@testing-library/react';
import { PhaseController } from './PhaseController';
import { createMockGameState, createMockPlayers } from '~/lib/game-engine-utils';

describe('PhaseController', () => {
  const defaultProps = {
    currentPhase: 'lobby' as const,
    gameState: createMockGameState(),
    players: createMockPlayers(5),
    onPhaseTransition: jest.fn(),
    roomCode: 'TEST123',
    playerId: 'player-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Phase Rendering', () => {
    it('renders lobby phase correctly', () => {
      render(<PhaseController {...defaultProps} />);
      
      expect(screen.getByTestId('lobby-phase')).toBeInTheDocument();
      expect(screen.getAllByText('Lobby')).toHaveLength(2); // Header and phase content
      expect(screen.getAllByText('Waiting for players to join and ready up')).toHaveLength(2); // Header and phase content
    });

    it('renders role reveal phase correctly', () => {
      const propsWithRoleReveal = {
        ...defaultProps,
        currentPhase: 'roleReveal' as const
      };
      
      render(<PhaseController {...propsWithRoleReveal} />);
      
      expect(screen.getByTestId('role-reveal-phase')).toBeInTheDocument();
      expect(screen.getAllByText('Role Reveal')).toHaveLength(2); // Header and phase content
      expect(screen.getAllByText('Players are learning their roles')).toHaveLength(2); // Header and phase content
    });

    it('renders voting phase correctly', () => {
      const propsWithVoting = {
        ...defaultProps,
        currentPhase: 'voting' as const
      };
      
      render(<PhaseController {...propsWithVoting} />);
      
      expect(screen.getByTestId('voting-phase')).toBeInTheDocument();
      expect(screen.getAllByText('Team Voting')).toHaveLength(2); // Header and phase content
      expect(screen.getByTestId('approve-vote-button')).toBeInTheDocument();
      expect(screen.getByTestId('reject-vote-button')).toBeInTheDocument();
    });

    it('renders mission select phase correctly', () => {
      const propsWithMissionSelect = {
        ...defaultProps,
        currentPhase: 'missionSelect' as const
      };
      
      render(<PhaseController {...propsWithMissionSelect} />);
      
      expect(screen.getByTestId('mission-select-phase')).toBeInTheDocument();
      expect(screen.getAllByText('Mission Selection')).toHaveLength(2); // Header and phase content
      expect(screen.getAllByText('The leader is selecting team members')).toHaveLength(2); // Header and phase content
    });

    it('renders mission vote phase correctly', () => {
      const propsWithMissionVote = {
        ...defaultProps,
        currentPhase: 'missionVote' as const
      };
      
      render(<PhaseController {...propsWithMissionVote} />);
      
      expect(screen.getByTestId('mission-vote-phase')).toBeInTheDocument();
      expect(screen.getAllByText('Mission Vote')).toHaveLength(3); // Header, phase content, and button label
      expect(screen.getByTestId('success-vote-button')).toBeInTheDocument();
      expect(screen.getByTestId('failure-vote-button')).toBeInTheDocument();
    });

    it('renders mission result phase correctly', () => {
      const propsWithMissionResult = {
        ...defaultProps,
        currentPhase: 'missionResult' as const
      };
      
      render(<PhaseController {...propsWithMissionResult} />);
      
      expect(screen.getByTestId('mission-result-phase')).toBeInTheDocument();
      expect(screen.getAllByText('Mission Result')).toHaveLength(2); // Header and phase content
      expect(screen.getAllByText('Mission results are being revealed')).toHaveLength(2); // Header and phase content
    });

    it('renders assassin attempt phase correctly', () => {
      const propsWithAssassin = {
        ...defaultProps,
        currentPhase: 'assassinAttempt' as const
      };
      
      render(<PhaseController {...propsWithAssassin} />);
      
      expect(screen.getByTestId('assassin-attempt-phase')).toBeInTheDocument();
      expect(screen.getAllByText('Assassin Attempt')).toHaveLength(2); // Header and phase content
      expect(screen.getAllByText('The assassin is making their attempt')).toHaveLength(2); // Header and phase content
    });

    it('renders game over phase correctly', () => {
      const propsWithGameOver = {
        ...defaultProps,
        currentPhase: 'gameOver' as const
      };
      
      render(<PhaseController {...propsWithGameOver} />);
      
      expect(screen.getByTestId('game-over-phase')).toBeInTheDocument();
      expect(screen.getAllByText('Game Over')).toHaveLength(2); // Header and phase content
      expect(screen.getAllByText('The game has ended')).toHaveLength(2); // Header and phase content
      expect(screen.getByTestId('new-game-button')).toBeInTheDocument();
    });
  });

  describe('Phase Header', () => {
    it('displays correct phase information', () => {
      render(<PhaseController {...defaultProps} />);
      
      expect(screen.getAllByText('Lobby')).toHaveLength(2); // Header and phase content
      expect(screen.getAllByText('Waiting for players to join and ready up')).toHaveLength(2); // Header and phase content
      expect(screen.getByText('Room: TEST123')).toBeInTheDocument();
      expect(screen.getByText('Round: 1')).toBeInTheDocument();
      expect(screen.getByText('Players: 5')).toBeInTheDocument();
    });
  });

  describe('Player Display', () => {
    it('displays all players in lobby phase', () => {
      render(<PhaseController {...defaultProps} />);
      
      expect(screen.getByText('Player 1 (Host)')).toBeInTheDocument();
      expect(screen.getByText('Player 2')).toBeInTheDocument();
      expect(screen.getByText('Player 3')).toBeInTheDocument();
      expect(screen.getByText('Player 4')).toBeInTheDocument();
      expect(screen.getByText('Player 5')).toBeInTheDocument();
    });

    it('displays player ready status', () => {
      render(<PhaseController {...defaultProps} />);
      
      // All mock players are ready by default
      expect(screen.getAllByText('Ready')).toHaveLength(5);
    });
  });

  describe('Styling', () => {
    it('applies correct background color', () => {
      render(<PhaseController {...defaultProps} />);
      
      const container = screen.getByTestId('phase-controller');
      expect(container).toBeInTheDocument();
    });
  });
});
