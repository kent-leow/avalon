/**
 * Phase Orchestrator
 * 
 * Backend service responsible for managing automatic phase transitions,
 * validating game state, and orchestrating the complete game flow.
 */

import type { PrismaClient } from '@prisma/client';
import type { GameState, GamePhase } from '~/types/game-state';
import { 
  emitRoomEvent,
  syncRoomState
} from '../sse-events';

// Database Player type (from Prisma)
interface DatabasePlayer {
  id: string;
  joinedAt: Date;
  name: string;
  isHost: boolean;
  role: string | null;
  roleData: any;
  isReady: boolean;
  sessionId: string | null;
  roomId: string;
}

export interface PhaseTransitionCondition {
  phaseId: GamePhase;
  condition: (gameState: GameState, players: DatabasePlayer[]) => boolean;
  nextPhase: GamePhase | ((gameState: GameState, players: DatabasePlayer[]) => GamePhase);
  timeout?: number; // Optional timeout in milliseconds
  description: string;
}

export interface PhaseOrchestrationResult {
  success: boolean;
  transitioned: boolean;
  fromPhase?: GamePhase;
  toPhase?: GamePhase;
  error?: string;
  timestamp: Date;
}

export class PhaseOrchestrator {
  private db: PrismaClient;
  private transitionConditions: Map<GamePhase, PhaseTransitionCondition>;
  private activeTimers: Map<string, NodeJS.Timeout>;

  constructor(db: PrismaClient) {
    this.db = db;
    this.activeTimers = new Map();
    this.transitionConditions = this.initializeTransitionConditions();
  }

  /**
   * Initialize phase transition conditions
   */
  private initializeTransitionConditions(): Map<GamePhase, PhaseTransitionCondition> {
    const conditions = new Map<GamePhase, PhaseTransitionCondition>();

    // Role Reveal -> Mission Select
    conditions.set('roleReveal', {
      phaseId: 'roleReveal',
      condition: (gameState, players) => {
        // All players must have confirmed they've seen their role
        return players.every(player => player.isReady);
      },
      nextPhase: 'missionSelect',
      timeout: 300000, // 5 minutes
      description: 'All players have confirmed their roles',
    });

    // Mission Select -> Voting
    conditions.set('missionSelect', {
      phaseId: 'missionSelect',
      condition: (gameState, players) => {
        // Leader has selected a team
        const currentMission = gameState.missions?.length || 0;
        const mission = gameState.missions?.[currentMission];
        return !!(mission?.teamMembers && mission.teamMembers.length > 0);
      },
      nextPhase: 'voting',
      timeout: 180000, // 3 minutes
      description: 'Leader has selected mission team',
    });

    // Voting -> Mission Vote or Mission Select
    conditions.set('voting', {
      phaseId: 'voting',
      condition: (gameState, players) => {
        // All players have voted
        const votes = gameState.votes || [];
        return votes.length >= players.length;
      },
      nextPhase: (gameState, players) => {
        const votes = gameState.votes || [];
        const approvalVotes = votes.filter(v => v.vote === 'approve').length;
        const rejectionCount = (gameState as any).rejectionCount || 0;
        
        if (approvalVotes > players.length / 2) {
          return 'missionVote';
        } else if (rejectionCount >= 4) {
          // Fifth rejection = evil wins
          return 'gameOver';
        } else {
          return 'missionSelect';
        }
      },
      timeout: 120000, // 2 minutes
      description: 'All players have voted on the mission team',
    });

    // Mission Vote -> Mission Select, Assassin Attempt, or Game Over
    conditions.set('missionVote', {
      phaseId: 'missionVote',
      condition: (gameState, players) => {
        const currentMission = gameState.missions?.length || 0;
        const mission = gameState.missions?.[currentMission - 1];
        const missionVotes = (gameState as any).missionVotes || [];
        const teamSize = mission?.teamMembers?.length || 0;
        
        return missionVotes.length >= teamSize;
      },
      nextPhase: (gameState, players) => {
        const missionResults = gameState.missions?.map(m => m.result).filter(Boolean) || [];
        const goodWins = missionResults.filter(r => r === 'success').length;
        const evilWins = missionResults.filter(r => r === 'failure').length;
        
        if (goodWins >= 3) {
          // Good team wins 3 missions -> Assassin attempt
          return 'assassinAttempt';
        } else if (evilWins >= 3) {
          // Evil team wins 3 missions -> Game over
          return 'gameOver';
        } else {
          // Continue to next mission
          return 'missionSelect';
        }
      },
      timeout: 120000, // 2 minutes
      description: 'All team members have voted on the mission',
    });

    // Assassin Attempt -> Game Over
    conditions.set('assassinAttempt', {
      phaseId: 'assassinAttempt',
      condition: (gameState, players) => {
        const assassinAttempt = (gameState as any).assassinAttempt;
        return !!(assassinAttempt?.targetId);
      },
      nextPhase: 'gameOver',
      timeout: 180000, // 3 minutes
      description: 'Assassin has made their attempt',
    });

    return conditions;
  }

  /**
   * Check and process phase transitions for a room
   */
  async checkPhaseTransition(roomId: string): Promise<PhaseOrchestrationResult> {
    try {
      // Get room with current state and players
      const room = await this.db.room.findUnique({
        where: { id: roomId },
        include: {
          players: {
            orderBy: { joinedAt: 'asc' }
          }
        }
      });

      if (!room) {
        return {
          success: false,
          transitioned: false,
          error: 'Room not found',
          timestamp: new Date(),
        };
      }

      const gameState = room.gameState as unknown as GameState;
      const currentPhase = gameState.phase;

      // Check if current phase has transition conditions
      const condition = this.transitionConditions.get(currentPhase);
      if (!condition) {
        return {
          success: true,
          transitioned: false,
          timestamp: new Date(),
        };
      }

      // Check if transition condition is met
      if (!condition.condition(gameState, room.players)) {
        return {
          success: true,
          transitioned: false,
          timestamp: new Date(),
        };
      }

      // Determine next phase
      const nextPhase = typeof condition.nextPhase === 'function' 
        ? condition.nextPhase(gameState, room.players)
        : condition.nextPhase;

      // Execute the transition
      const transitionResult = await this.executePhaseTransition(
        roomId,
        currentPhase,
        nextPhase,
        gameState,
        room.players
      );

      return transitionResult;

    } catch (error) {
      console.error('Error checking phase transition:', error);
      return {
        success: false,
        transitioned: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Execute a phase transition
   */
  private async executePhaseTransition(
    roomId: string,
    fromPhase: GamePhase,
    toPhase: GamePhase,
    currentGameState: GameState,
    players: DatabasePlayer[]
  ): Promise<PhaseOrchestrationResult> {
    try {
      console.log(`[PhaseOrchestrator] Transitioning ${roomId}: ${fromPhase} -> ${toPhase}`);

      // Prepare new game state based on phase
      const newGameState = await this.prepareGameStateForPhase(
        toPhase,
        currentGameState,
        players
      );

      // Update room in database
      await this.db.room.update({
        where: { id: roomId },
        data: {
          phase: toPhase,
          gameState: newGameState as any,
          updatedAt: new Date(),
        },
      });

      // Handle phase-specific setup
      await this.handlePhaseSetup(roomId, toPhase, newGameState, players);

      // Emit real-time events
      await this.emitPhaseTransitionEvents(roomId, fromPhase, toPhase, newGameState);

      return {
        success: true,
        transitioned: true,
        fromPhase,
        toPhase,
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('Error executing phase transition:', error);
      
      // Emit error event
      await emitRoomEvent(roomId, 'error_occurred', {
        type: 'phase_transition_error',
        message: `Failed to transition from ${fromPhase} to ${toPhase}`,
        recoverable: true,
        timestamp: new Date(),
      });

      return {
        success: false,
        transitioned: false,
        fromPhase,
        toPhase,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Prepare game state for specific phase
   */
  private async prepareGameStateForPhase(
    phase: GamePhase,
    currentGameState: GameState,
    players: DatabasePlayer[]
  ): Promise<GameState> {
    const newGameState = { ...currentGameState, phase };

    switch (phase) {
      case 'missionSelect':
        // Reset votes and prepare for new mission selection
        newGameState.votes = [];
        
        // Rotate leader if not first mission
        if (currentGameState.phase === 'voting') {
          const rejectionCount = (currentGameState as any).rejectionCount || 0;
          newGameState.leaderIndex = (currentGameState.leaderIndex + 1) % players.length;
          (newGameState as any).rejectionCount = rejectionCount + 1;
        }
        
        // Initialize new mission if coming from mission vote
        if (currentGameState.phase === 'missionVote') {
          const missionNumber = (newGameState.missions?.length || 0) + 1;
          
          newGameState.missions = [
            ...(newGameState.missions || []),
            {
              id: `mission-${missionNumber}`,
              round: missionNumber,
              teamSize: this.getRequiredPlayers(missionNumber, players.length),
              teamMembers: [],
              votes: [],
              result: undefined,
            }
          ];
          
          newGameState.round = missionNumber;
          (newGameState as any).rejectionCount = 0;
        }
        break;

      case 'voting':
        // Clear previous votes
        newGameState.votes = [];
        break;

      case 'missionVote':
        // Clear mission votes
        (newGameState as any).missionVotes = [];
        break;

      case 'assassinAttempt':
        // Prepare assassin attempt state
        (newGameState as any).assassinAttempt = {
          started: true,
          assassinId: this.findAssassinPlayerId(players),
          timestamp: new Date(),
        };
        break;

      case 'gameOver':
        // Finalize game state
        (newGameState as any).endedAt = new Date();
        break;
    }

    return newGameState;
  }

  /**
   * Handle phase-specific setup
   */
  private async handlePhaseSetup(
    roomId: string,
    phase: GamePhase,
    gameState: GameState,
    players: DatabasePlayer[]
  ): Promise<void> {
    switch (phase) {
      case 'roleReveal':
        // Reset all player ready states for role confirmation
        await Promise.all(
          players.map(player =>
            this.db.player.update({
              where: { id: player.id },
              data: { isReady: false },
            })
          )
        );
        break;

      case 'missionSelect':
        // Start timer for mission selection
        this.startPhaseTimer(roomId, phase, 180000); // 3 minutes
        break;

      case 'voting':
        // Start timer for voting
        this.startPhaseTimer(roomId, phase, 120000); // 2 minutes
        break;

      case 'missionVote':
        // Start timer for mission execution
        this.startPhaseTimer(roomId, phase, 120000); // 2 minutes
        break;

      case 'assassinAttempt':
        // Start timer for assassin attempt
        this.startPhaseTimer(roomId, phase, 180000); // 3 minutes
        break;
    }
  }

  /**
   * Get required players for mission
   */
  private getRequiredPlayers(missionNumber: number, totalPlayers: number): number {
    // Basic mission requirements (simplified)
    const requirements: Record<number, Record<number, number>> = {
      5: { 1: 2, 2: 3, 3: 2, 4: 3, 5: 3 },
      6: { 1: 2, 2: 3, 3: 4, 4: 3, 5: 4 },
      7: { 1: 2, 2: 3, 3: 3, 4: 4, 5: 4 },
      8: { 1: 3, 2: 4, 3: 4, 4: 5, 5: 5 },
      9: { 1: 3, 2: 4, 3: 4, 4: 5, 5: 5 },
      10: { 1: 3, 2: 4, 3: 4, 4: 5, 5: 5 },
    };
    
    return requirements[totalPlayers]?.[missionNumber] || 2;
  }

  /**
   * Find the assassin player ID
   */
  private findAssassinPlayerId(players: DatabasePlayer[]): string | undefined {
    return players.find(p => p.role === 'assassin')?.id;
  }

  /**
   * Start phase timer for automatic progression
   */
  private startPhaseTimer(roomId: string, phase: GamePhase, timeoutMs: number): void {
    const timerId = `${roomId}-${phase}`;
    
    // Clear existing timer
    if (this.activeTimers.has(timerId)) {
      clearTimeout(this.activeTimers.get(timerId)!);
    }

    // Start new timer
    const timer = setTimeout(async () => {
      console.log(`[PhaseOrchestrator] Phase timeout for ${roomId}:${phase}`);
      
      try {
        await this.handlePhaseTimeout(roomId, phase);
      } catch (error) {
        console.error('Error handling phase timeout:', error);
      }
      
      this.activeTimers.delete(timerId);
    }, timeoutMs);

    this.activeTimers.set(timerId, timer);
  }

  /**
   * Handle phase timeout (simplified for now)
   */
  private async handlePhaseTimeout(roomId: string, phase: GamePhase): Promise<void> {
    const room = await this.db.room.findUnique({
      where: { id: roomId },
      include: { players: true }
    });

    if (!room || room.phase !== phase) {
      return; // Phase already changed
    }

    // For timeout handling, we'll emit a timeout event and let the frontend handle it
    await emitRoomEvent(roomId, 'error_occurred', {
      phase,
      message: `Phase ${phase} timed out`,
      timestamp: new Date(),
    });
  }

  /**
   * Emit phase transition events
   */
  private async emitPhaseTransitionEvents(
    roomId: string,
    fromPhase: GamePhase,
    toPhase: GamePhase,
    gameState: GameState
  ): Promise<void> {
    try {
      // Get room code for events
      const room = await this.db.room.findUnique({
        where: { id: roomId },
        select: { code: true }
      });

      if (!room) return;

      // Emit phase transition event
      await emitRoomEvent(room.code, 'game_state_updated', {
        fromPhase,
        toPhase,
        gameState,
        timestamp: new Date(),
        automated: true,
      });

      // Sync room state
      await syncRoomState(roomId, room.code, this.db);

    } catch (error) {
      console.error('Error emitting phase transition events:', error);
    }
  }

  /**
   * Force a specific phase transition (for manual override)
   */
  async forcePhaseTransition(
    roomId: string,
    targetPhase: GamePhase,
    reason?: string
  ): Promise<PhaseOrchestrationResult> {
    try {
      const room = await this.db.room.findUnique({
        where: { id: roomId },
        include: { players: true }
      });

      if (!room) {
        return {
          success: false,
          transitioned: false,
          error: 'Room not found',
          timestamp: new Date(),
        };
      }

      const gameState = room.gameState as unknown as GameState;
      const currentPhase = gameState.phase;

      // Prepare game state for target phase
      const newGameState = await this.prepareGameStateForPhase(
        targetPhase,
        gameState,
        room.players
      );

      // Update room
      await this.db.room.update({
        where: { id: roomId },
        data: {
          phase: targetPhase,
          gameState: newGameState as any,
          updatedAt: new Date(),
        },
      });

      // Handle phase setup
      await this.handlePhaseSetup(roomId, targetPhase, newGameState, room.players);

      // Emit events
      await this.emitPhaseTransitionEvents(roomId, currentPhase, targetPhase, newGameState);

      // Log manual transition
      console.log(`[PhaseOrchestrator] Manual transition ${roomId}: ${currentPhase} -> ${targetPhase} (${reason || 'No reason provided'})`);

      return {
        success: true,
        transitioned: true,
        fromPhase: currentPhase,
        toPhase: targetPhase,
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('Error forcing phase transition:', error);
      return {
        success: false,
        transitioned: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Stop all timers for a room
   */
  stopRoomTimers(roomId: string): void {
    for (const [timerId, timer] of this.activeTimers) {
      if (timerId.startsWith(roomId)) {
        clearTimeout(timer);
        this.activeTimers.delete(timerId);
      }
    }
  }

  /**
   * Cleanup - stop all timers
   */
  cleanup(): void {
    for (const timer of this.activeTimers.values()) {
      clearTimeout(timer);
    }
    this.activeTimers.clear();
  }
}

// Global instance
let phaseOrchestrator: PhaseOrchestrator | null = null;

export function getPhaseOrchestrator(db: PrismaClient): PhaseOrchestrator {
  if (!phaseOrchestrator) {
    phaseOrchestrator = new PhaseOrchestrator(db);
  }
  return phaseOrchestrator;
}

export function cleanupPhaseOrchestrator(): void {
  if (phaseOrchestrator) {
    phaseOrchestrator.cleanup();
    phaseOrchestrator = null;
  }
}