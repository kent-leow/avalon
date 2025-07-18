/**
 * Game State Manager Component
 * 
 * Coordinates state updates across all features and handles synchronization
 * between client and server state.
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import type { GameStateManagerProps } from '~/types/game-engine';
import { createGameEngineError } from '~/lib/game-engine-utils';

/**
 * Game State Manager Component
 * 
 * Manages centralized game state coordination and synchronization.
 */
export function GameStateManager({
  roomCode,
  gameState,
  onStateUpdate,
  onError,
}: GameStateManagerProps) {
  
  // Track state changes
  const lastStateRef = useRef(gameState);
  const stateUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle state synchronization with server
   */
  const synchronizeState = useCallback(async () => {
    try {
      // TODO: Replace with real API call in Phase 2
      console.log('Synchronizing state for room:', roomCode);
      
      // Mock state synchronization
      const mockDelay = Math.random() * 100; // 0-100ms delay
      
      await new Promise(resolve => setTimeout(resolve, mockDelay));
      
      // Simulate state update
      const updatedState = {
        ...gameState,
        // Add mock timestamp to simulate server updates
        lastSyncedAt: new Date(),
      };
      
      // onStateUpdate(updatedState);
      
    } catch (error) {
      console.error('State synchronization failed:', error);
      
      const engineError = createGameEngineError(
        'STATE_SYNC_FAILED',
        'Failed to synchronize game state with server',
        gameState.phase,
        true
      );
      
      onError(engineError);
    }
  }, [roomCode, gameState, onError]);

  /**
   * Handle optimistic state updates
   */
  const handleOptimisticUpdate = useCallback((newState: typeof gameState) => {
    // Store the current state for rollback
    lastStateRef.current = gameState;
    
    // Apply optimistic update
    onStateUpdate(newState);
    
    // Clear any pending synchronization
    if (stateUpdateTimeoutRef.current) {
      clearTimeout(stateUpdateTimeoutRef.current);
    }
    
    // Schedule state synchronization
    stateUpdateTimeoutRef.current = setTimeout(() => {
      synchronizeState();
    }, 500); // Debounce for 500ms
    
  }, [gameState, onStateUpdate, synchronizeState]);

  /**
   * Rollback to previous state in case of error
   */
  const rollbackState = useCallback(() => {
    if (lastStateRef.current) {
      console.log('Rolling back to previous state');
      onStateUpdate(lastStateRef.current);
    }
  }, [onStateUpdate]);

  /**
   * Validate state integrity
   */
  const validateState = useCallback((state: typeof gameState) => {
    const errors: string[] = [];
    
    // Basic validation
    if (!state.phase) {
      errors.push('Missing game phase');
    }
    
    if (state.round < 1) {
      errors.push('Invalid round number');
    }
    
    if (state.leaderIndex < 0) {
      errors.push('Invalid leader index');
    }
    
    // Phase-specific validation
    if (state.phase === 'voting' && state.votes.length > 10) {
      errors.push('Too many votes for voting phase');
    }
    
    if (state.phase === 'missionResult' && state.missions.length === 0) {
      errors.push('No missions available for result phase');
    }
    
    if (errors.length > 0) {
      console.warn('State validation errors:', errors);
      const engineError = createGameEngineError(
        'STATE_VALIDATION_FAILED',
        `State validation failed: ${errors.join(', ')}`,
        state.phase,
        true
      );
      
      onError(engineError);
      return false;
    }
    
    return true;
  }, [onError]);

  /**
   * Monitor state changes
   */
  useEffect(() => {
    // Validate current state
    validateState(gameState);
    
    // Log state changes for debugging
    console.log('Game state updated:', {
      phase: gameState.phase,
      round: gameState.round,
      leaderIndex: gameState.leaderIndex,
      votes: gameState.votes.length,
      missions: gameState.missions.length,
    });
    
  }, [gameState, validateState]);

  /**
   * Periodic state health check
   */
  useEffect(() => {
    const healthCheckInterval = setInterval(() => {
      // Perform periodic state validation
      validateState(gameState);
      
      // Check for state staleness
      const now = new Date().getTime();
      const stateAge = gameState.startedAt ? now - gameState.startedAt.getTime() : 0;
      
      if (stateAge > 30 * 60 * 1000) { // 30 minutes
        console.warn('Game state appears stale, may need refresh');
      }
      
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(healthCheckInterval);
  }, [gameState, validateState]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (stateUpdateTimeoutRef.current) {
        clearTimeout(stateUpdateTimeoutRef.current);
      }
    };
  }, []);

  // This component doesn't render anything visible
  return (
    <div 
      style={{ display: 'none' }} 
      data-testid="game-state-manager"
      data-room-code={roomCode}
      data-phase={gameState.phase}
      data-round={gameState.round}
    >
      Game State Manager Active
    </div>
  );
}

export default GameStateManager;
