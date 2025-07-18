/**
 * Game Engine Components Export
 * 
 * Centralized exports for all game engine components.
 */

export { GameEngine } from './GameEngine';
export { PhaseController } from './PhaseController';
export { GameStateManager } from './GameStateManager';
export { PerformanceMonitor } from './PerformanceMonitor';
export { GameEngineErrorBoundary } from './ErrorBoundary';

// Re-export types
export type {
  GameEngineProps,
  GameEngineState,
  GameEngineError,
  PhaseControllerProps,
  GameStateManagerProps,
  PerformanceMonitorProps,
  ErrorBoundaryProps,
  PerformanceMetrics,
  PerformanceThresholds,
} from '~/types/game-engine';
