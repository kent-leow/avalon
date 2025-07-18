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
          mutateAsync: jest.fn(),
          isPending: false
        }))
      },
      submitVote: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
          mutateAsync: jest.fn(),
          isPending: false
        }))
      },
      submitMissionTeam: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
          mutateAsync: jest.fn(),
          isPending: false
        }))
      },
      submitMissionVote: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
          mutateAsync: jest.fn(),
          isPending: false
        }))
      }
    },
    subscriptions: {
      subscribeToRoom: {
        useSubscription: jest.fn(() => ({
          data: null,
          error: null
        }))
      }
    }
  }
}));

// Mock useOptimizedRealtimeRoom hook
jest.mock('~/hooks/useOptimizedRealtimeRoom', () => ({
  useOptimizedRealtimeRoom: jest.fn(() => ({
    roomState: {
      room: {
        id: 'test-room',
        code: 'TEST123',
        hostId: 'host-id',
        gameState: {
          phase: 'lobby',
          round: 1,
          leaderIndex: 0,
          votes: [],
          missions: [],
        },
        players: [
          { id: '1', name: 'Alice', isHost: true, isReady: false },
          { id: '2', name: 'Bob', isHost: false, isReady: true }
        ]
      },
      players: [
        { id: '1', name: 'Alice', isHost: true, isReady: false },
        { id: '2', name: 'Bob', isHost: false, isReady: true }
      ],
      gameState: {
        phase: 'lobby',
        round: 1,
        leaderIndex: 0,
        votes: [],
        missions: [],
      },
      connected: true,
      error: null,
      isLoading: false,
      lastUpdate: new Date(),
      subscriptionStatus: 'connected',
      connectionInfo: {
        connected: true,
        reconnectCount: 0,
        lastReconnectTime: null,
        connectionId: 'test-connection'
      }
    }
  }))
}));

// Mock session
jest.mock('~/lib/session', () => ({
  getSession: jest.fn(() => Promise.resolve({
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

    expect(screen.getByRole('heading', { name: 'Game Setup' })).toBeInTheDocument();
    expect(screen.getByText('Complete the requirements below to begin your Avalon adventure')).toBeInTheDocument();
    expect(screen.getByText('Waiting for host to start the game...')).toBeInTheDocument();
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
