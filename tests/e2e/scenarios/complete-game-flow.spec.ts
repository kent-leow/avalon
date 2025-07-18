/**
 * Complete Game Flow Test Scenarios
 * 
 * End-to-end testing of complete game flows from start to finish
 */

import { test, expect } from '@playwright/test';
import { GameTestSuite } from '../GameTestSuite';
import { TestDataGenerator } from '../TestDataGenerator';

test.describe('Complete Game Flow', () => {
  let gameTestSuite: GameTestSuite;
  let testDataGenerator: TestDataGenerator;

  test.beforeEach(async ({ page }) => {
    gameTestSuite = new GameTestSuite(page);
    testDataGenerator = new TestDataGenerator();
    await gameTestSuite.initialize();
  });

  test.afterEach(async ({ page }) => {
    // Clean up after each test
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test('5-player standard game flow', async ({ page }) => {
    const scenario = {
      id: 'standard-5-player',
      name: '5-Player Standard Game',
      description: 'Complete 5-player game with standard roles',
      priority: 'high' as const,
      category: 'core' as const,
      players: 5,
      roles: ['Merlin', 'Percival', 'Loyal Servant', 'Assassin', 'Morgana'],
      missions: [2, 3, 2, 3, 3],
      expectedDuration: '15-20 minutes',
      steps: [],
      validation: [
        {
          type: 'element' as const,
          selector: '[data-testid="game-board"]',
          expected: true,
          comparison: 'exists' as const
        }
      ]
    };

    await gameTestSuite.runCompleteGameFlow(scenario);
  });

  test('10-player large game flow', async ({ page }) => {
    const scenario = {
      id: 'large-10-player',
      name: '10-Player Large Game',
      description: 'Complete 10-player game with all roles',
      priority: 'high' as const,
      category: 'core' as const,
      players: 10,
      roles: ['Merlin', 'Percival', 'Loyal Servant', 'Loyal Servant', 'Loyal Servant', 'Loyal Servant', 'Assassin', 'Morgana', 'Mordred', 'Oberon'],
      missions: [3, 4, 4, 5, 5],
      expectedDuration: '25-30 minutes',
      steps: [],
      validation: [
        {
          type: 'element' as const,
          selector: '[data-testid="player-card"]',
          expected: 10,
          comparison: 'equals' as const
        }
      ]
    };

    await gameTestSuite.runCompleteGameFlow(scenario);
  });

  test('quick game flow for performance', async ({ page }) => {
    const scenario = {
      id: 'quick-game',
      name: 'Quick Game Flow',
      description: 'Fast-paced game for performance testing',
      priority: 'medium' as const,
      category: 'performance' as const,
      players: 5,
      roles: ['Merlin', 'Percival', 'Loyal Servant', 'Assassin', 'Morgana'],
      missions: [2, 3, 2, 3, 3],
      expectedDuration: '5-10 minutes',
      steps: [],
      validation: [
        {
          type: 'performance' as const,
          expected: 5000,
          comparison: 'less' as const
        }
      ]
    };

    await gameTestSuite.runCompleteGameFlow(scenario);
  });

  test('game with role reveal verification', async ({ page }) => {
    // Create room
    const roomId = await gameTestSuite.createRoom('Role Reveal Test');
    
    // Add players
    const players = await gameTestSuite.addPlayers(5);
    expect(players).toHaveLength(5);
    
    // Start game
    await gameTestSuite.startGame();
    
    // Verify role distribution
    await gameTestSuite.verifyRoleDistribution();
    
    // Verify role card is displayed
    await expect(page.locator('[data-testid="role-card"]')).toBeVisible();
    
    // Verify player names are displayed
    for (const player of players) {
      await expect(page.locator(`[data-testid="player-${player.name}"]`)).toBeVisible();
    }
  });

  test('complete mission flow verification', async ({ page }) => {
    // Create and start game
    await gameTestSuite.createRoom('Mission Test');
    await gameTestSuite.addPlayers(5);
    await gameTestSuite.startGame();
    await gameTestSuite.verifyRoleDistribution();
    
    // Play first mission
    const missionResult = await gameTestSuite.playMission(1);
    expect(missionResult.missionNumber).toBe(1);
    expect(missionResult.team).toHaveLength(2); // First mission has 2 players
    expect(['success', 'failure']).toContain(missionResult.result);
    
    // Verify mission result is displayed
    await expect(page.locator('[data-testid="mission-result"]')).toBeVisible();
    
    // Verify mission progress is updated
    await expect(page.locator('[data-testid="mission-progress"]')).toContainText('1');
  });

  test('game completion verification', async ({ page }) => {
    // Create and start game
    await gameTestSuite.createRoom('Completion Test');
    await gameTestSuite.addPlayers(5);
    await gameTestSuite.startGame();
    await gameTestSuite.verifyRoleDistribution();
    
    // Play through all missions (or until game ends)
    for (let mission = 1; mission <= 5; mission++) {
      await gameTestSuite.playMission(mission);
      
      // Check if game ended early
      const gameEnded = await page.locator('[data-testid="game-results"]').isVisible();
      if (gameEnded) {
        break;
      }
    }
    
    // Verify game completion
    const gameResult = await gameTestSuite.verifyGameCompletion();
    expect(['good', 'evil']).toContain(gameResult.winner);
    expect(gameResult.winCondition).toBeTruthy();
    expect(gameResult.duration).toBeGreaterThan(0);
  });

  test('error handling during game flow', async ({ page }) => {
    // Create room
    await gameTestSuite.createRoom('Error Test');
    
    // Test with insufficient players
    await gameTestSuite.addPlayers(3); // Less than minimum
    
    // Verify start game is disabled or shows error
    const startButton = page.locator('[data-testid="start-game-button"]');
    await expect(startButton).toBeDisabled();
    
    // Add enough players
    await gameTestSuite.addPlayers(2); // Total 5 players
    
    // Now start game should work
    await expect(startButton).toBeEnabled();
    await gameTestSuite.startGame();
    
    // Verify error recovery
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
  });

  test('responsive design during game flow', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Run complete game flow
    const scenario = {
      id: 'mobile-game',
      name: 'Mobile Game Flow',
      description: 'Complete game flow on mobile viewport',
      priority: 'high' as const,
      category: 'core' as const,
      players: 5,
      roles: ['Merlin', 'Percival', 'Loyal Servant', 'Assassin', 'Morgana'],
      missions: [2, 3, 2, 3, 3],
      expectedDuration: '15-20 minutes',
      steps: [],
      validation: [
        {
          type: 'element' as const,
          selector: '[data-testid="game-board"]',
          expected: true,
          comparison: 'visible' as const
        }
      ]
    };

    await gameTestSuite.runCompleteGameFlow(scenario);
    
    // Verify mobile-specific elements
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    await expect(page.locator('[data-testid="touch-controls"]')).toBeVisible();
  });

  test('game state persistence', async ({ page }) => {
    // Create and start game
    await gameTestSuite.createRoom('Persistence Test');
    await gameTestSuite.addPlayers(5);
    await gameTestSuite.startGame();
    
    // Play first mission
    await gameTestSuite.playMission(1);
    
    // Refresh page
    await page.reload();
    
    // Verify game state is restored
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
    await expect(page.locator('[data-testid="mission-progress"]')).toContainText('1');
  });

  test('concurrent player actions', async ({ page }) => {
    // Create and start game
    await gameTestSuite.createRoom('Concurrent Test');
    await gameTestSuite.addPlayers(5);
    await gameTestSuite.startGame();
    await gameTestSuite.verifyRoleDistribution();
    
    // Start mission 1
    await page.waitForSelector('[data-testid="team-selection"]');
    
    // Simulate concurrent team selection
    const playerCards = await page.$$('[data-testid="player-card"]');
    
    // Select team members simultaneously
    await Promise.all([
      playerCards[0]?.click(),
      playerCards[1]?.click()
    ]);
    
    // Verify team selection
    const selectedCards = await page.$$('[data-testid="player-card"][data-selected="true"]');
    expect(selectedCards.length).toBe(2);
    
    // Confirm team
    await page.click('[data-testid="confirm-team-button"]');
    
    // Verify voting phase
    await expect(page.locator('[data-testid="voting-phase"]')).toBeVisible();
  });

  test('game analytics and metrics', async ({ page }) => {
    // Create and start game
    await gameTestSuite.createRoom('Analytics Test');
    await gameTestSuite.addPlayers(5);
    await gameTestSuite.startGame();
    
    // Generate test report
    const report = await gameTestSuite.generateTestReport();
    const reportData = JSON.parse(report);
    
    // Verify report structure
    expect(reportData.testSuite).toBe('Game Test Suite');
    expect(reportData.timestamp).toBeTruthy();
    expect(reportData.environment).toBeTruthy();
    expect(reportData.gameState).toBeTruthy();
    expect(reportData.results).toBeTruthy();
  });
});
