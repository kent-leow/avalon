# Testing Strategy for Game Flow Implementation

**Created:** July 19, 2025  
**Status:** Testing Specification  
**Priority:** Critical  

## 1. Testing Overview

### 1.1 Testing Objectives

**Primary Goals:**
- Validate complete game flow from lobby to end results
- Ensure real-time synchronization across all players
- Verify automatic phase transitions work correctly
- Test error handling and recovery mechanisms
- Validate performance under concurrent load

**Success Criteria:**
- 100% phase transition success rate
- <200ms real-time update latency
- >99% error recovery success rate
- Support for 50+ concurrent games
- Zero data corruption or game state inconsistencies

### 1.2 Testing Scope

**In Scope:**
- Complete game flow integration testing
- SSE real-time synchronization testing
- Phase transition automation testing
- Error handling and recovery testing
- Performance and load testing
- Multi-player synchronization testing

**Out of Scope:**
- Individual component unit tests (already exist)
- Basic database CRUD operations (already tested)
- Static UI component testing (already covered)

## 2. Test Categories

### 2.1 Integration Testing

#### Test Suite: Complete Game Flow
**File:** `/tests/integration/complete-game-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { GameFlowTestHelper } from '../helpers/game-flow-helper';

describe('Complete Game Flow Integration', () => {
  let gameHelper: GameFlowTestHelper;

  beforeEach(async () => {
    gameHelper = new GameFlowTestHelper();
    await gameHelper.createTestRoom(5); // 5 players
  });

  afterEach(async () => {
    await gameHelper.cleanup();
  });

  test('5-player game completes successfully', async () => {
    // Start the game
    await gameHelper.startGame();
    
    // Role Reveal Phase
    await gameHelper.expectPhase('roleReveal');
    await gameHelper.confirmAllPlayerRoles();
    await gameHelper.expectPhaseTransition('roleReveal', 'missionSelect');

    // Mission 1
    await gameHelper.expectPhase('missionSelect');
    await gameHelper.selectMissionTeam(1, [0, 1]); // Leader selects first 2 players
    await gameHelper.expectPhaseTransition('missionSelect', 'missionVote');

    await gameHelper.expectPhase('missionVote');
    await gameHelper.voteOnTeam(['approve', 'approve', 'approve', 'reject', 'reject']);
    await gameHelper.expectPhaseTransition('missionVote', 'missionExecution');

    await gameHelper.expectPhase('missionExecution');
    await gameHelper.executeMission(['success', 'success']);
    await gameHelper.expectMissionResult('success');
    await gameHelper.expectPhaseTransition('missionExecution', 'missionSelect');

    // Mission 2
    await gameHelper.expectPhase('missionSelect');
    await gameHelper.expectLeaderRotation();
    await gameHelper.selectMissionTeam(2, [1, 2, 3]); // New leader selects 3 players
    
    // Continue through all missions...
    await gameHelper.playMissionsUntilCompletion();

    // Final phase
    await gameHelper.expectPhase('gameOver');
    await gameHelper.validateGameResults();
  });

  test('evil victory through 5 team rejections', async () => {
    await gameHelper.startGame();
    await gameHelper.confirmAllPlayerRoles();

    // Reject 5 teams in a row
    for (let i = 0; i < 5; i++) {
      await gameHelper.expectPhase('missionSelect');
      await gameHelper.selectMissionTeam(1, [0, 1]);
      
      await gameHelper.expectPhase('missionVote');
      await gameHelper.voteOnTeam(['reject', 'reject', 'reject', 'approve', 'approve']);
      
      if (i < 4) {
        await gameHelper.expectPhaseTransition('missionVote', 'missionSelect');
        await gameHelper.expectLeaderRotation();
      } else {
        await gameHelper.expectPhaseTransition('missionVote', 'gameOver');
        await gameHelper.expectEvilVictory('five_rejections');
      }
    }
  });

  test('assassin successfully kills Merlin', async () => {
    await gameHelper.startGame();
    await gameHelper.confirmAllPlayerRoles();

    // Play through missions with good team winning 3
    await gameHelper.playMissionsToGoodVictory();

    // Assassin phase
    await gameHelper.expectPhase('assassinAttempt');
    const merlinId = await gameHelper.getMerlinPlayerId();
    await gameHelper.selectAssassinTarget(merlinId);
    
    await gameHelper.expectPhaseTransition('assassinAttempt', 'gameOver');
    await gameHelper.expectEvilVictory('assassin_success');
  });

  test('good team victory when assassin fails', async () => {
    await gameHelper.startGame();
    await gameHelper.confirmAllPlayerRoles();

    await gameHelper.playMissionsToGoodVictory();

    await gameHelper.expectPhase('assassinAttempt');
    const nonMerlinId = await gameHelper.getNonMerlinPlayerId();
    await gameHelper.selectAssassinTarget(nonMerlinId);
    
    await gameHelper.expectPhaseTransition('assassinAttempt', 'gameOver');
    await gameHelper.expectGoodVictory('missions_and_assassin_fail');
  });
});
```

#### Test Suite: Phase Transitions
**File:** `/tests/integration/phase-transitions.spec.ts`

```typescript
describe('Phase Transition Integration', () => {
  test('automatic phase transitions work correctly', async () => {
    const gameHelper = new GameFlowTestHelper();
    await gameHelper.createTestRoom(5);
    await gameHelper.startGame();

    // Test automatic transition after all players confirm roles
    await gameHelper.expectPhase('roleReveal');
    
    // Confirm first 4 players, should not transition yet
    await gameHelper.confirmPlayerRoles([0, 1, 2, 3]);
    await gameHelper.expectStillInPhase('roleReveal');
    
    // Confirm last player, should auto-transition
    await gameHelper.confirmPlayerRoles([4]);
    await gameHelper.expectPhaseTransition('roleReveal', 'missionSelect', { timeout: 2000 });
  });

  test('manual phase transitions work correctly', async () => {
    const gameHelper = new GameFlowTestHelper();
    await gameHelper.createTestRoom(5);
    await gameHelper.startGame();

    await gameHelper.expectPhase('roleReveal');
    await gameHelper.confirmAllPlayerRoles();
    
    await gameHelper.expectPhase('missionSelect');
    await gameHelper.selectMissionTeam(1, [0, 1]);
    await gameHelper.expectPhaseTransition('missionSelect', 'missionVote', { timeout: 1000 });
  });

  test('invalid phase transitions are prevented', async () => {
    const gameHelper = new GameFlowTestHelper();
    await gameHelper.createTestRoom(5);
    
    // Attempt invalid transition from lobby to missionSelect
    const result = await gameHelper.attemptPhaseTransition('lobby', 'missionSelect');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid phase transition');
  });

  test('phase transitions with player disconnections', async () => {
    const gameHelper = new GameFlowTestHelper();
    await gameHelper.createTestRoom(5);
    await gameHelper.startGame();
    
    await gameHelper.expectPhase('roleReveal');
    
    // Disconnect one player
    await gameHelper.disconnectPlayer(2);
    
    // Other players confirm roles
    await gameHelper.confirmPlayerRoles([0, 1, 3, 4]);
    
    // Should not auto-transition due to disconnected player
    await gameHelper.expectStillInPhase('roleReveal', { timeout: 3000 });
    
    // Reconnect player
    await gameHelper.reconnectPlayer(2);
    await gameHelper.confirmPlayerRoles([2]);
    
    // Should now auto-transition
    await gameHelper.expectPhaseTransition('roleReveal', 'missionSelect');
  });
});
```

### 2.2 Real-time Synchronization Testing

#### Test Suite: SSE Synchronization
**File:** `/tests/integration/sse-synchronization.spec.ts`

```typescript
describe('SSE Real-time Synchronization', () => {
  test('all players receive phase transition events', async () => {
    const gameHelper = new GameFlowTestHelper();
    await gameHelper.createTestRoom(5);
    const players = await gameHelper.getAllPlayerSessions();

    await gameHelper.startGame();

    // Monitor SSE events for all players
    const eventPromises = players.map(player =>
      gameHelper.waitForSSEEvent(player.sessionId, 'phase_transition')
    );

    // Trigger phase transition
    await gameHelper.confirmAllPlayerRoles();

    // All players should receive the event within 200ms
    const events = await Promise.all(eventPromises);
    
    events.forEach(event => {
      expect(event.data.fromPhase).toBe('roleReveal');
      expect(event.data.toPhase).toBe('missionSelect');
      expect(event.timestamp).toBeWithinMs(Date.now(), 200);
    });
  });

  test('player actions are synchronized in real-time', async () => {
    const gameHelper = new GameFlowTestHelper();
    await gameHelper.createTestRoom(5);
    const players = await gameHelper.getAllPlayerSessions();

    await gameHelper.startGame();
    await gameHelper.confirmAllPlayerRoles();
    await gameHelper.expectPhase('missionSelect');

    // Monitor player action events
    const actionEventPromises = players.slice(1).map(player =>
      gameHelper.waitForSSEEvent(player.sessionId, 'player_action')
    );

    // Leader selects team
    await gameHelper.selectMissionTeam(1, [0, 1]);

    // Other players should see the team selection immediately
    const actionEvents = await Promise.all(actionEventPromises);
    
    actionEvents.forEach(event => {
      expect(event.data.action).toBe('team_selected');
      expect(event.data.data.teamMembers).toEqual(['player-0', 'player-1']);
    });
  });

  test('player confirmation status updates in real-time', async () => {
    const gameHelper = new GameFlowTestHelper();
    await gameHelper.createTestRoom(5);
    const players = await gameHelper.getAllPlayerSessions();

    await gameHelper.startGame();
    await gameHelper.expectPhase('roleReveal');

    // Monitor confirmation events for all players
    const confirmationPromises = players.map(player =>
      gameHelper.waitForSSEEvent(player.sessionId, 'player_confirmation')
    );

    // First player confirms role
    await gameHelper.confirmPlayerRoles([0]);

    // All players should see the confirmation update
    const confirmationEvents = await Promise.all(confirmationPromises);
    
    confirmationEvents.forEach(event => {
      expect(event.data.playerId).toBe('player-0');
      expect(event.data.confirmationType).toBe('role_viewed');
      expect(event.data.confirmed).toBe(true);
      expect(event.data.allPlayersConfirmed).toBe(false);
    });
  });

  test('game state updates are synchronized', async () => {
    const gameHelper = new GameFlowTestHelper();
    await gameHelper.createTestRoom(5);
    const players = await gameHelper.getAllPlayerSessions();

    await gameHelper.playToMissionExecution();

    // Monitor game state update events
    const stateUpdatePromises = players.map(player =>
      gameHelper.waitForSSEEvent(player.sessionId, 'game_state_update')
    );

    // Execute mission with mixed results
    await gameHelper.executeMission(['success', 'failure']);

    // All players should receive game state updates
    const stateEvents = await Promise.all(stateUpdatePromises);
    
    stateEvents.forEach(event => {
      expect(event.data.updates.missions).toBeDefined();
      expect(event.data.updates.missions[0].result).toBe('failure');
    });
  });

  test('connection recovery and state re-sync', async () => {
    const gameHelper = new GameFlowTestHelper();
    await gameHelper.createTestRoom(5);
    
    await gameHelper.startGame();
    await gameHelper.confirmAllPlayerRoles();
    await gameHelper.expectPhase('missionSelect');

    // Disconnect a player
    await gameHelper.disconnectPlayer(2);

    // Continue game progression
    await gameHelper.selectMissionTeam(1, [0, 1]);
    await gameHelper.voteOnTeam(['approve', 'approve', 'approve', 'approve', 'approve']);

    // Reconnect player
    await gameHelper.reconnectPlayer(2);

    // Player should receive state synchronization
    const syncEvent = await gameHelper.waitForSSEEvent('player-2', 'game_state_update');
    expect(syncEvent.data.updateType).toBe('full');
    expect(syncEvent.data.requiresAck).toBe(true);

    // Verify player has correct game state
    const playerState = await gameHelper.getPlayerGameState('player-2');
    expect(playerState.phase).toBe('missionExecution');
  });
});
```

### 2.3 Error Handling and Recovery Testing

#### Test Suite: Error Scenarios
**File:** `/tests/integration/error-handling.spec.ts`

```typescript
describe('Error Handling and Recovery', () => {
  test('invalid player actions are rejected gracefully', async () => {
    const gameHelper = new GameFlowTestHelper();
    await gameHelper.createTestRoom(5);
    await gameHelper.startGame();
    await gameHelper.confirmAllPlayerRoles();
    await gameHelper.expectPhase('missionSelect');

    // Non-leader tries to select team
    const result = await gameHelper.attemptTeamSelection('player-1', [0, 1]);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Only the leader can select the team');

    // Game state should remain unchanged
    const gameState = await gameHelper.getGameState();
    expect(gameState.phase).toBe('missionSelect');
  });

  test('database connection failures are handled gracefully', async () => {
    const gameHelper = new GameFlowTestHelper();
    await gameHelper.createTestRoom(5);
    
    // Simulate database connection failure
    await gameHelper.simulateDatabaseFailure();

    await gameHelper.startGame();
    await gameHelper.confirmAllPlayerRoles();

    // Should receive error event
    const errorEvent = await gameHelper.waitForSSEEvent('all', 'game_error');
    expect(errorEvent.data.errorType).toBe('database');
    expect(errorEvent.data.recoverable).toBe(true);

    // Restore database connection
    await gameHelper.restoreDatabaseConnection();

    // Game should recover automatically
    await gameHelper.expectPhase('missionSelect');
  });

  test('SSE connection failures trigger recovery', async () => {
    const gameHelper = new GameFlowTestHelper();
    await gameHelper.createTestRoom(5);
    const player = await gameHelper.getPlayerSession('player-0');

    await gameHelper.startGame();

    // Simulate SSE connection failure
    await gameHelper.simulateSSEFailure('player-0');

    // Player should attempt reconnection
    const reconnectionAttempt = await gameHelper.waitForReconnectionAttempt('player-0');
    expect(reconnectionAttempt.attempts).toBeGreaterThan(0);

    // Restore SSE connection
    await gameHelper.restoreSSEConnection('player-0');

    // Player should receive state sync
    const syncEvent = await gameHelper.waitForSSEEvent('player-0', 'game_state_update');
    expect(syncEvent.data.updateType).toBe('full');
  });

  test('game state corruption detection and recovery', async () => {
    const gameHelper = new GameFlowTestHelper();
    await gameHelper.createTestRoom(5);
    await gameHelper.startGame();

    // Corrupt game state
    await gameHelper.corruptGameState({
      leaderIndex: 999, // Invalid leader index
      round: -1,        // Invalid round number
    });

    // System should detect corruption
    const validationResult = await gameHelper.validateGameState();
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.issues).toContain('Invalid leader index');

    // Attempt automatic recovery
    const recoveryResult = await gameHelper.attemptStateRecovery();
    expect(recoveryResult.recovered).toBe(true);

    // Game state should be valid after recovery
    const finalValidation = await gameHelper.validateGameState();
    expect(finalValidation.isValid).toBe(true);
  });

  test('player disconnection during critical actions', async () => {
    const gameHelper = new GameFlowTestHelper();
    await gameHelper.createTestRoom(5);
    await gameHelper.startGame();
    await gameHelper.playToMissionExecution();

    // Disconnect a team member during mission execution
    await gameHelper.disconnectPlayer(0); // Team member

    // Other team member votes
    await gameHelper.submitMissionVote('player-1', 'success');

    // Game should wait for disconnected player
    await gameHelper.expectStillInPhase('missionExecution', { timeout: 3000 });

    // Reconnect player
    await gameHelper.reconnectPlayer(0);

    // Player should be able to vote
    await gameHelper.submitMissionVote('player-0', 'success');

    // Mission should complete
    await gameHelper.expectPhaseTransition('missionExecution', 'missionSelect');
  });

  test('simultaneous action conflicts are resolved', async () => {
    const gameHelper = new GameFlowTestHelper();
    await gameHelper.createTestRoom(5);
    await gameHelper.startGame();
    await gameHelper.confirmAllPlayerRoles();
    await gameHelper.selectMissionTeam(1, [0, 1]);
    await gameHelper.expectPhase('missionVote');

    // Simulate simultaneous votes
    const votePromises = [
      gameHelper.submitVote('player-0', 'approve'),
      gameHelper.submitVote('player-1', 'approve'),
      gameHelper.submitVote('player-2', 'approve'),
      gameHelper.submitVote('player-3', 'reject'),
      gameHelper.submitVote('player-4', 'reject'),
    ];

    const results = await Promise.all(votePromises);

    // All votes should be recorded successfully
    results.forEach(result => {
      expect(result.success).toBe(true);
    });

    // Vote results should be consistent
    const finalVotes = await gameHelper.getVotes();
    expect(finalVotes).toHaveLength(5);
    expect(finalVotes.filter(v => v.vote === 'approve')).toHaveLength(3);
    expect(finalVotes.filter(v => v.vote === 'reject')).toHaveLength(2);
  });
});
```

### 2.4 Performance Testing

#### Test Suite: Performance and Load
**File:** `/tests/performance/load-testing.spec.ts`

```typescript
describe('Performance and Load Testing', () => {
  test('phase transitions complete within 500ms', async () => {
    const gameHelper = new GameFlowTestHelper();
    await gameHelper.createTestRoom(10); // Maximum players
    await gameHelper.startGame();

    const startTime = Date.now();
    await gameHelper.confirmAllPlayerRoles();
    const transitionTime = Date.now() - startTime;

    expect(transitionTime).toBeLessThan(500);
  });

  test('SSE events are delivered within 200ms', async () => {
    const gameHelper = new GameFlowTestHelper();
    await gameHelper.createTestRoom(5);
    const players = await gameHelper.getAllPlayerSessions();

    await gameHelper.startGame();
    await gameHelper.confirmAllPlayerRoles();
    await gameHelper.expectPhase('missionSelect');

    // Measure SSE event delivery time
    const eventPromises = players.slice(1).map(player => ({
      playerId: player.sessionId,
      promise: gameHelper.waitForSSEEvent(player.sessionId, 'player_action'),
      startTime: Date.now(),
    }));

    await gameHelper.selectMissionTeam(1, [0, 1]);

    const results = await Promise.all(
      eventPromises.map(async ep => ({
        playerId: ep.playerId,
        event: await ep.promise,
        deliveryTime: Date.now() - ep.startTime,
      }))
    );

    results.forEach(result => {
      expect(result.deliveryTime).toBeLessThan(200);
    });
  });

  test('concurrent games do not interfere', async () => {
    const numGames = 10;
    const gameHelpers = await Promise.all(
      Array(numGames).fill(0).map(async () => {
        const helper = new GameFlowTestHelper();
        await helper.createTestRoom(5);
        return helper;
      })
    );

    // Start all games simultaneously
    await Promise.all(gameHelpers.map(helper => helper.startGame()));

    // Progress each game independently
    const gameProgresses = gameHelpers.map(async (helper, index) => {
      await helper.confirmAllPlayerRoles();
      await helper.selectMissionTeam(1, [0, 1]);
      await helper.voteOnTeam(['approve', 'approve', 'approve', 'reject', 'reject']);
      
      return {
        gameIndex: index,
        success: true,
      };
    });

    const results = await Promise.all(gameProgresses);

    // All games should complete successfully
    results.forEach(result => {
      expect(result.success).toBe(true);
    });

    // Cleanup
    await Promise.all(gameHelpers.map(helper => helper.cleanup()));
  });

  test('memory usage remains stable during long game sessions', async () => {
    const gameHelper = new GameFlowTestHelper();
    await gameHelper.createTestRoom(5);

    const initialMemory = await gameHelper.getMemoryUsage();

    // Play multiple complete games
    for (let i = 0; i < 5; i++) {
      await gameHelper.startGame();
      await gameHelper.playCompleteGame();
      await gameHelper.resetGame();
    }

    const finalMemory = await gameHelper.getMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be minimal (< 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB
  });

  test('database query performance under load', async () => {
    const gameHelper = new GameFlowTestHelper();
    const numQueries = 100;

    const queryPromises = Array(numQueries).fill(0).map(async () => {
      const startTime = Date.now();
      await gameHelper.createTestRoom(5);
      const queryTime = Date.now() - startTime;
      return queryTime;
    });

    const queryTimes = await Promise.all(queryPromises);
    const averageQueryTime = queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length;

    expect(averageQueryTime).toBeLessThan(100); // Average < 100ms
    expect(Math.max(...queryTimes)).toBeLessThan(300); // Max < 300ms
  });
});
```

## 3. Test Helper Implementation

### 3.1 Game Flow Test Helper
**File:** `/tests/helpers/game-flow-helper.ts`

```typescript
export class GameFlowTestHelper {
  private roomCode: string = '';
  private roomId: string = '';
  private players: Array<{ id: string; sessionId: string; name: string }> = [];
  private sseConnections: Map<string, EventSource> = new Map();

  async createTestRoom(playerCount: number): Promise<void> {
    // Create room
    const roomResponse = await fetch('/api/trpc/room.createRoom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hostName: 'Test Host',
        settings: { playerCount },
      }),
    });

    const roomData = await roomResponse.json();
    this.roomCode = roomData.roomCode;
    this.roomId = roomData.roomId;

    // Create and join players
    for (let i = 0; i < playerCount; i++) {
      const playerResponse = await fetch('/api/trpc/room.joinRoom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: this.roomCode,
          playerName: `Test Player ${i}`,
        }),
      });

      const playerData = await playerResponse.json();
      this.players.push({
        id: playerData.playerId,
        sessionId: playerData.sessionId,
        name: `Test Player ${i}`,
      });

      // Set up SSE connection for each player
      await this.setupSSEConnection(playerData.sessionId);
    }
  }

  async startGame(): Promise<void> {
    const response = await fetch('/api/trpc/room.startGame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: this.roomId,
        hostId: this.players[0].id,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to start game');
    }

    await this.expectPhase('roleReveal');
  }

  async confirmAllPlayerRoles(): Promise<void> {
    const confirmPromises = this.players.map(player =>
      this.confirmPlayerRole(player.sessionId)
    );

    await Promise.all(confirmPromises);
  }

  async confirmPlayerRoles(playerIndices: number[]): Promise<void> {
    const confirmPromises = playerIndices.map(index =>
      this.confirmPlayerRole(this.players[index].sessionId)
    );

    await Promise.all(confirmPromises);
  }

  async expectPhase(expectedPhase: string, options = { timeout: 5000 }): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < options.timeout) {
      const gameState = await this.getGameState();
      if (gameState.phase === expectedPhase) {
        return;
      }
      await this.sleep(100);
    }

    throw new Error(`Expected phase ${expectedPhase} but got ${await this.getCurrentPhase()}`);
  }

  async expectPhaseTransition(
    fromPhase: string,
    toPhase: string,
    options = { timeout: 5000 }
  ): Promise<void> {
    const eventPromises = this.players.map(player =>
      this.waitForSSEEvent(player.sessionId, 'phase_transition')
    );

    const events = await Promise.race([
      Promise.all(eventPromises),
      this.timeoutPromise(options.timeout),
    ]);

    if (!events) {
      throw new Error(`Phase transition timeout: ${fromPhase} -> ${toPhase}`);
    }

    events.forEach(event => {
      expect(event.data.fromPhase).toBe(fromPhase);
      expect(event.data.toPhase).toBe(toPhase);
    });
  }

  async selectMissionTeam(round: number, playerIndices: number[]): Promise<void> {
    const leader = this.getCurrentLeader();
    const teamMemberIds = playerIndices.map(index => this.players[index].id);

    const response = await fetch('/api/trpc/room.submitMissionTeam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: this.roomId,
        leaderId: leader.id,
        teamMembers: teamMemberIds,
        round,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to select mission team');
    }
  }

  async voteOnTeam(votes: Array<'approve' | 'reject'>): Promise<void> {
    const votePromises = this.players.map((player, index) =>
      fetch('/api/trpc/room.submitVote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: this.roomId,
          playerId: player.id,
          vote: votes[index],
          round: 1, // Current round
        }),
      })
    );

    const responses = await Promise.all(votePromises);
    responses.forEach(response => {
      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }
    });
  }

  async executeMission(votes: Array<'success' | 'failure'>): Promise<void> {
    // Get current mission team
    const gameState = await this.getGameState();
    const currentMission = gameState.missions[gameState.missions.length - 1];
    
    const votePromises = votes.map((vote, index) =>
      fetch('/api/trpc/room.submitMissionVote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: this.roomId,
          playerId: currentMission.teamMembers[index],
          vote,
          missionRound: gameState.round,
        }),
      })
    );

    const responses = await Promise.all(votePromises);
    responses.forEach(response => {
      if (!response.ok) {
        throw new Error('Failed to submit mission vote');
      }
    });
  }

  async waitForSSEEvent(
    sessionId: string,
    eventType: string,
    timeout = 5000
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const connection = this.sseConnections.get(sessionId);
      if (!connection) {
        reject(new Error(`No SSE connection for session ${sessionId}`));
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new Error(`SSE event timeout: ${eventType}`));
      }, timeout);

      const eventHandler = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === eventType) {
          clearTimeout(timeoutId);
          connection.removeEventListener('message', eventHandler);
          resolve({
            data: data.payload,
            timestamp: Date.now(),
          });
        }
      };

      connection.addEventListener('message', eventHandler);
    });
  }

  async getGameState(): Promise<any> {
    const response = await fetch(`/api/trpc/room.getRoomInfo?roomCode=${this.roomCode}`);
    const data = await response.json();
    return data.gameState;
  }

  async cleanup(): Promise<void> {
    // Close SSE connections
    this.sseConnections.forEach(connection => connection.close());
    this.sseConnections.clear();

    // Cleanup room (optional - depends on test isolation strategy)
    // await this.deleteTestRoom();
  }

  private async setupSSEConnection(sessionId: string): Promise<void> {
    const connection = new EventSource(`/api/sse?sessionId=${sessionId}`);
    this.sseConnections.set(sessionId, connection);

    return new Promise((resolve, reject) => {
      connection.onopen = () => resolve();
      connection.onerror = () => reject(new Error('SSE connection failed'));
    });
  }

  private getCurrentLeader(): { id: string; name: string } {
    const gameState = this.getGameState();
    return this.players[gameState.leaderIndex];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private timeoutPromise(ms: number): Promise<null> {
    return new Promise(resolve => setTimeout(() => resolve(null), ms));
  }

  // Additional helper methods...
}
```

## 4. Continuous Integration Setup

### 4.1 GitHub Actions Workflow
**File:** `.github/workflows/game-flow-tests.yml`

```yaml
name: Game Flow Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: avalon_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'yarn'
    
    - name: Install dependencies
      run: yarn install --frozen-lockfile
    
    - name: Setup test database
      run: |
        yarn prisma migrate deploy
        yarn prisma generate
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/avalon_test
    
    - name: Run integration tests
      run: yarn test:integration
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/avalon_test
        NODE_ENV: test
    
    - name: Run performance tests
      run: yarn test:performance
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/avalon_test
        NODE_ENV: test

  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'yarn'
    
    - name: Install dependencies
      run: yarn install --frozen-lockfile
    
    - name: Install Playwright browsers
      run: yarn playwright install --with-deps
    
    - name: Build application
      run: yarn build
    
    - name: Run E2E tests
      run: yarn test:e2e
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

### 4.2 Test Scripts Configuration
**File:** `package.json` (test scripts section)

```json
{
  "scripts": {
    "test:integration": "jest --config jest.integration.config.js",
    "test:performance": "jest --config jest.performance.config.js",
    "test:e2e": "playwright test",
    "test:game-flow": "yarn test:integration && yarn test:e2e",
    "test:load": "k6 run tests/load/game-flow-load.js"
  }
}
```

## 5. Success Metrics and Reporting

### 5.1 Performance Metrics

**Key Performance Indicators:**
- Phase transition time: <500ms average
- SSE event delivery: <200ms average
- Database query time: <100ms average
- Memory usage: <100MB per game session
- Error rate: <1% of all operations

### 5.2 Test Coverage Requirements

**Minimum Coverage Targets:**
- Integration test coverage: >90%
- Critical path coverage: 100%
- Error scenario coverage: >80%
- Performance test coverage: >95%

### 5.3 Test Reporting

**Automated Reports:**
- Test results dashboard
- Performance trend analysis
- Error rate monitoring
- Memory usage tracking
- SSE latency metrics

This comprehensive testing strategy ensures that the game flow implementation is robust, performant, and provides an excellent user experience while maintaining high code quality and reliability standards.
