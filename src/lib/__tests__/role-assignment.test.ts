import { assignRoles, validateRoleConfiguration, getStandardRoleConfiguration } from '../role-assignment';
import type { RoleAssignment } from '~/types/roles';
import type { Player } from '~/types/room';

// Mock crypto.getRandomValues for tests
Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: (arr: Uint32Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 0xFFFFFFFF);
      }
      return arr;
    },
  },
});

describe('Role Assignment', () => {
  const createMockPlayers = (count: number): Player[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `player${i + 1}`,
      name: `Player ${i + 1}`,
      isHost: i === 0,
      isReady: true,
      joinedAt: new Date(),
      roomId: 'test-room',
      sessionId: `session${i + 1}`,
    }));
  };

  test('should assign roles correctly for 5 players', () => {
    const players = createMockPlayers(5);
    const result = assignRoles(players);
    
    expect(result).toHaveLength(5);
    expect(result.every(r => r.playerId && r.roleId)).toBe(true);
    
    // Check that all player IDs are assigned
    const assignedPlayerIds = result.map(r => r.playerId).sort();
    const expectedPlayerIds = players.map(p => p.id).sort();
    expect(assignedPlayerIds).toEqual(expectedPlayerIds);
  });

  test('should assign roles correctly for 7 players', () => {
    const players = createMockPlayers(7);
    const result = assignRoles(players);
    
    expect(result).toHaveLength(7);
    
    // Check that all player IDs are assigned
    const assignedPlayerIds = result.map(r => r.playerId).sort();
    const expectedPlayerIds = players.map(p => p.id).sort();
    expect(assignedPlayerIds).toEqual(expectedPlayerIds);
  });

  test('should validate role configuration correctly', () => {
    const standardConfig = getStandardRoleConfiguration(5);
    const validation = validateRoleConfiguration(5, standardConfig);
    
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test('should detect invalid player count', () => {
    const validation = validateRoleConfiguration(3, ['merlin', 'assassin', 'servant']);
    
    expect(validation.valid).toBe(false);
    expect(validation.errors.some(e => e.includes('Invalid player count'))).toBe(true);
  });

  test('should detect role count mismatch', () => {
    const validation = validateRoleConfiguration(5, ['merlin', 'assassin']);
    
    expect(validation.valid).toBe(false);
    expect(validation.errors.some(e => e.includes('Role count'))).toBe(true);
  });

  test('should not assign duplicate roles', () => {
    const players = createMockPlayers(5);
    const result = assignRoles(players);
    
    const roleIds = result.map(r => r.roleId);
    const uniqueRoles = [...new Set(roleIds)];
    
    expect(roleIds.length).toBe(uniqueRoles.length);
  });

  test('should assign all player IDs correctly', () => {
    const players = createMockPlayers(6);
    const result = assignRoles(players);
    
    const assignedPlayerIds = result.map(r => r.playerId).sort();
    const expectedPlayerIds = players.map(p => p.id).sort();
    expect(assignedPlayerIds).toEqual(expectedPlayerIds);
  });

  test('should throw error for invalid player count', () => {
    const players = createMockPlayers(3);
    
    expect(() => assignRoles(players)).toThrow('Invalid player count');
  });

  test('should accept custom role selection', () => {
    const players = createMockPlayers(5);
    const customRoles = ['merlin', 'percival', 'servant', 'assassin', 'morgana'];
    const result = assignRoles(players, customRoles);
    
    expect(result).toHaveLength(5);
    const assignedRoles = result.map(r => r.roleId).sort();
    expect(assignedRoles).toEqual(customRoles.sort());
  });
});
