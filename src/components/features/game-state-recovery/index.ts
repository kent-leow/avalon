/**
 * Game State Recovery Integration
 * 
 * Main integration file for game state recovery functionality,
 * combining all recovery components and utilities.
 */

import RecoveryStatusIndicator from './RecoveryStatusIndicator';
import RecoveryControlPanel from './RecoveryControlPanel';
import RecoveryNotificationSystem, { 
  ConnectionNotification, 
  SaveNotification, 
  RecoveryProgressNotification 
} from './RecoveryNotificationSystem';
import RecoveryDemo from './RecoveryDemo';

// Re-export all components
export {
  RecoveryStatusIndicator,
  RecoveryControlPanel,
  RecoveryNotificationSystem,
  ConnectionNotification,
  SaveNotification,
  RecoveryProgressNotification,
  RecoveryDemo
};

// Re-export types
export type {
  RecoveryState,
  RecoveryConfiguration,
  RecoveryMetrics,
  GameStateSnapshot,
  PlayerRecoveryState,
  RecoveryError,
  RecoveryNotification,
  RecoveryStatus,
  RecoveryAction,
  PlayerConnectionState,
  GameRecoveryPhase
} from '~/types/game-state-recovery';

// Re-export utilities
export {
  createInitialRecoveryState,
  createGameStateSnapshot,
  createPlayerStateSnapshot,
  generateChecksum,
  generateValidationHash,
  generateRecoveryToken,
  validateSnapshot,
  compressSnapshot,
  decompressSnapshot,
  calculateReconnectionDelay,
  hasPlayerTimedOut,
  hasGamePhaseTimedOut,
  detectMassDisconnection,
  resolveActionConflicts,
  createRecoveryError,
  createRecoveryNotification,
  calculateRecoveryMetrics,
  createPlayerActivityLog,
  addPlayerActivityEvent,
  cleanupOldSnapshots,
  estimateSnapshotSize,
  createMemoryAdapter,
  createLocalStorageAdapter,
  validateRecoveryToken
} from '~/lib/game-state-recovery-utils';

// Default export for convenience
export default {
  RecoveryStatusIndicator,
  RecoveryControlPanel,
  RecoveryNotificationSystem,
  ConnectionNotification,
  SaveNotification,
  RecoveryProgressNotification,
  RecoveryDemo
};
