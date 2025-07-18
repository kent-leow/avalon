/**
 * Game Engine Component
 * 
 * Central orchestration system that manages the entire Avalon game flow
 * from start to finish, coordinating all 18 implemented features.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import type { 
  GameEngineProps, 
  GameEngineState, 
  GameEngineError 
} from '~/types/game-engine';
import type { GamePhase } from '~/types/game-state';
import { PhaseController } from './PhaseController';
import { GameStateManager } from './GameStateManager';
import { PerformanceMonitor } from './PerformanceMonitor';
import { GameEngineErrorBoundary } from './ErrorBoundary';
import { 
  createMockGameState, 
  createMockPlayers, 
  createInitialPerformanceMetrics,
  createDefaultPerformanceThresholds,
  createGameEngineError
} from '~/lib/game-engine-utils';

/**
 * Main Game Engine Component
 * 
 * Orchestrates the entire game flow and manages state coordination
 * across all game features and phases.
 */
export function GameEngine({
  roomCode,
  roomId,
  playerId,
  playerName,
  initialGameState,
  initialPlayers,
  onError,
  onPhaseTransition,
}: GameEngineProps) {
  // Initialize game engine state
  const [engineState, setEngineState] = useState<GameEngineState>({
    isInitialized: false,
    currentPhase: initialGameState?.phase || 'lobby',
    gameState: initialGameState || createMockGameState(),
    players: initialPlayers || createMockPlayers(5),
    error: null,
    performance: createInitialPerformanceMetrics(),
    transitionInProgress: false,
  });

  // Performance monitoring
  const performanceThresholds = createDefaultPerformanceThresholds();

  /**
   * Initialize the game engine
   */
  const initializeEngine = useCallback(async () => {
    try {
      console.log('Initializing Game Engine for room:', roomCode);
      
      // Use the provided initial game state and real player data
      setEngineState(prev => ({
        ...prev,
        isInitialized: true,
        gameState: initialGameState || createMockGameState(),
        players: initialPlayers || createMockPlayers(5),
        error: null,
      }));
      
      console.log('Game Engine initialized successfully');
    } catch (error) {
      const engineError = createGameEngineError(
        'INIT_FAILED',
        'Failed to initialize game engine',
        'lobby',
        true
      );
      
      setEngineState(prev => ({
        ...prev,
        error: engineError,
      }));
      
      onError?.(engineError);
      console.error('Game Engine initialization failed:', error);
    }
  }, [roomCode, initialGameState, initialPlayers, onError]);

  /**
   * Handle phase transitions
   */
  const handlePhaseTransition = useCallback((newPhase: GamePhase) => {
    const currentPhase = engineState.currentPhase;
    
    if (currentPhase === newPhase) return;
    
    console.log(`Phase transition: ${currentPhase} -> ${newPhase}`);
    
    setEngineState(prev => ({
      ...prev,
      transitionInProgress: true,
    }));
    
    // Simulate transition delay
    setTimeout(() => {
      setEngineState(prev => ({
        ...prev,
        currentPhase: newPhase,
        transitionInProgress: false,
      }));
      
      onPhaseTransition?.(currentPhase, newPhase);
    }, 300);
  }, [engineState.currentPhase, onPhaseTransition]);

  /**
   * Handle game state updates
   */
  const handleStateUpdate = useCallback((newGameState: typeof engineState.gameState) => {
    setEngineState(prev => ({
      ...prev,
      gameState: newGameState,
    }));
  }, []);

  /**
   * Handle errors
   */
  const handleError = useCallback((error: GameEngineError) => {
    setEngineState(prev => ({
      ...prev,
      error,
    }));
    
    onError?.(error);
  }, [onError]);

  /**
   * Handle errors from error boundary
   */
  const handleErrorBoundaryError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Error boundary caught error:', error, errorInfo);
    
    const engineError = createGameEngineError(
      'ERROR_BOUNDARY',
      error.message,
      engineState.currentPhase,
      true
    );
    
    handleError(engineError);
  }, [engineState.currentPhase, handleError]);

  /**
   * Handle performance metrics updates
   */
  const handlePerformanceUpdate = useCallback((metrics: typeof engineState.performance) => {
    setEngineState(prev => ({
      ...prev,
      performance: metrics,
    }));
  }, []);

  /**
   * Initialize engine on mount
   */
  useEffect(() => {
    if (!engineState.isInitialized) {
      initializeEngine();
    }
  }, [engineState.isInitialized, initializeEngine]);

  /**
   * Loading state
   */
  if (!engineState.isInitialized) {
    return (
      <div 
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: '#0a0a0f' }}
        data-testid="game-engine-loading"
      >
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p 
            className="text-lg font-medium"
            style={{ color: '#f8f9fa' }}
          >
            Initializing Game Engine...
          </p>
        </div>
      </div>
    );
  }

  /**
   * Error state
   */
  if (engineState.error && !engineState.error.recoverable) {
    return (
      <div 
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: '#0a0a0f' }}
        data-testid="game-engine-error"
      >
        <div className="max-w-md rounded-lg p-6" style={{ backgroundColor: '#1a1a2e' }}>
          <div className="text-center">
            <div className="mb-4 text-5xl">⚠️</div>
            <h2 
              className="mb-2 text-xl font-bold"
              style={{ color: '#ef4444' }}
            >
              Game Engine Error
            </h2>
            <p 
              className="mb-4 text-sm"
              style={{ color: '#f8f9fa' }}
            >
              {engineState.error.message}
            </p>
            <p 
              className="text-xs"
              style={{ color: '#9ca3af' }}
            >
              Error Code: {engineState.error.code}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Main game engine render
   */
  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: '#0a0a0f' }}
      data-testid="game-engine-container"
    >
      {/* Performance Monitor */}
      <PerformanceMonitor
        enabled={true}
        onMetricsUpdate={handlePerformanceUpdate}
        thresholds={performanceThresholds}
      />

      {/* Game State Manager */}
      <GameStateManager
        roomCode={roomCode}
        gameState={engineState.gameState}
        onStateUpdate={handleStateUpdate}
        onError={handleError}
      />

      {/* Error Boundary */}
      <GameEngineErrorBoundary onError={handleErrorBoundaryError}>
        {/* Phase Controller */}
        <PhaseController
          currentPhase={engineState.currentPhase}
          gameState={engineState.gameState}
          players={engineState.players}
          onPhaseTransition={handlePhaseTransition}
          roomCode={roomCode}
          roomId={roomId}
          playerId={playerId}
        />
      </GameEngineErrorBoundary>

      {/* Transition Overlay */}
      {engineState.transitionInProgress && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(10, 10, 15, 0.8)' }}
          data-testid="phase-transition-overlay"
        >
          <div className="text-center">
            <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p 
              className="text-lg font-medium"
              style={{ color: '#f8f9fa' }}
            >
              Transitioning Phase...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameEngine;
