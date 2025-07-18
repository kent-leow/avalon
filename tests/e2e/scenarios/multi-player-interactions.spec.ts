/**
 * Multi-Player Interactions Test Scenarios
 * 
 * Testing multi-player interactions and real-time synchronization
 */

import { test, expect } from '@playwright/test';
import { GameTestSuite } from '../GameTestSuite';
import { MultiPlayerTestRunner } from '../MultiPlayerTestRunner';

test.describe('Multi-Player Interactions', () => {
  let gameTestSuite: GameTestSuite;
  let multiPlayerRunner: MultiPlayerTestRunner;

  test.beforeEach(async ({ page }) => {
    gameTestSuite = new GameTestSuite(page);
    multiPlayerRunner = new MultiPlayerTestRunner(page);
    await gameTestSuite.initialize();
  });

  test('simultaneous player actions', async ({ page }) => {
    const config = {
      playerCount: 5,
      roleDistribution: {
        good: ['Merlin', 'Percival', 'Loyal Servant'],
        evil: ['Assassin', 'Morgana'],
        special: ['Merlin', 'Percival', 'Assassin', 'Morgana']
      },
      testActions: [
        { type: 'vote', player: 'all', target: 'mission-team' },
        { type: 'select_team', player: 'leader', target: 'players' },
        { type: 'mission_action', player: 'team', target: 'mission' }
      ],
      syncValidation: true
    };

    await multiPlayerRunner.runTest(config);
  });

  test('real-time synchronization', async ({ page }) => {
    // Create room and add players
    await gameTestSuite.createRoom('Sync Test');
    await gameTestSuite.addPlayers(6);
    await gameTestSuite.startGame();
    
    // Test synchronization during team selection
    await page.waitForSelector('[data-testid="team-selection"]');
    
    // Simulate leader selecting team
    const playerCards = await page.$$('[data-testid="player-card"]');
    await playerCards[0]?.click();
    await playerCards[1]?.click();
    await playerCards[2]?.click();
    
    // Verify team selection is synchronized
    const selectedCards = await page.$$('[data-testid="player-card"][data-selected="true"]');
    expect(selectedCards.length).toBe(3);
    
    // Confirm team
    await page.click('[data-testid="confirm-team-button"]');
    
    // Verify all players see the voting phase
    await expect(page.locator('[data-testid="voting-phase"]')).toBeVisible();
    
    // Test voting synchronization
    await page.click('[data-testid="vote-approve"]');
    
    // Verify vote is recorded
    await expect(page.locator('[data-testid="vote-status"]')).toContainText('1/6');
  });

  test('player disconnection handling', async ({ page }) => {
    // Create room and add players
    await gameTestSuite.createRoom('Disconnect Test');
    const players = await gameTestSuite.addPlayers(5);
    await gameTestSuite.startGame();
    
    // Start first mission
    await gameTestSuite.playMission(1);
    
    // Simulate player disconnection
    await page.evaluate(() => {
      // Simulate network disconnection
      window.dispatchEvent(new Event('offline'));
    });
    
    // Verify disconnection is handled
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('Disconnected');
    
    // Simulate reconnection
    await page.evaluate(() => {
      window.dispatchEvent(new Event('online'));
    });
    
    // Verify reconnection
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('Connected');
    
    // Verify game state is restored
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
  });

  test('host transfer functionality', async ({ page }) => {
    // Create room with host
    await gameTestSuite.createRoom('Host Transfer Test');
    const players = await gameTestSuite.addPlayers(5);
    
    // Verify initial host
    await expect(page.locator('[data-testid="host-indicator"]')).toContainText(players[0]?.name || 'Player1');
    
    // Transfer host to another player
    await page.click('[data-testid="transfer-host-button"]');
    await page.click(`[data-testid="player-${players[1]?.name || 'Player2'}"]`);
    await page.click('[data-testid="confirm-transfer"]');
    
    // Verify host transfer
    await expect(page.locator('[data-testid="host-indicator"]')).toContainText(players[1]?.name || 'Player2');
    
    // Verify new host can start game
    await expect(page.locator('[data-testid="start-game-button"]')).toBeEnabled();
  });

  test('chat and communication', async ({ page }) => {
    // Create room and add players
    await gameTestSuite.createRoom('Chat Test');
    await gameTestSuite.addPlayers(5);
    await gameTestSuite.startGame();
    
    // Test chat functionality
    await page.click('[data-testid="chat-toggle"]');
    await expect(page.locator('[data-testid="chat-panel"]')).toBeVisible();
    
    // Send message
    await page.fill('[data-testid="chat-input"]', 'Hello everyone!');
    await page.press('[data-testid="chat-input"]', 'Enter');
    
    // Verify message appears
    await expect(page.locator('[data-testid="chat-messages"]')).toContainText('Hello everyone!');
    
    // Test role-specific chat
    await page.click('[data-testid="evil-chat-tab"]');
    await page.fill('[data-testid="chat-input"]', 'Evil team strategy');
    await page.press('[data-testid="chat-input"]', 'Enter');
    
    // Verify evil chat message
    await expect(page.locator('[data-testid="evil-chat-messages"]')).toContainText('Evil team strategy');
  });

  test('voting synchronization', async ({ page }) => {
    // Create room and start game
    await gameTestSuite.createRoom('Voting Test');
    await gameTestSuite.addPlayers(5);
    await gameTestSuite.startGame();
    
    // Navigate to voting phase
    await page.waitForSelector('[data-testid="team-selection"]');
    
    // Select team
    const playerCards = await page.$$('[data-testid="player-card"]');
    await playerCards[0]?.click();
    await playerCards[1]?.click();
    await page.click('[data-testid="confirm-team-button"]');
    
    // Verify voting phase
    await expect(page.locator('[data-testid="voting-phase"]')).toBeVisible();
    
    // Cast vote
    await page.click('[data-testid="vote-approve"]');
    
    // Verify vote count updates
    await expect(page.locator('[data-testid="vote-count"]')).toContainText('1/5');
    
    // Simulate other players voting
    await page.evaluate(() => {
      // Simulate votes from other players
      window.dispatchEvent(new CustomEvent('vote-cast', { 
        detail: { playerId: 'player-2', vote: 'approve' } 
      }));
      window.dispatchEvent(new CustomEvent('vote-cast', { 
        detail: { playerId: 'player-3', vote: 'approve' } 
      }));
      window.dispatchEvent(new CustomEvent('vote-cast', { 
        detail: { playerId: 'player-4', vote: 'reject' } 
      }));
      window.dispatchEvent(new CustomEvent('vote-cast', { 
        detail: { playerId: 'player-5', vote: 'approve' } 
      }));
    });
    
    // Verify voting results
    await expect(page.locator('[data-testid="vote-result"]')).toContainText('Approved');
  });

  test('mission execution synchronization', async ({ page }) => {
    // Create room and start game
    await gameTestSuite.createRoom('Mission Sync Test');
    await gameTestSuite.addPlayers(5);
    await gameTestSuite.startGame();
    
    // Play through to mission phase
    await page.waitForSelector('[data-testid="team-selection"]');
    
    // Select team and vote
    const playerCards = await page.$$('[data-testid="player-card"]');
    await playerCards[0]?.click();
    await playerCards[1]?.click();
    await page.click('[data-testid="confirm-team-button"]');
    
    await page.waitForSelector('[data-testid="voting-phase"]');
    await page.click('[data-testid="vote-approve"]');
    
    // Wait for mission phase
    await page.waitForSelector('[data-testid="mission-phase"]');
    
    // Submit mission action
    await page.click('[data-testid="mission-success"]');
    
    // Verify mission progress
    await expect(page.locator('[data-testid="mission-progress"]')).toContainText('Waiting for');
    
    // Simulate second player action
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('mission-action', { 
        detail: { playerId: 'player-2', action: 'success' } 
      }));
    });
    
    // Verify mission completion
    await expect(page.locator('[data-testid="mission-result"]')).toContainText('Success');
  });

  test('game state consistency', async ({ page }) => {
    // Create room and start game
    await gameTestSuite.createRoom('State Consistency Test');
    await gameTestSuite.addPlayers(6);
    await gameTestSuite.startGame();
    
    // Verify initial state
    const initialState = await page.evaluate(() => {
      return {
        phase: document.querySelector('[data-testid="game-phase"]')?.textContent,
        mission: document.querySelector('[data-testid="current-mission"]')?.textContent,
        players: document.querySelectorAll('[data-testid^="player-"]').length
      };
    });
    
    expect(initialState.phase).toBe('role-reveal');
    expect(initialState.mission).toBe('0');
    expect(initialState.players).toBe(6);
    
    // Progress through game phases
    await page.waitForSelector('[data-testid="team-selection"]');
    
    // Verify state after phase change
    const teamSelectionState = await page.evaluate(() => {
      return {
        phase: document.querySelector('[data-testid="game-phase"]')?.textContent,
        mission: document.querySelector('[data-testid="current-mission"]')?.textContent,
        leader: document.querySelector('[data-testid="mission-leader"]')?.textContent
      };
    });
    
    expect(teamSelectionState.phase).toBe('team-selection');
    expect(teamSelectionState.mission).toBe('1');
    expect(teamSelectionState.leader).toBeTruthy();
  });

  test('performance under load', async ({ page }) => {
    // Create room with maximum players
    await gameTestSuite.createRoom('Performance Test');
    await gameTestSuite.addPlayers(10);
    
    // Measure initial load time
    const startTime = Date.now();
    await gameTestSuite.startGame();
    const loadTime = Date.now() - startTime;
    
    // Verify performance threshold
    expect(loadTime).toBeLessThan(5000); // 5 seconds
    
    // Measure game progression performance
    const missionStartTime = Date.now();
    await gameTestSuite.playMission(1);
    const missionTime = Date.now() - missionStartTime;
    
    // Verify mission performance
    expect(missionTime).toBeLessThan(10000); // 10 seconds
    
    // Check memory usage
    const memoryUsage = await page.evaluate(() => {
      return (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize
      } : null;
    });
    
    if (memoryUsage) {
      expect(memoryUsage.used).toBeLessThan(50 * 1024 * 1024); // 50MB
    }
  });

  test('error recovery and resilience', async ({ page }) => {
    // Create room and start game
    await gameTestSuite.createRoom('Error Recovery Test');
    await gameTestSuite.addPlayers(5);
    await gameTestSuite.startGame();
    
    // Simulate network error during game
    await page.evaluate(() => {
      // Simulate API error
      window.fetch = () => Promise.reject(new Error('Network error'));
    });
    
    // Attempt to progress game
    await page.click('[data-testid="next-phase-button"]');
    
    // Verify error handling
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Network error');
    
    // Restore network
    await page.reload();
    
    // Verify game state recovery
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
  });
});
