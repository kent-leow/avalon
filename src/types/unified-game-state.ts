import type { ReactNode } from 'react';
import type { GameState, GamePhase } from '~/types/game-state';
import type { Player } from '~/types/room';
import type { RealTimeEvent } from '~/types/real-time-sync';

/**
 * Unified Game State Management Types
 * 
 * Core types for centralized state management across all 18 game features,
 * providing real-time synchronization and conflict resolution.
 */

// Core unified game state structure
export interface UnifiedGameState {
  roomCode: string;
  gameState: GameState;
  players: Player[];
  realTimeData: RealTimeGameData;
  metadata: GameStateMetadata;
  version: number;
  timestamp: number;
  checksum: string;
}

// Real-time game data structure
export interface RealTimeGameData {
  lastUpdated: number;
  connectionStates: Record<string, ConnectionState>;
  activeEvents: RealTimeEvent[];
  latency: number;
  syncVersion: number;
}

// Connection state for real-time sync
export interface ConnectionState {
  playerId: string;
  status: 'connected' | 'disconnected' | 'reconnecting';
  lastSeen: number;
  latency: number;
}

// Game state metadata for tracking and validation
export interface GameStateMetadata {
  createdAt: number;
  updatedAt: number;
  lastSyncedAt: number;
  phase: GamePhase;
  turn: number;
  round: number;
  activePlayerId?: string;
  syncStatus: SyncStatus;
  persistenceStatus: PersistenceStatus;
}

// Synchronization status tracking
export type SyncStatus = 'synchronized' | 'syncing' | 'out_of_sync' | 'conflict' | 'error';

// Persistence status tracking
export type PersistenceStatus = 'saved' | 'saving' | 'error' | 'recovery_needed' | 'idle' | 'restoring';

// State conflict structure
export interface StateConflict {
  id: string;
  type: ConflictType;
  conflictingStates: UnifiedGameState[];
  priority: ConflictPriority;
  resolutionStrategy: ConflictResolutionStrategy;
  timestamp: number;
  playerId: string;
  description: string;
  affectedComponents: string[];
}

// Types of conflicts that can occur
export type ConflictType = 
  | 'simultaneous_action' 
  | 'version_mismatch' 
  | 'data_corruption' 
  | 'network_partition' 
  | 'player_disconnect';

// Conflict resolution priorities
export type ConflictPriority = 'low' | 'medium' | 'high' | 'critical';

// Conflict resolution strategies
export type ConflictResolutionStrategy = 
  | 'last_writer_wins' 
  | 'first_writer_wins' 
  | 'merge_changes' 
  | 'manual_resolution' 
  | 'rollback_to_checkpoint';

// Optimistic update structure
export interface OptimisticUpdate {
  id: string;
  type: UpdateType;
  payload: any;
  timestamp: number;
  playerId: string;
  status: OptimisticUpdateStatus;
  retryCount: number;
  maxRetries: number;
  timeoutMs: number;
  rollbackState?: UnifiedGameState;
  description: string;
  confirmed?: boolean;
}

// Types of updates that can be made optimistically
export type UpdateType = 
  | 'player_action' 
  | 'game_state_change' 
  | 'vote_cast' 
  | 'mission_action' 
  | 'role_reveal' 
  | 'phase_transition';

// Status of optimistic updates
export type OptimisticUpdateStatus = 'pending' | 'confirmed' | 'rolled_back' | 'failed';

// Game state error structure
export interface GameStateError {
  code: string;
  message: string;
  context: any;
  recoverable: boolean;
  timestamp: number;
  playerId?: string;
  componentName?: string;
  severity: ErrorSeverity;
}

// Optimistic update error structure
export interface OptimisticUpdateError {
  type: 'apply_failed' | 'rollback_failed' | 'max_retries_exceeded' | 'timeout_exceeded';
  message: string;
  updateId: string;
  context: any;
}

// Persistence error structure
export interface PersistenceError {
  type: 'storage_full' | 'corruption' | 'permission' | 'quota_exceeded' | 'save_failed' | 'restore_failed';
  message: string;
  context: any;
}

// Conflict resolution error structure
export interface ConflictResolutionError {
  type: 'strategy_failed' | 'resolution_timeout' | 'invalid_conflict' | 'merge_failed';
  message: string;
  conflictId: string;
  context: any;
}

// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// State persistence configuration
export interface PersistenceConfig {
  enableAutoSave: boolean;
  autoSaveInterval: number;
  enableLocalStorage: boolean;
  enableIndexedDB: boolean;
  maxSnapshots: number;
  compressionEnabled: boolean;
}

// Game state snapshot for persistence
export interface GameStateSnapshot {
  id: string;
  gameState: UnifiedGameState;
  timestamp: number;
  version: number;
  compressed: boolean;
  size: number;
  checksum: string;
  description: string;
  tags: string[];
  source?: string;
}

// Sync configuration
export interface SyncConfig {
  enableRealTimeSync: boolean;
  syncInterval: number;
  maxRetries: number;
  retryDelay: number;
  conflictResolutionTimeout: number;
  optimisticUpdates: boolean;
}

// Conflict resolution result
export interface ConflictResolution {
  conflictId: string;
  strategy: ConflictResolutionStrategy;
  resolvedState: UnifiedGameState;
  timestamp: number;
  playerId: string;
  automatic: boolean;
}

// Sync error types
export interface SyncError {
  type: 'network' | 'version' | 'validation' | 'permission' | 'timeout';
  message: string;
  recoverable: boolean;
  retryAfter?: number;
  context?: any;
}

// Component props interfaces
export interface UnifiedGameStateManagerProps {
  roomCode: string;
  playerId: string;
  initialState?: UnifiedGameState;
  syncConfig?: SyncConfig;
  persistenceConfig?: PersistenceConfig;
  onStateChange?: (state: UnifiedGameState) => void;
  onError?: (error: GameStateError) => void;
  onConflict?: (conflict: StateConflict) => void;
  onSync?: (syncStatus: SyncStatus) => void;
  enableDebugMode?: boolean;
  children?: ReactNode;
}

export interface StateSyncProps {
  gameState: UnifiedGameState;
  roomCode: string;
  playerId: string;
  syncConfig: SyncConfig;
  onSync: (syncedState: UnifiedGameState) => void;
  onSyncError: (error: SyncError) => void;
  onConflict: (conflict: StateConflict) => void;
  syncInterval?: number;
  enableOptimisticUpdates?: boolean;
}

export interface ConflictResolverProps {
  conflicts: StateConflict[];
  resolutionStrategy: ConflictResolutionStrategy;
  onResolve: (resolvedState: UnifiedGameState) => void;
  onResolutionError: (error: ConflictResolutionError) => void;
  autoResolve?: boolean;
  resolutionTimeout?: number;
}

export interface OptimisticUpdateManagerProps {
  gameState: UnifiedGameState;
  pendingUpdates: OptimisticUpdate[];
  onUpdate: (update: OptimisticUpdate) => void;
  onRollback: (updateId: string) => void;
  onConfirm: (updateId: string) => void;
  onUpdateError: (error: OptimisticUpdateError) => void;
  onApplyUpdate: (state: UnifiedGameState) => void;
  onRollbackUpdate: (state: UnifiedGameState) => void;
  maxRetries?: number;
  timeoutMs?: number;
  maxPendingUpdates?: number;
  updateTimeout?: number;
  showPendingIndicator?: boolean;
}

export interface StatePersistenceProps {
  gameState: UnifiedGameState;
  persistenceConfig: PersistenceConfig;
  onSave: (snapshot: GameStateSnapshot) => void;
  onRestore: (snapshot: GameStateSnapshot) => void;
  onPersistenceError: (error: PersistenceError) => void;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
}

// Hook return types
export interface UseUnifiedGameStateReturn {
  gameState: UnifiedGameState | null;
  isLoading: boolean;
  error: GameStateError | null;
  syncStatus: SyncStatus;
  conflicts: StateConflict[];
  pendingUpdates: OptimisticUpdate[];
  updateGameState: (update: Partial<UnifiedGameState>) => Promise<void>;
  rollbackUpdate: (updateId: string) => Promise<void>;
  resolveConflict: (conflictId: string, strategy: ConflictResolutionStrategy) => Promise<void>;
  persistState: () => Promise<void>;
  restoreState: (snapshotId: string) => Promise<void>;
  clearError: () => void;
  retry: () => Promise<void>;
}

// State change event types
export interface StateChangeEvent {
  type: 'update' | 'conflict' | 'sync' | 'error' | 'persistence';
  payload: any;
  timestamp: number;
  playerId: string;
  componentName?: string;
}

// Debug information
export interface DebugInfo {
  stateVersion: number;
  lastSyncTime: number;
  syncLatency: number;
  conflictCount: number;
  pendingUpdateCount: number;
  persistenceStatus: PersistenceStatus;
  memoryUsage: number;
  networkStatus: 'online' | 'offline';
}

// Mock data generator types
export interface MockGameStateOptions {
  roomCode: string;
  playerCount: number;
  gamePhase: GamePhase;
  withConflicts?: boolean;
  withOptimisticUpdates?: boolean;
  withErrors?: boolean;
}

export interface MockConflictOptions {
  conflictType: ConflictType;
  priority: ConflictPriority;
  playerId: string;
  affectedComponents: string[];
}

// Export utility type for component registry
export type UnifiedGameStateComponent = 
  | 'UnifiedGameStateManager'
  | 'StateSync'
  | 'ConflictResolver'
  | 'OptimisticUpdateManager'
  | 'StatePersistence';
