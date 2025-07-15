export interface Room {
  id: string;
  code: string;
  hostId: string;
  players: Player[];
  gameState: GameState;
  settings: GameSettings;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  role?: string;
  joinedAt: Date;
  roomId: string;
  sessionId?: string;
}

export interface GameState {
  phase: 'lobby' | 'roleReveal' | 'voting' | 'mission' | 'gameOver';
  round: number;
  leaderIndex: number;
  votes: Vote[];
  missions: Mission[];
}

export interface Vote {
  id: string;
  playerId: string;
  vote: 'approve' | 'reject';
  round: number;
  timestamp: Date;
}

export interface Mission {
  id: string;
  round: number;
  teamMembers: string[];
  votes: MissionVote[];
  result: 'success' | 'fail' | 'pending';
  timestamp: Date;
}

export interface MissionVote {
  id: string;
  playerId: string;
  vote: 'success' | 'fail';
  timestamp: Date;
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
