# Game Flow User Stories and Implementation Tasks

**Created:** July 19, 2025  
**Status:** Ready for Development  
**Priority:** Critical  

## Epic: Production-Ready Game Flow

**AS A** player  
**I WANT** to experience a complete, seamless game of Avalon from lobby to end results  
**SO THAT** I can enjoy the full game experience with real-time synchronization and smooth phase transitions

---

## User Story 1: Game Engine Orchestration

**AS A** player who has started a game  
**I WANT** the game engine to automatically coordinate all phases and players  
**SO THAT** the game progresses smoothly without technical interruptions

### Acceptance Criteria
- [ ] Game engine loads properly when transitioning from lobby to game
- [ ] All players see the same game state in real-time
- [ ] Phase transitions happen automatically when conditions are met
- [ ] Error recovery works when players disconnect/reconnect
- [ ] Performance monitoring shows sub-second response times

### Implementation Tasks

#### Task 1.1: Enhanced Game Engine Controller
**File:** `/src/app/room/[roomCode]/game/page.tsx`
**Priority:** Critical

```typescript
// Replace placeholder with full GameEngine integration
- Remove "Game Interface Coming Soon" placeholder
- Integrate GameEngine component with real SSE connection
- Add session validation and player matching
- Implement error boundaries and recovery
- Add performance monitoring integration
```

**Subtasks:**
- [ ] Remove placeholder content and integrate GameEngine component
- [ ] Fix session/player ID mapping issues (current bug causing "Player not found")
- [ ] Add proper error handling for missing players or invalid sessions
- [ ] Integrate with GlobalSSEContext for real-time updates
- [ ] Add loading states and transition animations

#### Task 1.2: Game Engine Component Enhancement
**File:** `/src/components/game-engine/GameEngine.tsx`
**Priority:** Critical

```typescript
// Enhance existing GameEngine to handle real game flow
interface GameEngineEnhancements {
  realTimeSync: boolean;      // Replace mock data with SSE integration
  phaseTransitions: boolean;  // Automatic phase progression
  errorRecovery: boolean;     // Handle disconnections and errors
  stateValidation: boolean;   // Ensure game state consistency
}
```

**Subtasks:**
- [ ] Replace mock data with real game state from props
- [ ] Integrate with useOptimizedRealtimeRoom for SSE updates
- [ ] Add automatic phase transition logic
- [ ] Implement error recovery mechanisms
- [ ] Add state validation and synchronization

#### Task 1.3: SSE Event System Enhancement
**File:** `/src/context/GlobalSSEContext.tsx`
**Priority:** High

```typescript
// Add game flow specific SSE events
type GameFlowEvents = 
  | 'phase_transition'
  | 'player_action'
  | 'game_state_update'
  | 'timer_update'
  | 'error_recovery';
```

**Subtasks:**
- [ ] Add game flow event handlers to GlobalSSEContext
- [ ] Implement phase transition event processing
- [ ] Add player action synchronization
- [ ] Implement game state update handling
- [ ] Add timer synchronization for timed phases

---

## User Story 2: Role Reveal Phase Integration

**AS A** player whose role has been assigned  
**I WANT** to see my character role and understand my objectives  
**SO THAT** I can plan my strategy for the game

### Acceptance Criteria
- [ ] Role is displayed clearly with character art and description
- [ ] Players with special knowledge (Merlin) see relevant information
- [ ] All players must confirm viewing their role before progression
- [ ] Phase automatically transitions when all players are ready
- [ ] Real-time updates show confirmation status of other players

### Implementation Tasks

#### Task 2.1: Role Reveal Phase Controller
**File:** `/src/components/game/phases/RoleRevealPhase.tsx`
**Priority:** Critical

```typescript
// New phase controller component
interface RoleRevealPhaseProps {
  gameState: GameState;
  currentPlayer: Player;
  players: Player[];
  onRoleConfirmed: () => Promise<void>;
  onPhaseComplete: () => void;
}
```

**Subtasks:**
- [ ] Create new RoleRevealPhase component
- [ ] Integrate existing RoleRevealIntegration component
- [ ] Add confirmation tracking for all players
- [ ] Implement automatic progression logic
- [ ] Add loading states and error handling

#### Task 2.2: Backend API Enhancement
**File:** `/src/server/api/routers/room.ts`
**Priority:** High

```typescript
// Enhance role reveal APIs
confirmRoleViewed: publicProcedure
  .input(z.object({ roomId: z.string(), playerId: z.string() }))
  .mutation(async ({ input }) => {
    // Mark player as confirmed and check if all ready
    // Emit SSE event for confirmation
    // Auto-progress to next phase if all confirmed
  });
```

**Subtasks:**
- [ ] Add confirmRoleViewed mutation
- [ ] Add checkAllPlayersConfirmed query
- [ ] Implement SSE notifications for role confirmations
- [ ] Add automatic phase progression when all ready
- [ ] Fix existing JSON parsing bug in getRoleKnowledge

#### Task 2.3: SSE Integration for Role Reveal
**File:** `/src/server/sse-events.ts`
**Priority:** High

```typescript
// Add role reveal specific SSE events
export function notifyRoleConfirmation(roomId: string, playerId: string) {
  // Notify all players when someone confirms their role
}

export function notifyPhaseTransition(roomId: string, newPhase: GamePhase) {
  // Notify all players of phase change
}
```

**Subtasks:**
- [ ] Add notifyRoleConfirmation SSE event emitter
- [ ] Add notifyPhaseTransition SSE event emitter
- [ ] Update GlobalSSEContext to handle these events
- [ ] Test real-time confirmation updates
- [ ] Validate automatic phase progression

---

## User Story 3: Mission Team Selection Integration

**AS A** mission leader  
**I WANT** to select team members for the current mission  
**SO THAT** we can proceed to the voting phase

### Acceptance Criteria
- [ ] Current mission leader is clearly identified
- [ ] Mission requirements (team size, special rules) are displayed
- [ ] Leader can select/deselect team members interactively
- [ ] Team submission triggers automatic progression to voting
- [ ] All players see real-time updates of team selection

### Implementation Tasks

#### Task 3.1: Mission Select Phase Controller
**File:** `/src/components/game/phases/MissionSelectPhase.tsx`
**Priority:** Critical

```typescript
// New mission selection phase controller
interface MissionSelectPhaseProps {
  gameState: GameState;
  players: Player[];
  currentLeader: Player;
  missionRequirements: MissionRequirements;
  onTeamSubmitted: (team: Player[]) => Promise<void>;
}
```

**Subtasks:**
- [ ] Create MissionSelectPhase component
- [ ] Integrate existing MissionTeamSelectorIntegration
- [ ] Add leader identification and validation
- [ ] Implement team selection UI with validation
- [ ] Add automatic progression to voting phase

#### Task 3.2: Backend Mission Logic Enhancement
**File:** `/src/server/api/routers/room.ts`
**Priority:** High

```typescript
// Enhanced mission team submission
submitMissionTeam: publicProcedure
  .input(z.object({
    roomId: z.string(),
    leaderId: z.string(),
    teamMembers: z.array(z.string()),
    round: z.number()
  }))
  .mutation(async ({ input }) => {
    // Validate leader and team composition
    // Update game state with proposed team
    // Emit SSE event for team proposal
    // Progress to voting phase
  });
```

**Subtasks:**
- [ ] Enhance submitMissionTeam with leader validation
- [ ] Add leader rotation logic for multiple rounds
- [ ] Implement team composition validation
- [ ] Add SSE notifications for team submissions
- [ ] Auto-progress to voting phase after submission

#### Task 3.3: Leader Management System
**File:** `/src/lib/leader-management.ts`
**Priority:** Medium

```typescript
// Leader rotation and validation
interface LeaderManager {
  getCurrentLeader(gameState: GameState, players: Player[]): Player;
  rotateLeader(gameState: GameState): number;
  validateLeaderAction(leaderId: string, currentLeader: Player): boolean;
}
```

**Subtasks:**
- [ ] Create leader management utility functions
- [ ] Implement leader rotation logic
- [ ] Add leader validation for actions
- [ ] Integrate with mission selection phase
- [ ] Test leader rotation across multiple rounds

---

## User Story 4: Team Voting Integration

**AS A** player  
**I WANT** to vote on the proposed mission team  
**SO THAT** we can collectively decide whether to proceed with the mission

### Acceptance Criteria
- [ ] Proposed team is clearly displayed to all players
- [ ] All players can vote approve/reject on the team
- [ ] Vote progress is shown in real-time
- [ ] Results are revealed dramatically after all votes cast
- [ ] 5 rejections automatically triggers evil victory
- [ ] Approved team progresses to mission execution

### Implementation Tasks

#### Task 4.1: Voting Phase Controller
**File:** `/src/components/game/phases/VotingPhase.tsx`
**Priority:** Critical

```typescript
// Team voting phase controller
interface VotingPhaseProps {
  gameState: GameState;
  proposedTeam: Player[];
  players: Player[];
  onVoteSubmitted: (vote: 'approve' | 'reject') => Promise<void>;
  onVotingComplete: (results: VoteResults) => void;
}
```

**Subtasks:**
- [ ] Create VotingPhase component
- [ ] Integrate existing VotingScreenIntegration
- [ ] Add real-time vote progress tracking
- [ ] Implement dramatic results reveal
- [ ] Add rejection counter and evil victory condition

#### Task 4.2: Backend Voting Logic Enhancement
**File:** `/src/server/api/routers/room.ts`
**Priority:** High

```typescript
// Enhanced voting system
submitVote: publicProcedure
  .input(z.object({
    roomId: z.string(),
    playerId: z.string(),
    vote: z.enum(['approve', 'reject']),
    round: z.number()
  }))
  .mutation(async ({ input }) => {
    // Record player vote
    // Check if all players have voted
    // Calculate results and update rejection counter
    // Emit SSE events for vote progress and results
    // Handle auto-progression or evil victory
  });
```

**Subtasks:**
- [ ] Enhance submitVote with validation and progress tracking
- [ ] Add automatic vote tallying when all players voted
- [ ] Implement 5-rejection evil victory condition
- [ ] Add SSE notifications for vote progress and results
- [ ] Auto-progress to mission execution or team reselection

#### Task 4.3: Vote Results and Progression Logic
**File:** `/src/lib/voting-progression.ts`
**Priority:** High

```typescript
// Voting outcome handling
interface VotingProgressionManager {
  calculateVoteResults(votes: Vote[]): VoteResults;
  checkRejectionLimit(gameState: GameState): boolean;
  determineNextPhase(voteResult: VoteResults, rejectionCount: number): GamePhase;
  handleEvilVictory(roomId: string): Promise<void>;
}
```

**Subtasks:**
- [ ] Create voting progression utility functions
- [ ] Implement vote result calculation
- [ ] Add rejection limit checking
- [ ] Implement automatic evil victory on 5 rejections
- [ ] Add next phase determination logic

---

## User Story 5: Mission Execution Integration

**AS A** selected team member  
**I WANT** to vote on the mission outcome  
**SO THAT** I can contribute to the mission's success or failure

### Acceptance Criteria
- [ ] Only selected team members can vote on mission
- [ ] Good players can only vote success (UI enforcement)
- [ ] Evil players can vote success or failure
- [ ] Mission results are calculated correctly (including 2-fail rule for Mission 4)
- [ ] Results are revealed dramatically to all players
- [ ] Game checks for victory conditions after each mission

### Implementation Tasks

#### Task 5.1: Mission Execution Phase Controller
**File:** `/src/components/game/phases/MissionExecutionPhase.tsx`
**Priority:** Critical

```typescript
// Mission execution phase controller
interface MissionExecutionPhaseProps {
  gameState: GameState;
  missionTeam: Player[];
  currentPlayer: Player;
  missionRound: number;
  onMissionVoteSubmitted: (vote: 'success' | 'failure') => Promise<void>;
  onMissionComplete: (result: MissionResult) => void;
}
```

**Subtasks:**
- [ ] Create MissionExecutionPhase component
- [ ] Integrate existing MissionExecutionIntegration
- [ ] Add role-based voting constraints
- [ ] Implement mission result calculation
- [ ] Add victory condition checking after each mission

#### Task 5.2: Backend Mission Execution Logic
**File:** `/src/server/api/routers/room.ts`
**Priority:** High

```typescript
// Mission vote submission and result calculation
submitMissionVote: publicProcedure
  .input(z.object({
    roomId: z.string(),
    playerId: z.string(),
    vote: z.enum(['success', 'failure']),
    missionRound: z.number()
  }))
  .mutation(async ({ input }) => {
    // Validate team member can vote
    // Record mission vote
    // Check if all team members voted
    // Calculate mission result (including 2-fail rule)
    // Update mission in game state
    // Check victory conditions
    // Emit SSE events and progress to next phase
  });
```

**Subtasks:**
- [ ] Enhance submitMissionVote with team member validation
- [ ] Add mission result calculation (including Mission 4 special rule)
- [ ] Implement victory condition checking (3 successes for good)
- [ ] Add SSE notifications for mission results
- [ ] Auto-progress to next round or endgame phases

#### Task 5.3: Victory Condition Management
**File:** `/src/lib/victory-conditions.ts`
**Priority:** High

```typescript
// Victory condition checking
interface VictoryConditionManager {
  checkGoodVictory(missions: Mission[]): boolean;
  checkEvilVictory(missions: Mission[], rejectionCount: number): boolean;
  shouldTriggerAssassin(missions: Mission[]): boolean;
  calculateFinalVictor(gameState: GameState): 'good' | 'evil' | 'ongoing';
}
```

**Subtasks:**
- [ ] Create victory condition utility functions
- [ ] Implement 3-mission success good victory
- [ ] Implement 3-mission failure evil victory
- [ ] Add assassin phase trigger (3 good missions)
- [ ] Integrate with mission execution phase

---

## User Story 6: Assassin Attempt Integration

**AS A** the Assassin (when good team has won 3 missions)  
**I WANT** to identify and eliminate Merlin  
**SO THAT** the evil team can still achieve victory

### Acceptance Criteria
- [ ] Assassin phase only triggers when good team wins 3 missions
- [ ] Only the Assassin player can select a target
- [ ] All players are presented as potential targets
- [ ] Assassin's choice is final and immediately resolves the game
- [ ] Victory is determined correctly (evil wins if Merlin killed)
- [ ] Game automatically progresses to results phase

### Implementation Tasks

#### Task 6.1: Assassin Phase Controller
**File:** `/src/components/game/phases/AssassinPhase.tsx`
**Priority:** High

```typescript
// Assassin attempt phase controller
interface AssassinPhaseProps {
  gameState: GameState;
  assassinPlayer: Player;
  players: Player[];
  currentPlayer: Player;
  onTargetSelected: (targetId: string) => Promise<void>;
  onAssassinComplete: (success: boolean) => void;
}
```

**Subtasks:**
- [ ] Create AssassinPhase component
- [ ] Integrate existing AssassinScreenIntegration
- [ ] Add assassin player identification
- [ ] Implement target selection interface
- [ ] Add dramatic victory resolution

#### Task 6.2: Backend Assassin Logic
**File:** `/src/server/api/routers/room.ts`
**Priority:** High

```typescript
// Assassin target selection and resolution
submitAssassinAttempt: publicProcedure
  .input(z.object({
    roomId: z.string(),
    assassinId: z.string(),
    targetId: z.string()
  }))
  .mutation(async ({ input }) => {
    // Validate assassin player
    // Record assassin attempt
    // Check if target is Merlin
    // Determine final victory
    // Update game state to gameOver
    // Emit SSE events for game completion
  });
```

**Subtasks:**
- [ ] Add submitAssassinAttempt mutation
- [ ] Implement Merlin identification logic
- [ ] Add final victory determination
- [ ] Auto-progress to game over phase
- [ ] Add SSE notifications for game completion

#### Task 6.3: Final Victory Resolution
**File:** `/src/lib/final-victory.ts`
**Priority:** Medium

```typescript
// Final game resolution
interface FinalVictoryResolver {
  resolveAssassinAttempt(target: Player, merlin: Player): 'good' | 'evil';
  calculateFinalResults(gameState: GameState): GameResults;
  determinePlayerPerformance(player: Player, gameState: GameState): PlayerPerformance;
}
```

**Subtasks:**
- [ ] Create final victory resolution utilities
- [ ] Implement assassin success/failure logic
- [ ] Add comprehensive result calculation
- [ ] Integrate with game results phase
- [ ] Add player performance tracking

---

## User Story 7: Game Results and Completion

**AS A** player  
**I WANT** to see comprehensive game results and statistics  
**SO THAT** I can understand the outcome and learn from the game

### Acceptance Criteria
- [ ] Final victory condition is clearly displayed
- [ ] All player roles are revealed
- [ ] Mission history and vote history are shown
- [ ] Individual player performance is calculated
- [ ] Options to play again or return to lobby are provided
- [ ] Game statistics are tracked for future reference

### Implementation Tasks

#### Task 7.1: Game Over Phase Controller
**File:** `/src/components/game/phases/GameOverPhase.tsx`
**Priority:** Medium

```typescript
// Game completion and results phase
interface GameOverPhaseProps {
  gameState: GameState;
  players: Player[];
  gameResults: GameResults;
  onPlayAgain: () => Promise<void>;
  onReturnToLobby: () => void;
}
```

**Subtasks:**
- [ ] Create GameOverPhase component
- [ ] Integrate existing GameResultsIntegration
- [ ] Add comprehensive results display
- [ ] Implement play again functionality
- [ ] Add lobby return navigation

#### Task 7.2: Backend Game Completion Logic
**File:** `/src/server/api/routers/room.ts`
**Priority:** Medium

```typescript
// Game completion and statistics
getGameResults: publicProcedure
  .input(z.object({ roomId: z.string() }))
  .query(async ({ input }) => {
    // Calculate comprehensive game results
    // Generate player performance metrics
    // Create game statistics
    // Return formatted results
  });

resetGame: publicProcedure
  .input(z.object({ roomId: z.string(), hostId: z.string() }))
  .mutation(async ({ input }) => {
    // Reset game state to lobby
    // Clear player roles and game data
    // Emit SSE events for room reset
  });
```

**Subtasks:**
- [ ] Add getGameResults query with comprehensive data
- [ ] Add resetGame mutation for play again
- [ ] Implement game statistics calculation
- [ ] Add room state cleanup logic
- [ ] Add SSE notifications for game completion

---

## Cross-Cutting Implementation Tasks

### Task X.1: SSE Event System Enhancement
**Priority:** Critical

**Files:** 
- `/src/server/sse-events.ts`
- `/src/context/GlobalSSEContext.tsx`
- `/src/types/real-time-sync.ts`

**Subtasks:**
- [ ] Add phase transition SSE events
- [ ] Add player action synchronization events
- [ ] Add game state update events
- [ ] Add timer synchronization events
- [ ] Update GlobalSSEContext to handle all game flow events

### Task X.2: Error Handling and Recovery
**Priority:** High

**Files:**
- `/src/components/game-engine/ErrorBoundary.tsx`
- `/src/hooks/useGameStateRecovery.ts`
- `/src/lib/error-recovery.ts`

**Subtasks:**
- [ ] Implement game-specific error boundaries
- [ ] Add state recovery mechanisms
- [ ] Add player reconnection handling
- [ ] Add graceful degradation for failed SSE connections
- [ ] Add user-friendly error messages

### Task X.3: Performance Optimization
**Priority:** Medium

**Files:**
- `/src/components/game-engine/PerformanceMonitor.tsx`
- `/src/hooks/usePerformanceOptimization.ts`
- `/src/lib/performance-optimization.ts`

**Subtasks:**
- [ ] Add performance monitoring for phase transitions
- [ ] Optimize SSE connection management
- [ ] Add component rendering optimization
- [ ] Implement state update batching
- [ ] Add memory leak prevention

### Task X.4: Testing Implementation
**Priority:** Medium

**Files:**
- `/tests/game-flow.e2e.spec.ts`
- `/tests/phase-transitions.integration.spec.ts`
- `/tests/sse-synchronization.spec.ts`

**Subtasks:**
- [ ] Add end-to-end game flow tests
- [ ] Add phase transition integration tests
- [ ] Add SSE synchronization tests
- [ ] Add error recovery scenario tests
- [ ] Add performance regression tests

---

## Definition of Done

For each user story to be considered complete:

### Functional Requirements
- [ ] All acceptance criteria are met
- [ ] Integration with existing SSE system works properly
- [ ] Real-time synchronization functions correctly
- [ ] Error handling gracefully manages failures
- [ ] Performance meets sub-second response requirements

### Technical Requirements
- [ ] Code follows T3 Stack best practices
- [ ] TypeScript strict mode with no errors
- [ ] ESLint and Prettier compliance
- [ ] Comprehensive error handling
- [ ] Mobile-responsive design maintained

### Testing Requirements
- [ ] Unit tests for new components and utilities
- [ ] Integration tests for phase transitions
- [ ] End-to-end tests for complete game flow
- [ ] Performance tests for real-time updates
- [ ] Accessibility compliance validated

### Documentation Requirements
- [ ] JSDoc comments for all public APIs
- [ ] README updates for new functionality
- [ ] API documentation for new endpoints
- [ ] User guide updates for game flow

---

## Success Metrics

### User Experience Metrics
- **Phase Transition Time:** <500ms average
- **Real-time Update Latency:** <200ms average
- **Error Recovery Rate:** >99% successful reconnections
- **User Satisfaction:** >4.5/5 rating for game flow smoothness

### Technical Metrics
- **Memory Usage:** <100MB per game session
- **SSE Connection Stability:** >99.9% uptime
- **Database Query Performance:** <100ms average
- **API Response Time:** <300ms average

### Business Metrics
- **Game Completion Rate:** >95% of started games complete
- **Player Retention:** >80% play multiple games
- **Error Rate:** <1% of user actions result in errors
- **Concurrent Game Support:** 50+ simultaneous games

This comprehensive implementation plan provides a clear roadmap for creating a production-ready game flow that seamlessly integrates all 18 existing features into a cohesive, real-time gaming experience.
