import { test, expect } from '@playwright/test';

test.describe('Lobby Functionality', () => {
  test('host can create room and configure settings', async ({ page }) => {
    // Navigate to the home page
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Find and click the "Create Room" button
    await page.click('text=Create Room');
    
    // Fill in the host name
    await page.fill('input[name="hostName"]', 'Test Host');
    
    // Click the create button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to lobby
    await page.waitForURL('**/lobby');
    
    // Check that the lobby page loaded
    await expect(page.locator('text=Room Lobby')).toBeVisible();
    
    // Check that the host badge is visible
    await expect(page.locator('text=Host')).toBeVisible();
    
    // Check that the player management section is visible
    await expect(page.locator('text=Players (')).toBeVisible();
    
    // Check that the game settings section is visible
    await expect(page.locator('text=Game Settings')).toBeVisible();
    
    // Check that the game start section is visible
    await expect(page.locator('text=Game Setup')).toBeVisible();
    
    // Try to expand game settings
    await page.click('text=Configure Settings');
    
    // Check that the character selector is visible
    await expect(page.locator('text=Character Selector')).toBeVisible();
    
    // Check that player count selector is visible
    await expect(page.locator('text=Player Count')).toBeVisible();
  });
});
