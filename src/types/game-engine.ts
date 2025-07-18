/**
 * Game Engine Types
 * 
 * Type definitions for the central game orchestration system
 */

import type { GamePhase, GameState } from './game-state';
import type { Player } from './room';

/**
 * Core game engine state interface
 */
export interface GameEngineState {
  isInitialized: boolean;
  currentPhase: GamePhase;
  gameState: GameState;
  players: Player[];
  error: GameEngineError | null;
  performance: PerformanceMetrics;
  transitionInProgress: boolean;
}

/**
 * Game engine error interface
 */
export interface GameEngineError {
  code: string;
  message: string;
  phase: GamePhase;
  recoverable: boolean;
  timestamp: Date;
}

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  frameRate: number;
  memoryUsage: number;
  transitionTime: number;
  errorCount: number;
  lastHealthCheck: Date;
}

/**
 * Performance thresholds interface
 */
export interface PerformanceThresholds {
  maxFrameRate: number;
  maxMemoryUsage: number;
  maxTransitionTime: number;
  maxErrorCount: number;
}

/**
 * Game engine props interface
 */
export interface GameEngineProps {
  roomCode: string;
  roomId: string;
  playerId: string;
  playerName: string;
  initialGameState?: GameState;
  initialPlayers?: Player[];
  onError?: (error: GameEngineError) => void;
  onPhaseTransition?: (from: GamePhase, to: GamePhase) => void;
}

/**
 * Phase controller props interface
 */
export interface PhaseControllerProps {
  currentPhase: GamePhase;
  gameState: GameState;
  players: Player[];
  onPhaseTransition: (newPhase: GamePhase) => void;
  roomCode: string;
  roomId: string;
  playerId: string;
}

/**
 * Game state manager props interface
 */
export interface GameStateManagerProps {
  roomCode: string;
  gameState: GameState;
  onStateUpdate: (newState: GameState) => void;
  onError: (error: GameEngineError) => void;
}

/**
 * Error boundary props interface
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallback?: React.ComponentType<{error: Error; retry: () => void}>;
}

/**
 * Performance monitor props interface
 */
export interface PerformanceMonitorProps {
  enabled: boolean;
  onMetricsUpdate: (metrics: PerformanceMetrics) => void;
  thresholds: PerformanceThresholds;
}

/**
 * Phase transition request interface
 */
export interface PhaseTransitionRequest {
  roomCode: string;
  fromPhase: GamePhase;
  toPhase: GamePhase;
  playerId: string;
  gameState: GameState;
}

/**
 * Phase transition response interface
 */
export interface PhaseTransitionResponse {
  success: boolean;
  newGameState: GameState;
  error?: string;
}
