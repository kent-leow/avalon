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
      expect(screen.getByText('Lobby')).toBeInTheDocument();
      expect(screen.getByText('Waiting for players to join and ready up')).toBeInTheDocument();
    });

    it('renders role reveal phase correctly', () => {
      render(
        <PhaseController 
          {...defaultProps} 
          currentPhase="roleReveal"
        />
      );
      
      expect(screen.getByTestId('role-reveal-phase')).toBeInTheDocument();
      expect(screen.getByText('Role Reveal')).toBeInTheDocument();
      expect(screen.getByText('Players are learning their roles')).toBeInTheDocument();
    });

    it('renders voting phase correctly', () => {
      render(
        <PhaseController 
          {...defaultProps} 
          currentPhase="voting"
        />
      );
      
      expect(screen.getByTestId('voting-phase')).toBeInTheDocument();
      expect(screen.getByText('Team Voting')).toBeInTheDocument();
      expect(screen.getByTestId('approve-vote-button')).toBeInTheDocument();
      expect(screen.getByTestId('reject-vote-button')).toBeInTheDocument();
    });

    it('renders mission select phase correctly', () => {
      render(
        <PhaseController 
          {...defaultProps} 
          currentPhase="missionSelect"
        />
      );
      
      expect(screen.getByTestId('mission-select-phase')).toBeInTheDocument();
      expect(screen.getByText('Mission Selection')).toBeInTheDocument();
      expect(screen.getByText('The leader is selecting team members')).toBeInTheDocument();
    });

    it('renders mission vote phase correctly', () => {
      render(
        <PhaseController 
          {...defaultProps} 
          currentPhase="missionVote"
        />
      );
      
      expect(screen.getByTestId('mission-vote-phase')).toBeInTheDocument();
      expect(screen.getByText('Mission Vote')).toBeInTheDocument();
      expect(screen.getByTestId('success-vote-button')).toBeInTheDocument();
      expect(screen.getByTestId('failure-vote-button')).toBeInTheDocument();
    });

    it('renders mission result phase correctly', () => {
      render(
        <PhaseController 
          {...defaultProps} 
          currentPhase="missionResult"
        />
      );
      
      expect(screen.getByTestId('mission-result-phase')).toBeInTheDocument();
      expect(screen.getByText('Mission Result')).toBeInTheDocument();
      expect(screen.getByText('Mission results are being revealed')).toBeInTheDocument();
    });

    it('renders assassin attempt phase correctly', () => {
      render(
        <PhaseController 
          {...defaultProps} 
          currentPhase="assassinAttempt"
        />
      );
      
      expect(screen.getByTestId('assassin-attempt-phase')).toBeInTheDocument();
      expect(screen.getByText('Assassin Attempt')).toBeInTheDocument();
      expect(screen.getByText('The assassin is making their attempt')).toBeInTheDocument();
    });

    it('renders game over phase correctly', () => {
      render(
        <PhaseController 
          {...defaultProps} 
          currentPhase="gameOver"
        />
      );
      
      expect(screen.getByTestId('game-over-phase')).toBeInTheDocument();
      expect(screen.getByText('Game Over')).toBeInTheDocument();
      expect(screen.getByText('The game has ended')).toBeInTheDocument();
      expect(screen.getByTestId('new-game-button')).toBeInTheDocument();
    });
  });

  describe('Phase Header', () => {
    it('displays correct phase information', () => {
      render(<PhaseController {...defaultProps} />);
      
      expect(screen.getByText('Lobby')).toBeInTheDocument();
      expect(screen.getByText('Waiting for players to join and ready up')).toBeInTheDocument();
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
