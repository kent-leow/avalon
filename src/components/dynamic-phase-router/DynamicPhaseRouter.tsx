/**
 * Dynamic Phase Router Component
 * 
 * Intelligent component routing based on game state with enhanced loading,
 * error handling, and smooth transitions between game phases.
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import type { DynamicPhaseRouterProps } from '~/types/dynamic-phase-router';
import { PhaseTransition } from './PhaseTransition';
import { PhaseLoader } from './PhaseLoader';
import { InvalidPhaseHandler } from './InvalidPhaseHandler';
import { NavigationGuard } from './NavigationGuard';
import { PhaseComponentRegistry } from './PhaseComponentRegistry';
import { usePhaseRouter } from '~/hooks/usePhaseRouter';
import { useNavigationGuard } from '~/hooks/useNavigationGuard';
import { 
  getValidPhases,
  getTransitionDirection,
  getTransitionOptions,
  shouldBlockNavigation,
  formatPhaseDisplayName,
  getPhaseDescription
} from '~/lib/phase-router-utils';

/**
 * Dynamic Phase Router Component
 * 
 * Provides intelligent routing based on game state with dynamic component loading,
 * smooth transitions, and comprehensive error handling.
 */
export function DynamicPhaseRouter({
  currentPhase,
  gameState,
  players,
  roomCode,
  playerId,
  onPhaseTransition,
  onError,
  enableTransitions = true,
  transitionDuration = 400,
  enableNavigationGuard = true,
}: DynamicPhaseRouterProps) {
  const mountedRef = useRef(true);
  
  // Initialize phase router
  const {
    routerState,
    transitionToPhase,
    resetRouter,
    retryTransition,
    clearError,
    isPhaseValid,
  } = usePhaseRouter({
    initialPhase: currentPhase,
    gameState,
    players,
    onError,
  });

  // Initialize navigation guard
  const {
    isNavigationBlocked,
    blockNavigation,
    unblockNavigation,
    backupState,
  } = useNavigationGuard({
    isGameActive: shouldBlockNavigation(currentPhase, gameState),
    enabled: enableNavigationGuard,
  });

  /**
   * Handle phase transition requests
   */
  const handlePhaseTransition = useCallback((newPhase: typeof currentPhase) => {
    if (!mountedRef.current) return;
    
    if (isPhaseValid(newPhase)) {
      transitionToPhase(newPhase);
      onPhaseTransition?.(newPhase);
    } else {
      onError?.({
        code: 'INVALID_PHASE',
        message: `Invalid phase transition to ${newPhase}`,
        phase: newPhase,
        recoverable: true,
      });
    }
  }, [isPhaseValid, transitionToPhase, onPhaseTransition, onError]);

  /**
   * Handle component loading
   */
  const handleComponentLoad = useCallback((phase: typeof currentPhase, component: React.ComponentType) => {
    if (!mountedRef.current) return;
    
    console.log(`Phase component loaded: ${phase}`);
    // Component is now available in the registry
  }, []);

  /**
   * Handle component loading errors
   */
  const handleComponentError = useCallback((phase: typeof currentPhase, error: Error) => {
    if (!mountedRef.current) return;
    
    onError?.({
      code: 'COMPONENT_LOAD_ERROR',
      message: `Failed to load component for phase ${phase}: ${error.message}`,
      phase,
      recoverable: true,
      metadata: { originalError: error },
    });
  }, [onError]);

  /**
   * Handle navigation attempts
   */
  const handleNavigationAttempt = useCallback((event: BeforeUnloadEvent) => {
    if (!mountedRef.current) return;
    
    // Backup current state
    backupState(gameState);
    
    // Show warning message
    const message = 'Are you sure you want to leave? Your game progress may be lost.';
    event.returnValue = message;
    return message;
  }, [gameState, backupState]);

  /**
   * Handle error recovery
   */
  const handleRetry = useCallback(() => {
    if (!mountedRef.current) return;
    
    clearError();
    retryTransition();
  }, [clearError, retryTransition]);

  /**
   * Handle router reset
   */
  const handleReset = useCallback(() => {
    if (!mountedRef.current) return;
    
    resetRouter();
  }, [resetRouter]);

  /**
   * Handle forced phase transition
   */
  const handleForcePhase = useCallback((phase: typeof currentPhase) => {
    if (!mountedRef.current) return;
    
    clearError();
    transitionToPhase(phase);
  }, [clearError, transitionToPhase]);

  /**
   * Sync with external phase changes
   */
  useEffect(() => {
    if (currentPhase !== routerState.currentPhase && !routerState.isTransitioning) {
      handlePhaseTransition(currentPhase);
    }
  }, [currentPhase, routerState.currentPhase, routerState.isTransitioning, handlePhaseTransition]);

  /**
   * Manage navigation blocking
   */
  useEffect(() => {
    if (shouldBlockNavigation(currentPhase, gameState)) {
      blockNavigation();
    } else {
      unblockNavigation();
    }
  }, [currentPhase, gameState, blockNavigation, unblockNavigation]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Get transition options
  const transitionDirection = routerState.previousPhase 
    ? getTransitionDirection(routerState.previousPhase, routerState.currentPhase)
    : 'forward';
  
  const transitionOptions = routerState.previousPhase
    ? getTransitionOptions(routerState.previousPhase, routerState.currentPhase, transitionDirection)
    : { type: 'fade' as const, duration: transitionDuration, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', direction: transitionDirection };

  // Get valid phases for error recovery
  const validPhases = getValidPhases(routerState.currentPhase, gameState, players);

  return (
    <div 
      className="relative w-full h-full"
      style={{ backgroundColor: '#0a0a0f' }}
      data-testid="dynamic-phase-router"
    >
      {/* Navigation Guard */}
      {enableNavigationGuard && (
        <NavigationGuard
          isGameActive={shouldBlockNavigation(routerState.currentPhase, gameState)}
          currentPhase={routerState.currentPhase}
          gameState={gameState}
          allowNavigation={!isNavigationBlocked}
          warningMessage="Are you sure you want to leave? Your game progress may be lost."
          onNavigationAttempt={handleNavigationAttempt}
          onStateBackup={backupState}
        />
      )}

      {/* Phase Component Registry */}
      <PhaseComponentRegistry
        onComponentLoad={handleComponentLoad}
        onComponentError={handleComponentError}
        preloadPhases={validPhases}
        enableCaching={true}
      />

      {/* Phase Loader Overlay */}
      {routerState.isLoading && (
        <PhaseLoader
          phase={routerState.currentPhase}
          loadingType="component"
          message={`Loading ${formatPhaseDisplayName(routerState.currentPhase)}...`}
          isVisible={true}
          timeout={10000}
          onTimeout={() => handleComponentError(routerState.currentPhase, new Error('Component loading timeout'))}
        />
      )}

      {/* Error Handler */}
      {routerState.error && (
        <InvalidPhaseHandler
          error={routerState.error}
          currentPhase={routerState.currentPhase}
          validPhases={validPhases}
          gameState={gameState}
          onRetry={handleRetry}
          onReset={handleReset}
          onForcePhase={handleForcePhase}
          allowManualRecovery={true}
        />
      )}

      {/* Main Phase Content */}
      {!routerState.error && (
        <PhaseTransition
          phase={routerState.currentPhase}
          previousPhase={routerState.previousPhase}
          isTransitioning={routerState.isTransitioning}
          transitionDuration={enableTransitions ? transitionOptions.duration : 0}
          transitionType={enableTransitions ? transitionOptions.type : 'fade'}
          direction={transitionDirection}
          onTransitionStart={() => {
            console.log(`Phase transition started: ${routerState.previousPhase} -> ${routerState.currentPhase}`);
          }}
          onTransitionComplete={() => {
            console.log(`Phase transition completed: ${routerState.currentPhase}`);
          }}
        >
          {/* Phase Content Area */}
          <div 
            className="w-full h-full"
            style={{ backgroundColor: '#1a1a2e' }}
            data-testid="phase-content-area"
          >
            {/* Phase Header */}
            <div className="p-6 border-b border-opacity-20" style={{ borderColor: '#252547' }}>
              <div className="text-center">
                <h1 
                  className="text-3xl font-bold mb-2"
                  style={{ color: '#f8f9fa' }}
                  data-testid="phase-title"
                >
                  {formatPhaseDisplayName(routerState.currentPhase)}
                </h1>
                <p 
                  className="text-lg"
                  style={{ color: '#9ca3af' }}
                  data-testid="phase-description"
                >
                  {getPhaseDescription(routerState.currentPhase)}
                </p>
              </div>
              
              {/* Phase Progress */}
              <div className="flex justify-center items-center space-x-4 mt-4 text-sm" style={{ color: '#9ca3af' }}>
                <span data-testid="room-code">Room: {roomCode}</span>
                <span>•</span>
                <span data-testid="round-info">Round: {gameState.round}</span>
                <span>•</span>
                <span data-testid="player-count">Players: {players.length}</span>
              </div>
            </div>

            {/* Dynamic Phase Component */}
            <div className="flex-1 p-6" data-testid="dynamic-phase-content">
              {/* Phase component will be dynamically loaded here */}
              <div className="text-center">
                <div 
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                  style={{ backgroundColor: '#252547' }}
                >
                  <span className="text-2xl">🎮</span>
                </div>
                <h2 
                  className="text-xl font-semibold mb-2"
                  style={{ color: '#f8f9fa' }}
                >
                  {formatPhaseDisplayName(routerState.currentPhase)}
                </h2>
                <p 
                  className="text-sm"
                  style={{ color: '#9ca3af' }}
                >
                  Phase component loading...
                </p>
              </div>
            </div>
          </div>
        </PhaseTransition>
      )}

      {/* Debug Information (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="fixed bottom-4 right-4 p-3 rounded-lg text-xs space-y-1"
          style={{ backgroundColor: '#1a1a2e', color: '#9ca3af' }}
          data-testid="debug-info"
        >
          <div>Phase: {routerState.currentPhase}</div>
          <div>Previous: {routerState.previousPhase || 'None'}</div>
          <div>Transitioning: {routerState.isTransitioning ? 'Yes' : 'No'}</div>
          <div>Loading: {routerState.isLoading ? 'Yes' : 'No'}</div>
          <div>Navigation Blocked: {isNavigationBlocked ? 'Yes' : 'No'}</div>
          <div>Valid Phases: {validPhases.length}</div>
        </div>
      )}
    </div>
  );
}

export default DynamicPhaseRouter;
