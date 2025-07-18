/**
 * E2E Testing Types
 * 
 * Type definitions for E2E testing system
 */

// Test result types
export interface TestResult {
  testId: string;
  scenarioId: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  startTime: string;
  endTime: string;
  error?: {
    message: string;
    stack?: string;
  };
  metadata?: {
    performance?: {
      loadTime: number;
      memoryUsage: number;
      networkRequests: number;
      renderTime?: number;
    };
    accessibility?: {
      violations: number;
      complianceScore: number;
      wcagLevel: 'A' | 'AA' | 'AAA';
    };
    visual?: {
      screenshotCount: number;
      visualDiffs: number;
      failedComparisons: number;
    };
    components?: string[];
    userActions?: string[];
  };
}

// Test report types
export interface TestReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  successRate: number;
  totalDuration: number;
  averageDuration: number;
  metrics: TestMetrics;
  failureReasons: Record<string, number>;
  recommendations: string[];
  results: TestResult[];
}

// Test metrics types
export interface TestMetrics {
  performance?: {
    averageLoadTime: number;
    maxLoadTime: number;
    minLoadTime: number;
    averageMemoryUsage: number;
    maxMemoryUsage: number;
    totalNetworkRequests: number;
  };
  accessibility?: {
    totalViolations: number;
    averageScore: number;
    wcagCompliance: string;
  };
  visual?: {
    totalScreenshots: number;
    totalVisualDiffs: number;
    visualStabilityScore: number;
  };
  coverage: {
    scenariosCovered: number;
    componentsCovered: number;
    testCoverage: number;
  };
}

// Test configuration types
export interface TestConfig {
  timeout: number;
  retries: number;
  parallel: boolean;
  headless: boolean;
  baseUrl: string;
  browsers: string[];
  viewport: {
    width: number;
    height: number;
  };
  reporting: {
    formats: ('json' | 'html' | 'csv')[];
    outputDir: string;
  };
}

// Test scenario types
export interface TestScenario {
  id: string;
  name: string;
  description: string;
  tags: string[];
  steps: TestStep[];
  expectedDuration: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  prerequisites?: string[];
  cleanup?: string[];
}

export interface TestStep {
  action: string;
  description?: string;
  data?: any;
  expected?: any;
  timeout?: number;
  retry?: number;
}

// Test suite types
export interface TestSuite {
  id: string;
  name: string;
  description: string;
  scenarios: TestScenario[];
  config: TestConfig;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

// Test environment types
export interface TestEnvironment {
  name: string;
  url: string;
  database?: {
    url: string;
    reset: boolean;
  };
  auth?: {
    username: string;
    password: string;
  };
  variables?: Record<string, string>;
}

// Test data types
export interface TestData {
  players: TestPlayer[];
  rooms: TestRoom[];
  games: TestGame[];
  scenarios: TestScenario[];
}

export interface TestPlayer {
  id: string;
  name: string;
  role?: string;
  isHost: boolean;
  isConnected: boolean;
  performance?: {
    responseTime: number;
    actionCount: number;
    errorsCount: number;
    disconnections: number;
  };
}

export interface TestRoom {
  id: string;
  name: string;
  hostId: string;
  players: TestPlayer[];
  settings: any;
  status: 'waiting' | 'playing' | 'completed';
}

export interface TestGame {
  id: string;
  roomId: string;
  players: TestPlayer[];
  currentPhase: string;
  currentMission: number;
  gameSettings: any;
  roleDistribution: any;
  missionResults: any[];
}

// Test utilities types
export interface TestAssertion {
  name: string;
  description: string;
  assert: (actual: any, expected: any) => boolean;
  message: (actual: any, expected: any) => string;
}

export interface TestHelper {
  name: string;
  description: string;
  execute: (...args: any[]) => any;
}

// All types are exported above with their interface declarations
