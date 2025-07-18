/**
 * Error Handling E2E Test Scenario
 * 
 * Tests error handling and recovery in the game
 */

import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { TestAssertions } from '../utils/assertions';
import { TestDataGenerator } from '../TestDataGenerator';
import { TestResultsManager } from '../utils/test-reporting';

const helpers = new TestHelpers();
const assertions = new TestAssertions();
const dataGenerator = new TestDataGenerator();
const resultsManager = TestResultsManager.getInstance();

test.describe('Error Handling and Recovery', () => {
  test.beforeEach(async ({ page }) => {
    await helpers.setupTestEnvironment(page);
  });

  test.afterEach(async ({ page }) => {
    await helpers.cleanupTestEnvironment(page);
  });

  test('should handle network disconnection gracefully', async ({ page }) => {
    const testId = 'error-handling-network-disconnection';
    const startTime = Date.now();

    try {
      // Create room and add players
      const roomData = dataGenerator.generateRoomData();
      await helpers.createRoom(page, roomData);
      
      const players = dataGenerator.generatePlayers(5);
      for (const player of players) {
        await helpers.addPlayerToRoom(page, player);
      }

      // Start game
      await helpers.startGame(page);
      
      // Wait for game to be in progress
      await helpers.waitForGamePhase(page, 'team-selection');

      // Simulate network disconnection
      await page.context().setOffline(true);

      // Verify error handling
      await assertions.assertErrorMessageDisplayed(page, 'Connection lost');
      await assertions.assertReconnectOptionAvailable(page);

      // Restore connection
      await page.context().setOffline(false);

      // Verify reconnection
      await assertions.assertGameStateRecovered(page);
      await assertions.assertPlayerCanContinueGame(page);

      const duration = Date.now() - startTime;
      resultsManager.addResult({
        testId,
        scenarioId: 'error-handling',
        status: 'passed',
        duration,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString()
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      resultsManager.addResult({
        testId,
        scenarioId: 'error-handling',
        status: 'failed',
        duration,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString(),
        error: error as Error
      });
      throw error;
    }
  });

  test('should handle server errors gracefully', async ({ page }) => {
    const testId = 'error-handling-server-error';
    const startTime = Date.now();

    try {
      // Create room
      const roomData = dataGenerator.generateRoomData();
      await helpers.createRoom(page, roomData);

      // Simulate server error by intercepting API calls
      await page.route('**/api/game/**', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });

      // Try to start game
      await helpers.attemptGameStart(page);

      // Verify error handling
      await assertions.assertErrorMessageDisplayed(page, 'Server error');
      await assertions.assertRetryOptionAvailable(page);

      // Remove error simulation
      await page.unroute('**/api/game/**');

      // Retry operation
      await helpers.retryGameStart(page);

      // Verify successful recovery
      await assertions.assertGameStarted(page);

      const duration = Date.now() - startTime;
      resultsManager.addResult({
        testId,
        scenarioId: 'error-handling',
        status: 'passed',
        duration,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString()
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      resultsManager.addResult({
        testId,
        scenarioId: 'error-handling',
        status: 'failed',
        duration,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString(),
        error: error as Error
      });
      throw error;
    }
  });

  test('should handle invalid game state gracefully', async ({ page }) => {
    const testId = 'error-handling-invalid-state';
    const startTime = Date.now();

    try {
      // Create room and start game
      const roomData = dataGenerator.generateRoomData();
      await helpers.createRoom(page, roomData);
      
      const players = dataGenerator.generatePlayers(5);
      for (const player of players) {
        await helpers.addPlayerToRoom(page, player);
      }

      await helpers.startGame(page);

      // Simulate invalid state by manipulating local storage
      await page.evaluate(() => {
        localStorage.setItem('gameState', JSON.stringify({ invalid: 'state' }));
      });

      // Refresh page to trigger state validation
      await page.reload();

      // Verify error handling
      await assertions.assertStateValidationError(page);
      await assertions.assertStateRecoveryInitiated(page);

      // Verify game state is recovered
      await assertions.assertGameStateValid(page);

      const duration = Date.now() - startTime;
      resultsManager.addResult({
        testId,
        scenarioId: 'error-handling',
        status: 'passed',
        duration,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString()
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      resultsManager.addResult({
        testId,
        scenarioId: 'error-handling',
        status: 'failed',
        duration,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString(),
        error: error as Error
      });
      throw error;
    }
  });

  test('should handle player disconnection during game', async ({ page }) => {
    const testId = 'error-handling-player-disconnection';
    const startTime = Date.now();

    try {
      // Create room and add players
      const roomData = dataGenerator.generateRoomData();
      await helpers.createRoom(page, roomData);
      
      const players = dataGenerator.generatePlayers(5);
      for (const player of players) {
        await helpers.addPlayerToRoom(page, player);
      }

      // Start game
      await helpers.startGame(page);
      
      // Wait for team selection phase
      await helpers.waitForGamePhase(page, 'team-selection');

      // Simulate player disconnection
      await helpers.simulatePlayerDisconnection(page, players[1].id);

      // Verify disconnection handling
      await assertions.assertPlayerMarkedAsDisconnected(page, players[1].id);
      await assertions.assertGameContinues(page);

      // Simulate player reconnection
      await helpers.simulatePlayerReconnection(page, players[1].id);

      // Verify reconnection handling
      await assertions.assertPlayerMarkedAsConnected(page, players[1].id);
      await assertions.assertPlayerCanParticipate(page, players[1].id);

      const duration = Date.now() - startTime;
      resultsManager.addResult({
        testId,
        scenarioId: 'error-handling',
        status: 'passed',
        duration,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString()
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      resultsManager.addResult({
        testId,
        scenarioId: 'error-handling',
        status: 'failed',
        duration,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString(),
        error: error as Error
      });
      throw error;
    }
  });

  test('should handle timeout scenarios gracefully', async ({ page }) => {
    const testId = 'error-handling-timeout';
    const startTime = Date.now();

    try {
      // Create room with short timeout
      const roomData = dataGenerator.generateRoomData({
        settings: { timeLimit: 5000 } // 5 second timeout
      });
      await helpers.createRoom(page, roomData);
      
      const players = dataGenerator.generatePlayers(5);
      for (const player of players) {
        await helpers.addPlayerToRoom(page, player);
      }

      // Start game
      await helpers.startGame(page);
      
      // Wait for team selection phase
      await helpers.waitForGamePhase(page, 'team-selection');

      // Wait for timeout to occur
      await page.waitForTimeout(6000);

      // Verify timeout handling
      await assertions.assertTimeoutOccurred(page);
      await assertions.assertAutoActionTaken(page);

      // Verify game continues
      await assertions.assertGameProgresses(page);

      const duration = Date.now() - startTime;
      resultsManager.addResult({
        testId,
        scenarioId: 'error-handling',
        status: 'passed',
        duration,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString()
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      resultsManager.addResult({
        testId,
        scenarioId: 'error-handling',
        status: 'failed',
        duration,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString(),
        error: error as Error
      });
      throw error;
    }
  });

  test('should handle concurrent user actions gracefully', async ({ page }) => {
    const testId = 'error-handling-concurrent-actions';
    const startTime = Date.now();

    try {
      // Create room and add players
      const roomData = dataGenerator.generateRoomData();
      await helpers.createRoom(page, roomData);
      
      const players = dataGenerator.generatePlayers(5);
      for (const player of players) {
        await helpers.addPlayerToRoom(page, player);
      }

      // Start game
      await helpers.startGame(page);
      
      // Wait for voting phase
      await helpers.waitForGamePhase(page, 'voting');

      // Simulate concurrent voting actions
      const votePromises = players.map(player => 
        helpers.simulatePlayerVote(page, player.id, 'approve')
      );

      // Wait for all votes to be processed
      await Promise.all(votePromises);

      // Verify all votes were handled correctly
      await assertions.assertAllVotesRecorded(page);
      await assertions.assertNoVotingConflicts(page);

      // Verify game continues normally
      await assertions.assertGameProgresses(page);

      const duration = Date.now() - startTime;
      resultsManager.addResult({
        testId,
        scenarioId: 'error-handling',
        status: 'passed',
        duration,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString()
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      resultsManager.addResult({
        testId,
        scenarioId: 'error-handling',
        status: 'failed',
        duration,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString(),
        error: error as Error
      });
      throw error;
    }
  });
});
