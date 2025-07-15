export interface Role {
  id: string;
  name: string;
  team: 'good' | 'evil';
  description: string;
  abilities: string[];
  seesEvil: boolean;
  seenByMerlin: boolean;
  isAssassin: boolean;
}

export interface RoleAssignment {
  playerId: string;
  roleId: string;
  assignedAt: Date;
}

export interface RoleConfiguration {
  playerCount: number;
  roles: Role[];
  requirements: RoleRequirement[];
}

export interface RoleRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  satisfied: boolean;
}

// Standard Avalon roles
export const AVALON_ROLES: Record<string, Role> = {
  merlin: {
    id: 'merlin',
    name: 'Merlin',
    team: 'good',
    description: 'Knows all evil players except Mordred',
    abilities: ['Can see evil players', 'Cannot reveal identity'],
    seesEvil: true,
    seenByMerlin: false,
    isAssassin: false,
  },
  percival: {
    id: 'percival',
    name: 'Percival',
    team: 'good',
    description: 'Knows Merlin and Morgana',
    abilities: ['Can see Merlin and Morgana'],
    seesEvil: false,
    seenByMerlin: false,
    isAssassin: false,
  },
  servant: {
    id: 'servant',
    name: 'Loyal Servant of Arthur',
    team: 'good',
    description: 'Standard good player with no special abilities',
    abilities: [],
    seesEvil: false,
    seenByMerlin: false,
    isAssassin: false,
  },
  assassin: {
    id: 'assassin',
    name: 'Assassin',
    team: 'evil',
    description: 'Can kill Merlin at game end',
    abilities: ['Can assassinate Merlin', 'Knows other evil players'],
    seesEvil: true,
    seenByMerlin: true,
    isAssassin: true,
  },
  morgana: {
    id: 'morgana',
    name: 'Morgana',
    team: 'evil',
    description: 'Appears as Merlin to Percival',
    abilities: ['Appears as Merlin to Percival', 'Knows other evil players'],
    seesEvil: true,
    seenByMerlin: true,
    isAssassin: false,
  },
  mordred: {
    id: 'mordred',
    name: 'Mordred',
    team: 'evil',
    description: 'Hidden from Merlin',
    abilities: ['Hidden from Merlin', 'Knows other evil players'],
    seesEvil: true,
    seenByMerlin: false,
    isAssassin: false,
  },
  oberon: {
    id: 'oberon',
    name: 'Oberon',
    team: 'evil',
    description: 'Unknown to other evil players',
    abilities: ['Unknown to other evil players'],
    seesEvil: false,
    seenByMerlin: true,
    isAssassin: false,
  },
  minion: {
    id: 'minion',
    name: 'Minion of Mordred',
    team: 'evil',
    description: 'Standard evil player',
    abilities: ['Knows other evil players (except Oberon)'],
    seesEvil: true,
    seenByMerlin: true,
    isAssassin: false,
  },
};
