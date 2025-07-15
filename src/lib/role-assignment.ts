import { type Player } from "~/types/room";
import { type Role, type RoleAssignment, AVALON_ROLES } from "~/types/roles";

/**
 * Cryptographically secure random number generator
 */
function getSecureRandom(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0]! / (0xFFFFFFFF + 1);
}

/**
 * Cryptographically secure Fisher-Yates shuffle implementation
 */
function secureshuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(getSecureRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

/**
 * Standard role configurations for different player counts
 */
const ROLE_CONFIGURATIONS: Record<number, string[]> = {
  5: ['merlin', 'percival', 'servant', 'assassin', 'morgana'],
  6: ['merlin', 'percival', 'servant', 'servant', 'assassin', 'morgana'],
  7: ['merlin', 'percival', 'servant', 'servant', 'assassin', 'morgana', 'oberon'],
  8: ['merlin', 'percival', 'servant', 'servant', 'servant', 'assassin', 'morgana', 'minion'],
  9: ['merlin', 'percival', 'servant', 'servant', 'servant', 'servant', 'assassin', 'morgana', 'mordred'],
  10: ['merlin', 'percival', 'servant', 'servant', 'servant', 'servant', 'assassin', 'morgana', 'mordred', 'oberon'],
};

/**
 * Assigns roles to players based on game configuration
 */
export function assignRoles(
  players: Player[],
  selectedRoles?: string[]
): RoleAssignment[] {
  const playerCount = players.length;
  
  if (playerCount < 5 || playerCount > 10) {
    throw new Error(`Invalid player count: ${playerCount}. Must be between 5 and 10.`);
  }

  // Use custom roles if provided, otherwise use standard configuration
  const roleIds = selectedRoles ?? ROLE_CONFIGURATIONS[playerCount];
  
  if (!roleIds) {
    throw new Error(`No role configuration available for ${playerCount} players`);
  }

  if (roleIds.length !== playerCount) {
    throw new Error(`Role configuration mismatch: ${roleIds.length} roles for ${playerCount} players`);
  }

  // Validate all roles exist
  const invalidRoles = roleIds.filter(roleId => !(roleId in AVALON_ROLES));
  if (invalidRoles.length > 0) {
    throw new Error(`Invalid roles: ${invalidRoles.join(', ')}`);
  }

  // Shuffle players and roles independently for maximum randomness
  const shuffledPlayers = secureshuffle(players);
  const shuffledRoles = secureshuffle(roleIds);

  // Create role assignments
  const assignments: RoleAssignment[] = shuffledPlayers.map((player, index) => ({
    playerId: player.id,
    roleId: shuffledRoles[index]!,
    assignedAt: new Date(),
  }));

  return assignments;
}

/**
 * Validates role configuration for a given player count
 */
export function validateRoleConfiguration(
  playerCount: number,
  roleIds: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check player count
  if (playerCount < 5 || playerCount > 10) {
    errors.push(`Invalid player count: ${playerCount}. Must be between 5 and 10.`);
  }

  // Check role count matches player count
  if (roleIds.length !== playerCount) {
    errors.push(`Role count (${roleIds.length}) must match player count (${playerCount})`);
  }

  // Check all roles exist
  const invalidRoles = roleIds.filter(roleId => !(roleId in AVALON_ROLES));
  if (invalidRoles.length > 0) {
    errors.push(`Invalid roles: ${invalidRoles.join(', ')}`);
  }

  // Check required roles are present
  const roles = roleIds.map(id => AVALON_ROLES[id]!);
  const evilCount = roles.filter(role => role.team === 'evil').length;
  const goodCount = roles.filter(role => role.team === 'good').length;

  // Standard evil count requirements
  const requiredEvilCount = Math.ceil(playerCount / 3);
  if (evilCount !== requiredEvilCount) {
    errors.push(`Evil player count (${evilCount}) must be ${requiredEvilCount} for ${playerCount} players`);
  }

  // Must have exactly one Merlin
  const merlinCount = roles.filter(role => role.id === 'merlin').length;
  if (merlinCount !== 1) {
    errors.push(`Must have exactly one Merlin (found ${merlinCount})`);
  }

  // Must have exactly one Assassin
  const assassinCount = roles.filter(role => role.isAssassin).length;
  if (assassinCount !== 1) {
    errors.push(`Must have exactly one Assassin (found ${assassinCount})`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Gets the standard role configuration for a player count
 */
export function getStandardRoleConfiguration(playerCount: number): string[] {
  const configuration = ROLE_CONFIGURATIONS[playerCount];
  if (!configuration) {
    throw new Error(`No standard configuration for ${playerCount} players`);
  }
  return [...configuration];
}

/**
 * Gets role information by ID
 */
export function getRoleById(roleId: string): Role | undefined {
  return AVALON_ROLES[roleId];
}

/**
 * Gets all available roles
 */
export function getAllRoles(): Role[] {
  return Object.values(AVALON_ROLES);
}

/**
 * Checks if a player can see another player's role
 */
export function canSeeRole(viewerRole: Role, targetRole: Role): boolean {
  // Merlin can see all evil players except Mordred
  if (viewerRole.id === 'merlin' && targetRole.team === 'evil' && targetRole.id !== 'mordred') {
    return true;
  }

  // Percival can see Merlin and Morgana
  if (viewerRole.id === 'percival' && (targetRole.id === 'merlin' || targetRole.id === 'morgana')) {
    return true;
  }

  // Evil players can see each other (except Oberon)
  if (viewerRole.team === 'evil' && targetRole.team === 'evil' && 
      viewerRole.id !== 'oberon' && targetRole.id !== 'oberon') {
    return true;
  }

  return false;
}

/**
 * Gets the visible players for a given role
 */
export function getVisiblePlayers(
  viewerAssignment: RoleAssignment,
  allAssignments: RoleAssignment[]
): RoleAssignment[] {
  const viewerRole = AVALON_ROLES[viewerAssignment.roleId];
  if (!viewerRole) {
    return [];
  }

  return allAssignments.filter(assignment => {
    if (assignment.playerId === viewerAssignment.playerId) {
      return false; // Don't include self
    }

    const targetRole = AVALON_ROLES[assignment.roleId];
    if (!targetRole) {
      return false;
    }

    return canSeeRole(viewerRole, targetRole);
  });
}
