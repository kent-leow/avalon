/**
 * TypeScript interfaces for demo data
 * Provides type safety for all demo scenarios and components
 */

export interface DemoPlayer {
  readonly _brand: 'demo';
  id: string;
  name: string;
  role: 'good' | 'evil' | 'merlin' | 'assassin' | 'percival' | 'morgana' | 'mordred' | 'oberon';
  isHost: boolean;
  isReady: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
}

export interface DemoMission {
  readonly _brand: 'demo';
  id: string;
  number: number;
  requiredPlayers: number;
  status: 'pending' | 'in-progress' | 'success' | 'failure';
  selectedPlayers: string[];
  votes: Array<{
    playerId: string;
    vote: 'success' | 'failure';
  }>;
  failVotesRequired: number;
}

export interface DemoGameState {
  readonly _brand: 'demo';
  id: string;
  roomCode: string;
  phase: 'lobby' | 'role-reveal' | 'team-selection' | 'mission-voting' | 'mission-execution' | 'game-end';
  players: DemoPlayer[];
  missions: DemoMission[];
  currentMission: number;
  hostId: string;
  settings: {
    playerCount: number;
    includeMerlin: boolean;
    includePercival: boolean;
    includeMorgana: boolean;
    includeMordred: boolean;
    includeOberon: boolean;
  };
  gameResult?: {
    winner: 'good' | 'evil';
    reason: 'missions' | 'assassination';
    assassinationTarget?: string;
  };
}

export interface DemoScenario {
  readonly _brand: 'demo';
  id: string;
  name: string;
  description: string;
  gameState: DemoGameState;
  category: 'standard' | 'large-game' | 'endgame' | 'mobile' | 'accessibility';
}

export interface DemoAccessibilityState {
  readonly _brand: 'demo';
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
}

export interface DemoMobileState {
  readonly _brand: 'demo';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  touchEnabled: boolean;
  viewportSize: {
    width: number;
    height: number;
  };
}

export type DemoDataType = 'game' | 'mobile' | 'accessibility' | 'realtime';
