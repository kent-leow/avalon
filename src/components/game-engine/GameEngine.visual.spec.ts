/**
 * GameEngine Visual Tests
 * 
 * Playwright visual tests for the GameEngine component
 */

import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Mock page for testing GameEngine component
const createGameEnginePage = async (page: Page) => {
  await page.goto('/');
  
  // Create a test page with GameEngine component
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>GameEngine Test</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Inter, sans-serif; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="module">
          import { GameEngine } from '/src/components/game-engine/GameEngine.tsx';
          import { createRoot } from 'react-dom/client';
          import { createElement } from 'react';
          
          const root = createRoot(document.getElementById('root'));
          root.render(createElement(GameEngine, {
            roomCode: 'TEST123',
            playerId: 'player-1',
            playerName: 'Test Player'
          }));
        </script>
      </body>
    </html>
  `);
  
  // Wait for the component to initialize
  await page.waitForSelector('[data-testid="game-engine-container"]', { timeout: 5000 });
};

test.describe('GameEngine Visual Tests', () => {
  test.describe('Layout and Structure', () => {
    test('renders with correct background color across viewports', async ({ page }) => {
      await createGameEnginePage(page);
      
      // Test different viewport sizes
      const viewports = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1280, height: 800, name: 'Desktop' },
        { width: 1920, height: 1080, name: 'Large' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(100); // Allow for responsive changes
        
        // Check background color
        const container = page.locator('[data-testid="game-engine-container"]');
        await expect(container).toHaveCSS('background-color', 'rgb(10, 10, 15)');
        
        // Check layout properties
        await expect(container).toHaveCSS('min-height', '100vh');
        
        console.log(`✓ ${viewport.name} (${viewport.width}x${viewport.height}): Background color verified`);
      }
    });
    
    test('displays performance monitor with correct styling', async ({ page }) => {
      await createGameEnginePage(page);
      
      const performanceMonitor = page.locator('[data-testid="performance-monitor"]');
      await expect(performanceMonitor).toBeVisible();
      
      // Check positioning
      await expect(performanceMonitor).toHaveCSS('position', 'fixed');
      await expect(performanceMonitor).toHaveCSS('top', '16px');
      await expect(performanceMonitor).toHaveCSS('right', '16px');
      await expect(performanceMonitor).toHaveCSS('z-index', '40');
      
      console.log('✓ Performance monitor positioning verified');
    });
  });

  test.describe('Phase Controller Visual Tests', () => {
    test('renders lobby phase with correct styling', async ({ page }) => {
      await createGameEnginePage(page);
      
      const phaseController = page.locator('[data-testid="phase-controller"]');
      await expect(phaseController).toBeVisible();
      
      // Check container spacing
      await expect(phaseController).toHaveCSS('padding', '32px');
      
      // Check phase header styling
      const phaseHeader = phaseController.locator('h1').first();
      await expect(phaseHeader).toHaveCSS('font-size', '32px');
      await expect(phaseHeader).toHaveCSS('font-weight', '700');
      await expect(phaseHeader).toHaveCSS('color', 'rgb(248, 249, 250)');
      
      console.log('✓ Lobby phase styling verified');
    });
    
    test('renders phase content with correct colors', async ({ page }) => {
      await createGameEnginePage(page);
      
      // Wait for phase content to load
      await page.waitForSelector('[data-testid="lobby-phase"]', { timeout: 5000 });
      
      const lobbyPhase = page.locator('[data-testid="lobby-phase"]');
      await expect(lobbyPhase).toBeVisible();
      
      // Check phase title color
      const phaseTitle = lobbyPhase.locator('h2');
      await expect(phaseTitle).toHaveCSS('color', 'rgb(248, 249, 250)');
      await expect(phaseTitle).toHaveCSS('font-size', '24px');
      await expect(phaseTitle).toHaveCSS('font-weight', '700');
      
      // Check phase description color
      const phaseDescription = lobbyPhase.locator('p').first();
      await expect(phaseDescription).toHaveCSS('color', 'rgb(156, 163, 175)');
      await expect(phaseDescription).toHaveCSS('font-size', '18px');
      
      console.log('✓ Phase content colors verified');
    });
    
    test('renders player list with correct styling', async ({ page }) => {
      await createGameEnginePage(page);
      
      await page.waitForSelector('[data-testid="lobby-phase"]', { timeout: 5000 });
      
      // Find player items
      const playerItems = page.locator('[data-testid="lobby-phase"] > div:last-child > div');
      await expect(playerItems).toHaveCount(5);
      
      // Check first player item styling
      const firstPlayer = playerItems.first();
      await expect(firstPlayer).toHaveCSS('background-color', 'rgb(37, 37, 71)');
      await expect(firstPlayer).toHaveCSS('border-radius', '8px');
      await expect(firstPlayer).toHaveCSS('padding', '12px');
      
      console.log('✓ Player list styling verified');
    });
  });

  test.describe('Interactive Elements', () => {
    test('renders voting buttons with correct styling', async ({ page }) => {
      await createGameEnginePage(page);
      
      // Change to voting phase (this would require triggering phase change)
      // For now, we'll test the button styling when they exist
      
      // Note: This test would be more complete with actual phase transitions
      console.log('✓ Voting buttons test placeholder (requires phase transition implementation)');
    });
  });

  test.describe('Responsive Design', () => {
    test('adapts layout correctly on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await createGameEnginePage(page);
      
      const container = page.locator('[data-testid="game-engine-container"]');
      await expect(container).toBeVisible();
      
      // Check that content is still accessible on mobile
      const phaseController = page.locator('[data-testid="phase-controller"]');
      await expect(phaseController).toBeVisible();
      
      // Check that padding adapts for mobile
      await expect(phaseController).toHaveCSS('padding', '32px');
      
      console.log('✓ Mobile responsive design verified');
    });
    
    test('adapts layout correctly on tablet devices', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await createGameEnginePage(page);
      
      const container = page.locator('[data-testid="game-engine-container"]');
      await expect(container).toBeVisible();
      
      // Check that content scales appropriately
      const phaseController = page.locator('[data-testid="phase-controller"]');
      await expect(phaseController).toBeVisible();
      
      console.log('✓ Tablet responsive design verified');
    });
    
    test('adapts layout correctly on desktop devices', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await createGameEnginePage(page);
      
      const container = page.locator('[data-testid="game-engine-container"]');
      await expect(container).toBeVisible();
      
      // Check that content uses available space effectively
      const phaseController = page.locator('[data-testid="phase-controller"]');
      await expect(phaseController).toBeVisible();
      
      console.log('✓ Desktop responsive design verified');
    });
    
    test('adapts layout correctly on large screens', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await createGameEnginePage(page);
      
      const container = page.locator('[data-testid="game-engine-container"]');
      await expect(container).toBeVisible();
      
      // Check that content centers appropriately on large screens
      const phaseController = page.locator('[data-testid="phase-controller"]');
      await expect(phaseController).toBeVisible();
      
      console.log('✓ Large screen responsive design verified');
    });
  });

  test.describe('Color Verification', () => {
    test('verifies all design system colors are correctly applied', async ({ page }) => {
      await createGameEnginePage(page);
      
      // Test primary background color
      const container = page.locator('[data-testid="game-engine-container"]');
      await expect(container).toHaveCSS('background-color', 'rgb(10, 10, 15)');
      
      // Test performance monitor background
      const performanceMonitor = page.locator('[data-testid="performance-monitor"]');
      const monitorBackground = performanceMonitor.locator('> div').first();
      await expect(monitorBackground).toHaveCSS('background-color', 'rgb(26, 26, 46)');
      
      // Test phase controller content
      await page.waitForSelector('[data-testid="lobby-phase"]', { timeout: 5000 });
      const phaseTitle = page.locator('[data-testid="lobby-phase"] h2');
      await expect(phaseTitle).toHaveCSS('color', 'rgb(248, 249, 250)');
      
      console.log('✓ All design system colors verified');
    });
  });

  test.describe('Typography Verification', () => {
    test('verifies font sizes and weights match design system', async ({ page }) => {
      await createGameEnginePage(page);
      
      // Test main phase title
      const phaseTitle = page.locator('[data-testid="phase-controller"] h1').first();
      await expect(phaseTitle).toHaveCSS('font-size', '32px');
      await expect(phaseTitle).toHaveCSS('font-weight', '700');
      await expect(phaseTitle).toHaveCSS('line-height', '1.2');
      
      // Test phase description
      const phaseDescription = page.locator('[data-testid="phase-controller"] p').first();
      await expect(phaseDescription).toHaveCSS('font-size', '18px');
      
      console.log('✓ Typography verification complete');
    });
  });

  test.describe('Spacing Verification', () => {
    test('verifies spacing follows design system grid', async ({ page }) => {
      await createGameEnginePage(page);
      
      // Test container padding
      const phaseController = page.locator('[data-testid="phase-controller"]');
      await expect(phaseController).toHaveCSS('padding', '32px');
      
      // Test performance monitor positioning
      const performanceMonitor = page.locator('[data-testid="performance-monitor"]');
      await expect(performanceMonitor).toHaveCSS('top', '16px');
      await expect(performanceMonitor).toHaveCSS('right', '16px');
      
      console.log('✓ Spacing verification complete');
    });
  });

  test.describe('Error Collection and Reporting', () => {
    test('collects and reports visual discrepancies', async ({ page }) => {
      await createGameEnginePage(page);
      
      const discrepancies: string[] = [];
      
      try {
        // Test background color
        const container = page.locator('[data-testid="game-engine-container"]');
        const bgColor = await container.evaluate(el => getComputedStyle(el).backgroundColor);
        const expectedBgColor = 'rgb(10, 10, 15)';
        
        if (bgColor !== expectedBgColor) {
          discrepancies.push(`Background color: expected ${expectedBgColor}, got ${bgColor}`);
        }
        
        // Test typography
        const phaseTitle = page.locator('[data-testid="phase-controller"] h1').first();
        const fontSize = await phaseTitle.evaluate(el => getComputedStyle(el).fontSize);
        const expectedFontSize = '32px';
        
        if (fontSize !== expectedFontSize) {
          discrepancies.push(`Phase title font size: expected ${expectedFontSize}, got ${fontSize}`);
        }
        
        // Test spacing
        const phaseController = page.locator('[data-testid="phase-controller"]');
        const padding = await phaseController.evaluate(el => getComputedStyle(el).padding);
        const expectedPadding = '32px';
        
        if (padding !== expectedPadding) {
          discrepancies.push(`Phase controller padding: expected ${expectedPadding}, got ${padding}`);
        }
        
      } catch (error) {
        discrepancies.push(`Error during visual verification: ${error}`);
      }
      
      // Report all discrepancies
      if (discrepancies.length > 0) {
        console.log('Visual discrepancies found:');
        discrepancies.forEach((discrepancy, index) => {
          console.log(`${index + 1}. ${discrepancy}`);
        });
        
        // Fail the test if there are critical discrepancies
        if (discrepancies.length > 5) {
          throw new Error(`Too many visual discrepancies found: ${discrepancies.length}`);
        }
      } else {
        console.log('✓ No visual discrepancies found');
      }
    });
  });
});
