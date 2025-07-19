# Complete Game Flow Requirements - Production Ready Implementation

**Created:** July 19, 2025  
**Status:** Development Required  
**Priority:** Critical  

## 1. Overview

### 1.1 Current State Assessment

**✅ Functional Components:**
- Lobby flow with room creation, joining, settings, and game start
- 18 individual game features implemented with backend APIs
- Database schema with complete game state management
- SSE real-time synchronization infrastructure in place
- Game engine components exist but need integration

**❌ Missing Critical Implementation:**
- Complete game flow orchestration from role reveal to end game
- Real-time state synchronization during gameplay phases
- Automatic phase transitions with SSE notifications
- Production-ready error handling and recovery
- Unified game state management across all phases

### 1.2 Problem Statement

Players currently get stuck after game starts because:
1. No unified game flow controller coordinates phases
2. Phase transitions don't trigger automatically via SSE
3. Individual components work in isolation but lack integration
4. No real-time synchronization for game state changes
5. Backend doesn't emit proper SSE events for phase progression

## 2. Game Flow Architecture Requirements

### 2.1 Core Game Engine Controller

**Location:** `/src/app/room/[roomCode]/game/page.tsx`

**Primary Responsibilities:**
```typescript
interface GameFlowController {
  // State Management
  currentPhase: GamePhase;
  gameState: GameState;
  players: Player[];
  
  // Real-time Integration
  sseConnection: SSEConnection;
  stateSync: GameStateSync;
  
  // Phase Management
  phaseTransitions: PhaseTransitionManager;
  automaticProgression: AutoProgressionEngine;
  
  // Error Recovery
  errorHandling: GameErrorHandler;
  stateRecovery: GameStateRecovery;
}
```

### 2.2 Phase Progression System

**Required Game Flow:**
1. `roleReveal` → Character role display and acknowledgment
2. `missionSelect` → Leader selects mission team
3. `missionVote` → All players vote on proposed team
4. `missionExecution` → Selected team executes mission
5. `missionResult` → Display mission outcome
6. `assassinAttempt` → Assassin targets Merlin (if triggered)
7. `gameOver` → Display final results and options

**Transition Triggers:**
- **Manual:** Player actions (vote, confirm, submit)
- **Automatic:** Timer expiration, all players ready
- **Conditional:** Game state conditions (5 team rejections, 3 missions complete)

### 2.3 Real-time State Synchronization

**SSE Event Integration:**
```typescript
// Required SSE Events for Game Flow
type GameFlowSSEEvents = 
  | 'phase_transition'      // Phase changes to all players
  | 'player_action'         // Player votes, selections, confirmations
  | 'game_state_update'     // Mission results, score updates
  | 'timer_update'          // Phase timer synchronization
  | 'error_recovery'        // Error states and recovery
  | 'leader_change'         // Leader rotation for missions
  | 'role_knowledge_sync'   // Character-specific information updates
```

## 3. Technical Implementation Requirements

### 3.1 Backend API Requirements

#### 3.1.1 Phase Transition Management
```typescript
// New tRPC procedures needed
interface PhaseTransitionAPI {
  // Phase progression
  progressToNextPhase(roomId: string, triggeredBy: string): Promise<GameStateUpdate>;
  validatePhaseTransition(roomId: string, targetPhase: GamePhase): Promise<boolean>;
  
  // Real-time notifications
  notifyPhaseTransition(roomId: string, newPhase: GamePhase, gameState: GameState): void;
  notifyPlayerAction(roomId: string, playerId: string, action: PlayerAction): void;
  notifyGameStateUpdate(roomId: string, updates: GameStateUpdates): void;
}
```

#### 3.1.2 Game State Orchestration
```typescript
// Enhanced game state management
interface GameStateOrchestrator {
  // State validation
  validateGameState(gameState: GameState): ValidationResult;
  
  // Automatic progression logic
  checkAutoProgressionConditions(gameState: GameState): ProgressionCheck;
  
  // Player synchronization
  ensureAllPlayersSync(roomId: string): Promise<SyncStatus>;
  
  // Error recovery
  recoverFromInvalidState(roomId: string): Promise<RecoveryResult>;
}
```

### 3.2 Frontend Integration Requirements

#### 3.2.1 Enhanced Game Engine Component
```typescript
// Main game orchestrator
interface GameEngineProps {
  roomCode: string;
  roomId: string;
  playerId: string;
  playerName: string;
  initialGameState: GameState;
  initialPlayers: Player[];
  
  // Real-time integration
  sseConnection: SSEConnection;
  onPhaseTransition: (fromPhase: GamePhase, toPhase: GamePhase) => void;
  onGameStateUpdate: (updates: GameStateUpdate) => void;
  onError: (error: GameEngineError) => void;
}
```

#### 3.2.2 Phase-Specific Controllers
```typescript
// Individual phase controllers
interface PhaseController {
  // Role Reveal Phase
  RoleRevealController: {
    displayRole: (player: Player) => void;
    confirmRoleViewed: (playerId: string) => Promise<void>;
    checkAllPlayersReady: () => Promise<boolean>;
  };
  
  // Mission Selection Phase
  MissionSelectController: {
    displayMissionRequirements: (round: number) => void;
    allowTeamSelection: (leaderId: string) => void;
    submitTeam: (team: string[]) => Promise<void>;
  };
  
  // Voting Phase
  VotingController: {
    displayProposedTeam: (team: Player[]) => void;
    collectVotes: () => Promise<Vote[]>;
    displayResults: (results: VoteResults) => void;
  };
  
  // Mission Execution Phase
  MissionExecutionController: {
    allowMissionVoting: (teamMembers: string[]) => void;
    collectMissionVotes: () => Promise<MissionVote[]>;
    calculateResult: (votes: MissionVote[]) => MissionResult;
  };
}
```

### 3.3 SSE Event System Enhancement

#### 3.3.1 Game Flow SSE Events
```typescript
// Enhanced SSE event types for game flow
interface GameFlowSSEEventData {
  // Phase transitions
  phase_transition: {
    fromPhase: GamePhase;
    toPhase: GamePhase;
    gameState: GameState;
    timestamp: Date;
  };
  
  // Player actions
  player_action: {
    playerId: string;
    action: 'vote' | 'confirm' | 'select' | 'submit';
    data: any;
    phase: GamePhase;
  };
  
  // Game state updates
  game_state_update: {
    updates: Partial<GameState>;
    affectedPlayers: string[];
    requiresSync: boolean;
  };
  
  // Timer synchronization
  timer_update: {
    phase: GamePhase;
    timeRemaining: number;
    warningThreshold: number;
    autoProgressAt: Date;
  };
}
```

#### 3.3.2 SSE Event Emitters
```typescript
// Backend SSE notification functions
interface GameFlowSSEEmitters {
  // Core game flow events
  notifyPhaseTransition(roomId: string, data: PhaseTransitionData): void;
  notifyPlayerAction(roomId: string, data: PlayerActionData): void;
  notifyGameStateUpdate(roomId: string, data: GameStateUpdateData): void;
  notifyTimerUpdate(roomId: string, data: TimerUpdateData): void;
  
  // Error and recovery events
  notifyGameError(roomId: string, error: GameError): void;
  notifyStateRecovery(roomId: string, recovery: RecoveryData): void;
  
  // Specialized game events
  notifyMissionResult(roomId: string, result: MissionResult): void;
  notifyLeaderChange(roomId: string, newLeader: Player): void;
  notifyVictoryCondition(roomId: string, victor: 'good' | 'evil', reason: string): void;
}
```

## 4. User Story Implementation Plan

### 4.1 Epic: Complete Game Flow Implementation

**AS A** player who has started a game  
**I WANT** the game to automatically progress through all phases with real-time synchronization  
**SO THAT** I can experience a complete, seamless game of Avalon from start to finish

### 4.2 User Stories and Tasks

#### Story 1: Phase Transition Orchestration
**Priority:** Critical  

**Tasks:**
1. **Backend Phase Controller** (`/src/server/api/routers/game-flow.ts`)
   - Create phase transition validation logic
   - Implement automatic progression triggers
   - Add SSE event emission for phase changes
   - Add game state consistency checks

2. **Frontend Game Engine Integration** (`/src/app/room/[roomCode]/game/page.tsx`)
   - Replace placeholder with GameEngine component
   - Integrate real-time SSE connections
   - Add phase-specific component rendering
   - Implement transition animations

3. **SSE Event Handling** (`/src/context/GlobalSSEContext.tsx`)
   - Add game flow event handlers
   - Implement state synchronization logic
   - Add conflict resolution for simultaneous actions
   - Add error recovery mechanisms

#### Story 2: Role Reveal Phase Integration
**Priority:** Critical  

**Tasks:**
1. **Role Reveal Controller** (`/src/components/game/phases/RoleRevealPhase.tsx`)
   - Integrate with real backend role knowledge API
   - Add confirmation tracking for all players
   - Implement automatic progression when all confirmed
   - Add SSE notifications for role confirmations

2. **Backend Integration** (`/src/server/api/routers/room.ts`)
   - Enhance `getRoleKnowledge` with better error handling
   - Add `confirmRoleViewed` mutation
   - Add `checkAllPlayersConfirmed` query
   - Emit SSE events for phase progression

#### Story 3: Mission Team Selection Integration
**Priority:** Critical  

**Tasks:**
1. **Mission Select Controller** (`/src/components/game/phases/MissionSelectPhase.tsx`)
   - Integrate with real mission requirements API
   - Add leader identification and validation
   - Implement team submission with validation
   - Add real-time team selection updates

2. **Backend API Enhancement** (`/src/server/api/routers/room.ts`)
   - Add leader rotation logic
   - Enhance team validation
   - Add SSE notifications for team submissions
   - Implement automatic progression to voting

#### Story 4: Team Voting Integration
**Priority:** Critical  

**Tasks:**
1. **Voting Controller** (`/src/components/game/phases/VotingPhase.tsx`)
   - Integrate with real voting API
   - Add real-time vote tracking
   - Implement vote result calculation and display
   - Add rejection counter and handling

2. **Backend Voting Logic** (`/src/server/api/routers/room.ts`)
   - Enhance vote collection and validation
   - Add automatic vote tallying
   - Implement 5-rejection evil victory condition
   - Add SSE notifications for vote results

#### Story 5: Mission Execution Integration
**Priority:** Critical  

**Tasks:**
1. **Mission Execution Controller** (`/src/components/game/phases/MissionExecutionPhase.tsx`)
   - Integrate with real mission voting API
   - Add role-based voting constraints
   - Implement mission result calculation
   - Add victory condition checking

2. **Backend Mission Logic** (`/src/server/api/routers/room.ts`)
   - Add mission vote collection
   - Implement mission result calculation
   - Add 3-mission victory checking
   - Add automatic progression to next round or assassin phase

#### Story 6: Assassin Attempt Integration
**Priority:** High  

**Tasks:**
1. **Assassin Controller** (`/src/components/game/phases/AssassinPhase.tsx`)
   - Integrate with real assassin target selection
   - Add Merlin identification logic
   - Implement victory condition resolution
   - Add dramatic reveal animations

2. **Backend Assassin Logic** (`/src/server/api/routers/room.ts`)
   - Add assassin target validation
   - Implement final victory calculation
   - Add game completion logic
   - Add SSE notifications for game end

#### Story 7: Game Results and Completion
**Priority:** High  

**Tasks:**
1. **Game Results Controller** (`/src/components/game/phases/GameOverPhase.tsx`)
   - Display comprehensive game results
   - Show detailed player performance
   - Add replay and lobby return options
   - Implement result sharing capabilities

2. **Backend Game Completion** (`/src/server/api/routers/room.ts`)
   - Add game completion API
   - Implement room reset functionality
   - Add game statistics tracking
   - Add cleanup and archival logic

### 4.3 Cross-cutting Concerns

#### Error Handling and Recovery
**Requirements:**
- Graceful handling of disconnections during critical phases
- State recovery when players reconnect
- Validation of game state consistency
- User-friendly error messages and recovery options

**Implementation:**
```typescript
interface GameErrorHandler {
  handlePhaseTransitionError(error: PhaseTransitionError): RecoveryAction;
  handlePlayerDisconnection(playerId: string): DisconnectionStrategy;
  handleStateDesync(players: Player[]): SyncResolution;
  handleInvalidAction(action: PlayerAction): ValidationResponse;
}
```

#### Performance and Optimization
**Requirements:**
- Real-time updates within 200ms
- Smooth phase transitions
- Optimized SSE connection management
- Memory-efficient state management

**Implementation:**
```typescript
interface PerformanceOptimizer {
  optimizeSSEConnections(): ConnectionPool;
  minimizeStateUpdates(): StateUpdateBatcher;
  cacheComponentRendering(): ComponentCache;
  monitorPerformanceMetrics(): PerformanceTracker;
}
```

## 5. API Integration Requirements

### 5.1 New tRPC Procedures Required

```typescript
// Game flow management procedures
interface GameFlowProcedures {
  // Phase management
  progressToNextPhase: publicProcedure
    .input(z.object({ roomId: z.string(), triggeredBy: z.string() }))
    .mutation(async ({ input }) => { /* Implementation */ });
    
  validatePhaseTransition: publicProcedure
    .input(z.object({ roomId: z.string(), targetPhase: z.enum(['roleReveal', 'missionSelect', ...]) }))
    .query(async ({ input }) => { /* Implementation */ });
    
  // Real-time synchronization
  syncGameState: publicProcedure
    .input(z.object({ roomId: z.string(), playerId: z.string() }))
    .mutation(async ({ input }) => { /* Implementation */ });
    
  broadcastPlayerAction: publicProcedure
    .input(z.object({ roomId: z.string(), action: z.object({}) }))
    .mutation(async ({ input }) => { /* Implementation */ });
    
  // Timer management
  updatePhaseTimer: publicProcedure
    .input(z.object({ roomId: z.string(), timeRemaining: z.number() }))
    .mutation(async ({ input }) => { /* Implementation */ });
    
  checkAutoProgression: publicProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ input }) => { /* Implementation */ });
}
```

### 5.2 Database Schema Enhancements

```sql
-- Add game flow tracking
ALTER TABLE "Room" ADD COLUMN "lastPhaseChange" TIMESTAMP;
ALTER TABLE "Room" ADD COLUMN "autoProgressionEnabled" BOOLEAN DEFAULT true;
ALTER TABLE "Room" ADD COLUMN "phaseTimeoutAt" TIMESTAMP;

-- Add player action tracking
CREATE TABLE "PlayerAction" (
  "id" TEXT PRIMARY KEY,
  "playerId" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "phase" TEXT NOT NULL,
  "actionType" TEXT NOT NULL,
  "actionData" JSONB,
  "timestamp" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("playerId") REFERENCES "Player"("id"),
  FOREIGN KEY ("roomId") REFERENCES "Room"("id")
);

-- Add phase transition history
CREATE TABLE "PhaseTransition" (
  "id" TEXT PRIMARY KEY,
  "roomId" TEXT NOT NULL,
  "fromPhase" TEXT NOT NULL,
  "toPhase" TEXT NOT NULL,
  "triggeredBy" TEXT,
  "transitionType" TEXT NOT NULL, -- 'manual', 'automatic', 'timeout'
  "timestamp" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("roomId") REFERENCES "Room"("id")
);
```

## 6. Testing Requirements

### 6.1 Integration Testing
**Required Test Coverage:**
- Complete game flow from lobby to game over
- All phase transitions working correctly
- SSE event synchronization across multiple clients
- Error handling and recovery scenarios
- Performance under concurrent player actions

### 6.2 End-to-End Testing
**Test Scenarios:**
```typescript
describe('Complete Game Flow', () => {
  test('5-player game completes successfully', async () => {
    // Test complete game from start to finish
  });
  
  test('Mission rejection leads to evil victory', async () => {
    // Test 5-rejection evil victory condition
  });
  
  test('Assassin successfully identifies Merlin', async () => {
    // Test assassin victory condition
  });
  
  test('Player disconnection and reconnection', async () => {
    // Test error recovery scenarios
  });
});
```

## 7. Performance and Scalability

### 7.1 Performance Targets
- **Phase Transition:** <500ms including SSE propagation
- **Real-time Updates:** <200ms for player actions
- **State Synchronization:** <1s for complete game state sync
- **Memory Usage:** <100MB per game session

### 7.2 Scalability Considerations
- Support for 50+ concurrent games
- Efficient SSE connection pooling
- Database query optimization
- CDN integration for static assets

## 8. Implementation Timeline

### 8.1 Sprint 1 (Week 1): Core Infrastructure
**Days 1-3:**
- Implement enhanced game engine controller
- Add phase transition management APIs
- Integrate SSE event system for game flow

**Days 4-5:**
- Complete role reveal phase integration
- Add mission team selection phase integration
- Test phase transitions between role reveal and team selection

### 8.2 Sprint 2 (Week 2): Core Game Phases
**Days 1-3:**
- Complete team voting phase integration
- Add mission execution phase integration
- Implement automatic mission progression

**Days 4-5:**
- Add assassin attempt phase integration
- Complete game over phase implementation
- Test complete 5-player game flow

### 8.3 Sprint 3 (Week 3): Polish and Production
**Days 1-2:**
- Error handling and recovery implementation
- Performance optimization and testing
- Mobile responsiveness validation

**Days 3-5:**
- End-to-end testing and bug fixes
- Production deployment preparation
- Documentation and training materials

## 9. Success Criteria

### 9.1 Functional Requirements
✅ **Complete Game Flow:** Players can complete a full game from lobby to results  
✅ **Real-time Synchronization:** All players see updates within 200ms  
✅ **Error Recovery:** Graceful handling of disconnections and errors  
✅ **Phase Transitions:** Automatic progression based on game logic  
✅ **Victory Conditions:** Correct implementation of all win scenarios  

### 9.2 Non-Functional Requirements
✅ **Performance:** Sub-second response times for all interactions  
✅ **Reliability:** 99.9% uptime with error recovery  
✅ **Scalability:** Support for 50+ concurrent games  
✅ **Security:** No game state manipulation possible  
✅ **Accessibility:** WCAG 2.1 AA compliance maintained  

### 9.3 User Experience Requirements
✅ **Intuitive Flow:** Clear indication of current phase and required actions  
✅ **Responsive Design:** Optimal experience on all devices  
✅ **Visual Feedback:** Smooth transitions and loading states  
✅ **Error Communication:** Clear, actionable error messages  
✅ **Performance Feedback:** Real-time indicators of connection and sync status  

## 10. Risk Mitigation

### 10.1 Technical Risks
**Risk:** SSE connection failures during critical phases  
**Mitigation:** Implement automatic reconnection with state recovery

**Risk:** Database performance under high load  
**Mitigation:** Query optimization and caching strategies

**Risk:** State desynchronization between players  
**Mitigation:** Implement conflict resolution and state validation

### 10.2 User Experience Risks
**Risk:** Player confusion during phase transitions  
**Mitigation:** Clear visual indicators and progress tracking

**Risk:** Mobile performance degradation  
**Mitigation:** Performance testing and optimization

**Risk:** Accessibility compliance issues  
**Mitigation:** Automated testing and manual accessibility audits

---

## Conclusion

This requirements document provides a comprehensive plan for implementing a production-ready complete game flow. The implementation focuses on:

1. **Real-time synchronization** using the existing SSE infrastructure
2. **Automatic phase progression** with proper trigger conditions
3. **Error handling and recovery** for robust user experience
4. **Performance optimization** for smooth gameplay
5. **Production readiness** with comprehensive testing

The deliverable will be a fully functional Avalon game that seamlessly progresses from lobby through all game phases to completion, with real-time synchronization and error recovery capabilities.
