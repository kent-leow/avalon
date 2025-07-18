import { test, expect } from '@playwright/test';

test.describe('Phase Transition Animations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render phase transition animator', async ({ page }) => {
    // Create a room first
    await page.fill('input[placeholder="Enter room name"]', 'Test Room');
    await page.fill('input[placeholder="Enter your name"]', 'Test Player');
    await page.click('button:has-text("Create Room")');

    // Wait for room page to load
    await page.waitForURL('**/room/**');

    // Check if the phase transition animator exists
    const animator = page.locator('[data-testid="phase-transition-animator"]');
    await expect(animator).toBeVisible();
  });

  test('should handle motion preferences', async ({ page }) => {
    // Create a room first
    await page.fill('input[placeholder="Enter room name"]', 'Test Room');
    await page.fill('input[placeholder="Enter your name"]', 'Test Player');
    await page.click('button:has-text("Create Room")');

    // Wait for room page to load
    await page.waitForURL('**/room/**');

    // Check if motion preferences are respected
    const animator = page.locator('[data-testid="phase-transition-animator"]');
    await expect(animator).toBeVisible();

    // Check if reduced motion is handled
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(animator).toBeVisible();
  });

  test('should show animation effects during transitions', async ({ page }) => {
    // Create a room first
    await page.fill('input[placeholder="Enter room name"]', 'Test Room');
    await page.fill('input[placeholder="Enter your name"]', 'Test Player');
    await page.click('button:has-text("Create Room")');

    // Wait for room page to load
    await page.waitForURL('**/room/**');

    // Check if transition effects are present
    const effects = page.locator('[data-testid="transition-effects"]');
    await expect(effects).toBeVisible();
  });

  test('should handle celebration animations', async ({ page }) => {
    // Create a room first
    await page.fill('input[placeholder="Enter room name"]', 'Test Room');
    await page.fill('input[placeholder="Enter your name"]', 'Test Player');
    await page.click('button:has-text("Create Room")');

    // Wait for room page to load
    await page.waitForURL('**/room/**');

    // Check if celebration animations component exists
    const celebration = page.locator('[data-testid="celebration-animations"]');
    await expect(celebration).toBeVisible();
  });

  test('should handle action feedback', async ({ page }) => {
    // Create a room first
    await page.fill('input[placeholder="Enter room name"]', 'Test Room');
    await page.fill('input[placeholder="Enter your name"]', 'Test Player');
    await page.click('button:has-text("Create Room")');

    // Wait for room page to load
    await page.waitForURL('**/room/**');

    // Check if action feedback component exists
    const feedback = page.locator('[data-testid="action-feedback"]');
    await expect(feedback).toBeVisible();
  });

  test('should handle audio cues', async ({ page }) => {
    // Create a room first
    await page.fill('input[placeholder="Enter room name"]', 'Test Room');
    await page.fill('input[placeholder="Enter your name"]', 'Test Player');
    await page.click('button:has-text("Create Room")');

    // Wait for room page to load
    await page.waitForURL('**/room/**');

    // Check if audio cue manager exists
    const audioManager = page.locator('[data-testid="audio-cue-manager"]');
    await expect(audioManager).toBeVisible();
  });
});
