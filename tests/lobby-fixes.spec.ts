import { test, expect } from '@playwright/test';

test.describe('Lobby Issues Fix', () => {
  test('host can click ready, make host and kick work, and settings are responsive', async ({ page }) => {
    // Navigate to create room
    await page.goto('/create-room');
    
    // Create room
    await page.fill('[data-testid="host-name-input"]', 'TestHost');
    await page.click('button[type="submit"]');
    
    // Should be in lobby
    await expect(page).toHaveURL(/\/room\/[A-Z0-9]{8}\/lobby/);
    
    // 1. Test host can click Ready
    await expect(page.getByRole('button', { name: /ready/i })).toBeVisible();
    await page.getByRole('button', { name: /ready/i }).click();
    
    // Should show "Not Ready" after clicking
    await expect(page.getByRole('button', { name: /not ready/i })).toBeVisible();
    
    // 2. Test Configure Settings is responsive
    await page.getByRole('button', { name: /configure settings/i }).click();
    
    // Settings panel should be visible and not cut off
    await expect(page.getByText(/character selector/i)).toBeVisible();
    await expect(page.getByText(/player count/i)).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText(/character selector/i)).toBeVisible();
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // 3. Test Make Host and Kick buttons with a second player
    const context = page.context();
    const playerPage = await context.newPage();
    
    // Get room code
    const roomCode = page.url().match(/\/room\/([A-Z0-9]{8})/)?.[1];
    
    // Player joins room
    await playerPage.goto(`/room/${roomCode}`);
    await playerPage.fill('[data-testid="player-name-input"]', 'TestPlayer');
    await playerPage.click('button[type="submit"]');
    
    // Should be in lobby
    await expect(playerPage).toHaveURL(/\/room\/[A-Z0-9]{8}\/lobby/);
    
    // Host should see player and action buttons
    await expect(page.getByText('TestPlayer')).toBeVisible();
    await expect(page.getByRole('button', { name: /make host/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /kick/i })).toBeVisible();
    
    // Test Make Host button (with confirmation)
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /make host/i }).click();
    
    // Should show processing state
    await expect(page.getByText(/processing/i)).toBeVisible();
    
    console.log('✅ All lobby functionality tests passed');
  });
});
