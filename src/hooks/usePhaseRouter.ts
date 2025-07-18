/**
 * Use Phase Router Hook
 * 
 * Custom hook for managing phase router state and transitions
 * with type-safe phase management and error handling.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { UsePhaseRouterReturn, PhaseRouterState, PhaseRouterError } from '~/types/dynamic-phase-router';
import type { GamePhase } from '~/types/game-state';
import { validatePhaseTransition, createPhaseRouterError } from '~/lib/phase-router-utils';

/**
 * Custom hook for managing dynamic phase router state
 * 
 * Provides centralized state management for phase transitions,
 * component loading, and error handling.
 */
export function usePhaseRouter(
  initialPhase: GamePhase,
  validPhases: GamePhase[] = ['lobby', 'roleReveal', 'voting', 'missionSelect', 'missionVote', 'missionResult', 'assassinAttempt', 'gameOver']
): UsePhaseRouterReturn {
  const [routerState, setRouterState] = useState<PhaseRouterState>({
    currentPhase: initialPhase,
    previousPhase: null,
    isTransitioning: false,
    isLoading: false,
    error: null,
    transitionStartTime: null,
    loadedComponents: new Map(),
    navigationBlocked: false,
  });

  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTransitionTime = 10000; // 10 seconds

  /**
   * Clear any existing transition timeout
   */
  const clearTransitionTimeout = useCallback(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, []);

  /**
   * Start transition timeout
   */
  const startTransitionTimeout = useCallback(() => {
    clearTransitionTimeout();
    
    transitionTimeoutRef.current = setTimeout(() => {
      setRouterState(prev => ({
        ...prev,
        isTransitioning: false,
        isLoading: false,
        error: createPhaseRouterError('TRANSITION_FAILED', 'Transition timeout exceeded', prev.currentPhase),
      }));
    }, maxTransitionTime);
  }, [clearTransitionTimeout]);

  /**
   * Validate if a phase is valid
   */
  const isPhaseValid = useCallback((phase: GamePhase): boolean => {
    return validPhases.includes(phase);
  }, [validPhases]);

  /**
   * Transition to a new phase
   */
  const transitionToPhase = useCallback((newPhase: GamePhase) => {
    // Validate the new phase
    if (!isPhaseValid(newPhase)) {
      setRouterState(prev => ({
        ...prev,
        error: createPhaseRouterError('INVALID_PHASE', `Invalid phase: ${newPhase}`, newPhase),
      }));
      return;
    }

    // Check if navigation is blocked
    if (routerState.navigationBlocked) {
      setRouterState(prev => ({
        ...prev,
        error: createPhaseRouterError('NAVIGATION_BLOCKED', 'Navigation is currently blocked', newPhase),
      }));
      return;
    }

    // Check if we're already transitioning
    if (routerState.isTransitioning) {
      return;
    }

    // Validate the transition
    const validationResult = validatePhaseTransition(routerState.currentPhase, newPhase);
    if (!validationResult.isValid) {
      setRouterState(prev => ({
        ...prev,
        error: createPhaseRouterError('TRANSITION_FAILED', validationResult.reason || 'Invalid transition', newPhase),
      }));
      return;
    }

    // Start the transition
    setRouterState(prev => ({
      ...prev,
      isTransitioning: true,
      isLoading: true,
      error: null,
      transitionStartTime: Date.now(),
      previousPhase: prev.currentPhase,
    }));

    // Start timeout
    startTransitionTimeout();

    // Simulate async transition (in real app, this would load components, etc.)
    setTimeout(() => {
      setRouterState(prev => ({
        ...prev,
        currentPhase: newPhase,
        isTransitioning: false,
        isLoading: false,
        transitionStartTime: null,
      }));
      
      clearTransitionTimeout();
    }, 100);
  }, [routerState.navigationBlocked, routerState.isTransitioning, routerState.currentPhase, isPhaseValid, startTransitionTimeout, clearTransitionTimeout]);

  /**
   * Reset router to initial state
   */
  const resetRouter = useCallback(() => {
    clearTransitionTimeout();
    
    setRouterState({
      currentPhase: initialPhase,
      previousPhase: null,
      isTransitioning: false,
      isLoading: false,
      error: null,
      transitionStartTime: null,
      loadedComponents: new Map(),
      navigationBlocked: false,
    });
  }, [initialPhase, clearTransitionTimeout]);

  /**
   * Retry the last failed transition
   */
  const retryTransition = useCallback(() => {
    if (routerState.error && routerState.error.recoverable) {
      setRouterState(prev => ({
        ...prev,
        error: null,
      }));
      
      // Retry the transition to the phase that failed
      if (routerState.error.phase && isPhaseValid(routerState.error.phase)) {
        transitionToPhase(routerState.error.phase);
      }
    }
  }, [routerState.error, isPhaseValid, transitionToPhase]);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setRouterState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  /**
   * Block navigation
   */
  const blockNavigation = useCallback(() => {
    setRouterState(prev => ({
      ...prev,
      navigationBlocked: true,
    }));
  }, []);

  /**
   * Unblock navigation
   */
  const unblockNavigation = useCallback(() => {
    setRouterState(prev => ({
      ...prev,
      navigationBlocked: false,
    }));
  }, []);

  /**
   * Set component as loaded
   */
  const setComponentLoaded = useCallback((phase: GamePhase, component: React.ComponentType<any>) => {
    setRouterState(prev => ({
      ...prev,
      loadedComponents: new Map(prev.loadedComponents).set(phase, component),
    }));
  }, []);

  /**
   * Check if component is loaded
   */
  const isComponentLoaded = useCallback((phase: GamePhase): boolean => {
    return routerState.loadedComponents.has(phase);
  }, [routerState.loadedComponents]);

  /**
   * Get loaded component
   */
  const getLoadedComponent = useCallback((phase: GamePhase): React.ComponentType<any> | null => {
    return routerState.loadedComponents.get(phase) || null;
  }, [routerState.loadedComponents]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearTransitionTimeout();
    };
  }, [clearTransitionTimeout]);

  return {
    routerState,
    transitionToPhase,
    resetRouter,
    retryTransition,
    clearError,
    isPhaseValid,
    blockNavigation,
    unblockNavigation,
    setComponentLoaded,
    isComponentLoaded,
    getLoadedComponent,
  };
}

export default usePhaseRouter;
