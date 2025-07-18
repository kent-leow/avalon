/**
 * Game Test Suite
 * 
 * Comprehensive E2E testing framework for all game scenarios.
 * Orchestrates all testing scenarios and provides main test coordination.
 */

import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { MultiPlayerTestRunner } from './MultiPlayerTestRunner';
import { PerformanceTestSuite } from './PerformanceTestSuite';
import { AccessibilityTestSuite } from './AccessibilityTestSuite';
import { VisualRegressionSuite } from './VisualRegressionSuite';
import { TestDataGenerator } from './TestDataGenerator';
import { TestHelpers } from './utils/test-helpers';
import { TestAssertions } from './utils/assertions';

export interface GameTestSuiteConfig {
  testEnvironment: 'local' | 'staging' | 'production';
  browserConfigs: BrowserConfig[];
  testScenarios: TestScenario[];
  reportingConfig: ReportingConfig;
  baseUrl: string;
  timeout: number;
  retries: number;
}

export interface BrowserConfig {
  name: string;
  viewport: { width: number; height: number };
  userAgent?: string;
  isMobile?: boolean;
  hasTouch?: boolean;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'core' | 'integration' | 'performance' | 'accessibility' | 'visual';
  players: number;
  roles: string[];
  missions: number[];
  expectedDuration: string;
  preconditions?: string[];
  steps: TestStep[];
  validation: ValidationRule[];
}

export interface TestStep {
  id: string;
  description: string;
  action: string;
  target?: string;
  data?: any;
  wait?: number;
  validation?: string[];
}

export interface ValidationRule {
  type: 'element' | 'state' | 'data' | 'performance' | 'accessibility';
  selector?: string;
  expected: any;
  comparison: 'equals' | 'contains' | 'greater' | 'less' | 'exists' | 'visible';
  timeout?: number;
}

export interface ReportingConfig {
  formats: ('html' | 'json' | 'junit' | 'custom')[];
  outputDir: string;
  screenshots: boolean;
  videos: boolean;
  traces: boolean;
  metrics: boolean;
}

export interface GameState {
  roomId: string;
  players: Player[];
  currentPhase: string;
  currentMission: number;
  gameSettings: GameSettings;
  roleDistribution: RoleDistribution;
  missionResults: MissionResult[];
  gameResult?: GameResult;
}

export interface Player {
  id: string;
  name: string;
  role?: string;
  isHost: boolean;
  isConnected: boolean;
  lastAction?: PlayerAction;
  performance?: PlayerPerformance;
}

export interface PlayerAction {
  type: string;
  timestamp: number;
  data?: any;
  duration?: number;
}

export interface PlayerPerformance {
  responseTime: number;
  actionCount: number;
  errorsCount: number;
  disconnections: number;
}

export interface GameSettings {
  playerCount: number;
  gameMode: string;
  timeLimit: number;
  enableOptionalRoles: boolean;
  enableSpecialRules: boolean;
}

export interface RoleDistribution {
  good: string[];
  evil: string[];
  special: string[];
}

export interface MissionResult {
  missionNumber: number;
  team: string[];
  votes: Vote[];
  actions: MissionAction[];
  result: 'success' | 'failure';
  duration: number;
}

export interface Vote {
  playerId: string;
  vote: 'approve' | 'reject';
  timestamp: number;
}

export interface MissionAction {
  playerId: string;
  action: 'success' | 'failure';
  timestamp: number;
}

export interface GameResult {
  winner: 'good' | 'evil';
  winCondition: string;
  finalScore: { good: number; evil: number };
  duration: number;
  statistics: GameStatistics;
}

export interface GameStatistics {
  totalActions: number;
  averageResponseTime: number;
  disconnections: number;
  errors: number;
  performanceMetrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  averageLoadTime: number;
  peakMemoryUsage: number;
  networkRequests: number;
  renderTime: number;
}

export const DEFAULT_TEST_CONFIG: GameTestSuiteConfig = {
  testEnvironment: 'local',
  browserConfigs: [
    { name: 'Chrome', viewport: { width: 1920, height: 1080 } },
    { name: 'Firefox', viewport: { width: 1920, height: 1080 } },
    { name: 'Safari', viewport: { width: 1920, height: 1080 } },
    { name: 'Mobile Chrome', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    { name: 'Mobile Safari', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
  ],
  testScenarios: [],
  reportingConfig: {
    formats: ['html', 'json', 'junit'],
    outputDir: 'test-results',
    screenshots: true,
    videos: true,
    traces: true,
    metrics: true
  },
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  retries: 2
};

export class GameTestSuite {
  private page: Page;
  private config: GameTestSuiteConfig;
  private testHelpers: TestHelpers;
  private assertions: TestAssertions;
  private multiPlayerRunner: MultiPlayerTestRunner;
  private performanceSuite: PerformanceTestSuite;
  private accessibilitySuite: AccessibilityTestSuite;
  private visualSuite: VisualRegressionSuite;
  private testDataGenerator: TestDataGenerator;
  private currentGameState: GameState | null = null;

  constructor(page: Page, config: Partial<GameTestSuiteConfig> = {}) {
    this.page = page;
    this.config = { ...DEFAULT_TEST_CONFIG, ...config };
    this.testHelpers = new TestHelpers(page);
    this.assertions = new TestAssertions(page);
    this.multiPlayerRunner = new MultiPlayerTestRunner(page);
    this.performanceSuite = new PerformanceTestSuite(page);
    this.accessibilitySuite = new AccessibilityTestSuite(page);
    this.visualSuite = new VisualRegressionSuite(page);
    this.testDataGenerator = new TestDataGenerator();
  }

  /**
   * Initialize the test suite
   */
  async initialize(): Promise<void> {
    await this.page.goto(this.config.baseUrl);
    await this.testHelpers.waitForPageLoad();
    await this.setupTestEnvironment();
  }

  /**
   * Create a new game room
   */
  async createRoom(roomName: string): Promise<string> {
    await this.page.click('[data-testid="create-room-button"]');
    await this.page.fill('[data-testid="room-name-input"]', roomName);
    await this.page.click('[data-testid="create-room-submit"]');
    
    // Wait for room creation
    await this.page.waitForSelector('[data-testid="room-info"]');
    const roomId = await this.page.textContent('[data-testid="room-id"]');
    
    if (!roomId) {
      throw new Error('Failed to create room');
    }

    // Initialize game state
    this.currentGameState = {
      roomId,
      players: [],
      currentPhase: 'lobby',
      currentMission: 0,
      gameSettings: this.testDataGenerator.generateGameSettings(),
      roleDistribution: { good: [], evil: [], special: [] },
      missionResults: []
    };

    return roomId;
  }

  /**
   * Add players to the game
   */
  async addPlayers(count: number): Promise<Player[]> {
    const players: Player[] = [];
    
    for (let i = 0; i < count; i++) {
      const playerName = `Player${i + 1}`;
      const playerId = await this.testHelpers.addPlayer(playerName, i === 0);
      
      players.push({
        id: playerId,
        name: playerName,
        isHost: i === 0,
        isConnected: true,
        performance: {
          responseTime: 0,
          actionCount: 0,
          errorsCount: 0,
          disconnections: 0
        }
      });
    }

    if (this.currentGameState) {
      this.currentGameState.players = players;
    }

    return players;
  }

  /**
   * Start the game
   */
  async startGame(): Promise<void> {
    await this.page.click('[data-testid="start-game-button"]');
    await this.page.waitForSelector('[data-testid="game-board"]');
    
    if (this.currentGameState) {
      this.currentGameState.currentPhase = 'role-reveal';
    }
  }

  /**
   * Verify role distribution
   */
  async verifyRoleDistribution(): Promise<void> {
    await this.page.waitForSelector('[data-testid="role-card"]');
    const roleCard = await this.page.textContent('[data-testid="role-card"]');
    
    if (!roleCard) {
      throw new Error('Role not assigned');
    }

    // Verify role distribution logic
    const playerCount = this.currentGameState?.players.length || 0;
    const expectedDistribution = this.testDataGenerator.generateRoleDistribution(playerCount);
    
    await this.assertions.verifyRoleDistribution(expectedDistribution);
  }

  /**
   * Play a mission
   */
  async playMission(missionNumber: number): Promise<MissionResult> {
    const startTime = Date.now();
    
    // Team selection phase
    await this.page.waitForSelector('[data-testid="team-selection"]');
    const teamSize = this.getMissionTeamSize(missionNumber);
    await this.selectMissionTeam(teamSize);
    
    // Voting phase
    await this.page.waitForSelector('[data-testid="voting-phase"]');
    const votes = await this.conductVoting();
    
    // Mission phase
    await this.page.waitForSelector('[data-testid="mission-phase"]');
    const actions = await this.conductMission();
    
    // Determine result
    const result = this.determineMissionResult(actions);
    const duration = Date.now() - startTime;
    
    const missionResult: MissionResult = {
      missionNumber,
      team: await this.getCurrentTeam(),
      votes,
      actions,
      result,
      duration
    };

    if (this.currentGameState) {
      this.currentGameState.missionResults.push(missionResult);
      this.currentGameState.currentMission = missionNumber;
    }

    return missionResult;
  }

  /**
   * Verify game completion
   */
  async verifyGameCompletion(): Promise<GameResult> {
    await this.page.waitForSelector('[data-testid="game-results"]');
    
    const winner = await this.page.textContent('[data-testid="winner"]');
    const winCondition = await this.page.textContent('[data-testid="win-condition"]');
    
    if (!winner || !winCondition) {
      throw new Error('Game result not found');
    }

    const gameResult: GameResult = {
      winner: winner.toLowerCase() as 'good' | 'evil',
      winCondition,
      finalScore: await this.getFinalScore(),
      duration: await this.getGameDuration(),
      statistics: await this.getGameStatistics()
    };

    if (this.currentGameState) {
      this.currentGameState.gameResult = gameResult;
    }

    return gameResult;
  }

  /**
   * Run complete game flow test
   */
  async runCompleteGameFlow(scenario: TestScenario): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Create room
      const roomId = await this.createRoom(scenario.name);
      
      // Add players
      const players = await this.addPlayers(scenario.players);
      
      // Start game
      await this.startGame();
      
      // Verify role distribution
      await this.verifyRoleDistribution();
      
      // Play through missions
      for (let i = 0; i < scenario.missions.length; i++) {
        await this.playMission(i + 1);
        
        // Check if game ended early
        const gameEnded = await this.checkGameEnded();
        if (gameEnded) break;
      }
      
      // Verify game completion
      await this.verifyGameCompletion();
      
      // Validate scenario completion
      await this.validateScenarioCompletion(scenario);
      
    } catch (error) {
      await this.handleTestError(error, scenario);
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      await this.recordTestResults(scenario, duration);
    }
  }

  /**
   * Run multi-player test
   */
  async runMultiPlayerTest(config: any): Promise<void> {
    await this.multiPlayerRunner.runTest(config);
  }

  /**
   * Run performance test
   */
  async runPerformanceTest(config: any): Promise<void> {
    await this.performanceSuite.runTest(config);
  }

  /**
   * Run accessibility test
   */
  async runAccessibilityTest(config: any): Promise<void> {
    await this.accessibilitySuite.runTest(config);
  }

  /**
   * Run visual regression test
   */
  async runVisualRegressionTest(config: any): Promise<void> {
    await this.visualSuite.runTest(config);
  }

  /**
   * Generate test report
   */
  async generateTestReport(): Promise<string> {
    const reportData = {
      testSuite: 'Game Test Suite',
      timestamp: new Date().toISOString(),
      environment: this.config.testEnvironment,
      gameState: this.currentGameState,
      results: await this.getTestResults()
    };

    return JSON.stringify(reportData, null, 2);
  }

  // Private helper methods
  private async setupTestEnvironment(): Promise<void> {
    // Set up test environment
    await this.page.evaluate(() => {
      window.localStorage.setItem('test-mode', 'true');
    });
  }

  private getMissionTeamSize(missionNumber: number): number {
    const playerCount = this.currentGameState?.players.length || 5;
    const teamSizes = playerCount === 5 ? [2, 3, 2, 3, 3] : [3, 4, 4, 5, 5];
    return teamSizes[missionNumber - 1] || 2;
  }

  private async selectMissionTeam(teamSize: number): Promise<void> {
    const players = await this.page.$$('[data-testid="player-card"]');
    
    for (let i = 0; i < teamSize && i < players.length; i++) {
      const player = players[i];
      if (player) {
        await player.click();
      }
    }
    
    await this.page.click('[data-testid="confirm-team-button"]');
  }

  private async conductVoting(): Promise<Vote[]> {
    const votes: Vote[] = [];
    
    // Simulate voting by all players
    const voteButtons = await this.page.$$('[data-testid="vote-button"]');
    
    for (const button of voteButtons) {
      await button.click();
      const timestamp = Date.now();
      votes.push({
        playerId: 'test-player',
        vote: 'approve',
        timestamp
      });
    }
    
    return votes;
  }

  private async conductMission(): Promise<MissionAction[]> {
    const actions: MissionAction[] = [];
    
    // Simulate mission actions
    const actionButtons = await this.page.$$('[data-testid="mission-action-button"]');
    
    for (const button of actionButtons) {
      await button.click();
      const timestamp = Date.now();
      actions.push({
        playerId: 'test-player',
        action: 'success',
        timestamp
      });
    }
    
    return actions;
  }

  private determineMissionResult(actions: MissionAction[]): 'success' | 'failure' {
    const failureCount = actions.filter(action => action.action === 'failure').length;
    return failureCount > 0 ? 'failure' : 'success';
  }

  private async getCurrentTeam(): Promise<string[]> {
    const teamMembers = await this.page.$$eval(
      '[data-testid="team-member"]',
      elements => elements.map(el => el.textContent || '')
    );
    return teamMembers;
  }

  private async checkGameEnded(): Promise<boolean> {
    const gameResults = await this.page.$('[data-testid="game-results"]');
    return gameResults !== null;
  }

  private async getFinalScore(): Promise<{ good: number; evil: number }> {
    const goodScore = await this.page.textContent('[data-testid="good-score"]');
    const evilScore = await this.page.textContent('[data-testid="evil-score"]');
    
    return {
      good: parseInt(goodScore || '0', 10),
      evil: parseInt(evilScore || '0', 10)
    };
  }

  private async getGameDuration(): Promise<number> {
    const duration = await this.page.textContent('[data-testid="game-duration"]');
    return parseInt(duration || '0', 10);
  }

  private async getGameStatistics(): Promise<GameStatistics> {
    return {
      totalActions: 0,
      averageResponseTime: 0,
      disconnections: 0,
      errors: 0,
      performanceMetrics: {
        averageLoadTime: 0,
        peakMemoryUsage: 0,
        networkRequests: 0,
        renderTime: 0
      }
    };
  }

  private async validateScenarioCompletion(scenario: TestScenario): Promise<void> {
    // Validate that scenario was completed according to specifications
    for (const validation of scenario.validation) {
      await this.assertions.validateRule(validation);
    }
  }

  private async handleTestError(error: any, scenario: TestScenario): Promise<void> {
    console.error(`Test error in scenario ${scenario.name}:`, error);
    
    // Take screenshot for debugging
    await this.page.screenshot({
      path: `test-results/errors/${scenario.id}-error.png`,
      fullPage: true
    });
  }

  private async recordTestResults(scenario: TestScenario, duration: number): Promise<void> {
    const results = {
      scenario: scenario.name,
      duration,
      timestamp: new Date().toISOString(),
      gameState: this.currentGameState
    };
    
    // Save results to file
    await this.testHelpers.saveTestResults(results);
  }

  private async getTestResults(): Promise<any> {
    return {
      gameState: this.currentGameState,
      testMetrics: await this.getTestMetrics()
    };
  }

  private async getTestMetrics(): Promise<any> {
    return {
      performance: await this.performanceSuite.getMetrics(),
      accessibility: await this.accessibilitySuite.getMetrics(),
      visual: await this.visualSuite.getMetrics()
    };
  }
}
