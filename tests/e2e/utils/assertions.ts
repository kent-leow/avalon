/**
 * Test Assertions
 * 
 * Custom assertions for E2E testing
 */

import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export interface ValidationRule {
  type: 'element' | 'state' | 'data' | 'performance' | 'accessibility';
  selector?: string;
  expected: any;
  comparison: 'equals' | 'contains' | 'greater' | 'less' | 'exists' | 'visible';
  timeout?: number;
}

export interface RoleDistribution {
  good: string[];
  evil: string[];
  special: string[];
}

export class TestAssertions {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Validate a rule against the page
   */
  async validateRule(rule: ValidationRule): Promise<void> {
    switch (rule.type) {
      case 'element':
        await this.validateElementRule(rule);
        break;
      case 'state':
        await this.validateStateRule(rule);
        break;
      case 'data':
        await this.validateDataRule(rule);
        break;
      case 'performance':
        await this.validatePerformanceRule(rule);
        break;
      case 'accessibility':
        await this.validateAccessibilityRule(rule);
        break;
      default:
        throw new Error(`Unknown validation rule type: ${rule.type}`);
    }
  }

  /**
   * Verify role distribution
   */
  async verifyRoleDistribution(expected: RoleDistribution): Promise<void> {
    const roleCard = await this.page.textContent('[data-testid="role-card"]');
    
    if (!roleCard) {
      throw new Error('Role card not found');
    }

    const allRoles = [...expected.good, ...expected.evil, ...expected.special];
    const isValidRole = allRoles.includes(roleCard);
    
    expect(isValidRole).toBe(true);
  }

  /**
   * Verify game state
   */
  async verifyGameState(expectedState: string): Promise<void> {
    const gameState = await this.page.getAttribute('[data-testid="game-board"]', 'data-state');
    expect(gameState).toBe(expectedState);
  }

  /**
   * Verify player count
   */
  async verifyPlayerCount(expectedCount: number): Promise<void> {
    const playerElements = await this.page.$$('[data-testid^="player-"]');
    expect(playerElements.length).toBe(expectedCount);
  }

  /**
   * Verify mission result
   */
  async verifyMissionResult(expectedResult: 'success' | 'failure'): Promise<void> {
    const missionResult = await this.page.textContent('[data-testid="mission-result"]');
    expect(missionResult?.toLowerCase()).toBe(expectedResult);
  }

  /**
   * Verify game winner
   */
  async verifyGameWinner(expectedWinner: 'good' | 'evil'): Promise<void> {
    const winner = await this.page.textContent('[data-testid="winner"]');
    expect(winner?.toLowerCase()).toBe(expectedWinner);
  }

  /**
   * Verify element existence
   */
  async verifyElementExists(selector: string): Promise<void> {
    const element = await this.page.$(selector);
    expect(element).not.toBeNull();
  }

  /**
   * Verify element visibility
   */
  async verifyElementVisible(selector: string): Promise<void> {
    const isVisible = await this.page.isVisible(selector);
    expect(isVisible).toBe(true);
  }

  /**
   * Verify element text
   */
  async verifyElementText(selector: string, expectedText: string): Promise<void> {
    const actualText = await this.page.textContent(selector);
    expect(actualText).toBe(expectedText);
  }

  /**
   * Verify element contains text
   */
  async verifyElementContainsText(selector: string, expectedText: string): Promise<void> {
    const actualText = await this.page.textContent(selector);
    expect(actualText).toContain(expectedText);
  }

  /**
   * Verify element count
   */
  async verifyElementCount(selector: string, expectedCount: number): Promise<void> {
    const elements = await this.page.$$(selector);
    expect(elements.length).toBe(expectedCount);
  }

  /**
   * Verify URL
   */
  async verifyURL(expectedURL: string): Promise<void> {
    const currentURL = this.page.url();
    expect(currentURL).toBe(expectedURL);
  }

  /**
   * Verify URL contains
   */
  async verifyURLContains(expectedPart: string): Promise<void> {
    const currentURL = this.page.url();
    expect(currentURL).toContain(expectedPart);
  }

  /**
   * Verify page title
   */
  async verifyPageTitle(expectedTitle: string): Promise<void> {
    const title = await this.page.title();
    expect(title).toBe(expectedTitle);
  }

  /**
   * Verify local storage item
   */
  async verifyLocalStorageItem(key: string, expectedValue: string): Promise<void> {
    const value = await this.page.evaluate((key) => {
      return window.localStorage.getItem(key);
    }, key);
    expect(value).toBe(expectedValue);
  }

  /**
   * Verify session storage item
   */
  async verifySessionStorageItem(key: string, expectedValue: string): Promise<void> {
    const value = await this.page.evaluate((key) => {
      return window.sessionStorage.getItem(key);
    }, key);
    expect(value).toBe(expectedValue);
  }

  /**
   * Verify console has no errors
   */
  async verifyNoConsoleErrors(): Promise<void> {
    const errors: string[] = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    expect(errors.length).toBe(0);
  }

  /**
   * Verify network request
   */
  async verifyNetworkRequest(url: string, method: string = 'GET'): Promise<void> {
    let requestFound = false;
    
    this.page.on('request', request => {
      if (request.url().includes(url) && request.method() === method) {
        requestFound = true;
      }
    });
    
    expect(requestFound).toBe(true);
  }

  /**
   * Verify performance metrics
   */
  async verifyPerformanceMetrics(maxLoadTime: number): Promise<void> {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart
      };
    });
    
    expect(metrics.loadTime).toBeLessThan(maxLoadTime);
  }

  /**
   * Verify accessibility attributes
   */
  async verifyAccessibilityAttributes(selector: string, attributes: Record<string, string>): Promise<void> {
    const element = await this.page.$(selector);
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    for (const [attr, expectedValue] of Object.entries(attributes)) {
      const actualValue = await element.getAttribute(attr);
      expect(actualValue).toBe(expectedValue);
    }
  }

  // Private helper methods
  private async validateElementRule(rule: ValidationRule): Promise<void> {
    if (!rule.selector) {
      throw new Error('Element rule requires selector');
    }

    switch (rule.comparison) {
      case 'exists':
        await this.verifyElementExists(rule.selector);
        break;
      case 'visible':
        await this.verifyElementVisible(rule.selector);
        break;
      case 'equals':
        await this.verifyElementText(rule.selector, rule.expected);
        break;
      case 'contains':
        await this.verifyElementContainsText(rule.selector, rule.expected);
        break;
      default:
        throw new Error(`Unsupported element comparison: ${rule.comparison}`);
    }
  }

  private async validateStateRule(rule: ValidationRule): Promise<void> {
    switch (rule.comparison) {
      case 'equals':
        await this.verifyGameState(rule.expected);
        break;
      default:
        throw new Error(`Unsupported state comparison: ${rule.comparison}`);
    }
  }

  private async validateDataRule(rule: ValidationRule): Promise<void> {
    // Implement data validation logic
    console.log('Data validation not implemented yet');
  }

  private async validatePerformanceRule(rule: ValidationRule): Promise<void> {
    switch (rule.comparison) {
      case 'less':
        await this.verifyPerformanceMetrics(rule.expected);
        break;
      default:
        throw new Error(`Unsupported performance comparison: ${rule.comparison}`);
    }
  }

  private async validateAccessibilityRule(rule: ValidationRule): Promise<void> {
    if (!rule.selector) {
      throw new Error('Accessibility rule requires selector');
    }

    await this.verifyAccessibilityAttributes(rule.selector, rule.expected);
  }
}
