export interface GameSettings {
  characters: string[];
  playerCount: number;
  timeLimit?: number;
  allowSpectators: boolean;
  autoStart: boolean;
  customRules?: CustomRule[];
}

export interface CustomRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  characters: ['merlin', 'assassin', 'loyal', 'loyal', 'minion'],
  playerCount: 5,
  timeLimit: 300, // 5 minutes
  allowSpectators: false,
  autoStart: false,
  customRules: []
};

export const PLAYER_COUNT_CONFIGURATIONS = {
  5: {
    good: 3,
    evil: 2,
    recommended: ['merlin', 'assassin', 'loyal', 'loyal', 'minion']
  },
  6: {
    good: 4,
    evil: 2,
    recommended: ['merlin', 'assassin', 'loyal', 'loyal', 'loyal', 'minion']
  },
  7: {
    good: 4,
    evil: 3,
    recommended: ['merlin', 'percival', 'morgana', 'assassin', 'loyal', 'loyal', 'minion']
  },
  8: {
    good: 5,
    evil: 3,
    recommended: ['merlin', 'percival', 'morgana', 'assassin', 'loyal', 'loyal', 'loyal', 'minion']
  },
  9: {
    good: 6,
    evil: 3,
    recommended: ['merlin', 'percival', 'morgana', 'mordred', 'assassin', 'loyal', 'loyal', 'loyal', 'minion']
  },
  10: {
    good: 6,
    evil: 4,
    recommended: ['merlin', 'percival', 'morgana', 'mordred', 'oberon', 'assassin', 'loyal', 'loyal', 'loyal', 'minion']
  }
} as const;
