import { test, expect } from '@playwright/test';

test.describe('Global Session Expiration Detection', () => {
  test('should detect expired session and redirect to home page from any page', async ({ page }) => {
    // Step 1: Create a room and join it
    await page.goto('/');
    await page.click('text=Create Room');
    await page.fill('input[name="playerName"]', 'TestHost');
    await page.click('button[type="submit"]');
    
    // Wait for lobby to load
    await page.waitForURL('**/lobby');
    const url = page.url();
    const roomCode = url.split('/')[4];
    
    // Verify we're in the lobby
    await expect(page.locator('text=Room Lobby')).toBeVisible();
    await expect(page.locator(`text=${roomCode}`)).toBeVisible();
    
    // Step 2: Simulate session expiration by manipulating localStorage
    await page.evaluate(() => {
      // Create an expired session in localStorage
      const expiredSession = {
        roomCode: 'EXPIRED',
        name: 'TestHost',
        isHost: true,
        createdAt: Date.now() - 1000000, // Very old timestamp
        expiresAt: Date.now() - 10000 // Expired 10 seconds ago
      };
      localStorage.setItem('avalon-session', JSON.stringify(expiredSession));
    });
    
    // Step 3: Navigate to any page to trigger the global session check
    await page.goto('/create-room');
    
    // Step 4: Verify redirect to home page happens
    await page.waitForURL('/', { timeout: 35000 }); // Wait up to 35s for redirect
    await expect(page.locator('text=Join Game')).toBeVisible();
    
    // Step 5: Verify session was cleared
    const sessionAfterExpiration = await page.evaluate(() => {
      return localStorage.getItem('avalon-session');
    });
    expect(sessionAfterExpiration).toBeNull();
  });
  
  test('should handle room not found and redirect to home page', async ({ page }) => {
    // Step 1: Create a fake session for non-existent room
    await page.goto('/');
    
    await page.evaluate(() => {
      const fakeSession = {
        roomCode: 'FAKE123',
        name: 'TestPlayer',
        isHost: false,
        createdAt: Date.now(),
        expiresAt: Date.now() + 3600000 // 1 hour from now
      };
      localStorage.setItem('avalon-session', JSON.stringify(fakeSession));
    });
    
    // Step 2: Navigate to join page which will trigger global session check
    await page.goto('/join');
    
    // Step 3: Verify redirect to home page happens within 35 seconds
    await page.waitForURL('/', { timeout: 35000 });
    await expect(page.locator('text=Join Game')).toBeVisible();
    
    // Step 4: Verify session was cleared
    const sessionAfterCheck = await page.evaluate(() => {
      return localStorage.getItem('avalon-session');
    });
    expect(sessionAfterCheck).toBeNull();
  });
  
  test('should not redirect if session is valid', async ({ page }) => {
    // Step 1: Create a valid room and session
    await page.goto('/');
    await page.click('text=Create Room');
    await page.fill('input[name="playerName"]', 'ValidHost');
    await page.click('button[type="submit"]');
    
    // Wait for lobby
    await page.waitForURL('**/lobby');
    
    // Step 2: Navigate to different pages and verify no redirect
    await page.goto('/create-room');
    await page.waitForTimeout(5000); // Wait 5 seconds
    
    // Should still be on create-room page
    await expect(page.locator('text=Create Room')).toBeVisible();
    
    // Step 3: Navigate to join page
    await page.goto('/join');
    await page.waitForTimeout(5000); // Wait 5 seconds
    
    // Should still be on join page
    await expect(page.locator('text=Join Game')).toBeVisible();
    
    // Step 4: Verify session is still intact
    const sessionAfterNavigation = await page.evaluate(() => {
      return localStorage.getItem('avalon-session');
    });
    expect(sessionAfterNavigation).not.toBeNull();
  });
  
  test('should handle API errors gracefully and redirect to home', async ({ page }) => {
    // Step 1: Create a session
    await page.goto('/');
    
    await page.evaluate(() => {
      const testSession = {
        roomCode: 'TEST123',
        name: 'TestPlayer',
        isHost: false,
        createdAt: Date.now(),
        expiresAt: Date.now() + 3600000
      };
      localStorage.setItem('avalon-session', JSON.stringify(testSession));
    });
    
    // Step 2: Mock API to return error
    await page.route('**/api/trpc/room.getRoomInfo*', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    // Step 3: Navigate to trigger session check
    await page.goto('/join');
    
    // Step 4: Verify redirect to home page
    await page.waitForURL('/', { timeout: 35000 });
    await expect(page.locator('text=Join Game')).toBeVisible();
    
    // Step 5: Verify session was cleared due to error
    const sessionAfterError = await page.evaluate(() => {
      return localStorage.getItem('avalon-session');
    });
    expect(sessionAfterError).toBeNull();
  });
});
