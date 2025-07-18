export interface Character {
  id: string;
  name: string;
  team: 'good' | 'evil';
  description: string;
  ability: string;
  dependencies: readonly string[]; // Required characters
  conflicts: readonly string[]; // Mutually exclusive characters
  requiredFor: readonly string[]; // Characters that require this one
  minPlayers: number;
  maxPlayers: number;
  allowMultiple?: boolean; // Whether multiple instances are allowed
  maxInstances?: number; // Maximum number of instances (only for allowMultiple: true)
  // Additional properties for specific characters
  seesEvil?: boolean;
  seenBy?: readonly string[];
  sees?: readonly string[];
  appearsTo?: readonly string[];
  hiddenFrom?: readonly string[];
  isolated?: boolean;
  canKill?: readonly string[];
}

export type CharacterCount = Record<string, number>;

export interface ValidationError {
  type: 'dependency' | 'conflict' | 'balance' | 'playerCount';
  message: string;
  characters: string[];
  severity: 'error' | 'warning';
}

// Official Avalon Character Rules
export const AVALON_CHARACTERS = {
  merlin: {
    id: 'merlin',
    name: 'Merlin',
    team: 'good' as const,
    description: 'Knows who the evil players are but must remain hidden',
    ability: 'Sees all evil players except Mordred',
    dependencies: [] as readonly string[],
    conflicts: [] as readonly string[],
    requiredFor: ['percival', 'assassin'] as readonly string[],
    minPlayers: 5,
    maxPlayers: 10,
    seesEvil: true,
    seenBy: ['percival', 'morgana'] as readonly string[]
  },
  percival: {
    id: 'percival',
    name: 'Percival',
    team: 'good' as const,
    description: 'Knows who Merlin is but cannot distinguish from Morgana',
    ability: 'Sees Merlin and Morgana but cannot tell them apart',
    dependencies: ['merlin', 'morgana'] as readonly string[],
    conflicts: [] as readonly string[],
    requiredFor: [] as readonly string[],
    minPlayers: 7,
    maxPlayers: 10,
    sees: ['merlin', 'morgana'] as readonly string[] // Cannot distinguish
  },
  morgana: {
    id: 'morgana',
    name: 'Morgana',
    team: 'evil' as const,
    description: 'Appears as Merlin to Percival',
    ability: 'Appears as Merlin to Percival',
    dependencies: [] as readonly string[],
    conflicts: [] as readonly string[],
    requiredFor: ['percival'] as readonly string[],
    minPlayers: 7,
    maxPlayers: 10,
    appearsTo: ['percival'] as readonly string[] // Appears as Merlin
  },
  mordred: {
    id: 'mordred',
    name: 'Mordred',
    team: 'evil' as const,
    description: 'Hidden from Merlin\'s sight',
    ability: 'Unknown to Merlin',
    dependencies: ['merlin'] as readonly string[],
    conflicts: [] as readonly string[],
    requiredFor: [] as readonly string[],
    minPlayers: 7,
    maxPlayers: 10,
    hiddenFrom: ['merlin'] as readonly string[] // Hidden from Merlin's sight
  },
  oberon: {
    id: 'oberon',
    name: 'Oberon',
    team: 'evil' as const,
    description: 'Isolated from other evil players',
    ability: 'Does not know other evil players and they do not know him',
    dependencies: [] as readonly string[],
    conflicts: [] as readonly string[],
    requiredFor: [] as readonly string[],
    minPlayers: 7,
    maxPlayers: 10,
    isolated: true // Doesn't see other evil, they don't see him
  },
  assassin: {
    id: 'assassin',
    name: 'Assassin',
    team: 'evil' as const,
    description: 'Can attempt to kill Merlin at the end of the game',
    ability: 'If good wins, can attempt to assassinate Merlin',
    dependencies: ['merlin'] as readonly string[],
    conflicts: [] as readonly string[],
    requiredFor: [] as readonly string[],
    minPlayers: 5,
    maxPlayers: 10,
    canKill: ['merlin'] as readonly string[] // Can attempt to kill Merlin
  },
  loyal: {
    id: 'loyal',
    name: 'Loyal Servant of Arthur',
    team: 'good' as const,
    description: 'Standard good role with no special abilities',
    ability: 'No special abilities',
    dependencies: [] as readonly string[],
    conflicts: [] as readonly string[],
    requiredFor: [] as readonly string[],
    minPlayers: 5,
    maxPlayers: 10,
    allowMultiple: true,
    maxInstances: 6
  },
  minion: {
    id: 'minion',
    name: 'Minion of Mordred',
    team: 'evil' as const,
    description: 'Standard evil role with no special abilities',
    ability: 'Knows other evil players (except Oberon)',
    dependencies: [] as readonly string[],
    conflicts: [] as readonly string[],
    requiredFor: [] as readonly string[],
    minPlayers: 5,
    maxPlayers: 10,
    allowMultiple: true,
    maxInstances: 4
  }
} satisfies Record<string, Character>;

export type CharacterId = keyof typeof AVALON_CHARACTERS;

/**
 * Convert character array to character count object
 */
export function charactersToCount(characters: string[]): CharacterCount {
  const counts: CharacterCount = {};
  for (const char of characters) {
    counts[char] = (counts[char] || 0) + 1;
  }
  return counts;
}

/**
 * Convert character count object to character array
 */
export function countToCharacters(counts: CharacterCount): string[] {
  const characters: string[] = [];
  for (const [charId, count] of Object.entries(counts)) {
    for (let i = 0; i < count; i++) {
      characters.push(charId);
    }
  }
  return characters;
}
