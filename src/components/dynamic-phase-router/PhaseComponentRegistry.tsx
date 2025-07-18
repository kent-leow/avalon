/**
 * Phase Component Registry
 * 
 * Manages dynamic loading and caching of phase components
 * with preloading capabilities and error handling.
 */

'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import type { ComponentType } from 'react';
import type { PhaseComponentRegistryProps } from '~/types/dynamic-phase-router';
import type { GamePhase } from '~/types/game-state';

/**
 * Phase Component Registry Component
 * 
 * Handles dynamic component loading, caching, and preloading
 * for optimal performance and user experience.
 */
export function PhaseComponentRegistry({
  onComponentLoad,
  onComponentError,
  preloadPhases = [],
  enableCaching = true,
}: PhaseComponentRegistryProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const componentCache = useRef<Map<GamePhase, ComponentType<any>>>(new Map());
  const loadingComponents = useRef<Set<GamePhase>>(new Set());
  const errorComponents = useRef<Set<GamePhase>>(new Set());

  /**
   * Component loaders for each phase
   * TODO: Replace with actual component paths when they are implemented
   */
  const componentLoaders: Partial<Record<GamePhase, () => Promise<ComponentType<any>>>> = {
    'lobby': () => Promise.resolve(() => React.createElement('div', { 'data-testid': 'lobby-placeholder' }, 'Lobby Component')),
    'roleReveal': () => Promise.resolve(() => React.createElement('div', { 'data-testid': 'role-reveal-placeholder' }, 'Role Reveal Component')),
    'voting': () => Promise.resolve(() => React.createElement('div', { 'data-testid': 'voting-placeholder' }, 'Voting Component')),
    'missionSelect': () => Promise.resolve(() => React.createElement('div', { 'data-testid': 'mission-select-placeholder' }, 'Mission Select Component')),
    'missionVote': () => Promise.resolve(() => React.createElement('div', { 'data-testid': 'mission-vote-placeholder' }, 'Mission Vote Component')),
    'missionResult': () => Promise.resolve(() => React.createElement('div', { 'data-testid': 'mission-result-placeholder' }, 'Mission Result Component')),
    'assassinAttempt': () => Promise.resolve(() => React.createElement('div', { 'data-testid': 'assassin-attempt-placeholder' }, 'Assassin Attempt Component')),
    'gameOver': () => Promise.resolve(() => React.createElement('div', { 'data-testid': 'game-over-placeholder' }, 'Game Over Component')),
  };

  /**
   * Load a component dynamically
   */
  const loadComponent = useCallback(async (phase: GamePhase): Promise<ComponentType<any> | null> => {
    // Return cached component if available
    if (enableCaching && componentCache.current.has(phase)) {
      const cachedComponent = componentCache.current.get(phase);
      if (cachedComponent) {
        return cachedComponent;
      }
    }

    // Skip if already loading
    if (loadingComponents.current.has(phase)) {
      return null;
    }

    // Skip if previously errored
    if (errorComponents.current.has(phase)) {
      return null;
    }

    const loader = componentLoaders[phase];
    if (!loader) {
      const error = new Error(`No loader found for phase: ${phase}`);
      onComponentError(phase, error);
      errorComponents.current.add(phase);
      return null;
    }

    try {
      loadingComponents.current.add(phase);
      
      const component = await loader();
      
      // Cache the component if caching is enabled
      if (enableCaching) {
        componentCache.current.set(phase, component);
      }
      
      // Notify that component was loaded
      onComponentLoad(phase, component);
      
      return component;
    } catch (error) {
      const loadError = error instanceof Error ? error : new Error(`Failed to load component for phase: ${phase}`);
      onComponentError(phase, loadError);
      errorComponents.current.add(phase);
      return null;
    } finally {
      loadingComponents.current.delete(phase);
    }
  }, [enableCaching, onComponentLoad, onComponentError]);

  /**
   * Preload multiple components
   */
  const preloadComponents = useCallback(async (phases: GamePhase[]): Promise<void> => {
    const loadPromises = phases.map(phase => loadComponent(phase));
    await Promise.allSettled(loadPromises);
  }, [loadComponent]);

  /**
   * Get cached component
   */
  const getCachedComponent = useCallback((phase: GamePhase): ComponentType<any> | null => {
    return componentCache.current.get(phase) || null;
  }, []);

  /**
   * Check if component is cached
   */
  const isComponentCached = useCallback((phase: GamePhase): boolean => {
    return componentCache.current.has(phase);
  }, []);

  /**
   * Check if component is loading
   */
  const isComponentLoading = useCallback((phase: GamePhase): boolean => {
    return loadingComponents.current.has(phase);
  }, []);

  /**
   * Check if component has errored
   */
  const hasComponentError = useCallback((phase: GamePhase): boolean => {
    return errorComponents.current.has(phase);
  }, []);

  /**
   * Clear component cache
   */
  const clearCache = useCallback((): void => {
    componentCache.current.clear();
    loadingComponents.current.clear();
    errorComponents.current.clear();
  }, []);

  /**
   * Retry loading a component that previously errored
   */
  const retryComponent = useCallback(async (phase: GamePhase): Promise<ComponentType<any> | null> => {
    // Remove from error set to allow retry
    errorComponents.current.delete(phase);
    
    // Remove from cache to force reload
    componentCache.current.delete(phase);
    
    return loadComponent(phase);
  }, [loadComponent]);

  /**
   * Get registry statistics
   */
  const getStats = useCallback(() => {
    return {
      cached: componentCache.current.size,
      loading: loadingComponents.current.size,
      errors: errorComponents.current.size,
      total: Object.keys(componentLoaders).length,
    };
  }, []);

  /**
   * Preload initial components
   */
  useEffect(() => {
    if (!isInitialized && preloadPhases.length > 0) {
      preloadComponents(preloadPhases);
      setIsInitialized(true);
    }
  }, [preloadPhases, preloadComponents, isInitialized]);

  /**
   * Expose registry methods via ref
   */
  useEffect(() => {
    // Attach methods to window for debugging in development
    if (process.env.NODE_ENV === 'development') {
      (window as any).phaseComponentRegistry = {
        loadComponent,
        preloadComponents,
        getCachedComponent,
        isComponentCached,
        isComponentLoading,
        hasComponentError,
        clearCache,
        retryComponent,
        getStats,
      };
    }

    return () => {
      if (process.env.NODE_ENV === 'development') {
        delete (window as any).phaseComponentRegistry;
      }
    };
  }, [
    loadComponent,
    preloadComponents,
    getCachedComponent,
    isComponentCached,
    isComponentLoading,
    hasComponentError,
    clearCache,
    retryComponent,
    getStats,
  ]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearCache();
    };
  }, [clearCache]);

  // This component doesn't render anything visible
  return null;
}

/**
 * Hook to access the phase component registry
 */
export function usePhaseComponentRegistry() {
  const loadComponent = useCallback(async (phase: GamePhase): Promise<ComponentType<any> | null> => {
    if (process.env.NODE_ENV === 'development' && (window as any).phaseComponentRegistry) {
      return (window as any).phaseComponentRegistry.loadComponent(phase);
    }
    return null;
  }, []);

  const getCachedComponent = useCallback((phase: GamePhase): ComponentType<any> | null => {
    if (process.env.NODE_ENV === 'development' && (window as any).phaseComponentRegistry) {
      return (window as any).phaseComponentRegistry.getCachedComponent(phase);
    }
    return null;
  }, []);

  const isComponentCached = useCallback((phase: GamePhase): boolean => {
    if (process.env.NODE_ENV === 'development' && (window as any).phaseComponentRegistry) {
      return (window as any).phaseComponentRegistry.isComponentCached(phase);
    }
    return false;
  }, []);

  const getStats = useCallback(() => {
    if (process.env.NODE_ENV === 'development' && (window as any).phaseComponentRegistry) {
      return (window as any).phaseComponentRegistry.getStats();
    }
    return { cached: 0, loading: 0, errors: 0, total: 0 };
  }, []);

  return {
    loadComponent,
    getCachedComponent,
    isComponentCached,
    getStats,
  };
}

export default PhaseComponentRegistry;
