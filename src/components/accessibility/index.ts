/**
 * Accessibility Components Index
 * 
 * Centralized export for all accessibility components
 */

export { default as AccessibilitySystem } from '~/components/AccessibilitySystem';
export { default as ScreenReaderSupport } from './ScreenReaderSupport';
export { default as KeyboardNavigation } from './KeyboardNavigation';
export { default as HighContrastMode } from './HighContrastMode';
export { default as AlternativeInputs } from './AlternativeInputs';

// Re-export types for convenience
export type {
  AccessibilitySettings,
  AccessibilityState,
  AccessibilityConfig,
  AccessibilityAnnouncement,
  AccessibilityInteraction,
  AccessibilityRecommendation,
  AccessibilityTestResult,
  AccessibilityPreset,
  AccessibilityFeature,
  AccessibilityEvent,
  InputMethod,
} from '~/types/accessibility';

// Re-export utilities
export {
  detectSystemPreferences,
  applyAccessibilitySettings,
  createAccessibilityAnnouncement,
  announceToScreenReader,
  createLiveRegions,
  trackAccessibilityInteraction,
  checkColorContrast,
  meetsWCAGContrast,
  createFocusTrap,
  generateAccessibilityRecommendations,
  createSkipLinks,
  validateAccessibilitySettings,
  getAccessibilityCompliance,
  formatAccessibilityAnnouncement,
  createMockAccessibilityData,
  applyTextScaling,
  isFocusable,
  getNextFocusableElement,
  createAccessibleTooltip,
  updatePageTitle,
} from '~/lib/accessibility-utils';

// Re-export context and hooks
export { AccessibilityProvider, useAccessibilityContext } from '~/context/AccessibilityContext';
export { default as useAccessibility } from '~/hooks/useAccessibility';