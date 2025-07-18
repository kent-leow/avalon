/**
 * Test Data Generator
 * 
 * Generates test data and scenarios for E2E testing
 */

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

export interface PlayerProfile {
  id: string;
  name: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredRoles: string[];
  playStyle: 'aggressive' | 'defensive' | 'balanced';
  responseTime: number;
}

export interface MockData {
  rooms: MockRoom[];
  players: PlayerProfile[];
  gameStates: MockGameState[];
  missionResults: MockMissionResult[];
}

export interface MockRoom {
  id: string;
  name: string;
  hostId: string;
  players: string[];
  settings: GameSettings;
  status: 'waiting' | 'playing' | 'finished';
}

export interface MockGameState {
  roomId: string;
  currentPhase: string;
  currentMission: number;
  roles: Record<string, string>;
  missionResults: string[];
}

export interface MockMissionResult {
  missionNumber: number;
  team: string[];
  result: 'success' | 'failure';
  votes: Record<string, 'approve' | 'reject'>;
  actions: Record<string, 'success' | 'failure'>;
}

export class TestDataGenerator {
  private playerNames = [
    'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'
  ];

  private rolesByPlayerCount = {
    5: ['Merlin', 'Percival', 'Loyal Servant', 'Assassin', 'Morgana'],
    6: ['Merlin', 'Percival', 'Loyal Servant', 'Loyal Servant', 'Assassin', 'Morgana'],
    7: ['Merlin', 'Percival', 'Loyal Servant', 'Loyal Servant', 'Assassin', 'Morgana', 'Oberon'],
    8: ['Merlin', 'Percival', 'Loyal Servant', 'Loyal Servant', 'Loyal Servant', 'Assassin', 'Morgana', 'Oberon'],
    9: ['Merlin', 'Percival', 'Loyal Servant', 'Loyal Servant', 'Loyal Servant', 'Loyal Servant', 'Assassin', 'Morgana', 'Mordred'],
    10: ['Merlin', 'Percival', 'Loyal Servant', 'Loyal Servant', 'Loyal Servant', 'Loyal Servant', 'Assassin', 'Morgana', 'Mordred', 'Oberon']
  };

  private missionSizesByPlayerCount = {
    5: [2, 3, 2, 3, 3],
    6: [2, 3, 4, 3, 4],
    7: [2, 3, 3, 4, 4],
    8: [3, 4, 4, 5, 5],
    9: [3, 4, 4, 5, 5],
    10: [3, 4, 4, 5, 5]
  };

  /**
   * Generate game settings
   */
  generateGameSettings(playerCount: number = 5): GameSettings {
    return {
      playerCount,
      gameMode: 'standard',
      timeLimit: 300000, // 5 minutes
      enableOptionalRoles: playerCount >= 7,
      enableSpecialRules: false
    };
  }

  /**
   * Generate role distribution
   */
  generateRoleDistribution(playerCount: number): RoleDistribution {
    const roles = this.rolesByPlayerCount[playerCount as keyof typeof this.rolesByPlayerCount] || 
                  this.rolesByPlayerCount[5];

    const goodRoles = roles.filter(role => 
      ['Merlin', 'Percival', 'Loyal Servant'].includes(role)
    );
    const evilRoles = roles.filter(role => 
      ['Assassin', 'Morgana', 'Mordred', 'Oberon'].includes(role)
    );
    const specialRoles = roles.filter(role => 
      ['Merlin', 'Percival', 'Assassin', 'Morgana', 'Mordred', 'Oberon'].includes(role)
    );

    return {
      good: goodRoles,
      evil: evilRoles,
      special: specialRoles
    };
  }

  /**
   * Generate test scenarios
   */
  generateTestScenarios(): TestScenario[] {
    return [
      this.generateStandardGameScenario(),
      this.generateLargeGameScenario(),
      this.generateQuickGameScenario(),
      this.generateDisconnectionScenario(),
      this.generatePerformanceScenario()
    ];
  }

  /**
   * Generate player profiles
   */
  generatePlayerProfiles(count: number): PlayerProfile[] {
    const profiles: PlayerProfile[] = [];
    
    for (let i = 0; i < count; i++) {
      profiles.push({
        id: `player-${i + 1}`,
        name: this.playerNames[i] || `Player${i + 1}`,
        skillLevel: this.getRandomSkillLevel(),
        preferredRoles: this.getRandomPreferredRoles(),
        playStyle: this.getRandomPlayStyle(),
        responseTime: this.getRandomResponseTime()
      });
    }
    
    return profiles;
  }

  /**
   * Generate mock data
   */
  generateMockData(): MockData {
    const rooms = this.generateMockRooms();
    const players = this.generatePlayerProfiles(10);
    const gameStates = this.generateMockGameStates();
    const missionResults = this.generateMockMissionResults();

    return {
      rooms,
      players,
      gameStates,
      missionResults
    };
  }

  /**
   * Generate mission sizes for player count
   */
  getMissionSizes(playerCount: number): number[] {
    return this.missionSizesByPlayerCount[playerCount as keyof typeof this.missionSizesByPlayerCount] || 
           this.missionSizesByPlayerCount[5];
  }

  /**
   * Generate random game data
   */
  generateRandomGameData(): any {
    return {
      roomId: this.generateRandomId(),
      playerCount: this.getRandomNumber(5, 10),
      gamePhase: this.getRandomGamePhase(),
      currentMission: this.getRandomNumber(1, 5),
      missionResults: this.generateRandomMissionResults()
    };
  }

  /**
   * Generate test user data
   */
  generateTestUserData(): any {
    return {
      userId: this.generateRandomId(),
      username: this.getRandomPlayerName(),
      email: `test-${this.generateRandomId()}@example.com`,
      preferences: {
        theme: 'light',
        notifications: true,
        soundEnabled: true
      }
    };
  }

  // Private helper methods
  private generateStandardGameScenario(): TestScenario {
    return {
      id: 'standard-5-player',
      name: 'Standard 5-Player Game',
      description: 'Complete 5-player game with standard roles',
      priority: 'high',
      category: 'core',
      players: 5,
      roles: this.rolesByPlayerCount[5],
      missions: this.missionSizesByPlayerCount[5],
      expectedDuration: '15-20 minutes',
      steps: [
        {
          id: 'create-room',
          description: 'Create game room',
          action: 'createRoom',
          data: { name: 'Test Room' }
        },
        {
          id: 'add-players',
          description: 'Add 5 players',
          action: 'addPlayers',
          data: { count: 5 }
        },
        {
          id: 'start-game',
          description: 'Start the game',
          action: 'startGame'
        }
      ],
      validation: [
        {
          type: 'element',
          selector: '[data-testid="game-board"]',
          expected: true,
          comparison: 'exists'
        },
        {
          type: 'state',
          expected: 'playing',
          comparison: 'equals'
        }
      ]
    };
  }

  private generateLargeGameScenario(): TestScenario {
    return {
      id: 'large-10-player',
      name: 'Large 10-Player Game',
      description: 'Complete 10-player game with all roles',
      priority: 'high',
      category: 'core',
      players: 10,
      roles: this.rolesByPlayerCount[10],
      missions: this.missionSizesByPlayerCount[10],
      expectedDuration: '25-30 minutes',
      steps: [
        {
          id: 'create-room',
          description: 'Create game room',
          action: 'createRoom',
          data: { name: 'Large Test Room' }
        },
        {
          id: 'add-players',
          description: 'Add 10 players',
          action: 'addPlayers',
          data: { count: 10 }
        },
        {
          id: 'start-game',
          description: 'Start the game',
          action: 'startGame'
        }
      ],
      validation: [
        {
          type: 'element',
          selector: '[data-testid="player-card"]',
          expected: 10,
          comparison: 'equals'
        }
      ]
    };
  }

  private generateQuickGameScenario(): TestScenario {
    return {
      id: 'quick-game',
      name: 'Quick Game Flow',
      description: 'Fast-paced game for performance testing',
      priority: 'medium',
      category: 'performance',
      players: 5,
      roles: this.rolesByPlayerCount[5],
      missions: this.missionSizesByPlayerCount[5],
      expectedDuration: '5-10 minutes',
      steps: [],
      validation: [
        {
          type: 'performance',
          expected: 5000,
          comparison: 'less'
        }
      ]
    };
  }

  private generateDisconnectionScenario(): TestScenario {
    return {
      id: 'disconnection-test',
      name: 'Player Disconnection Test',
      description: 'Test handling of player disconnections',
      priority: 'high',
      category: 'integration',
      players: 6,
      roles: this.rolesByPlayerCount[6],
      missions: this.missionSizesByPlayerCount[6],
      expectedDuration: '20-25 minutes',
      steps: [
        {
          id: 'disconnect-player',
          description: 'Disconnect a player',
          action: 'disconnectPlayer',
          data: { playerId: 'player-3' }
        },
        {
          id: 'reconnect-player',
          description: 'Reconnect the player',
          action: 'reconnectPlayer',
          data: { playerId: 'player-3' },
          wait: 5000
        }
      ],
      validation: [
        {
          type: 'state',
          expected: 'reconnected',
          comparison: 'equals'
        }
      ]
    };
  }

  private generatePerformanceScenario(): TestScenario {
    return {
      id: 'performance-test',
      name: 'Performance Test',
      description: 'Test performance under load',
      priority: 'medium',
      category: 'performance',
      players: 8,
      roles: this.rolesByPlayerCount[8],
      missions: this.missionSizesByPlayerCount[8],
      expectedDuration: '30-35 minutes',
      steps: [],
      validation: [
        {
          type: 'performance',
          expected: 3000,
          comparison: 'less'
        }
      ]
    };
  }

  private generateMockRooms(): MockRoom[] {
    return [
      {
        id: 'room-1',
        name: 'Test Room 1',
        hostId: 'player-1',
        players: ['player-1', 'player-2', 'player-3', 'player-4', 'player-5'],
        settings: this.generateGameSettings(5),
        status: 'waiting'
      },
      {
        id: 'room-2',
        name: 'Test Room 2',
        hostId: 'player-6',
        players: ['player-6', 'player-7', 'player-8'],
        settings: this.generateGameSettings(3),
        status: 'waiting'
      }
    ];
  }

  private generateMockGameStates(): MockGameState[] {
    return [
      {
        roomId: 'room-1',
        currentPhase: 'team-selection',
        currentMission: 1,
        roles: {
          'player-1': 'Merlin',
          'player-2': 'Percival',
          'player-3': 'Loyal Servant',
          'player-4': 'Assassin',
          'player-5': 'Morgana'
        },
        missionResults: []
      }
    ];
  }

  private generateMockMissionResults(): MockMissionResult[] {
    return [
      {
        missionNumber: 1,
        team: ['player-1', 'player-2'],
        result: 'success',
        votes: {
          'player-1': 'approve',
          'player-2': 'approve',
          'player-3': 'approve',
          'player-4': 'reject',
          'player-5': 'reject'
        },
        actions: {
          'player-1': 'success',
          'player-2': 'success'
        }
      }
    ];
  }

  private getRandomSkillLevel(): 'beginner' | 'intermediate' | 'advanced' {
    const levels = ['beginner', 'intermediate', 'advanced'] as const;
    const index = Math.floor(Math.random() * levels.length);
    return levels[index]!;
  }

  private getRandomPreferredRoles(): string[] {
    const allRoles = ['Merlin', 'Percival', 'Loyal Servant', 'Assassin', 'Morgana', 'Mordred', 'Oberon'];
    const count = Math.floor(Math.random() * 3) + 1;
    return allRoles.slice(0, count);
  }

  private getRandomPlayStyle(): 'aggressive' | 'defensive' | 'balanced' {
    const styles = ['aggressive', 'defensive', 'balanced'] as const;
    const index = Math.floor(Math.random() * styles.length);
    return styles[index]!;
  }

  private getRandomResponseTime(): number {
    return Math.floor(Math.random() * 5000) + 1000; // 1-6 seconds
  }

  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getRandomGamePhase(): string {
    const phases = ['lobby', 'role-reveal', 'team-selection', 'voting', 'mission', 'results'];
    const index = Math.floor(Math.random() * phases.length);
    return phases[index]!;
  }

  private generateRandomMissionResults(): string[] {
    const results = ['success', 'failure'];
    const count = Math.floor(Math.random() * 5) + 1;
    return Array.from({ length: count }, () => {
      const index = Math.floor(Math.random() * results.length);
      return results[index]!;
    });
  }

  private generateRandomId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getRandomPlayerName(): string {
    const index = Math.floor(Math.random() * this.playerNames.length);
    return this.playerNames[index]!;
  }
}
