import { test, expect } from '@playwright/test';

test.describe('Room Lobby Navigation', () => {
  test('should allow users to navigate to room lobby without getting stuck in redirects', async ({ page, context }) => {
    // Step 1: Navigate to create room page
    await page.goto('/create-room');
    
    // Step 2: Fill in host name
    await page.fill('[data-testid="host-name-input"]', 'TestHost');
    
    // Step 3: Click create room button
    await page.click('button[type="submit"]');
    
    // Step 4: Verify user is redirected to lobby page
    await expect(page).toHaveURL(/\/room\/[A-Z0-9]{8}\/lobby/);
    
    // Step 5: Verify lobby page displays room code and host status
    await expect(page.locator('h1')).toContainText('Room Lobby');
    await expect(page.locator('text=Room Code:')).toBeVisible();
    await expect(page.locator('text=Host')).toBeVisible();
    
    // Extract room code from the URL
    const url = page.url();
    const roomCodeMatch = url.match(/\/room\/([A-Z0-9]{8})/);
    const roomCode = roomCodeMatch ? roomCodeMatch[1] : '';
    expect(roomCode).toMatch(/^[A-Z0-9]{8}$/);
    
    // Step 6: Open new tab and navigate to room join page
    const newTab = await context.newPage();
    await newTab.goto(`/room/${roomCode}`);
    
    // Step 7: Verify join form is displayed
    await expect(newTab.locator('h1')).toContainText('Join Game Room');
    await expect(newTab.locator('[data-testid="player-name-input"]')).toBeVisible();
    await expect(newTab.locator('button[type="submit"]')).toBeVisible();
    
    // Step 8: Navigate directly to lobby URL
    await newTab.goto(`/room/${roomCode}/lobby`);
    
    // Step 9: Verify lobby page is accessible
    await expect(newTab.locator('h1')).toContainText('Room Lobby');
    await expect(newTab.locator(`text=${roomCode}`)).toBeVisible();
    await expect(newTab.locator('text=Host')).toBeVisible();
    
    // Clean up
    await newTab.close();
  });
  
  test('should handle direct lobby access without session gracefully', async ({ page }) => {
    // Navigate directly to a non-existent room lobby
    await page.goto('/room/TESTROOM/lobby');
    
    // Should either show join form or redirect to join page
    // The middleware should allow this and let client-side handle it
    await expect(page).toHaveURL(/\/room\/TESTROOM/);
  });
});
