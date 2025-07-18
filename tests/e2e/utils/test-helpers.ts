/**
 * Test Helpers
 * 
 * Utility functions for E2E testing
 */

import type { Page } from '@playwright/test';

export class TestHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Add a player to the game
   */
  async addPlayer(name: string, isHost: boolean = false): Promise<string> {
    if (!isHost) {
      // Join existing room
      await this.page.click('[data-testid="join-room-button"]');
    }
    
    await this.page.fill('[data-testid="player-name-input"]', name);
    await this.page.click('[data-testid="join-game-button"]');
    
    // Wait for player to be added
    await this.page.waitForSelector(`[data-testid="player-${name}"]`);
    
    return `player-${name}`;
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true
    });
  }

  /**
   * Save test results to file
   */
  async saveTestResults(results: any): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-results/results-${timestamp}.json`;
    
    // In a real implementation, this would save to a file
    console.log('Test results:', results);
  }

  /**
   * Wait for element with retry
   */
  async waitForElementWithRetry(selector: string, timeout: number = 10000): Promise<void> {
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        await this.page.waitForSelector(selector, { timeout });
        return;
      } catch (error) {
        attempts++;
        if (attempts === maxAttempts) {
          throw error;
        }
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Get element text with fallback
   */
  async getElementText(selector: string, fallback: string = ''): Promise<string> {
    try {
      const text = await this.page.textContent(selector);
      return text || fallback;
    } catch (error) {
      return fallback;
    }
  }

  /**
   * Click element with retry
   */
  async clickWithRetry(selector: string, maxAttempts: number = 3): Promise<void> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        await this.page.click(selector);
        return;
      } catch (error) {
        attempts++;
        if (attempts === maxAttempts) {
          throw error;
        }
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Generate unique test ID
   */
  generateTestId(): string {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear test data
   */
  async clearTestData(): Promise<void> {
    await this.page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  }

  /**
   * Set test mode
   */
  async setTestMode(enabled: boolean = true): Promise<void> {
    await this.page.evaluate((enabled) => {
      window.localStorage.setItem('test-mode', enabled.toString());
    }, enabled);
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<any> {
    return await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        memoryUsage: (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        } : null
      };
    });
  }

  /**
   * Wait for network requests to complete
   */
  async waitForNetworkIdle(timeout: number = 5000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Mock API response
   */
  async mockApiResponse(url: string, response: any): Promise<void> {
    await this.page.route(url, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  /**
   * Get console messages
   */
  async getConsoleMessages(): Promise<string[]> {
    const messages: string[] = [];
    
    this.page.on('console', msg => {
      messages.push(`${msg.type()}: ${msg.text()}`);
    });
    
    return messages;
  }

  /**
   * Check for JavaScript errors
   */
  async checkForJSErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    this.page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    return errors;
  }
}
