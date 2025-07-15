export interface Room {
  id: string;
  code: string;
  hostId: string;
  players: Player[];
  gameState: GameState;
  settings: GameSettings;
  phase: string;
  startedAt?: Date;
  maxPlayers: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  role?: string;
  roleData?: RoleData;
  isReady: boolean;
  joinedAt: Date;
  roomId: string;
  sessionId?: string;
}

export interface RoleData {
  roleId: string;
  assignedAt: Date;
  visiblePlayers: VisiblePlayer[];
  abilities: string[];
  seesEvil: boolean;
  seenByMerlin: boolean;
  isAssassin: boolean;
}

export interface VisiblePlayer {
  playerId: string;
  roleId: string;
  name: string;
}

export interface GameState {
  phase: 'lobby' | 'roleReveal' | 'voting' | 'missionSelect' | 'missionVote' | 'missionResult' | 'assassinAttempt' | 'gameOver';
  round: number;
  leaderIndex: number;
  startedAt?: Date;
  votes: Vote[];
  missions: Mission[];
  assassinAttempt?: AssassinAttempt;
}

export interface Vote {
  playerId: string;
  vote: 'approve' | 'reject';
  round: number;
  votedAt: Date;
}

export interface Mission {
  id: string;
  round: number;
  teamSize: number;
  teamMembers: string[];
  votes: MissionVote[];
  result?: 'success' | 'failure';
  completedAt?: Date;
}

export interface MissionVote {
  playerId: string;
  vote: 'success' | 'failure';
  votedAt: Date;
}

export interface AssassinAttempt {
  assassinId: string;
  targetId: string;
  success: boolean;
  attemptedAt: Date;
}

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

export interface JoinRoomRequest {
  roomCode: string;
  playerName: string;
  sessionId?: string;
}

export interface JoinRoomResponse {
  success: boolean;
  room: Room;
  player: Player;
  error?: string;
}
