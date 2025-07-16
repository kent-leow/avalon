import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StartGameSection from './StartGameSection';

// Mock tRPC
jest.mock('~/trpc/react', () => ({
  api: {
    room: {
      getGameState: {
        useQuery: jest.fn(() => ({
          data: {
            gameState: { phase: 'lobby' },
            phase: 'lobby',
            players: [
              { id: '1', name: 'Alice', isHost: true, isReady: false },
              { id: '2', name: 'Bob', isHost: false, isReady: true }
            ]
          },
          refetch: jest.fn()
        }))
      },
      checkStartRequirements: {
        useQuery: jest.fn(() => ({
          data: {
            requirements: [
              { id: 'min-players', name: 'Minimum Players', description: 'At least 5 players required', status: 'pending', required: true }
            ],
            canStart: false,
            playerCount: 2,
            minPlayers: 5
          },
          refetch: jest.fn()
        }))
      },
      startGame: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
          isPending: false
        }))
      },
      updatePlayerReady: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
          isPending: false
        }))
      }
    }
  }
}));

// Mock session
jest.mock('~/lib/session', () => ({
  getSession: jest.fn(() => ({
    id: '1',
    name: 'Alice',
    roomId: 'test-room'
  }))
}));

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}));

describe('StartGameSection Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with real tRPC integration', async () => {
    render(<StartGameSection roomId="test-room" roomCode="TEST123" />);

    expect(screen.getByRole('heading', { name: 'Start Game' })).toBeInTheDocument();
    expect(screen.getByText('Complete the requirements below to begin your Avalon adventure')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Game' })).toBeInTheDocument();
  });

  it('displays pre-start checklist', () => {
    render(
      <StartGameSection
        roomId="test-room"
        roomCode="TEST123"
      />
    );

    expect(screen.getByText('Game Start Requirements')).toBeInTheDocument();
    expect(screen.getByText('Minimum Players')).toBeInTheDocument();
  });

  it('displays player ready list', () => {
    render(
      <StartGameSection
        roomId="test-room"
        roomCode="TEST123"
      />
    );

    expect(screen.getByText('Players (2)')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('has correct test ids', () => {
    render(
      <StartGameSection
        roomId="test-room"
        roomCode="TEST123"
      />
    );

    expect(screen.getByTestId('pre-start-checklist')).toBeInTheDocument();
    expect(screen.getByTestId('player-ready-list')).toBeInTheDocument();
    expect(screen.getByTestId('start-game-button')).toBeInTheDocument();
  });
});
