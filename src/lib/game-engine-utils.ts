/**
 * Game Engine Utility Functions
 * 
 * Utility functions for the central game orchestration system
 */

import type { GamePhase, GameState } from '~/types/game-state';
import type { Player } from '~/types/room';
import type { 
  GameEngineError, 
  PerformanceMetrics, 
  PerformanceThresholds 
} from '~/types/game-engine';

/**
 * Creates a new game engine error
 */
export function createGameEngineError(
  code: string,
  message: string,
  phase: GamePhase,
  recoverable = true
): GameEngineError {
  return {
    code,
    message,
    phase,
    recoverable,
    timestamp: new Date(),
  };
}

/**
 * Creates initial performance metrics
 */
export function createInitialPerformanceMetrics(): PerformanceMetrics {
  return {
    frameRate: 60,
    memoryUsage: 0,
    transitionTime: 0,
    errorCount: 0,
    lastHealthCheck: new Date(),
  };
}

/**
 * Creates default performance thresholds
 */
export function createDefaultPerformanceThresholds(): PerformanceThresholds {
  return {
    maxFrameRate: 60,
    maxMemoryUsage: 50, // MB
    maxTransitionTime: 1000, // ms
    maxErrorCount: 5,
  };
}

/**
 * Validates if a phase transition is allowed
 */
export function isPhaseTransitionAllowed(
  from: GamePhase,
  to: GamePhase,
  gameState: GameState,
  players: Player[]
): boolean {
  // Basic validation rules
  if (from === to) return false;
  
  // Phase sequence validation
  const phaseOrder: GamePhase[] = [
    'lobby',
    'roleReveal',
    'voting',
    'missionSelect',
    'missionVote',
    'missionResult',
    'assassinAttempt',
    'gameOver'
  ];
  
  const fromIndex = phaseOrder.indexOf(from);
  const toIndex = phaseOrder.indexOf(to);
  
  // Allow forward progression or specific backwards transitions
  if (toIndex > fromIndex) return true;
  
  // Allow specific backwards transitions for game flow
  if (from === 'missionResult' && to === 'voting') return true;
  if (from === 'voting' && to === 'missionSelect') return true;
  
  return false;
}

/**
 * Calculates the next phase based on current game state
 */
export function calculateNextPhase(
  currentPhase: GamePhase,
  gameState: GameState,
  players: Player[]
): GamePhase | null {
  switch (currentPhase) {
    case 'lobby':
      return 'roleReveal';
    
    case 'roleReveal':
      return 'voting';
    
    case 'voting':
      // Check if team was approved
      if (gameState.votes.length > 0) {
        const approveVotes = gameState.votes.filter(v => v.vote === 'approve').length;
        const rejectVotes = gameState.votes.filter(v => v.vote === 'reject').length;
        
        if (approveVotes > rejectVotes) {
          return 'missionSelect';
        }
      }
      return 'voting'; // Stay in voting if team rejected
    
    case 'missionSelect':
      return 'missionVote';
    
    case 'missionVote':
      return 'missionResult';
    
    case 'missionResult':
      // Check if game should end
      const completedMissions = gameState.missions.filter(m => m.result).length;
      const successfulMissions = gameState.missions.filter(m => m.result === 'success').length;
      const failedMissions = gameState.missions.filter(m => m.result === 'failure').length;
      
      if (successfulMissions >= 3) {
        return 'assassinAttempt';
      } else if (failedMissions >= 3) {
        return 'gameOver';
      } else if (completedMissions >= 5) {
        return 'gameOver';
      }
      
      return 'voting'; // Continue to next round
    
    case 'assassinAttempt':
      return 'gameOver';
    
    case 'gameOver':
      return null; // Game is finished
    
    default:
      return null;
  }
}

/**
 * Checks if all players are ready for phase transition
 */
export function arePlayersReadyForTransition(
  phase: GamePhase,
  gameState: GameState,
  players: Player[]
): boolean {
  switch (phase) {
    case 'lobby':
      return players.length >= 5 && players.every(p => p.isReady);
    
    case 'roleReveal':
      return players.every(p => p.role !== undefined);
    
    case 'voting':
      return gameState.votes.length === players.length;
    
    case 'missionSelect':
      const currentMission = gameState.missions[gameState.round - 1];
      return !!(currentMission && currentMission.teamMembers.length > 0);
    
    case 'missionVote':
      const mission = gameState.missions[gameState.round - 1];
      return !!(mission && mission.votes.length === mission.teamMembers.length);
    
    case 'missionResult':
      return true; // Always ready after mission completion
    
    case 'assassinAttempt':
      return gameState.assassinAttempt !== undefined;
    
    case 'gameOver':
      return true; // Always ready
    
    default:
      return false;
  }
}

/**
 * Validates performance metrics against thresholds
 */
export function validatePerformanceMetrics(
  metrics: PerformanceMetrics,
  thresholds: PerformanceThresholds
): string[] {
  const issues: string[] = [];
  
  if (metrics.frameRate < thresholds.maxFrameRate * 0.8) {
    issues.push('Low frame rate detected');
  }
  
  if (metrics.memoryUsage > thresholds.maxMemoryUsage) {
    issues.push('High memory usage detected');
  }
  
  if (metrics.transitionTime > thresholds.maxTransitionTime) {
    issues.push('Slow phase transitions detected');
  }
  
  if (metrics.errorCount > thresholds.maxErrorCount) {
    issues.push('High error count detected');
  }
  
  return issues;
}

/**
 * Updates performance metrics with new measurements
 */
export function updatePerformanceMetrics(
  currentMetrics: PerformanceMetrics,
  newMeasurement: Partial<PerformanceMetrics>
): PerformanceMetrics {
  return {
    ...currentMetrics,
    ...newMeasurement,
    lastHealthCheck: new Date(),
  };
}

/**
 * Creates mock game state for testing
 */
export function createMockGameState(): GameState {
  return {
    phase: 'lobby',
    round: 1,
    leaderIndex: 0,
    startedAt: new Date(),
    votes: [],
    missions: [],
  };
}

/**
 * Creates mock players for testing
 */
export function createMockPlayers(count = 5): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i + 1}`,
    name: `Player ${i + 1}`,
    isReady: true,
    isHost: i === 0,
    role: undefined,
    joinedAt: new Date(),
    roomId: 'mock-room-id',
  }));
}

/**
 * Formats phase name for display
 */
export function formatPhaseName(phase: GamePhase): string {
  const phaseNames: Record<GamePhase, string> = {
    lobby: 'Lobby',
    roleReveal: 'Role Reveal',
    voting: 'Team Voting',
    missionSelect: 'Mission Selection',
    missionVote: 'Mission Vote',
    missionResult: 'Mission Result',
    assassinAttempt: 'Assassin Attempt',
    gameOver: 'Game Over',
  };
  
  return phaseNames[phase] || phase;
}

/**
 * Gets phase description for display
 */
export function getPhaseDescription(phase: GamePhase): string {
  const descriptions: Record<GamePhase, string> = {
    lobby: 'Waiting for players to join and ready up',
    roleReveal: 'Players are learning their roles',
    voting: 'Players are voting on the proposed team',
    missionSelect: 'The leader is selecting team members',
    missionVote: 'Team members are voting on the mission',
    missionResult: 'Mission results are being revealed',
    assassinAttempt: 'The assassin is making their attempt',
    gameOver: 'The game has ended',
  };
  
  return descriptions[phase] || 'Unknown phase';
}
