/**
 * Dynamic Phase Router Components
 * 
 * Export all components related to the dynamic phase router system
 */

// Main router component
export { DynamicPhaseRouter } from './DynamicPhaseRouter';
export { default as DynamicPhaseRouterDefault } from './DynamicPhaseRouter';

// Supporting components
export { PhaseTransition } from './PhaseTransition';
export { default as PhaseTransitionDefault } from './PhaseTransition';

export { PhaseLoader } from './PhaseLoader';
export { default as PhaseLoaderDefault } from './PhaseLoader';

export { InvalidPhaseHandler } from './InvalidPhaseHandler';
export { default as InvalidPhaseHandlerDefault } from './InvalidPhaseHandler';

export { NavigationGuard } from './NavigationGuard';
export { default as NavigationGuardDefault } from './NavigationGuard';

export { 
  PhaseComponentRegistry, 
  usePhaseComponentRegistry 
} from './PhaseComponentRegistry';
export { default as PhaseComponentRegistryDefault } from './PhaseComponentRegistry';

// Utility functions from NavigationGuard
export { 
  restoreGameStateFromBackup, 
  clearGameStateBackup, 
  hasGameStateBackup 
} from './NavigationGuard';

// Re-export types
export type {
  DynamicPhaseRouterProps,
  PhaseTransitionProps,
  PhaseLoaderProps,
  InvalidPhaseHandlerProps,
  NavigationGuardProps,
  PhaseComponentRegistryProps,
  PhaseRouterState,
  PhaseRouterError,
  PhaseComponentMap,
  PhaseTransitionOptions,
  UsePhaseRouterReturn,
  UseNavigationGuardReturn,
  PhaseComponentRegistry as PhaseComponentRegistryType,
  PhaseRouterConfig,
  PhaseRouterMetrics,
} from '~/types/dynamic-phase-router';

// Re-export hooks
export { usePhaseRouter } from '~/hooks/usePhaseRouter';
export { useNavigationGuard } from '~/hooks/useNavigationGuard';

// Re-export utility functions
export { 
  getNavigationGuardState, 
  clearNavigationGuardState 
} from '~/hooks/useNavigationGuard';

export {
  createPhaseRouterError,
  validatePhaseTransition,
  isPhaseTransitionAllowed,
  formatPhaseDisplayName,
  getLoadingMessage,
  getTransitionOptions,
} from '~/lib/phase-router-utils';
