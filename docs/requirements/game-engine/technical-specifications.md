# Game Flow Technical Specifications

**Created:** July 19, 2025  
**Status:** Development Specification  
**Priority:** Critical  

## 1. SSE Event System Enhancement

### 1.1 Game Flow SSE Events

```typescript
// Enhanced real-time event types for game flow
export interface GameFlowSSEEventData {
  // Phase transition events
  phase_transition: {
    fromPhase: GamePhase;
    toPhase: GamePhase;
    gameState: GameState;
    triggeredBy: string;
    timestamp: Date;
    autoTransition: boolean;
  };

  // Player action events
  player_action: {
    playerId: string;
    playerName: string;
    action: PlayerActionType;
    phase: GamePhase;
    data: any;
    timestamp: Date;
    requiresResponse: boolean;
  };

  // Game state synchronization
  game_state_update: {
    updates: Partial<GameState>;
    affectedPlayers: string[];
    updateType: 'incremental' | 'full';
    version: number;
    requiresAck: boolean;
  };

  // Timer and progression events
  timer_update: {
    phase: GamePhase;
    timeRemaining: number;
    warningThreshold: number;
    autoProgressAt: Date | null;
    timerType: 'countdown' | 'stopwatch';
  };

  // Player confirmation tracking
  player_confirmation: {
    playerId: string;
    confirmationType: 'role_viewed' | 'team_selected' | 'vote_cast';
    confirmed: boolean;
    allPlayersConfirmed: boolean;
    pendingPlayers: string[];
  };

  // Error and recovery events
  game_error: {
    errorType: 'connection' | 'validation' | 'timeout' | 'desync';
    message: string;
    phase: GamePhase;
    recoverable: boolean;
    suggestedAction: string;
  };
}

// Player action types
export type PlayerActionType =
  | 'role_confirmed'
  | 'team_selected'
  | 'vote_cast'
  | 'mission_vote_cast'
  | 'assassin_target_selected';
```

### 1.2 SSE Event Emitters

```typescript
// Enhanced SSE event emission functions
// File: /src/server/sse-events.ts

export function notifyPhaseTransition(
  roomId: string,
  fromPhase: GamePhase,
  toPhase: GamePhase,
  gameState: GameState,
  triggeredBy: string
): void {
  const eventData: GameFlowSSEEventData['phase_transition'] = {
    fromPhase,
    toPhase,
    gameState,
    triggeredBy,
    timestamp: new Date(),
    autoTransition: triggeredBy === 'system',
  };

  emitToRoom(roomId, 'phase_transition', eventData);
}

export function notifyPlayerAction(
  roomId: string,
  playerId: string,
  playerName: string,
  action: PlayerActionType,
  phase: GamePhase,
  data: any
): void {
  const eventData: GameFlowSSEEventData['player_action'] = {
    playerId,
    playerName,
    action,
    phase,
    data,
    timestamp: new Date(),
    requiresResponse: ['team_selected', 'assassin_target_selected'].includes(action),
  };

  emitToRoom(roomId, 'player_action', eventData);
}

export function notifyGameStateUpdate(
  roomId: string,
  updates: Partial<GameState>,
  affectedPlayers: string[],
  updateType: 'incremental' | 'full' = 'incremental'
): void {
  const eventData: GameFlowSSEEventData['game_state_update'] = {
    updates,
    affectedPlayers,
    updateType,
    version: Date.now(), // Simple versioning
    requiresAck: updateType === 'full',
  };

  emitToRoom(roomId, 'game_state_update', eventData);
}

export function notifyPlayerConfirmation(
  roomId: string,
  playerId: string,
  confirmationType: 'role_viewed' | 'team_selected' | 'vote_cast',
  allPlayersConfirmed: boolean,
  pendingPlayers: string[]
): void {
  const eventData: GameFlowSSEEventData['player_confirmation'] = {
    playerId,
    confirmationType,
    confirmed: true,
    allPlayersConfirmed,
    pendingPlayers,
  };

  emitToRoom(roomId, 'player_confirmation', eventData);
}

export function notifyTimerUpdate(
  roomId: string,
  phase: GamePhase,
  timeRemaining: number,
  autoProgressAt: Date | null = null
): void {
  const eventData: GameFlowSSEEventData['timer_update'] = {
    phase,
    timeRemaining,
    warningThreshold: 30, // 30 seconds warning
    autoProgressAt,
    timerType: timeRemaining > 0 ? 'countdown' : 'stopwatch',
  };

  emitToRoom(roomId, 'timer_update', eventData);
}

export function notifyGameError(
  roomId: string,
  errorType: string,
  message: string,
  phase: GamePhase,
  recoverable: boolean
): void {
  const eventData: GameFlowSSEEventData['game_error'] = {
    errorType: errorType as any,
    message,
    phase,
    recoverable,
    suggestedAction: recoverable ? 'Retry action' : 'Contact support',
  };

  emitToRoom(roomId, 'game_error', eventData);
}
```

### 1.3 GlobalSSEContext Enhancement

```typescript
// Enhanced GlobalSSEContext to handle game flow events
// File: /src/context/GlobalSSEContext.tsx

interface GameFlowSSEState {
  // Game flow state
  currentPhase: GamePhase;
  phaseTransitionInProgress: boolean;
  pendingPlayerActions: Map<string, PlayerActionType>;
  gameStateVersion: number;
  
  // Timer state
  phaseTimer: {
    timeRemaining: number;
    autoProgressAt: Date | null;
    isWarning: boolean;
  } | null;
  
  // Confirmation tracking
  playerConfirmations: Map<string, boolean>;
  allPlayersConfirmed: boolean;
  
  // Error state
  currentError: GameError | null;
  recoveryInProgress: boolean;
}

// Enhanced reducer to handle game flow events
function gameFlowSSEReducer(
  state: GameFlowSSEState,
  action: SSEAction
): GameFlowSSEState {
  switch (action.type) {
    case 'phase_transition': {
      const data = action.payload as GameFlowSSEEventData['phase_transition'];
      return {
        ...state,
        currentPhase: data.toPhase,
        phaseTransitionInProgress: false,
        playerConfirmations: new Map(), // Reset confirmations
        allPlayersConfirmed: false,
        currentError: null,
      };
    }

    case 'player_action': {
      const data = action.payload as GameFlowSSEEventData['player_action'];
      const newPendingActions = new Map(state.pendingPlayerActions);
      newPendingActions.set(data.playerId, data.action);
      
      return {
        ...state,
        pendingPlayerActions: newPendingActions,
      };
    }

    case 'game_state_update': {
      const data = action.payload as GameFlowSSEEventData['game_state_update'];
      return {
        ...state,
        gameStateVersion: data.version,
      };
    }

    case 'player_confirmation': {
      const data = action.payload as GameFlowSSEEventData['player_confirmation'];
      const newConfirmations = new Map(state.playerConfirmations);
      newConfirmations.set(data.playerId, data.confirmed);
      
      return {
        ...state,
        playerConfirmations: newConfirmations,
        allPlayersConfirmed: data.allPlayersConfirmed,
      };
    }

    case 'timer_update': {
      const data = action.payload as GameFlowSSEEventData['timer_update'];
      return {
        ...state,
        phaseTimer: {
          timeRemaining: data.timeRemaining,
          autoProgressAt: data.autoProgressAt,
          isWarning: data.timeRemaining <= data.warningThreshold,
        },
      };
    }

    case 'game_error': {
      const data = action.payload as GameFlowSSEEventData['game_error'];
      return {
        ...state,
        currentError: {
          type: data.errorType,
          message: data.message,
          phase: data.phase,
          recoverable: data.recoverable,
          suggestedAction: data.suggestedAction,
        },
        recoveryInProgress: false,
      };
    }

    default:
      return state;
  }
}
```

## 2. Backend API Enhancements

### 2.1 Phase Transition Management

```typescript
// Enhanced tRPC procedures for game flow
// File: /src/server/api/routers/game-flow.ts

export const gameFlowRouter = createTRPCRouter({
  // Phase progression management
  progressToNextPhase: publicProcedure
    .input(z.object({
      roomId: z.string().cuid(),
      triggeredBy: z.string().cuid(),
      reason: z.enum(['manual', 'automatic', 'timeout']),
    }))
    .mutation(async ({ input, ctx }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
        include: { players: true },
      });

      if (!room) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' });
      }

      // Validate phase transition
      const currentPhase = room.phase as GamePhase;
      const nextPhase = getNextPhase(currentPhase, room.gameState as GameState);
      
      if (!isPhaseTransitionAllowed(currentPhase, nextPhase)) {
        throw new TRPCError({ 
          code: 'BAD_REQUEST', 
          message: `Invalid phase transition from ${currentPhase} to ${nextPhase}` 
        });
      }

      // Update room with new phase
      const updatedRoom = await ctx.db.room.update({
        where: { id: input.roomId },
        data: {
          phase: nextPhase,
          lastPhaseChange: new Date(),
          gameState: updateGameStateForPhase(room.gameState as GameState, nextPhase),
        },
      });

      // Record phase transition
      await ctx.db.phaseTransition.create({
        data: {
          roomId: input.roomId,
          fromPhase: currentPhase,
          toPhase: nextPhase,
          triggeredBy: input.triggeredBy,
          transitionType: input.reason,
        },
      });

      // Emit SSE event
      notifyPhaseTransition(
        input.roomId,
        currentPhase,
        nextPhase,
        updatedRoom.gameState as GameState,
        input.triggeredBy
      );

      return {
        success: true,
        newPhase: nextPhase,
        gameState: updatedRoom.gameState,
      };
    }),

  // Check if automatic progression should occur
  checkAutoProgression: publicProcedure
    .input(z.object({
      roomId: z.string().cuid(),
    }))
    .query(async ({ input, ctx }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
        include: { players: true },
      });

      if (!room) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' });
      }

      const gameState = room.gameState as GameState;
      const currentPhase = room.phase as GamePhase;
      
      // Check phase-specific auto-progression conditions
      const shouldProgress = await checkAutoProgressionConditions(
        currentPhase,
        gameState,
        room.players
      );

      return {
        shouldProgress,
        currentPhase,
        nextPhase: shouldProgress ? getNextPhase(currentPhase, gameState) : currentPhase,
        reason: shouldProgress ? getProgressionReason(currentPhase, gameState) : null,
      };
    }),

  // Validate game state consistency
  validateGameState: publicProcedure
    .input(z.object({
      roomId: z.string().cuid(),
    }))
    .query(async ({ input, ctx }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
        include: { players: true },
      });

      if (!room) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' });
      }

      const gameState = room.gameState as GameState;
      const validation = validateGameStateConsistency(gameState, room.players);

      if (!validation.isValid) {
        // Attempt automatic recovery
        const recoveredState = await attemptStateRecovery(gameState, room.players);
        if (recoveredState) {
          await ctx.db.room.update({
            where: { id: input.roomId },
            data: { gameState: recoveredState },
          });

          return {
            isValid: true,
            recovered: true,
            issues: validation.issues,
          };
        }
      }

      return {
        isValid: validation.isValid,
        recovered: false,
        issues: validation.issues,
      };
    }),
});
```

### 2.2 Player Action Tracking

```typescript
// Player action tracking and coordination
// File: /src/server/api/routers/player-actions.ts

export const playerActionsRouter = createTRPCRouter({
  // Record player action and check progression
  recordPlayerAction: publicProcedure
    .input(z.object({
      roomId: z.string().cuid(),
      playerId: z.string().cuid(),
      action: z.enum(['role_confirmed', 'team_selected', 'vote_cast', 'mission_vote_cast', 'assassin_target_selected']),
      data: z.any(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Record the action
      await ctx.db.playerAction.create({
        data: {
          playerId: input.playerId,
          roomId: input.roomId,
          phase: await getCurrentPhase(input.roomId),
          actionType: input.action,
          actionData: input.data,
        },
      });

      // Get player info for notification
      const player = await ctx.db.player.findUnique({
        where: { id: input.playerId },
      });

      if (!player) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Player not found' });
      }

      // Emit SSE event for player action
      notifyPlayerAction(
        input.roomId,
        input.playerId,
        player.name,
        input.action,
        await getCurrentPhase(input.roomId),
        input.data
      );

      // Check if all players have completed this action
      const completionStatus = await checkActionCompletion(
        input.roomId,
        input.action
      );

      if (completionStatus.allCompleted) {
        // Emit confirmation event
        notifyPlayerConfirmation(
          input.roomId,
          input.playerId,
          input.action as any,
          true,
          []
        );

        // Check if this should trigger auto-progression
        const autoProgression = await checkAutoProgression(input.roomId);
        if (autoProgression.shouldProgress) {
          // Trigger automatic phase progression
          await progressToNextPhase(
            input.roomId,
            'system',
            'automatic'
          );
        }
      } else {
        // Emit partial confirmation event
        notifyPlayerConfirmation(
          input.roomId,
          input.playerId,
          input.action as any,
          false,
          completionStatus.pendingPlayers
        );
      }

      return {
        success: true,
        allCompleted: completionStatus.allCompleted,
        pendingPlayers: completionStatus.pendingPlayers,
      };
    }),

  // Get current action status for a phase
  getActionStatus: publicProcedure
    .input(z.object({
      roomId: z.string().cuid(),
      action: z.enum(['role_confirmed', 'team_selected', 'vote_cast', 'mission_vote_cast']),
    }))
    .query(async ({ input, ctx }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
        include: { players: true },
      });

      if (!room) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' });
      }

      // Get all actions of this type for current phase
      const actions = await ctx.db.playerAction.findMany({
        where: {
          roomId: input.roomId,
          actionType: input.action,
          phase: room.phase,
        },
        include: { player: true },
      });

      const completedPlayerIds = actions.map(action => action.playerId);
      const pendingPlayers = room.players.filter(
        player => !completedPlayerIds.includes(player.id)
      );

      return {
        completed: completedPlayerIds,
        pending: pendingPlayers.map(p => ({ id: p.id, name: p.name })),
        allCompleted: pendingPlayers.length === 0,
        totalPlayers: room.players.length,
      };
    }),
});
```

### 2.3 Game State Validation Utilities

```typescript
// Game state validation and recovery utilities
// File: /src/lib/game-state-validation.ts

interface GameStateValidation {
  isValid: boolean;
  issues: string[];
  severity: 'warning' | 'error' | 'critical';
}

export function validateGameStateConsistency(
  gameState: GameState,
  players: Player[]
): GameStateValidation {
  const issues: string[] = [];
  let severity: 'warning' | 'error' | 'critical' = 'warning';

  // Validate phase consistency
  if (!isValidPhase(gameState.phase)) {
    issues.push(`Invalid game phase: ${gameState.phase}`);
    severity = 'error';
  }

  // Validate player count consistency
  if (players.length < 5 || players.length > 10) {
    issues.push(`Invalid player count: ${players.length}`);
    severity = 'critical';
  }

  // Validate leader index
  if (gameState.leaderIndex < 0 || gameState.leaderIndex >= players.length) {
    issues.push(`Invalid leader index: ${gameState.leaderIndex}`);
    severity = 'error';
  }

  // Validate round consistency
  if (gameState.round < 1 || gameState.round > 5) {
    issues.push(`Invalid round number: ${gameState.round}`);
    severity = 'error';
  }

  // Validate mission consistency
  if (gameState.missions.length > gameState.round) {
    issues.push(`Too many missions for current round`);
    severity = 'error';
  }

  // Validate vote consistency
  const currentRoundVotes = gameState.votes.filter(v => v.round === gameState.round);
  if (currentRoundVotes.length > players.length) {
    issues.push(`Too many votes for current round`);
    severity = 'error';
  }

  return {
    isValid: issues.length === 0 || severity === 'warning',
    issues,
    severity,
  };
}

export async function attemptStateRecovery(
  gameState: GameState,
  players: Player[]
): Promise<GameState | null> {
  try {
    const recoveredState = { ...gameState };

    // Fix leader index if out of bounds
    if (recoveredState.leaderIndex >= players.length) {
      recoveredState.leaderIndex = 0;
    }

    // Fix round if inconsistent
    if (recoveredState.round < 1) {
      recoveredState.round = 1;
    }

    // Remove duplicate votes
    const uniqueVotes = recoveredState.votes.filter((vote, index, array) => 
      array.findIndex(v => v.playerId === vote.playerId && v.round === vote.round) === index
    );
    recoveredState.votes = uniqueVotes;

    // Validate recovered state
    const validation = validateGameStateConsistency(recoveredState, players);
    return validation.isValid ? recoveredState : null;
  } catch (error) {
    console.error('State recovery failed:', error);
    return null;
  }
}

export function getNextPhase(currentPhase: GamePhase, gameState: GameState): GamePhase {
  switch (currentPhase) {
    case 'lobby':
      return 'roleReveal';
    case 'roleReveal':
      return 'missionSelect';
    case 'missionSelect':
      return 'missionVote';
    case 'missionVote':
      // Check if team was approved
      const lastVote = gameState.votes[gameState.votes.length - 1];
      return lastVote?.vote === 'approve' ? 'missionExecution' : 'missionSelect';
    case 'missionExecution':
      // Check victory conditions
      const goodMissions = gameState.missions.filter(m => m.result === 'success').length;
      const evilMissions = gameState.missions.filter(m => m.result === 'failure').length;
      
      if (goodMissions >= 3) return 'assassinAttempt';
      if (evilMissions >= 3) return 'gameOver';
      return 'missionSelect'; // Next round
    case 'assassinAttempt':
      return 'gameOver';
    case 'gameOver':
      return 'lobby'; // For play again
    default:
      return currentPhase;
  }
}

export async function checkAutoProgressionConditions(
  phase: GamePhase,
  gameState: GameState,
  players: Player[]
): Promise<boolean> {
  switch (phase) {
    case 'roleReveal':
      // All players confirmed role viewing
      return await checkAllPlayersConfirmed('role_confirmed', gameState.roomId);
    
    case 'missionSelect':
      // Leader has selected team
      return await checkActionCompleted('team_selected', gameState.roomId, getCurrentLeader(gameState, players).id);
    
    case 'missionVote':
      // All players have voted
      return await checkAllPlayersConfirmed('vote_cast', gameState.roomId);
    
    case 'missionExecution':
      // All team members have voted
      const currentMission = gameState.missions[gameState.missions.length - 1];
      return await checkTeamMembersVoted(gameState.roomId, currentMission.teamMembers);
    
    case 'assassinAttempt':
      // Assassin has selected target
      const assassin = players.find(p => p.role === 'assassin');
      return assassin ? await checkActionCompleted('assassin_target_selected', gameState.roomId, assassin.id) : false;
    
    default:
      return false;
  }
}
```

## 3. Frontend Integration Specifications

### 3.1 Enhanced Game Engine Component

```typescript
// Enhanced GameEngine component
// File: /src/components/game-engine/GameEngine.tsx

interface GameEngineProps {
  roomCode: string;
  roomId: string;
  playerId: string;
  playerName: string;
  initialGameState: GameState;
  initialPlayers: Player[];
  onError?: (error: GameEngineError) => void;
  onPhaseTransition?: (fromPhase: GamePhase, toPhase: GamePhase) => void;
}

export function GameEngine({
  roomCode,
  roomId,
  playerId,
  playerName,
  initialGameState,
  initialPlayers,
  onError,
  onPhaseTransition,
}: GameEngineProps) {
  // Enhanced state management
  const [engineState, setEngineState] = useState<GameEngineState>({
    isInitialized: false,
    currentPhase: initialGameState?.phase || 'lobby',
    gameState: initialGameState,
    players: initialPlayers,
    error: null,
    performance: createInitialPerformanceMetrics(),
    transitionInProgress: false,
    // New game flow state
    phaseTimer: null,
    playerConfirmations: new Map(),
    allPlayersConfirmed: false,
    pendingActions: new Map(),
  });

  // SSE integration for real-time updates
  const {
    roomState,
    isConnected,
    connectionState,
  } = useOptimizedRealtimeRoom({
    roomCode,
    playerId,
    playerName,
    enabled: true,
  });

  // Handle SSE events for game flow
  useEffect(() => {
    if (!isConnected) return;

    const handlePhaseTransition = (data: GameFlowSSEEventData['phase_transition']) => {
      setEngineState(prev => ({
        ...prev,
        currentPhase: data.toPhase,
        gameState: data.gameState,
        transitionInProgress: false,
        playerConfirmations: new Map(),
        allPlayersConfirmed: false,
      }));

      onPhaseTransition?.(data.fromPhase, data.toPhase);
    };

    const handlePlayerAction = (data: GameFlowSSEEventData['player_action']) => {
      setEngineState(prev => {
        const newPendingActions = new Map(prev.pendingActions);
        newPendingActions.set(data.playerId, data.action);
        return {
          ...prev,
          pendingActions: newPendingActions,
        };
      });
    };

    const handlePlayerConfirmation = (data: GameFlowSSEEventData['player_confirmation']) => {
      setEngineState(prev => {
        const newConfirmations = new Map(prev.playerConfirmations);
        newConfirmations.set(data.playerId, data.confirmed);
        return {
          ...prev,
          playerConfirmations: newConfirmations,
          allPlayersConfirmed: data.allPlayersConfirmed,
        };
      });
    };

    const handleTimerUpdate = (data: GameFlowSSEEventData['timer_update']) => {
      setEngineState(prev => ({
        ...prev,
        phaseTimer: {
          timeRemaining: data.timeRemaining,
          autoProgressAt: data.autoProgressAt,
          isWarning: data.timeRemaining <= data.warningThreshold,
        },
      }));
    };

    const handleGameError = (data: GameFlowSSEEventData['game_error']) => {
      const error = createGameEngineError(
        data.errorType,
        data.message,
        data.phase,
        data.recoverable
      );
      
      setEngineState(prev => ({
        ...prev,
        error,
      }));

      onError?.(error);
    };

    // Subscribe to SSE events
    const unsubscribePhaseTransition = subscribeToSSEEvent('phase_transition', handlePhaseTransition);
    const unsubscribePlayerAction = subscribeToSSEEvent('player_action', handlePlayerAction);
    const unsubscribePlayerConfirmation = subscribeToSSEEvent('player_confirmation', handlePlayerConfirmation);
    const unsubscribeTimerUpdate = subscribeToSSEEvent('timer_update', handleTimerUpdate);
    const unsubscribeGameError = subscribeToSSEEvent('game_error', handleGameError);

    return () => {
      unsubscribePhaseTransition();
      unsubscribePlayerAction();
      unsubscribePlayerConfirmation();
      unsubscribeTimerUpdate();
      unsubscribeGameError();
    };
  }, [isConnected, onPhaseTransition, onError]);

  // Auto-progression checking
  useEffect(() => {
    if (!engineState.isInitialized || engineState.transitionInProgress) return;

    const checkProgression = async () => {
      try {
        const result = await api.gameFlow.checkAutoProgression.query({
          roomId,
        });

        if (result.shouldProgress) {
          setEngineState(prev => ({
            ...prev,
            transitionInProgress: true,
          }));

          await api.gameFlow.progressToNextPhase.mutate({
            roomId,
            triggeredBy: 'system',
            reason: 'automatic',
          });
        }
      } catch (error) {
        console.error('Auto-progression check failed:', error);
      }
    };

    // Check every 5 seconds if auto-progression should occur
    const interval = setInterval(checkProgression, 5000);
    return () => clearInterval(interval);
  }, [engineState.isInitialized, engineState.transitionInProgress, roomId]);

  // Render phase-specific component
  const renderPhaseComponent = () => {
    const commonProps = {
      gameState: engineState.gameState,
      players: engineState.players,
      currentPlayer: engineState.players.find(p => p.id === playerId)!,
      roomCode,
      roomId,
      playerId,
    };

    switch (engineState.currentPhase) {
      case 'roleReveal':
        return (
          <RoleRevealPhase
            {...commonProps}
            onRoleConfirmed={handleRoleConfirmed}
            confirmationStatus={engineState.playerConfirmations}
            allPlayersConfirmed={engineState.allPlayersConfirmed}
          />
        );

      case 'missionSelect':
        return (
          <MissionSelectPhase
            {...commonProps}
            onTeamSelected={handleTeamSelected}
          />
        );

      case 'missionVote':
        return (
          <VotingPhase
            {...commonProps}
            onVoteCast={handleVoteCast}
            votingProgress={engineState.playerConfirmations}
          />
        );

      case 'missionExecution':
        return (
          <MissionExecutionPhase
            {...commonProps}
            onMissionVoteCast={handleMissionVoteCast}
          />
        );

      case 'assassinAttempt':
        return (
          <AssassinPhase
            {...commonProps}
            onTargetSelected={handleAssassinTargetSelected}
          />
        );

      case 'gameOver':
        return (
          <GameOverPhase
            {...commonProps}
            onPlayAgain={handlePlayAgain}
            onReturnToLobby={handleReturnToLobby}
          />
        );

      default:
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Unknown Game Phase
              </h2>
              <p className="text-gray-300">
                Phase: {engineState.currentPhase}
              </p>
            </div>
          </div>
        );
    }
  };

  // Action handlers
  const handleRoleConfirmed = async () => {
    try {
      await api.playerActions.recordPlayerAction.mutate({
        roomId,
        playerId,
        action: 'role_confirmed',
        data: { confirmedAt: new Date() },
      });
    } catch (error) {
      console.error('Failed to confirm role:', error);
    }
  };

  const handleTeamSelected = async (teamMembers: string[]) => {
    try {
      await api.playerActions.recordPlayerAction.mutate({
        roomId,
        playerId,
        action: 'team_selected',
        data: { teamMembers, round: engineState.gameState.round },
      });
    } catch (error) {
      console.error('Failed to select team:', error);
    }
  };

  const handleVoteCast = async (vote: 'approve' | 'reject') => {
    try {
      await api.playerActions.recordPlayerAction.mutate({
        roomId,
        playerId,
        action: 'vote_cast',
        data: { vote, round: engineState.gameState.round },
      });
    } catch (error) {
      console.error('Failed to cast vote:', error);
    }
  };

  const handleMissionVoteCast = async (vote: 'success' | 'failure') => {
    try {
      await api.playerActions.recordPlayerAction.mutate({
        roomId,
        playerId,
        action: 'mission_vote_cast',
        data: { vote, round: engineState.gameState.round },
      });
    } catch (error) {
      console.error('Failed to cast mission vote:', error);
    }
  };

  const handleAssassinTargetSelected = async (targetId: string) => {
    try {
      await api.playerActions.recordPlayerAction.mutate({
        roomId,
        playerId,
        action: 'assassin_target_selected',
        data: { targetId },
      });
    } catch (error) {
      console.error('Failed to select assassin target:', error);
    }
  };

  const handlePlayAgain = async () => {
    try {
      await api.gameFlow.resetGame.mutate({
        roomId,
        hostId: playerId,
      });
    } catch (error) {
      console.error('Failed to reset game:', error);
    }
  };

  const handleReturnToLobby = () => {
    window.location.href = `/room/${roomCode}/lobby`;
  };

  // Render main game interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547]">
      {/* Performance Monitor */}
      <PerformanceMonitor
        enabled={true}
        onMetricsUpdate={handlePerformanceUpdate}
        thresholds={performanceThresholds}
      />

      {/* Game State Manager */}
      <GameStateManager
        roomCode={roomCode}
        gameState={engineState.gameState}
        onStateUpdate={handleStateUpdate}
        onError={handleError}
      />

      {/* Error Boundary */}
      <GameEngineErrorBoundary onError={handleErrorBoundaryError}>
        {/* Phase Timer (if active) */}
        {engineState.phaseTimer && (
          <PhaseTimer
            timeRemaining={engineState.phaseTimer.timeRemaining}
            isWarning={engineState.phaseTimer.isWarning}
            autoProgressAt={engineState.phaseTimer.autoProgressAt}
          />
        )}

        {/* Current Status Bar */}
        <CurrentStatusBar
          gameState={engineState.gameState}
          players={engineState.players}
          currentPhase={engineState.currentPhase}
          playerConfirmations={engineState.playerConfirmations}
        />

        {/* Phase-specific component */}
        {renderPhaseComponent()}

        {/* Connection Status */}
        <ConnectionStatus
          isConnected={isConnected}
          connectionState={connectionState}
          onReconnect={handleReconnect}
        />
      </GameEngineErrorBoundary>

      {/* Transition Overlay */}
      {engineState.transitionInProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center">
            <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-lg font-medium text-white">
              Transitioning Phase...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 3.2 Phase-Specific Controller Components

```typescript
// Phase controller components with SSE integration

// Role Reveal Phase Controller
export function RoleRevealPhase({
  gameState,
  players,
  currentPlayer,
  onRoleConfirmed,
  confirmationStatus,
  allPlayersConfirmed,
}: RoleRevealPhaseProps) {
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const handleConfirmRole = async () => {
    if (hasConfirmed) return;
    
    setHasConfirmed(true);
    await onRoleConfirmed();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Role Display */}
      <PlayerRoleCard
        player={currentPlayer}
        gameState={gameState}
        players={players}
      />

      {/* Confirmation Progress */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-white mb-4">
          Waiting for Players to Confirm Roles
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {players.map(player => (
            <div
              key={player.id}
              className={`p-3 rounded-lg ${
                confirmationStatus.get(player.id)
                  ? 'bg-green-600'
                  : 'bg-gray-600'
              }`}
            >
              <span className="text-white font-medium">
                {player.name}
              </span>
              {confirmationStatus.get(player.id) && (
                <span className="ml-2 text-green-200">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleConfirmRole}
          disabled={hasConfirmed}
          className={`px-8 py-4 rounded-lg font-bold text-xl transition-all ${
            hasConfirmed
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105'
          }`}
        >
          {hasConfirmed ? 'Role Confirmed' : 'Confirm Role'}
        </button>
      </div>

      {/* Auto-progression indicator */}
      {allPlayersConfirmed && (
        <div className="mt-6 text-center">
          <p className="text-green-400 font-medium">
            All players have confirmed their roles. Proceeding to mission selection...
          </p>
        </div>
      )}
    </div>
  );
}

// Mission Selection Phase Controller
export function MissionSelectPhase({
  gameState,
  players,
  currentPlayer,
  onTeamSelected,
}: MissionSelectPhaseProps) {
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentLeader = players[gameState.leaderIndex];
  const isLeader = currentPlayer.id === currentLeader.id;
  const missionRequirements = getMissionRequirements(gameState.round, players.length);

  const handleTeamSelection = (playerId: string) => {
    if (!isLeader) return;

    setSelectedTeam(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else if (prev.length < missionRequirements.teamSize) {
        return [...prev, playerId];
      }
      return prev;
    });
  };

  const handleSubmitTeam = async () => {
    if (!isLeader || selectedTeam.length !== missionRequirements.teamSize) return;

    setIsSubmitting(true);
    try {
      await onTeamSelected(selectedTeam);
    } catch (error) {
      console.error('Failed to submit team:', error);
      setIsSubmitting(false);
    }
  };

  if (!isLeader) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Mission {gameState.round} Team Selection
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {currentLeader.name} is selecting the mission team...
          </p>
          <div className="text-lg text-blue-400">
            Required team size: {missionRequirements.teamSize} players
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Mission {gameState.round} Team Selection
        </h2>
        <p className="text-xl text-gray-300 mb-4">
          You are the mission leader. Select {missionRequirements.teamSize} players for this mission.
        </p>
        <div className="text-lg text-blue-400">
          Selected: {selectedTeam.length} / {missionRequirements.teamSize}
        </div>
      </div>

      {/* Player Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {players.map(player => (
          <button
            key={player.id}
            onClick={() => handleTeamSelection(player.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedTeam.includes(player.id)
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
            }`}
          >
            <div className="font-bold">{player.name}</div>
            {selectedTeam.includes(player.id) && (
              <div className="text-blue-200 mt-1">Selected</div>
            )}
          </button>
        ))}
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          onClick={handleSubmitTeam}
          disabled={selectedTeam.length !== missionRequirements.teamSize || isSubmitting}
          className={`px-8 py-4 rounded-lg font-bold text-xl transition-all ${
            selectedTeam.length === missionRequirements.teamSize && !isSubmitting
              ? 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Team'}
        </button>
      </div>
    </div>
  );
}

// Similar implementations for VotingPhase, MissionExecutionPhase, AssassinPhase, and GameOverPhase...
```

This comprehensive technical specification provides the foundation for implementing a production-ready game flow with real-time synchronization, automatic phase transitions, and robust error handling. The implementation leverages the existing SSE infrastructure while adding game-specific enhancements for optimal user experience.
