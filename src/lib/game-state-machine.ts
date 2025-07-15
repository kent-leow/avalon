import { type GamePhase, type GameState } from "~/types/game-state";

/**
 * Valid game phase transitions
 */
const PHASE_TRANSITIONS: Record<GamePhase, GamePhase[]> = {
  lobby: ['roleReveal'],
  roleReveal: ['voting'],
  voting: ['missionSelect'],
  missionSelect: ['missionVote'],
  missionVote: ['missionResult'],
  missionResult: ['voting', 'assassinAttempt', 'gameOver'],
  assassinAttempt: ['gameOver'],
  gameOver: [],
};

/**
 * Game state machine for managing valid transitions
 */
export class GameStateMachine {
  private currentPhase: GamePhase;
  private gameState: GameState;

  constructor(initialState: GameState) {
    this.currentPhase = initialState.phase;
    this.gameState = { ...initialState };
  }

  /**
   * Checks if a phase transition is valid
   */
  canTransitionTo(newPhase: GamePhase): boolean {
    const validTransitions = PHASE_TRANSITIONS[this.currentPhase];
    return validTransitions?.includes(newPhase) ?? false;
  }

  /**
   * Transitions to a new phase if valid
   */
  transitionTo(newPhase: GamePhase): boolean {
    if (!this.canTransitionTo(newPhase)) {
      return false;
    }

    this.currentPhase = newPhase;
    this.gameState.phase = newPhase;
    
    // Update game state based on phase
    this.updateGameStateForPhase(newPhase);
    
    return true;
  }

  /**
   * Gets the current game state
   */
  getGameState(): GameState {
    return { ...this.gameState };
  }

  /**
   * Gets the current phase
   */
  getCurrentPhase(): GamePhase {
    return this.currentPhase;
  }

  /**
   * Gets valid next phases
   */
  getValidNextPhases(): GamePhase[] {
    return PHASE_TRANSITIONS[this.currentPhase] ?? [];
  }

  /**
   * Updates game state based on the current phase
   */
  private updateGameStateForPhase(phase: GamePhase): void {
    switch (phase) {
      case 'roleReveal':
        this.gameState.startedAt = new Date();
        this.gameState.round = 1;
        this.gameState.leaderIndex = 0;
        break;
      
      case 'voting':
        // Initialize voting state if needed
        break;
      
      case 'missionSelect':
        // Update leader for mission selection
        break;
      
      case 'missionVote':
        // Prepare for mission execution
        break;
      
      case 'missionResult':
        // Process mission results
        break;
      
      case 'assassinAttempt':
        // Good team won missions, evil gets assassination attempt
        break;
      
      case 'gameOver':
        // Game finished
        break;
    }
  }

  /**
   * Validates if the game can start from lobby
   */
  static canStartGame(
    playerCount: number,
    minPlayers: number = 5,
    maxPlayers: number = 10
  ): { canStart: boolean; errors: string[] } {
    const errors: string[] = [];

    if (playerCount < minPlayers) {
      errors.push(`Need at least ${minPlayers} players to start (currently ${playerCount})`);
    }

    if (playerCount > maxPlayers) {
      errors.push(`Too many players (${playerCount}), maximum is ${maxPlayers}`);
    }

    return {
      canStart: errors.length === 0,
      errors,
    };
  }

  /**
   * Creates initial game state for a new game
   */
  static createInitialState(): GameState {
    return {
      phase: 'lobby',
      round: 0,
      leaderIndex: 0,
      votes: [],
      missions: [],
    };
  }

  /**
   * Validates game state consistency
   */
  static validateGameState(gameState: GameState): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate phase
    const validPhases: GamePhase[] = [
      'lobby', 'roleReveal', 'voting', 'missionSelect', 
      'missionVote', 'missionResult', 'assassinAttempt', 'gameOver'
    ];
    
    if (!validPhases.includes(gameState.phase)) {
      errors.push(`Invalid phase: ${gameState.phase}`);
    }

    // Validate round
    if (gameState.round < 0 || gameState.round > 5) {
      errors.push(`Invalid round: ${gameState.round}`);
    }

    // Validate leader index
    if (gameState.leaderIndex < 0) {
      errors.push(`Invalid leader index: ${gameState.leaderIndex}`);
    }

    // Validate started timestamp
    if (gameState.phase !== 'lobby' && !gameState.startedAt) {
      errors.push('Game must have startedAt timestamp after lobby phase');
    }

    // Validate missions
    if (gameState.missions.length > 5) {
      errors.push(`Too many missions: ${gameState.missions.length}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Helper function to create a new game state machine
 */
export function createGameStateMachine(initialState?: GameState): GameStateMachine {
  const state = initialState ?? GameStateMachine.createInitialState();
  return new GameStateMachine(state);
}

/**
 * Helper function to check if a game can start
 */
export function canStartGame(playerCount: number): { canStart: boolean; errors: string[] } {
  return GameStateMachine.canStartGame(playerCount);
}

/**
 * Helper function to get mission team sizes for each round
 */
export function getMissionTeamSizes(playerCount: number): number[] {
  const teamSizes: Record<number, number[]> = {
    5: [2, 3, 2, 3, 3],
    6: [2, 3, 4, 3, 4],
    7: [2, 3, 3, 4, 4],
    8: [3, 4, 4, 5, 5],
    9: [3, 4, 4, 5, 5],
    10: [3, 4, 4, 5, 5],
  };

  return teamSizes[playerCount] ?? [2, 3, 2, 3, 3];
}

/**
 * Helper function to check if a mission needs two fails to fail
 */
export function missionNeedsTwoFails(playerCount: number, missionNumber: number): boolean {
  // 4th mission with 7+ players needs 2 fails
  return playerCount >= 7 && missionNumber === 4;
}
