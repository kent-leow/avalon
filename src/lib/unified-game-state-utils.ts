import type { 
  UnifiedGameState, 
  StateConflict, 
  ConflictResolutionStrategy, 
  OptimisticUpdate,
  UpdateType,
  GameStateSnapshot,
  PersistenceConfig,
  GameStateError,
  GameStateMetadata,
  RealTimeGameData,
  MockGameStateOptions,
  MockConflictOptions,
  ConflictType,
  ConflictPriority,
  DebugInfo
} from '~/types/unified-game-state';
import type { GamePhase } from '~/types/game-state';
import type { Player } from '~/types/room';

/**
 * Unified Game State Management Utilities
 * 
 * Core utility functions for managing centralized game state,
 * conflict resolution, and state synchronization.
 */

// State validation and integrity
export function validateGameState(state: UnifiedGameState): boolean {
  if (!state.roomCode || !state.gameState || !state.players) {
    return false;
  }
  
  if (state.version < 0 || state.timestamp <= 0) {
    return false;
  }
  
  if (!state.checksum || state.checksum.length === 0) {
    return false;
  }
  
  return true;
}

export function calculateChecksum(state: UnifiedGameState): string {
  const stateString = JSON.stringify({
    roomCode: state.roomCode,
    gameState: state.gameState,
    players: state.players,
    version: state.version,
    timestamp: state.timestamp
  });
  
  return btoa(stateString).slice(0, 16);
}

export function verifyStateIntegrity(state: UnifiedGameState): boolean {
  const expectedChecksum = calculateChecksum(state);
  return expectedChecksum === state.checksum;
}

// Conflict detection and resolution
export function detectConflicts(
  currentState: UnifiedGameState,
  incomingState: UnifiedGameState
): StateConflict[] {
  const conflicts: StateConflict[] = [];
  
  // Version conflict
  if (currentState.version !== incomingState.version) {
    conflicts.push({
      id: `version-${Date.now()}`,
      type: 'version_mismatch',
      conflictingStates: [currentState, incomingState],
      priority: 'high',
      resolutionStrategy: 'last_writer_wins',
      timestamp: Date.now(),
      playerId: 'system',
      description: 'Version mismatch detected between states',
      affectedComponents: ['gameState', 'metadata']
    });
  }
  
  // Timestamp conflict
  if (Math.abs(currentState.timestamp - incomingState.timestamp) > 5000) {
    conflicts.push({
      id: `timestamp-${Date.now()}`,
      type: 'network_partition',
      conflictingStates: [currentState, incomingState],
      priority: 'medium',
      resolutionStrategy: 'merge_changes',
      timestamp: Date.now(),
      playerId: 'system',
      description: 'Timestamp difference suggests network partition',
      affectedComponents: ['metadata']
    });
  }
  
  // Player count conflict
  if (currentState.players.length !== incomingState.players.length) {
    conflicts.push({
      id: `players-${Date.now()}`,
      type: 'data_corruption',
      conflictingStates: [currentState, incomingState],
      priority: 'high',
      resolutionStrategy: 'manual_resolution',
      timestamp: Date.now(),
      playerId: 'system',
      description: 'Player count mismatch detected',
      affectedComponents: ['players']
    });
  }
  
  return conflicts;
}

export function resolveConflict(
  conflict: StateConflict,
  strategy: ConflictResolutionStrategy
): UnifiedGameState {
  const [state1, state2] = conflict.conflictingStates;
  
  // Ensure we have at least one valid state
  if (!state1 && !state2) {
    throw new Error('No valid states available for conflict resolution');
  }
  
  // Handle cases where one state is undefined
  if (!state1) return state2!;
  if (!state2) return state1!;
  
  switch (strategy) {
    case 'last_writer_wins':
      return state1.timestamp > state2.timestamp ? state1 : state2;
      
    case 'first_writer_wins':
      return state1.timestamp < state2.timestamp ? state1 : state2;
      
    case 'merge_changes':
      return mergeStates(state1, state2);
      
    case 'rollback_to_checkpoint':
      // Return the state with the lower version (earlier checkpoint)
      return state1.version < state2.version ? state1 : state2;
      
    default:
      return state1; // Default to first state
  }
}

function mergeStates(state1: UnifiedGameState, state2: UnifiedGameState): UnifiedGameState {
  const merged: UnifiedGameState = {
    ...state1,
    version: Math.max(state1.version, state2.version),
    timestamp: Math.max(state1.timestamp, state2.timestamp),
    players: mergePlayerLists(state1.players, state2.players),
    metadata: {
      ...state1.metadata,
      ...state2.metadata,
      updatedAt: Math.max(state1.metadata.updatedAt, state2.metadata.updatedAt)
    }
  };
  
  merged.checksum = calculateChecksum(merged);
  return merged;
}

function mergePlayerLists(players1: Player[], players2: Player[]): Player[] {
  const playerMap = new Map<string, Player>();
  
  // Add all players from both lists, preferring more recent data
  [...players1, ...players2].forEach(player => {
    const existing = playerMap.get(player.id);
    if (!existing || (player.joinedAt && existing.joinedAt && player.joinedAt > existing.joinedAt)) {
      playerMap.set(player.id, player);
    }
  });
  
  return Array.from(playerMap.values());
}

// Optimistic update management
/**
 * Create optimistic update
 */
export function createOptimisticUpdate(
  type: UpdateType,
  payload: any,
  playerId: string,
  description: string = `${type} update`,
  options: {
    maxRetries?: number;
    timeoutMs?: number;
  } = {}
): OptimisticUpdate {
  return {
    id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    payload,
    timestamp: Date.now(),
    playerId,
    status: 'pending',
    retryCount: 0,
    maxRetries: options.maxRetries ?? 3,
    timeoutMs: options.timeoutMs ?? 5000,
    description,
    confirmed: false
  };
}

/**
 * Apply optimistic update to game state
 */
export function applyOptimisticUpdate(
  update: OptimisticUpdate,
  currentState: UnifiedGameState
): UnifiedGameState {
  // Store rollback state if not already stored
  if (!update.rollbackState) {
    update.rollbackState = { ...currentState };
  }
  
  // Apply the update based on type
  const updatedState = { ...currentState };
  
  switch (update.type) {
    case 'player_action':
      // Apply player action optimistically
      updatedState.gameState = {
        ...updatedState.gameState,
        // Apply player-specific changes
        ...update.payload
      };
      break;
      
    case 'game_state_change':
      // Apply game state changes
      updatedState.gameState = {
        ...updatedState.gameState,
        ...update.payload
      };
      break;
      
    case 'vote_cast':
      // Apply vote optimistically
      updatedState.gameState = {
        ...updatedState.gameState,
        votes: {
          ...updatedState.gameState.votes,
          [update.playerId]: update.payload.vote
        }
      };
      break;
      
    default:
      // Generic update application
      updatedState.gameState = {
        ...updatedState.gameState,
        ...update.payload
      };
  }
  
  // Update metadata
  updatedState.metadata.updatedAt = Date.now();
  updatedState.version += 1;
  updatedState.timestamp = Date.now();
  
  return updatedState;
}

/**
 * Rollback optimistic update
 */
export function rollbackOptimisticUpdate(
  update: OptimisticUpdate
): UnifiedGameState {
  if (!update.rollbackState) {
    throw new Error('No rollback state available for update');
  }
  
  return { ...update.rollbackState };
}

// State persistence utilities
export function createSnapshot(
  state: UnifiedGameState, 
  options: {
    description?: string;
    tags?: string[];
    source?: string;
  } = {}
): GameStateSnapshot {
  const stateString = JSON.stringify(state);
  
  return {
    id: `snapshot-${Date.now()}`,
    gameState: state,
    timestamp: Date.now(),
    version: state.version,
    compressed: false,
    size: stateString.length,
    checksum: calculateChecksum(state),
    description: options.description || 'Auto-generated snapshot',
    tags: options.tags || [],
    source: options.source || 'unknown'
  };
}

export function restoreFromSnapshot(snapshot: GameStateSnapshot): UnifiedGameState {
  // Verify snapshot integrity
  if (!verifyStateIntegrity(snapshot.gameState)) {
    throw new Error('Snapshot integrity check failed');
  }
  
  return {
    ...snapshot.gameState,
    metadata: {
      ...snapshot.gameState.metadata,
      lastSyncedAt: Date.now()
    }
  };
}

// Error handling utilities
export function createGameStateError(
  code: string,
  message: string,
  context?: any,
  recoverable: boolean = true
): GameStateError {
  return {
    code,
    message,
    context,
    recoverable,
    timestamp: Date.now(),
    severity: 'medium'
  };
}

export function isRecoverableError(error: GameStateError): boolean {
  return error.recoverable && error.severity !== 'critical';
}

// Debug utilities
export function getDebugInfo(state: UnifiedGameState): DebugInfo {
  return {
    stateVersion: state.version,
    lastSyncTime: state.metadata.lastSyncedAt,
    syncLatency: state.realTimeData.latency,
    conflictCount: 0, // Would be tracked separately
    pendingUpdateCount: 0, // Would be tracked separately
    persistenceStatus: state.metadata.persistenceStatus,
    memoryUsage: JSON.stringify(state).length,
    networkStatus: 'online' // Would be determined by connection check
  };
}

// Mock data generators for testing
export function createMockUnifiedGameState(options: MockGameStateOptions): UnifiedGameState {
  const players: Player[] = Array.from({ length: options.playerCount }, (_, i) => ({
    id: `player-${i + 1}`,
    name: `Player ${i + 1}`,
    isHost: i === 0,
    isReady: true,
    joinedAt: new Date(Date.now() - 1000 * 60 * i),
    roomId: options.roomCode,
    sessionId: `session-${i + 1}`
  }));
  
  const mockState: UnifiedGameState = {
    roomCode: options.roomCode,
    gameState: {
      phase: options.gamePhase,
      round: 1,
      leaderIndex: 0,
      votes: [],
      missions: []
    },
    players,
    realTimeData: {
      lastUpdated: Date.now(),
      connectionStates: {},
      activeEvents: [],
      latency: 50,
      syncVersion: 1
    },
    metadata: {
      createdAt: Date.now() - 1000 * 60 * 10,
      updatedAt: Date.now(),
      lastSyncedAt: Date.now(),
      phase: options.gamePhase,
      turn: 1,
      round: 1,
      syncStatus: 'synchronized',
      persistenceStatus: 'saved'
    },
    version: 1,
    timestamp: Date.now(),
    checksum: ''
  };
  
  mockState.checksum = calculateChecksum(mockState);
  return mockState;
}

export function createMockConflict(options: MockConflictOptions): StateConflict {
  return {
    id: `mock-conflict-${Date.now()}`,
    type: options.conflictType,
    conflictingStates: [], // Would be populated with actual conflicting states
    priority: options.priority,
    resolutionStrategy: 'last_writer_wins',
    timestamp: Date.now(),
    playerId: options.playerId,
    description: `Mock conflict of type ${options.conflictType}`,
    affectedComponents: options.affectedComponents
  };
}

export function createMockOptimisticUpdate(
  type: string,
  playerId: string,
  payload: any = {}
): OptimisticUpdate {
  return {
    id: `mock-update-${Date.now()}`,
    type: type as any,
    payload,
    timestamp: Date.now(),
    playerId,
    status: 'pending',
    retryCount: 0,
    maxRetries: 3,
    timeoutMs: 5000,
    description: `Mock ${type} update for player ${playerId}`,
    confirmed: false
  };
}

// State comparison utilities
export function areStatesEqual(state1: UnifiedGameState, state2: UnifiedGameState): boolean {
  return state1.checksum === state2.checksum && state1.version === state2.version;
}

export function getStateDifference(state1: UnifiedGameState, state2: UnifiedGameState): string[] {
  const differences: string[] = [];
  
  if (state1.version !== state2.version) {
    differences.push(`Version: ${state1.version} vs ${state2.version}`);
  }
  
  if (state1.timestamp !== state2.timestamp) {
    differences.push(`Timestamp: ${state1.timestamp} vs ${state2.timestamp}`);
  }
  
  if (state1.players.length !== state2.players.length) {
    differences.push(`Player count: ${state1.players.length} vs ${state2.players.length}`);
  }
  
  if (state1.gameState.phase !== state2.gameState.phase) {
    differences.push(`Phase: ${state1.gameState.phase} vs ${state2.gameState.phase}`);
  }
  
  return differences;
}

// Export constants for configuration
export const UNIFIED_GAME_STATE_CONFIG = {
  MAX_RETRIES: 3,
  SYNC_INTERVAL: 1000,
  CONFLICT_RESOLUTION_TIMEOUT: 10000,
  OPTIMISTIC_UPDATE_TIMEOUT: 5000,
  MAX_SNAPSHOTS: 10,
  CHECKSUM_LENGTH: 16
} as const;
