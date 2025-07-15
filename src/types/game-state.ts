export interface GameState {
  phase: GamePhase;
  round: number;
  leaderIndex: number;
  startedAt?: Date;
  votes: Vote[];
  missions: Mission[];
  assassinAttempt?: AssassinAttempt;
}

export type GamePhase = 
  | 'lobby' 
  | 'roleReveal' 
  | 'voting' 
  | 'missionSelect' 
  | 'missionVote' 
  | 'missionResult' 
  | 'assassinAttempt' 
  | 'gameOver';

export interface StartRequirement {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'satisfied' | 'failed';
  required: boolean;
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

export interface GameStartStatus {
  status: 'idle' | 'starting' | 'assigning-roles' | 'complete' | 'error';
  progress: number;
  message: string;
  error?: string;
}

export interface PlayerReadyStatus {
  playerId: string;
  isReady: boolean;
  isHost: boolean;
  name: string;
}
