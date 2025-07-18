/**
 * Mock Data for E2E Testing
 * 
 * Centralized mock data for all E2E test scenarios
 */

// Game test mock data
export const mockGameData = {
  // Standard 5-player game
  standardGame: {
    roomId: 'test-room-5player',
    players: [
      { id: 'p1', name: 'Alice', role: 'Merlin', isHost: true },
      { id: 'p2', name: 'Bob', role: 'Percival', isHost: false },
      { id: 'p3', name: 'Charlie', role: 'Loyal Servant', isHost: false },
      { id: 'p4', name: 'Diana', role: 'Assassin', isHost: false },
      { id: 'p5', name: 'Eve', role: 'Morgana', isHost: false }
    ],
    settings: {
      playerCount: 5,
      gameMode: 'standard',
      timeLimit: 300000,
      enableOptionalRoles: false,
      enableSpecialRules: false
    },
    missionSizes: [2, 3, 2, 3, 3]
  },

  // Large 10-player game
  largeGame: {
    roomId: 'test-room-10player',
    players: [
      { id: 'p1', name: 'Alice', role: 'Merlin', isHost: true },
      { id: 'p2', name: 'Bob', role: 'Percival', isHost: false },
      { id: 'p3', name: 'Charlie', role: 'Loyal Servant', isHost: false },
      { id: 'p4', name: 'Diana', role: 'Loyal Servant', isHost: false },
      { id: 'p5', name: 'Eve', role: 'Loyal Servant', isHost: false },
      { id: 'p6', name: 'Frank', role: 'Loyal Servant', isHost: false },
      { id: 'p7', name: 'Grace', role: 'Assassin', isHost: false },
      { id: 'p8', name: 'Henry', role: 'Morgana', isHost: false },
      { id: 'p9', name: 'Ivy', role: 'Mordred', isHost: false },
      { id: 'p10', name: 'Jack', role: 'Oberon', isHost: false }
    ],
    settings: {
      playerCount: 10,
      gameMode: 'advanced',
      timeLimit: 600000,
      enableOptionalRoles: true,
      enableSpecialRules: true
    },
    missionSizes: [3, 4, 4, 5, 5]
  }
};

// API response mocks
export const mockApiResponses = {
  // Room creation
  createRoom: {
    success: {
      roomId: 'room-123',
      hostId: 'player-1',
      settings: mockGameData.standardGame.settings,
      players: [],
      status: 'waiting'
    },
    error: {
      error: 'Room creation failed',
      code: 'ROOM_CREATE_ERROR'
    }
  },

  // Player join
  joinRoom: {
    success: {
      playerId: 'player-2',
      roomId: 'room-123',
      players: mockGameData.standardGame.players,
      status: 'waiting'
    },
    error: {
      error: 'Room not found',
      code: 'ROOM_NOT_FOUND'
    }
  },

  // Game start
  startGame: {
    success: {
      gameId: 'game-123',
      roomId: 'room-123',
      players: mockGameData.standardGame.players,
      currentPhase: 'role-reveal',
      currentMission: 0
    },
    error: {
      error: 'Not enough players',
      code: 'INSUFFICIENT_PLAYERS'
    }
  },

  // Mission results
  missionResult: {
    success: {
      missionNumber: 1,
      result: 'success',
      team: ['p1', 'p2'],
      votes: {
        p1: 'approve',
        p2: 'approve',
        p3: 'approve',
        p4: 'reject',
        p5: 'reject'
      },
      actions: {
        p1: 'success',
        p2: 'success'
      }
    },
    failure: {
      missionNumber: 1,
      result: 'failure',
      team: ['p1', 'p4'],
      votes: {
        p1: 'approve',
        p2: 'reject',
        p3: 'approve',
        p4: 'approve',
        p5: 'approve'
      },
      actions: {
        p1: 'success',
        p4: 'failure'
      }
    }
  },

  // Game completion
  gameComplete: {
    goodWins: {
      gameId: 'game-123',
      winner: 'good',
      winCondition: 'Three missions successful',
      finalScore: { good: 3, evil: 2 },
      duration: 1200000, // 20 minutes
      statistics: {
        totalActions: 45,
        averageResponseTime: 3500,
        disconnections: 1,
        errors: 0
      }
    },
    evilWins: {
      gameId: 'game-123',
      winner: 'evil',
      winCondition: 'Three missions failed',
      finalScore: { good: 2, evil: 3 },
      duration: 1800000, // 30 minutes
      statistics: {
        totalActions: 62,
        averageResponseTime: 4200,
        disconnections: 0,
        errors: 1
      }
    }
  }
};

// Error scenarios
export const mockErrors = {
  networkError: {
    message: 'Network request failed',
    code: 'NETWORK_ERROR',
    status: 500
  },
  timeoutError: {
    message: 'Request timeout',
    code: 'TIMEOUT_ERROR',
    status: 408
  },
  validationError: {
    message: 'Invalid input data',
    code: 'VALIDATION_ERROR',
    status: 400,
    details: ['Player name is required', 'Room ID is invalid']
  }
};

// Performance test data
export const mockPerformanceData = {
  lowLoad: {
    players: 5,
    expectedLoadTime: 2000,
    expectedMemoryUsage: 10 * 1024 * 1024, // 10MB
    expectedNetworkRequests: 20
  },
  mediumLoad: {
    players: 7,
    expectedLoadTime: 3000,
    expectedMemoryUsage: 20 * 1024 * 1024, // 20MB
    expectedNetworkRequests: 35
  },
  highLoad: {
    players: 10,
    expectedLoadTime: 5000,
    expectedMemoryUsage: 30 * 1024 * 1024, // 30MB
    expectedNetworkRequests: 50
  }
};

// Accessibility test data
export const mockAccessibilityData = {
  requiredAttributes: {
    'role-card': {
      'aria-label': 'Your role card',
      'role': 'button',
      'tabindex': '0'
    },
    'vote-button': {
      'aria-label': 'Vote on mission team',
      'role': 'button',
      'tabindex': '0'
    },
    'mission-action': {
      'aria-label': 'Choose mission action',
      'role': 'button',
      'tabindex': '0'
    }
  },
  keyboardShortcuts: {
    'Space': 'Select/Activate',
    'Enter': 'Confirm action',
    'Escape': 'Cancel/Close',
    'Tab': 'Navigate forward',
    'Shift+Tab': 'Navigate backward'
  }
};

// Visual regression test data
export const mockVisualData = {
  baselineScreenshots: {
    'game-lobby': 'screenshots/baseline/game-lobby.png',
    'role-reveal': 'screenshots/baseline/role-reveal.png',
    'team-selection': 'screenshots/baseline/team-selection.png',
    'voting-phase': 'screenshots/baseline/voting-phase.png',
    'mission-phase': 'screenshots/baseline/mission-phase.png',
    'game-results': 'screenshots/baseline/game-results.png'
  },
  viewports: [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 1366, height: 768, name: 'laptop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 390, height: 844, name: 'mobile' }
  ]
};

// Test scenarios data
export const mockTestScenarios = {
  standardGameFlow: {
    id: 'standard-game-flow',
    name: 'Standard Game Flow',
    description: 'Complete 5-player game with standard roles',
    steps: [
      { action: 'createRoom', data: { name: 'Test Room' } },
      { action: 'addPlayers', data: { count: 5 } },
      { action: 'startGame', data: {} },
      { action: 'playMission', data: { missionNumber: 1 } },
      { action: 'playMission', data: { missionNumber: 2 } },
      { action: 'playMission', data: { missionNumber: 3 } },
      { action: 'verifyGameCompletion', data: {} }
    ],
    expectedDuration: 15 * 60 * 1000 // 15 minutes
  },

  performanceTest: {
    id: 'performance-test',
    name: 'Performance Test',
    description: 'Test performance under load',
    steps: [
      { action: 'createRoom', data: { name: 'Performance Test' } },
      { action: 'addPlayers', data: { count: 10 } },
      { action: 'measureLoadTime', data: {} },
      { action: 'startGame', data: {} },
      { action: 'measureMemoryUsage', data: {} },
      { action: 'playAllMissions', data: {} },
      { action: 'measureNetworkRequests', data: {} }
    ],
    expectedDuration: 30 * 60 * 1000 // 30 minutes
  },

  accessibilityTest: {
    id: 'accessibility-test',
    name: 'Accessibility Test',
    description: 'Test accessibility compliance',
    steps: [
      { action: 'createRoom', data: { name: 'A11y Test' } },
      { action: 'addPlayers', data: { count: 5 } },
      { action: 'checkAriaLabels', data: {} },
      { action: 'testKeyboardNavigation', data: {} },
      { action: 'testScreenReader', data: {} },
      { action: 'validateColorContrast', data: {} }
    ],
    expectedDuration: 10 * 60 * 1000 // 10 minutes
  }
};

// Helper functions
export const createMockPlayer = (id: string, name: string, role?: string, isHost: boolean = false) => ({
  id,
  name,
  role,
  isHost,
  isConnected: true,
  performance: {
    responseTime: Math.floor(Math.random() * 5000) + 1000,
    actionCount: 0,
    errorsCount: 0,
    disconnections: 0
  }
});

export const createMockRoom = (id: string, hostId: string, players: any[] = []) => ({
  id,
  name: `Test Room ${id}`,
  hostId,
  players,
  settings: mockGameData.standardGame.settings,
  status: 'waiting' as const
});

export const createMockGameState = (roomId: string, players: any[] = []) => ({
  roomId,
  players,
  currentPhase: 'lobby' as const,
  currentMission: 0,
  gameSettings: mockGameData.standardGame.settings,
  roleDistribution: {
    good: ['Merlin', 'Percival', 'Loyal Servant'],
    evil: ['Assassin', 'Morgana'],
    special: ['Merlin', 'Percival', 'Assassin', 'Morgana']
  },
  missionResults: []
});

export const createMockMissionResult = (missionNumber: number, result: 'success' | 'failure') => ({
  missionNumber,
  team: ['p1', 'p2'],
  votes: mockApiResponses.missionResult[result].votes,
  actions: mockApiResponses.missionResult[result].actions,
  result,
  duration: Math.floor(Math.random() * 120000) + 30000 // 30s - 2.5min
});

export const generateMockMetrics = () => ({
  performance: {
    loadTime: Math.floor(Math.random() * 3000) + 1000,
    memoryUsage: Math.floor(Math.random() * 50) + 10,
    networkRequests: Math.floor(Math.random() * 30) + 10,
    renderTime: Math.floor(Math.random() * 1000) + 100
  },
  accessibility: {
    complianceScore: Math.floor(Math.random() * 20) + 80,
    violations: Math.floor(Math.random() * 5),
    wcagLevel: 'AA' as const
  },
  visual: {
    screenshotCount: Math.floor(Math.random() * 20) + 10,
    visualDiffs: Math.floor(Math.random() * 3),
    failedComparisons: Math.floor(Math.random() * 2)
  }
});

export default {
  mockGameData,
  mockApiResponses,
  mockErrors,
  mockPerformanceData,
  mockAccessibilityData,
  mockVisualData,
  mockTestScenarios,
  createMockPlayer,
  createMockRoom,
  createMockGameState,
  createMockMissionResult,
  generateMockMetrics
};
