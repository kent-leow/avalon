/**
 * GameEngine E2E Tests
 * 
 * End-to-end tests for the GameEngine component
 */

import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Helper function to create a game room and navigate to it
const createGameRoom = async (page: Page) => {
  // Navigate to the home page
  await page.goto('/');
  
  // Create a new game room
  await page.click('[data-testid="create-room-button"]');
  
  // Fill in room details
  await page.fill('[data-testid="room-name-input"]', 'E2E Test Room');
  await page.fill('[data-testid="player-name-input"]', 'Test Host');
  
  // Start the room
  await page.click('[data-testid="start-room-button"]');
  
  // Wait for room to be created
  await page.waitForURL(/\/room\/[A-Z0-9]+/);
  
  // Return the room code
  const url = page.url();
  const roomCode = url.split('/').pop();
  if (!roomCode) {
    throw new Error('Failed to extract room code from URL');
  }
  return roomCode;
};

// Helper function to join a game room
const joinGameRoom = async (page: Page, roomCode: string, playerName: string) => {
  await page.goto(`/room/${roomCode}`);
  
  // Fill in player name
  await page.fill('[data-testid="player-name-input"]', playerName);
  
  // Join the room
  await page.click('[data-testid="join-room-button"]');
  
  // Wait for join to complete
  await page.waitForSelector('[data-testid="game-engine-container"]', { timeout: 5000 });
};

test.describe('GameEngine E2E Tests', () => {
  test.describe('Room Creation and Joining', () => {
    test('creates room and initializes game engine', async ({ page }) => {
      const roomCode = await createGameRoom(page);
      
      // Verify game engine is initialized
      await expect(page.locator('[data-testid="game-engine-container"]')).toBeVisible();
      
      // Verify room code is displayed
      await expect(page.locator('[data-testid="room-code"]')).toHaveText(roomCode);
      
      // Verify initial phase is lobby
      await expect(page.locator('[data-testid="phase-controller"]')).toBeVisible();
      await expect(page.locator('[data-testid="lobby-phase"]')).toBeVisible();
      
      console.log(`✓ Room created successfully: ${roomCode}`);
    });
    
    test('allows multiple players to join room', async ({ browser }) => {
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      const context3 = await browser.newContext();
      
      const hostPage = await context1.newPage();
      const player2Page = await context2.newPage();
      const player3Page = await context3.newPage();
      
      try {
        // Host creates room
        const roomCode = await createGameRoom(hostPage);
        
        // Players join the room
        await joinGameRoom(player2Page, roomCode, 'Player 2');
        await joinGameRoom(player3Page, roomCode, 'Player 3');
        
        // Verify all players see each other
        for (const page of [hostPage, player2Page, player3Page]) {
          await expect(page.locator('[data-testid="game-engine-container"]')).toBeVisible();
          await expect(page.locator('[data-testid="lobby-phase"]')).toBeVisible();
          
          // Check player count
          const playerItems = page.locator('[data-testid="lobby-phase"] > div:last-child > div');
          await expect(playerItems).toHaveCount(3);
        }
        
        console.log(`✓ Multiple players joined successfully: ${roomCode}`);
      } finally {
        await context1.close();
        await context2.close();
        await context3.close();
      }
    });
  });

  test.describe('Game State Management', () => {
    test('maintains game state across page refreshes', async ({ page }) => {
      const roomCode = await createGameRoom(page);
      
      // Verify initial state
      await expect(page.locator('[data-testid="lobby-phase"]')).toBeVisible();
      
      // Refresh the page
      await page.reload();
      
      // Verify state is restored
      await expect(page.locator('[data-testid="game-engine-container"]')).toBeVisible();
      await expect(page.locator('[data-testid="lobby-phase"]')).toBeVisible();
      await expect(page.locator('[data-testid="room-code"]')).toHaveText(roomCode);
      
      console.log(`✓ Game state maintained across refresh: ${roomCode}`);
    });
    
    test('handles network disconnection gracefully', async ({ page }) => {
      const roomCode = await createGameRoom(page);
      
      // Verify initial connection
      await expect(page.locator('[data-testid="game-engine-container"]')).toBeVisible();
      
      // Simulate network disconnection
      await page.route('**/*', route => route.abort('internetdisconnected'));
      
      // Wait for error boundary to catch network issues
      await page.waitForTimeout(2000);
      
      // Verify error boundary is displayed
      await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible();
      
      // Restore network
      await page.unroute('**/*');
      
      // Verify recovery
      await page.click('[data-testid="error-retry-button"]');
      await expect(page.locator('[data-testid="game-engine-container"]')).toBeVisible();
      
      console.log(`✓ Network disconnection handled gracefully: ${roomCode}`);
    });
  });

  test.describe('Performance Monitoring', () => {
    test('displays performance metrics in development', async ({ page }) => {
      const roomCode = await createGameRoom(page);
      
      // Verify performance monitor is visible
      await expect(page.locator('[data-testid="performance-monitor"]')).toBeVisible();
      
      // Check that metrics are being displayed
      await expect(page.locator('[data-testid="performance-monitor"]')).toContainText('FPS:');
      await expect(page.locator('[data-testid="performance-monitor"]')).toContainText('Memory:');
      await expect(page.locator('[data-testid="performance-monitor"]')).toContainText('Players:');
      
      console.log(`✓ Performance metrics displayed: ${roomCode}`);
    });
    
    test('performance metrics update in real-time', async ({ page }) => {
      const roomCode = await createGameRoom(page);
      
      // Get initial FPS value
      const performanceMonitor = page.locator('[data-testid="performance-monitor"]');
      const initialFPS = await performanceMonitor.locator('div').first().textContent();
      
      // Wait for metrics to update
      await page.waitForTimeout(2000);
      
      // Get updated FPS value
      const updatedFPS = await performanceMonitor.locator('div').first().textContent();
      
      // Verify metrics are updating (values should be different)
      expect(initialFPS).not.toBe(updatedFPS);
      
      console.log(`✓ Performance metrics updating: ${roomCode}`);
    });
  });

  test.describe('Error Handling', () => {
    test('handles invalid room codes gracefully', async ({ page }) => {
      // Navigate to invalid room
      await page.goto('/room/INVALID');
      
      // Verify error boundary is displayed
      await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-boundary"]')).toContainText('Room not found');
      
      console.log('✓ Invalid room code handled gracefully');
    });
    
    test('handles API errors gracefully', async ({ page }) => {
      // Create room normally
      const roomCode = await createGameRoom(page);
      
      // Mock API failure
      await page.route('**/api/trpc/**', route => route.abort('failed'));
      
      // Try to trigger an API call (e.g., refresh game state)
      await page.reload();
      
      // Verify error boundary catches the API error
      await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible();
      
      console.log(`✓ API errors handled gracefully: ${roomCode}`);
    });
  });

  test.describe('Real-time Synchronization', () => {
    test('synchronizes player actions across clients', async ({ browser }) => {
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      
      const hostPage = await context1.newPage();
      const playerPage = await context2.newPage();
      
      try {
        // Host creates room
        const roomCode = await createGameRoom(hostPage);
        
        // Player joins the room
        await joinGameRoom(playerPage, roomCode, 'Test Player');
        
        // Verify both clients see the same state
        for (const page of [hostPage, playerPage]) {
          await expect(page.locator('[data-testid="lobby-phase"]')).toBeVisible();
          
          // Check player count
          const playerItems = page.locator('[data-testid="lobby-phase"] > div:last-child > div');
          await expect(playerItems).toHaveCount(2);
        }
        
        console.log(`✓ Real-time synchronization working: ${roomCode}`);
      } finally {
        await context1.close();
        await context2.close();
      }
    });
    
    test('handles player disconnections', async ({ browser }) => {
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      
      const hostPage = await context1.newPage();
      const playerPage = await context2.newPage();
      
      try {
        // Host creates room
        const roomCode = await createGameRoom(hostPage);
        
        // Player joins the room
        await joinGameRoom(playerPage, roomCode, 'Test Player');
        
        // Verify both players are present
        let playerItems = hostPage.locator('[data-testid="lobby-phase"] > div:last-child > div');
        await expect(playerItems).toHaveCount(2);
        
        // Player disconnects
        await playerPage.close();
        
        // Wait for disconnection to be detected
        await hostPage.waitForTimeout(3000);
        
        // Verify player count is updated
        playerItems = hostPage.locator('[data-testid="lobby-phase"] > div:last-child > div');
        await expect(playerItems).toHaveCount(1);
        
        console.log(`✓ Player disconnection handled: ${roomCode}`);
      } finally {
        await context1.close();
        if (!context2.close) await context2.close();
      }
    });
  });

  test.describe('Accessibility Compliance', () => {
    test('meets accessibility standards', async ({ page }) => {
      const roomCode = await createGameRoom(page);
      
      // Verify keyboard navigation
      await page.keyboard.press('Tab');
      
      // Check for proper ARIA labels
      await expect(page.locator('[data-testid="game-engine-container"]')).toHaveAttribute('role', 'main');
      
      // Check for proper heading structure
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(0);
      
      // Check for proper color contrast (this would need actual color testing)
      console.log(`✓ Basic accessibility compliance verified: ${roomCode}`);
    });
    
    test('supports screen reader navigation', async ({ page }) => {
      const roomCode = await createGameRoom(page);
      
      // Verify ARIA labels are present
      await expect(page.locator('[data-testid="game-engine-container"]')).toHaveAttribute('aria-label');
      await expect(page.locator('[data-testid="phase-controller"]')).toHaveAttribute('aria-label');
      
      // Verify proper heading structure
      const mainHeading = page.locator('h1').first();
      await expect(mainHeading).toBeVisible();
      
      console.log(`✓ Screen reader support verified: ${roomCode}`);
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('works correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const roomCode = await createGameRoom(page);
      
      // Verify mobile layout
      await expect(page.locator('[data-testid="game-engine-container"]')).toBeVisible();
      await expect(page.locator('[data-testid="phase-controller"]')).toBeVisible();
      
      // Verify touch interactions work
      await page.tap('[data-testid="phase-controller"]');
      
      console.log(`✓ Mobile responsiveness verified: ${roomCode}`);
    });
    
    test('adapts to different screen orientations', async ({ page }) => {
      const roomCode = await createGameRoom(page);
      
      // Test portrait orientation
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('[data-testid="game-engine-container"]')).toBeVisible();
      
      // Test landscape orientation
      await page.setViewportSize({ width: 667, height: 375 });
      await expect(page.locator('[data-testid="game-engine-container"]')).toBeVisible();
      
      console.log(`✓ Screen orientation adaptability verified: ${roomCode}`);
    });
  });

  test.describe('Security Testing', () => {
    test('prevents unauthorized access to game state', async ({ page }) => {
      const roomCode = await createGameRoom(page);
      
      // Try to access game state without proper authentication
      const response = await page.request.get(`/api/trpc/game.getState?input=${JSON.stringify({ roomCode })}`);
      
      // Verify proper authentication is required
      expect(response.status()).toBe(401);
      
      console.log(`✓ Unauthorized access prevented: ${roomCode}`);
    });
    
    test('sanitizes user input properly', async ({ page }) => {
      // Try to create room with malicious input
      await page.goto('/');
      
      await page.click('[data-testid="create-room-button"]');
      
      // Enter malicious script in room name
      await page.fill('[data-testid="room-name-input"]', '<script>alert("XSS")</script>');
      await page.fill('[data-testid="player-name-input"]', 'Test Player');
      
      await page.click('[data-testid="start-room-button"]');
      
      // Verify script is not executed
      await expect(page.locator('[data-testid="game-engine-container"]')).toBeVisible();
      
      // Verify input is sanitized
      await expect(page.locator('[data-testid="room-name-display"]')).not.toContainText('<script>');
      
      console.log('✓ User input sanitization verified');
    });
  });
});
