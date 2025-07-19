import type { DemoGameState, DemoMission, DemoPlayer } from './types';
import { validateDemoGameState, ensureDemoEnvironment } from './validation';

/**
 * Demo game data for testing game flow scenarios
 * All data is marked with _brand: 'demo' and validated
 */

ensureDemoEnvironment();

/**
 * Standard 5-player game in lobby phase
 */
export const DEMO_LOBBY_STATE: DemoGameState = {
  _brand: 'demo',
  id: 'demo-lobby-001',
  roomCode: 'DEMO01',
  phase: 'lobby',
  players: [
    {
      _brand: 'demo',
      id: 'demo-player-1',
      name: 'Alice',
      role: 'merlin',
      isHost: true,
      isReady: true,
      connectionStatus: 'connected',
    },
    {
      _brand: 'demo',
      id: 'demo-player-2',
      name: 'Bob',
      role: 'good',
      isHost: false,
      isReady: true,
      connectionStatus: 'connected',
    },
    {
      _brand: 'demo',
      id: 'demo-player-3',
      name: 'Charlie',
      role: 'good',
      isHost: false,
      isReady: false,
      connectionStatus: 'connected',
    },
    {
      _brand: 'demo',
      id: 'demo-player-4',
      name: 'Diana',
      role: 'assassin',
      isHost: false,
      isReady: true,
      connectionStatus: 'connected',
    },
    {
      _brand: 'demo',
      id: 'demo-player-5',
      name: 'Eve',
      role: 'evil',
      isHost: false,
      isReady: true,
      connectionStatus: 'connected',
    },
  ],
  missions: [
    {
      _brand: 'demo',
      id: 'demo-mission-1',
      number: 1,
      requiredPlayers: 2,
      status: 'pending',
      selectedPlayers: [],
      votes: [],
      failVotesRequired: 1,
    },
    {
      _brand: 'demo',
      id: 'demo-mission-2',
      number: 2,
      requiredPlayers: 3,
      status: 'pending',
      selectedPlayers: [],
      votes: [],
      failVotesRequired: 1,
    },
    {
      _brand: 'demo',
      id: 'demo-mission-3',
      number: 3,
      requiredPlayers: 2,
      status: 'pending',
      selectedPlayers: [],
      votes: [],
      failVotesRequired: 1,
    },
    {
      _brand: 'demo',
      id: 'demo-mission-4',
      number: 4,
      requiredPlayers: 3,
      status: 'pending',
      selectedPlayers: [],
      votes: [],
      failVotesRequired: 1,
    },
    {
      _brand: 'demo',
      id: 'demo-mission-5',
      number: 5,
      requiredPlayers: 3,
      status: 'pending',
      selectedPlayers: [],
      votes: [],
      failVotesRequired: 1,
    },
  ],
  currentMission: 1,
  hostId: 'demo-player-1',
  settings: {
    playerCount: 5,
    includeMerlin: true,
    includePercival: false,
    includeMorgana: false,
    includeMordred: false,
    includeOberon: false,
  },
};

/**
 * Game in progress - team selection phase
 */
export const DEMO_TEAM_SELECTION_STATE: DemoGameState = {
  ...DEMO_LOBBY_STATE,
  id: 'demo-team-selection-001',
  roomCode: 'DEMO02',
  phase: 'team-selection',
  players: DEMO_LOBBY_STATE.players.map(p => ({ ...p, isReady: true })),
};

/**
 * Game in progress - mission voting phase
 */
export const DEMO_MISSION_VOTING_STATE: DemoGameState = {
  ...DEMO_TEAM_SELECTION_STATE,
  id: 'demo-mission-voting-001',
  roomCode: 'DEMO03',
  phase: 'mission-voting',
  missions: DEMO_TEAM_SELECTION_STATE.missions.map((mission, index) => 
    index === 0 
      ? {
          ...mission,
          status: 'in-progress' as const,
          selectedPlayers: ['demo-player-1', 'demo-player-2'],
        }
      : mission
  ),
};

/**
 * Endgame scenario - assassination phase
 */
export const DEMO_ASSASSINATION_STATE: DemoGameState = {
  ...DEMO_LOBBY_STATE,
  id: 'demo-assassination-001',
  roomCode: 'DEMO04',
  phase: 'game-end',
  missions: [
    {
      _brand: 'demo',
      id: 'demo-mission-1',
      number: 1,
      requiredPlayers: 2,
      status: 'success',
      selectedPlayers: ['demo-player-1', 'demo-player-2'],
      votes: [
        { playerId: 'demo-player-1', vote: 'success' },
        { playerId: 'demo-player-2', vote: 'success' },
      ],
      failVotesRequired: 1,
    },
    {
      _brand: 'demo',
      id: 'demo-mission-2',
      number: 2,
      requiredPlayers: 3,
      status: 'success',
      selectedPlayers: ['demo-player-2', 'demo-player-3', 'demo-player-5'],
      votes: [
        { playerId: 'demo-player-2', vote: 'success' },
        { playerId: 'demo-player-3', vote: 'success' },
        { playerId: 'demo-player-5', vote: 'success' },
      ],
      failVotesRequired: 1,
    },
    {
      _brand: 'demo',
      id: 'demo-mission-3',
      number: 3,
      requiredPlayers: 2,
      status: 'success',
      selectedPlayers: ['demo-player-1', 'demo-player-3'],
      votes: [
        { playerId: 'demo-player-1', vote: 'success' },
        { playerId: 'demo-player-3', vote: 'success' },
      ],
      failVotesRequired: 1,
    },
    {
      _brand: 'demo',
      id: 'demo-mission-4',
      number: 4,
      requiredPlayers: 3,
      status: 'pending',
      selectedPlayers: [],
      votes: [],
      failVotesRequired: 1,
    },
    {
      _brand: 'demo',
      id: 'demo-mission-5',
      number: 5,
      requiredPlayers: 3,
      status: 'pending',
      selectedPlayers: [],
      votes: [],
      failVotesRequired: 1,
    },
  ],
  currentMission: 4,
};

/**
 * Large game scenario - 10 players with all roles
 */
export const DEMO_LARGE_GAME_STATE: DemoGameState = {
  _brand: 'demo',
  id: 'demo-large-game-001',
  roomCode: 'DEMO10',
  phase: 'role-reveal',
  players: [
    {
      _brand: 'demo',
      id: 'demo-player-1',
      name: 'Alice',
      role: 'merlin',
      isHost: true,
      isReady: true,
      connectionStatus: 'connected',
    },
    {
      _brand: 'demo',
      id: 'demo-player-2',
      name: 'Bob',
      role: 'percival',
      isHost: false,
      isReady: true,
      connectionStatus: 'connected',
    },
    {
      _brand: 'demo',
      id: 'demo-player-3',
      name: 'Charlie',
      role: 'good',
      isHost: false,
      isReady: true,
      connectionStatus: 'connected',
    },
    {
      _brand: 'demo',
      id: 'demo-player-4',
      name: 'Diana',
      role: 'good',
      isHost: false,
      isReady: true,
      connectionStatus: 'connected',
    },
    {
      _brand: 'demo',
      id: 'demo-player-5',
      name: 'Eve',
      role: 'good',
      isHost: false,
      isReady: true,
      connectionStatus: 'connected',
    },
    {
      _brand: 'demo',
      id: 'demo-player-6',
      name: 'Frank',
      role: 'good',
      isHost: false,
      isReady: true,
      connectionStatus: 'connected',
    },
    {
      _brand: 'demo',
      id: 'demo-player-7',
      name: 'Grace',
      role: 'assassin',
      isHost: false,
      isReady: true,
      connectionStatus: 'connected',
    },
    {
      _brand: 'demo',
      id: 'demo-player-8',
      name: 'Henry',
      role: 'morgana',
      isHost: false,
      isReady: true,
      connectionStatus: 'connected',
    },
    {
      _brand: 'demo',
      id: 'demo-player-9',
      name: 'Iris',
      role: 'mordred',
      isHost: false,
      isReady: true,
      connectionStatus: 'connected',
    },
    {
      _brand: 'demo',
      id: 'demo-player-10',
      name: 'Jack',
      role: 'oberon',
      isHost: false,
      isReady: true,
      connectionStatus: 'connected',
    },
  ],
  missions: [
    {
      _brand: 'demo',
      id: 'demo-mission-1',
      number: 1,
      requiredPlayers: 3,
      status: 'pending',
      selectedPlayers: [],
      votes: [],
      failVotesRequired: 1,
    },
    {
      _brand: 'demo',
      id: 'demo-mission-2',
      number: 2,
      requiredPlayers: 4,
      status: 'pending',
      selectedPlayers: [],
      votes: [],
      failVotesRequired: 1,
    },
    {
      _brand: 'demo',
      id: 'demo-mission-3',
      number: 3,
      requiredPlayers: 4,
      status: 'pending',
      selectedPlayers: [],
      votes: [],
      failVotesRequired: 1,
    },
    {
      _brand: 'demo',
      id: 'demo-mission-4',
      number: 4,
      requiredPlayers: 5,
      status: 'pending',
      selectedPlayers: [],
      votes: [],
      failVotesRequired: 2,
    },
    {
      _brand: 'demo',
      id: 'demo-mission-5',
      number: 5,
      requiredPlayers: 5,
      status: 'pending',
      selectedPlayers: [],
      votes: [],
      failVotesRequired: 1,
    },
  ],
  currentMission: 1,
  hostId: 'demo-player-1',
  settings: {
    playerCount: 10,
    includeMerlin: true,
    includePercival: true,
    includeMorgana: true,
    includeMordred: true,
    includeOberon: true,
  },
};

/**
 * Disconnection scenario for testing reconnection flows
 */
export const DEMO_DISCONNECTION_STATE: DemoGameState = {
  ...DEMO_MISSION_VOTING_STATE,
  id: 'demo-disconnection-001',
  roomCode: 'DEMO05',
  players: DEMO_MISSION_VOTING_STATE.players.map((player, index) => 
    index === 2 
      ? { ...player, connectionStatus: 'disconnected' as const }
      : index === 3
      ? { ...player, connectionStatus: 'reconnecting' as const }
      : player
  ),
};

// Validate all demo states
validateDemoGameState(DEMO_LOBBY_STATE);
validateDemoGameState(DEMO_TEAM_SELECTION_STATE);
validateDemoGameState(DEMO_MISSION_VOTING_STATE);
validateDemoGameState(DEMO_ASSASSINATION_STATE);
validateDemoGameState(DEMO_LARGE_GAME_STATE);
validateDemoGameState(DEMO_DISCONNECTION_STATE);
