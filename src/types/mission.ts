export interface Mission {
  id: string;
  round: number;
  requiredPlayers: number;
  failsRequired: number;
  leaderIndex: number;
  description: string;
  specialRules?: string[];
}

export interface MissionPlayer {
  id: string;
  name: string;
  role?: string;
  isOnline: boolean;
  isLeader?: boolean;
}

export interface TeamSelection {
  missionId: string;
  selectedPlayerIds: string[];
  leaderId: string;
  submittedAt?: Date;
  status: 'drafting' | 'submitted' | 'approved' | 'rejected';
}

export interface MissionRequirements {
  round: number;
  requiredPlayers: number;
  failsRequired: number;
  description: string;
  specialRules: string[];
}

export interface MissionValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MissionRules {
  playerCounts: Record<number, number[]>; // playerCount -> [mission1, mission2, mission3, mission4, mission5]
  failsRequired: Record<number, number[]>; // playerCount -> [mission1, mission2, mission3, mission4, mission5]
  specialRules: Record<string, {
      rounds: number[];
      description: string;
    }>;
}

export interface PlayerSelectionState {
  selectedPlayerIds: string[];
  maxSelections: number;
  isValid: boolean;
  validationErrors: string[];
}
