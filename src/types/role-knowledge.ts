export interface KnownPlayer {
  id: string;
  name: string;
  knowledgeType: 'role' | 'team' | 'ambiguous' | 'unknown';
  revealedRole?: string;
  revealedTeam?: 'good' | 'evil';
  isAmbiguous?: boolean;
  confidence: 'certain' | 'suspected' | 'unknown';
}

export interface RoleKnowledge {
  playerId: string;
  playerRole: Role;
  knownPlayers: KnownPlayer[];
  restrictions: string[];
  hints: string[];
}

export interface RoleRevealData {
  playerId: string;
  playerName: string;
  role: Role;
  team: 'good' | 'evil';
  knownPlayers: KnownPlayer[];
  timeRemaining?: number;
}

// Import Role type from existing types
import { type Role } from './roles';
