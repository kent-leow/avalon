import { GameStateMachine, createGameStateMachine, canStartGame, getMissionTeamSizes, missionNeedsTwoFails } from '../game-state-machine';
import type { GameState, GamePhase } from '~/types/game-state';

describe('GameStateMachine', () => {
  let gameStateMachine: GameStateMachine;
  let initialState: GameState;

  beforeEach(() => {
    initialState = {
      phase: 'lobby' as GamePhase,
      round: 0,
      leaderIndex: 0,
      votes: [],
      missions: [],
    };
    gameStateMachine = new GameStateMachine(initialState);
  });

  describe('initialization', () => {
    it('should initialize with lobby phase', () => {
      const state = gameStateMachine.getGameState();
      expect(state.phase).toBe('lobby');
    });

    it('should have correct initial state', () => {
      const state = gameStateMachine.getGameState();
      expect(state.round).toBe(0);
      expect(state.leaderIndex).toBe(0);
      expect(state.votes).toHaveLength(0);
      expect(state.missions).toHaveLength(0);
    });
  });

  describe('phase transitions', () => {
    it('should transition from lobby to roleReveal', () => {
      const result = gameStateMachine.transitionTo('roleReveal');
      expect(result).toBe(true);
      expect(gameStateMachine.getCurrentPhase()).toBe('roleReveal');
    });

    it('should transition from roleReveal to voting', () => {
      gameStateMachine.transitionTo('roleReveal');
      const result = gameStateMachine.transitionTo('voting');
      expect(result).toBe(true);
      expect(gameStateMachine.getCurrentPhase()).toBe('voting');
    });

    it('should transition from voting to missionSelect', () => {
      gameStateMachine.transitionTo('roleReveal');
      gameStateMachine.transitionTo('voting');
      const result = gameStateMachine.transitionTo('missionSelect');
      expect(result).toBe(true);
      expect(gameStateMachine.getCurrentPhase()).toBe('missionSelect');
    });

    it('should transition from missionSelect to missionVote', () => {
      gameStateMachine.transitionTo('roleReveal');
      gameStateMachine.transitionTo('voting');
      gameStateMachine.transitionTo('missionSelect');
      const result = gameStateMachine.transitionTo('missionVote');
      expect(result).toBe(true);
      expect(gameStateMachine.getCurrentPhase()).toBe('missionVote');
    });

    it('should transition from missionVote to missionResult', () => {
      gameStateMachine.transitionTo('roleReveal');
      gameStateMachine.transitionTo('voting');
      gameStateMachine.transitionTo('missionSelect');
      gameStateMachine.transitionTo('missionVote');
      const result = gameStateMachine.transitionTo('missionResult');
      expect(result).toBe(true);
      expect(gameStateMachine.getCurrentPhase()).toBe('missionResult');
    });

    it('should transition from missionResult to gameOver', () => {
      gameStateMachine.transitionTo('roleReveal');
      gameStateMachine.transitionTo('voting');
      gameStateMachine.transitionTo('missionSelect');
      gameStateMachine.transitionTo('missionVote');
      gameStateMachine.transitionTo('missionResult');
      const result = gameStateMachine.transitionTo('gameOver');
      expect(result).toBe(true);
      expect(gameStateMachine.getCurrentPhase()).toBe('gameOver');
    });

    it('should transition from missionResult to assassinAttempt', () => {
      gameStateMachine.transitionTo('roleReveal');
      gameStateMachine.transitionTo('voting');
      gameStateMachine.transitionTo('missionSelect');
      gameStateMachine.transitionTo('missionVote');
      gameStateMachine.transitionTo('missionResult');
      const result = gameStateMachine.transitionTo('assassinAttempt');
      expect(result).toBe(true);
      expect(gameStateMachine.getCurrentPhase()).toBe('assassinAttempt');
    });

    it('should transition from assassinAttempt to gameOver', () => {
      gameStateMachine.transitionTo('roleReveal');
      gameStateMachine.transitionTo('voting');
      gameStateMachine.transitionTo('missionSelect');
      gameStateMachine.transitionTo('missionVote');
      gameStateMachine.transitionTo('missionResult');
      gameStateMachine.transitionTo('assassinAttempt');
      const result = gameStateMachine.transitionTo('gameOver');
      expect(result).toBe(true);
      expect(gameStateMachine.getCurrentPhase()).toBe('gameOver');
    });

    it('should transition from missionResult back to voting for next round', () => {
      gameStateMachine.transitionTo('roleReveal');
      gameStateMachine.transitionTo('voting');
      gameStateMachine.transitionTo('missionSelect');
      gameStateMachine.transitionTo('missionVote');
      gameStateMachine.transitionTo('missionResult');
      const result = gameStateMachine.transitionTo('voting');
      expect(result).toBe(true);
      expect(gameStateMachine.getCurrentPhase()).toBe('voting');
    });
  });

  describe('invalid transitions', () => {
    it('should reject invalid transitions', () => {
      const result = gameStateMachine.transitionTo('missionVote');
      expect(result).toBe(false);
      expect(gameStateMachine.getCurrentPhase()).toBe('lobby');
    });

    it('should reject transition from gameOver to other phases', () => {
      gameStateMachine.transitionTo('roleReveal');
      gameStateMachine.transitionTo('voting');
      gameStateMachine.transitionTo('missionSelect');
      gameStateMachine.transitionTo('missionVote');
      gameStateMachine.transitionTo('missionResult');
      gameStateMachine.transitionTo('gameOver');

      const result = gameStateMachine.transitionTo('lobby');
      expect(result).toBe(false);
      expect(gameStateMachine.getCurrentPhase()).toBe('gameOver');
    });

    it('should reject transition from lobby to invalid phases', () => {
      expect(gameStateMachine.transitionTo('voting')).toBe(false);
      expect(gameStateMachine.transitionTo('missionSelect')).toBe(false);
      expect(gameStateMachine.transitionTo('gameOver')).toBe(false);
    });
  });

  describe('valid transitions', () => {
    it('should return valid transitions for lobby phase', () => {
      const validTransitions = gameStateMachine.getValidNextPhases();
      expect(validTransitions).toContain('roleReveal');
      expect(validTransitions).not.toContain('voting');
    });

    it('should return valid transitions for roleReveal phase', () => {
      gameStateMachine.transitionTo('roleReveal');
      const validTransitions = gameStateMachine.getValidNextPhases();
      expect(validTransitions).toContain('voting');
      expect(validTransitions).not.toContain('lobby');
    });

    it('should return empty array for gameOver phase', () => {
      gameStateMachine.transitionTo('roleReveal');
      gameStateMachine.transitionTo('voting');
      gameStateMachine.transitionTo('missionSelect');
      gameStateMachine.transitionTo('missionVote');
      gameStateMachine.transitionTo('missionResult');
      gameStateMachine.transitionTo('gameOver');

      const validTransitions = gameStateMachine.getValidNextPhases();
      expect(validTransitions).toHaveLength(0);
    });

    it('should return multiple valid transitions for missionResult', () => {
      gameStateMachine.transitionTo('roleReveal');
      gameStateMachine.transitionTo('voting');
      gameStateMachine.transitionTo('missionSelect');
      gameStateMachine.transitionTo('missionVote');
      gameStateMachine.transitionTo('missionResult');

      const validTransitions = gameStateMachine.getValidNextPhases();
      expect(validTransitions).toContain('voting');
      expect(validTransitions).toContain('assassinAttempt');
      expect(validTransitions).toContain('gameOver');
    });
  });

  describe('transition validation', () => {
    it('should correctly validate if transition is possible', () => {
      expect(gameStateMachine.canTransitionTo('roleReveal')).toBe(true);
      expect(gameStateMachine.canTransitionTo('voting')).toBe(false);
      
      gameStateMachine.transitionTo('roleReveal');
      expect(gameStateMachine.canTransitionTo('voting')).toBe(true);
      expect(gameStateMachine.canTransitionTo('lobby')).toBe(false);
    });
  });

  describe('game state updates', () => {
    it('should update startedAt when transitioning to roleReveal', () => {
      gameStateMachine.transitionTo('roleReveal');
      const state = gameStateMachine.getGameState();
      expect(state.startedAt).toBeDefined();
      expect(state.startedAt).toBeInstanceOf(Date);
    });

    it('should initialize round and leaderIndex when transitioning to roleReveal', () => {
      gameStateMachine.transitionTo('roleReveal');
      const state = gameStateMachine.getGameState();
      expect(state.round).toBe(1);
      expect(state.leaderIndex).toBe(0);
    });

    it('should maintain game state across transitions', () => {
      gameStateMachine.transitionTo('roleReveal');
      const roleRevealState = gameStateMachine.getGameState();
      
      gameStateMachine.transitionTo('voting');
      const votingState = gameStateMachine.getGameState();
      
      expect(votingState.startedAt).toEqual(roleRevealState.startedAt);
      expect(votingState.round).toBe(roleRevealState.round);
    });
  });
});

describe('Helper Functions', () => {
  describe('createGameStateMachine', () => {
    it('should create machine with default initial state', () => {
      const machine = createGameStateMachine();
      const state = machine.getGameState();
      expect(state.phase).toBe('lobby');
      expect(state.round).toBe(0);
      expect(state.leaderIndex).toBe(0);
    });

    it('should create machine with custom initial state', () => {
      const customState: GameState = {
        phase: 'voting',
        round: 2,
        leaderIndex: 1,
        votes: [],
        missions: [],
      };
      const machine = createGameStateMachine(customState);
      const state = machine.getGameState();
      expect(state.phase).toBe('voting');
      expect(state.round).toBe(2);
      expect(state.leaderIndex).toBe(1);
    });
  });

  describe('canStartGame', () => {
    it('should allow starting with 5 players', () => {
      const result = canStartGame(5);
      expect(result.canStart).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should allow starting with 10 players', () => {
      const result = canStartGame(10);
      expect(result.canStart).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject starting with too few players', () => {
      const result = canStartGame(4);
      expect(result.canStart).toBe(false);
      expect(result.errors).toContain('Need at least 5 players to start (currently 4)');
    });

    it('should reject starting with too many players', () => {
      const result = canStartGame(11);
      expect(result.canStart).toBe(false);
      expect(result.errors).toContain('Too many players (11), maximum is 10');
    });
  });

  describe('getMissionTeamSizes', () => {
    it('should return correct team sizes for 5 players', () => {
      const sizes = getMissionTeamSizes(5);
      expect(sizes).toEqual([2, 3, 2, 3, 3]);
    });

    it('should return correct team sizes for 6 players', () => {
      const sizes = getMissionTeamSizes(6);
      expect(sizes).toEqual([2, 3, 4, 3, 4]);
    });

    it('should return correct team sizes for 7 players', () => {
      const sizes = getMissionTeamSizes(7);
      expect(sizes).toEqual([2, 3, 3, 4, 4]);
    });

    it('should return correct team sizes for 8+ players', () => {
      const sizes8 = getMissionTeamSizes(8);
      const sizes9 = getMissionTeamSizes(9);
      const sizes10 = getMissionTeamSizes(10);
      
      expect(sizes8).toEqual([3, 4, 4, 5, 5]);
      expect(sizes9).toEqual([3, 4, 4, 5, 5]);
      expect(sizes10).toEqual([3, 4, 4, 5, 5]);
    });

    it('should return default sizes for invalid player count', () => {
      const sizes = getMissionTeamSizes(3);
      expect(sizes).toEqual([2, 3, 2, 3, 3]);
    });
  });

  describe('missionNeedsTwoFails', () => {
    it('should return true for 4th mission with 7+ players', () => {
      expect(missionNeedsTwoFails(7, 4)).toBe(true);
      expect(missionNeedsTwoFails(8, 4)).toBe(true);
      expect(missionNeedsTwoFails(9, 4)).toBe(true);
      expect(missionNeedsTwoFails(10, 4)).toBe(true);
    });

    it('should return false for 4th mission with less than 7 players', () => {
      expect(missionNeedsTwoFails(5, 4)).toBe(false);
      expect(missionNeedsTwoFails(6, 4)).toBe(false);
    });

    it('should return false for non-4th missions', () => {
      expect(missionNeedsTwoFails(7, 1)).toBe(false);
      expect(missionNeedsTwoFails(7, 2)).toBe(false);
      expect(missionNeedsTwoFails(7, 3)).toBe(false);
      expect(missionNeedsTwoFails(7, 5)).toBe(false);
    });
  });
});

describe('GameStateMachine.validateGameState', () => {
  it('should validate correct game state', () => {
    const validState: GameState = {
      phase: 'voting',
      round: 2,
      leaderIndex: 1,
      startedAt: new Date(),
      votes: [],
      missions: [],
    };
    
    const result = GameStateMachine.validateGameState(validState);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid phase', () => {
    const invalidState: GameState = {
      phase: 'invalid' as GamePhase,
      round: 1,
      leaderIndex: 0,
      votes: [],
      missions: [],
    };
    
    const result = GameStateMachine.validateGameState(invalidState);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid phase: invalid');
  });

  it('should reject invalid round', () => {
    const invalidState: GameState = {
      phase: 'voting',
      round: 6,
      leaderIndex: 0,
      votes: [],
      missions: [],
    };
    
    const result = GameStateMachine.validateGameState(invalidState);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid round: 6');
  });

  it('should reject invalid leader index', () => {
    const invalidState: GameState = {
      phase: 'voting',
      round: 1,
      leaderIndex: -1,
      votes: [],
      missions: [],
    };
    
    const result = GameStateMachine.validateGameState(invalidState);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid leader index: -1');
  });

  it('should require startedAt for non-lobby phases', () => {
    const invalidState: GameState = {
      phase: 'voting',
      round: 1,
      leaderIndex: 0,
      votes: [],
      missions: [],
    };
    
    const result = GameStateMachine.validateGameState(invalidState);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Game must have startedAt timestamp after lobby phase');
  });

  it('should reject too many missions', () => {
    const invalidState: GameState = {
      phase: 'voting',
      round: 1,
      leaderIndex: 0,
      startedAt: new Date(),
      votes: [],
      missions: new Array(6).fill(null).map((_, i) => ({
        id: `mission-${i}`,
        round: i + 1,
        teamSize: 2,
        teamMembers: [],
        votes: [],
      })),
    };
    
    const result = GameStateMachine.validateGameState(invalidState);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Too many missions: 6');
  });
});
