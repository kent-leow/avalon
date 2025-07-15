import { render, screen, fireEvent } from '@testing-library/react';
import StartGameButton from './StartGameButton';

describe('StartGameButton', () => {
  const mockOnStartGame = jest.fn();

  beforeEach(() => {
    mockOnStartGame.mockClear();
  });

  it('renders for non-host user', () => {
    render(
      <StartGameButton
        roomId="test-room"
        isHost={false}
        canStart={true}
        onStartGame={mockOnStartGame}
        isStarting={false}
      />
    );

    expect(screen.getByText('Waiting for host to start the game...')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders enabled button for host when can start', () => {
    render(
      <StartGameButton
        roomId="test-room"
        isHost={true}
        canStart={true}
        onStartGame={mockOnStartGame}
        isStarting={false}
      />
    );

    const button = screen.getByRole('button', { name: 'Start Game' });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  it('renders disabled button when cannot start', () => {
    render(
      <StartGameButton
        roomId="test-room"
        isHost={true}
        canStart={false}
        onStartGame={mockOnStartGame}
        isStarting={false}
      />
    );

    const button = screen.getByRole('button', { name: 'Start Game' });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(screen.getByText('Complete all requirements to start the game')).toBeInTheDocument();
  });

  it('shows loading state when starting', () => {
    render(
      <StartGameButton
        roomId="test-room"
        isHost={true}
        canStart={true}
        onStartGame={mockOnStartGame}
        isStarting={true}
      />
    );

    expect(screen.getByText('Starting Game...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onStartGame when clicked', () => {
    render(
      <StartGameButton
        roomId="test-room"
        isHost={true}
        canStart={true}
        onStartGame={mockOnStartGame}
        isStarting={false}
      />
    );

    const button = screen.getByRole('button', { name: 'Start Game' });
    fireEvent.click(button);

    expect(mockOnStartGame).toHaveBeenCalledTimes(1);
  });

  it('does not call onStartGame when disabled', () => {
    render(
      <StartGameButton
        roomId="test-room"
        isHost={true}
        canStart={false}
        onStartGame={mockOnStartGame}
        isStarting={false}
      />
    );

    const button = screen.getByRole('button', { name: 'Start Game' });
    fireEvent.click(button);

    expect(mockOnStartGame).not.toHaveBeenCalled();
  });

  it('does not call onStartGame when starting', () => {
    render(
      <StartGameButton
        roomId="test-room"
        isHost={true}
        canStart={true}
        onStartGame={mockOnStartGame}
        isStarting={true}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnStartGame).not.toHaveBeenCalled();
  });

  it('has correct testid', () => {
    render(
      <StartGameButton
        roomId="test-room"
        isHost={true}
        canStart={true}
        onStartGame={mockOnStartGame}
        isStarting={false}
      />
    );

    expect(screen.getByTestId('start-game-button')).toBeInTheDocument();
  });
});
