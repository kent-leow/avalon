import { AVALON_CHARACTERS, type Character, type ValidationError, type CharacterId } from '~/types/characters';
import { type GameSettings, PLAYER_COUNT_CONFIGURATIONS } from '~/types/game-settings';

/**
 * Validate a character configuration for a given player count
 * @param settings Game settings to validate
 * @returns Array of validation errors
 */
export function validateCharacterConfiguration(settings: GameSettings): ValidationError[] {
  const errors: ValidationError[] = [];
  const { characters, playerCount } = settings;

  // Check if player count is valid
  if (playerCount < 5 || playerCount > 10) {
    errors.push({
      type: 'playerCount',
      message: `Player count must be between 5 and 10, got ${playerCount}`,
      characters: [],
      severity: 'error'
    });
    return errors;
  }

  // Check if character count matches player count
  if (characters.length !== playerCount) {
    errors.push({
      type: 'playerCount',
      message: `Character count (${characters.length}) must match player count (${playerCount})`,
      characters: [],
      severity: 'error'
    });
  }

  // Check team balance
  const teamBalance = validateTeamBalance(characters, playerCount);
  if (teamBalance) {
    errors.push(teamBalance);
  }

  // Check character dependencies
  const dependencyErrors = validateCharacterDependencies(characters);
  errors.push(...dependencyErrors);

  // Check character conflicts
  const conflictErrors = validateCharacterConflicts(characters);
  errors.push(...conflictErrors);

  // Check minimum player requirements
  const playerRequirementErrors = validatePlayerRequirements(characters, playerCount);
  errors.push(...playerRequirementErrors);

  return errors;
}

/**
 * Validate team balance for the given characters and player count
 */
function validateTeamBalance(characters: string[], playerCount: number): ValidationError | null {
  const config = PLAYER_COUNT_CONFIGURATIONS[playerCount as keyof typeof PLAYER_COUNT_CONFIGURATIONS];
  if (!config) {
    return {
      type: 'playerCount',
      message: `No configuration available for ${playerCount} players`,
      characters: [],
      severity: 'error'
    };
  }

  const goodCount = characters.filter(char => {
    const character = AVALON_CHARACTERS[char as CharacterId];
    return character && character.team === 'good';
  }).length;

  const evilCount = characters.filter(char => {
    const character = AVALON_CHARACTERS[char as CharacterId];
    return character && character.team === 'evil';
  }).length;

  if (goodCount !== config.good || evilCount !== config.evil) {
    return {
      type: 'balance',
      message: `Team balance incorrect. Need ${config.good} good and ${config.evil} evil players, got ${goodCount} good and ${evilCount} evil`,
      characters: [],
      severity: 'error'
    };
  }

  return null;
}

/**
 * Validate character dependencies
 */
function validateCharacterDependencies(characters: string[]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  for (const charId of characters) {
    const character = AVALON_CHARACTERS[charId as CharacterId];
    if (!character) continue;

    for (const dependency of character.dependencies) {
      if (!characters.includes(dependency)) {
        errors.push({
          type: 'dependency',
          message: `${character.name} requires ${AVALON_CHARACTERS[dependency as CharacterId]?.name || dependency} to be included`,
          characters: [charId, dependency],
          severity: 'error'
        });
      }
    }
  }

  return errors;
}

/**
 * Validate character conflicts
 */
function validateCharacterConflicts(characters: string[]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  for (const charId of characters) {
    const character = AVALON_CHARACTERS[charId as CharacterId];
    if (!character) continue;

    for (const conflict of character.conflicts) {
      if (characters.includes(conflict)) {
        errors.push({
          type: 'conflict',
          message: `${character.name} cannot be used with ${AVALON_CHARACTERS[conflict as CharacterId]?.name || conflict}`,
          characters: [charId, conflict],
          severity: 'error'
        });
      }
    }
  }

  return errors;
}

/**
 * Validate minimum player requirements for characters
 */
function validatePlayerRequirements(characters: string[], playerCount: number): ValidationError[] {
  const errors: ValidationError[] = [];
  
  for (const charId of characters) {
    const character = AVALON_CHARACTERS[charId as CharacterId];
    if (!character) continue;

    if (playerCount < character.minPlayers) {
      errors.push({
        type: 'playerCount',
        message: `${character.name} requires at least ${character.minPlayers} players`,
        characters: [charId],
        severity: 'error'
      });
    }

    if (playerCount > character.maxPlayers) {
      errors.push({
        type: 'playerCount',
        message: `${character.name} can only be used with up to ${character.maxPlayers} players`,
        characters: [charId],
        severity: 'error'
      });
    }
  }

  return errors;
}

/**
 * Check if a character configuration is valid
 */
export function isValidConfiguration(settings: GameSettings): boolean {
  const errors = validateCharacterConfiguration(settings);
  return errors.filter(error => error.severity === 'error').length === 0;
}

/**
 * Get recommended character configuration for a player count
 */
export function getRecommendedConfiguration(playerCount: number): string[] {
  const config = PLAYER_COUNT_CONFIGURATIONS[playerCount as keyof typeof PLAYER_COUNT_CONFIGURATIONS];
  return config?.recommended ? [...config.recommended] : [];
}

/**
 * Fix common configuration issues automatically
 */
export function autoFixConfiguration(settings: GameSettings): GameSettings {
  const { playerCount } = settings;
  const recommended = getRecommendedConfiguration(playerCount);
  
  if (recommended.length === 0) {
    return settings;
  }

  // If the current configuration is invalid, use the recommended one
  if (!isValidConfiguration(settings)) {
    return {
      ...settings,
      characters: recommended
    };
  }

  return settings;
}
