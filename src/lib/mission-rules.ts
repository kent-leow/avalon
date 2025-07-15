import { type Mission, type MissionRules, type MissionRequirements, type MissionValidation, type MissionPlayer } from "~/types/mission";

/**
 * Official Avalon mission rules by player count
 */
export const MISSION_RULES: MissionRules = {
  playerCounts: {
    5: [2, 3, 2, 3, 3],
    6: [2, 3, 4, 3, 4],
    7: [2, 3, 3, 4, 4],
    8: [3, 4, 4, 5, 5],
    9: [3, 4, 4, 5, 5],
    10: [3, 4, 4, 5, 5],
  },
  failsRequired: {
    5: [1, 1, 1, 1, 1],
    6: [1, 1, 1, 1, 1],
    7: [1, 1, 1, 2, 1],
    8: [1, 1, 1, 2, 1],
    9: [1, 1, 1, 2, 1],
    10: [1, 1, 1, 2, 1],
  },
  specialRules: {
    "double-fail": {
      rounds: [4], // 4th mission (index 3) requires 2 fails for 7+ players
      description: "This mission requires 2 fails to be rejected",
    },
  },
};

/**
 * Get mission requirements for a specific round and player count
 */
export function getMissionRequirements(
  round: number,
  totalPlayers: number
): MissionRequirements {
  const playerCounts = MISSION_RULES.playerCounts[totalPlayers];
  const failsRequired = MISSION_RULES.failsRequired[totalPlayers];
  
  if (!playerCounts || !failsRequired) {
    throw new Error(`Invalid player count: ${totalPlayers}`);
  }
  
  if (round < 1 || round > 5) {
    throw new Error(`Invalid round: ${round}`);
  }
  
  const requiredPlayers = playerCounts[round - 1]!;
  const requiredFails = failsRequired[round - 1]!;
  const specialRules: string[] = [];
  
  // Check for special rules
  if (round === 4 && totalPlayers >= 7) {
    const doubleFailRule = MISSION_RULES.specialRules["double-fail"];
    if (doubleFailRule) {
      specialRules.push(doubleFailRule.description);
    }
  }
  
  return {
    round,
    requiredPlayers,
    failsRequired: requiredFails,
    description: `Mission ${round} requires ${requiredPlayers} players`,
    specialRules,
  };
}

/**
 * Validate a team selection
 */
export function validateTeamSelection(
  selectedPlayerIds: string[],
  requiredPlayers: number,
  availablePlayerIds: string[]
): MissionValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if correct number of players selected
  if (selectedPlayerIds.length !== requiredPlayers) {
    errors.push(`Must select exactly ${requiredPlayers} players (currently selected: ${selectedPlayerIds.length})`);
  }
  
  // Check if all selected players are available
  const invalidPlayers = selectedPlayerIds.filter(id => !availablePlayerIds.includes(id));
  if (invalidPlayers.length > 0) {
    errors.push(`Invalid players selected: ${invalidPlayers.join(', ')}`);
  }
  
  // Check for duplicate selections
  const uniqueSelections = new Set(selectedPlayerIds);
  if (uniqueSelections.size !== selectedPlayerIds.length) {
    errors.push('Cannot select the same player multiple times');
  }
  
  // Warnings for strategic considerations
  if (selectedPlayerIds.length > 0 && selectedPlayerIds.length < requiredPlayers) {
    warnings.push(`Still need to select ${requiredPlayers - selectedPlayerIds.length} more players`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get the next leader index (round-robin)
 */
export function getNextLeaderIndex(currentLeaderIndex: number, totalPlayers: number): number {
  return (currentLeaderIndex + 1) % totalPlayers;
}

/**
 * Check if a player can be selected for a mission
 */
export function canSelectPlayer(
  playerId: string,
  selectedPlayerIds: string[],
  maxSelections: number
): boolean {
  // If already selected, can always deselect
  if (selectedPlayerIds.includes(playerId)) {
    return true;
  }
  
  // If at max selections, cannot select more
  if (selectedPlayerIds.length >= maxSelections) {
    return false;
  }
  
  return true;
}

/**
 * Create a mission object with proper defaults
 */
export function createMission(
  round: number,
  totalPlayers: number,
  leaderIndex: number
): Mission {
  const requirements = getMissionRequirements(round, totalPlayers);
  
  return {
    id: `mission-${round}-${Date.now()}`,
    round,
    requiredPlayers: requirements.requiredPlayers,
    failsRequired: requirements.failsRequired,
    leaderIndex,
    description: requirements.description,
    specialRules: requirements.specialRules,
  };
}

/**
 * Mock data for development and testing
 */
export const mockMissionData = {
  mission: createMission(1, 7, 0),
  players: [
    { id: '1', name: 'Arthur', role: 'servant', isOnline: true, isLeader: true },
    { id: '2', name: 'Merlin', role: 'merlin', isOnline: true },
    { id: '3', name: 'Percival', role: 'percival', isOnline: true },
    { id: '4', name: 'Morgana', role: 'morgana', isOnline: true },
    { id: '5', name: 'Mordred', role: 'mordred', isOnline: true },
    { id: '6', name: 'Assassin', role: 'assassin', isOnline: true },
    { id: '7', name: 'Oberon', role: 'oberon', isOnline: true },
  ],
  selectedPlayerIds: ['1', '2'],
};

/**
 * Validates a proposed mission team
 * @param teamIds - Array of player IDs in the proposed team
 * @param mission - Current mission data
 * @param players - Array of all players in the game
 * @returns Validation result with success/error information
 */
export function validateMissionTeam(
  teamIds: string[],
  mission: Mission,
  players: MissionPlayer[]
): { success: boolean; error?: string } {
  // Check if team size matches required size
  if (teamIds.length !== mission.requiredPlayers) {
    return {
      success: false,
      error: `Team must have exactly ${mission.requiredPlayers} players`
    };
  }

  // Check if all team members are valid players
  const validPlayerIds = new Set(players.map(p => p.id));
  for (const playerId of teamIds) {
    if (!validPlayerIds.has(playerId)) {
      return {
        success: false,
        error: `Invalid player ID: ${playerId}`
      };
    }
  }

  // Check for duplicate players
  const uniqueIds = new Set(teamIds);
  if (uniqueIds.size !== teamIds.length) {
    return {
      success: false,
      error: "Team cannot contain duplicate players"
    };
  }

  return { success: true };
}
