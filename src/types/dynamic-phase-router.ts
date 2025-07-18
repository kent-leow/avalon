/**
 * Dynamic Phase Router Types
 * 
 * Type definitions for the intelligent phase routing system that provides
 * smooth transitions, dynamic component loading, and enhanced error handling.
 */

import type { GamePhase, GameState } from './game-state';
import type { Player } from './room';
import type { ReactNode, ComponentType } from 'react';
import type React from 'react';

/**
 * Phase router state interface
 */
export interface PhaseRouterState {
  currentPhase: GamePhase;
  previousPhase: GamePhase | null;
  isTransitioning: boolean;
  isLoading: boolean;
  error: PhaseRouterError | null;
  transitionStartTime: number | null;
  loadedComponents: Map<GamePhase, ComponentType<any>>;
  navigationBlocked: boolean;
}

/**
 * Phase router error interface
 */
export interface PhaseRouterError {
  code: 'INVALID_PHASE' | 'TRANSITION_FAILED' | 'COMPONENT_LOAD_ERROR' | 'NAVIGATION_BLOCKED';
  message: string;
  phase: GamePhase;
  recoverable: boolean;
  metadata?: Record<string, any>;
}

/**
 * Phase component mapping interface
 */
export type PhaseComponentMap = Record<string, () => Promise<ComponentType<any>>>;

/**
 * Phase transition options interface
 */
export interface PhaseTransitionOptions {
  type: 'fade' | 'slide' | 'scale' | 'flip';
  duration: number;
  easing: string;
  direction: 'forward' | 'backward';
}

/**
 * Dynamic phase router props interface
 */
export interface DynamicPhaseRouterProps {
  currentPhase: GamePhase;
  gameState: GameState;
  players: Player[];
  roomCode: string;
  playerId: string;
  onPhaseTransition?: (newPhase: GamePhase) => void;
  onError?: (error: PhaseRouterError) => void;
  enableTransitions?: boolean;
  transitionDuration?: number;
  enableNavigationGuard?: boolean;
}

/**
 * Phase transition props interface
 */
export interface PhaseTransitionProps {
  children: ReactNode;
  phase: GamePhase;
  previousPhase: GamePhase | null;
  isTransitioning: boolean;
  transitionDuration?: number;
  transitionType?: 'fade' | 'slide' | 'scale' | 'flip';
  direction?: 'forward' | 'backward';
  onTransitionStart?: () => void;
  onTransitionComplete?: () => void;
}

/**
 * Phase loader props interface
 */
export interface PhaseLoaderProps {
  phase: GamePhase;
  loadingType: 'transition' | 'component' | 'validation';
  message?: string;
  progress?: number;
  isVisible: boolean;
  timeout?: number;
  onTimeout?: () => void;
  onCancel?: () => void;
}

/**
 * Invalid phase handler props interface
 */
export interface InvalidPhaseHandlerProps {
  phase?: GamePhase;
  error: PhaseRouterError;
  validPhases?: GamePhase[];
  onRetry?: () => void;
  onNavigateToPhase?: (phase: GamePhase) => void;
  onReset?: () => void;
  autoRecovery?: boolean;
  autoRecoveryDelay?: number;
}

/**
 * Navigation guard props interface
 */
export interface NavigationGuardProps {
  isGameActive: boolean;
  currentPhase: GamePhase;
  gameState: GameState;
  allowNavigation?: boolean;
  warningMessage?: string;
  onNavigationAttempt?: (event: BeforeUnloadEvent) => void;
  onStateBackup?: (gameState: GameState) => void;
}

/**
 * Phase component registry props interface
 */
export interface PhaseComponentRegistryProps {
  onComponentLoad: (phase: GamePhase, component: ComponentType) => void;
  onComponentError: (phase: GamePhase, error: Error) => void;
  preloadPhases?: GamePhase[];
  enableCaching?: boolean;
}

/**
 * Phase router hook return interface
 */
export interface UsePhaseRouterReturn {
  routerState: PhaseRouterState;
  transitionToPhase: (phase: GamePhase) => void;
  resetRouter: () => void;
  retryTransition: () => void;
  clearError: () => void;
  isPhaseValid: (phase: GamePhase) => boolean;
  blockNavigation: () => void;
  unblockNavigation: () => void;
  setComponentLoaded: (phase: GamePhase, component: React.ComponentType<any>) => void;
  isComponentLoaded: (phase: GamePhase) => boolean;
  getLoadedComponent: (phase: GamePhase) => React.ComponentType<any> | null;
}

/**
 * Navigation guard hook return interface
 */
export interface UseNavigationGuardReturn {
  isNavigationBlocked: boolean;
  blockNavigation: () => void;
  unblockNavigation: () => void;
  backupState: (gameState: GameState) => void;
  restoreState: () => GameState | null;
  clearBackup: () => void;
  hasBackup: () => boolean;
}

/**
 * Phase component registry interface
 */
export interface PhaseComponentRegistry {
  register: (phase: GamePhase, loader: () => Promise<ComponentType<any>>) => void;
  load: (phase: GamePhase) => Promise<ComponentType<any>>;
  preload: (phases: GamePhase[]) => Promise<void>;
  clear: () => void;
  isLoaded: (phase: GamePhase) => boolean;
}

/**
 * Phase router configuration interface
 */
export interface PhaseRouterConfig {
  enableTransitions: boolean;
  transitionDuration: number;
  enableNavigationGuard: boolean;
  enableCaching: boolean;
  enablePreloading: boolean;
  maxRetries: number;
  timeoutMs: number;
}

/**
 * Phase router metrics interface
 */
export interface PhaseRouterMetrics {
  transitionTime: number;
  loadingTime: number;
  errorCount: number;
  componentCacheHits: number;
  componentCacheMisses: number;
  lastTransitionTimestamp: number;
}
