import type { DemoAccessibilityState } from './types';
import { validateDemoAccessibilityState, ensureDemoEnvironment } from './validation';

/**
 * Demo accessibility states for testing screen readers, high contrast, and other a11y features
 * All data is marked with _brand: 'demo' and validated
 */

// Only enforce demo environment check at runtime, not during build
if (typeof window !== 'undefined') {
  ensureDemoEnvironment();
}

/**
 * Default accessibility state - all features disabled
 */
export const DEMO_ACCESSIBILITY_DEFAULT: DemoAccessibilityState = {
  _brand: 'demo',
  highContrast: false,
  largeText: false,
  screenReader: false,
  keyboardNavigation: false,
  reducedMotion: false,
};

/**
 * High contrast mode enabled
 */
export const DEMO_ACCESSIBILITY_HIGH_CONTRAST: DemoAccessibilityState = {
  _brand: 'demo',
  highContrast: true,
  largeText: false,
  screenReader: false,
  keyboardNavigation: false,
  reducedMotion: false,
};

/**
 * Large text mode enabled
 */
export const DEMO_ACCESSIBILITY_LARGE_TEXT: DemoAccessibilityState = {
  _brand: 'demo',
  highContrast: false,
  largeText: true,
  screenReader: false,
  keyboardNavigation: false,
  reducedMotion: false,
};

/**
 * Screen reader mode enabled
 */
export const DEMO_ACCESSIBILITY_SCREEN_READER: DemoAccessibilityState = {
  _brand: 'demo',
  highContrast: false,
  largeText: false,
  screenReader: true,
  keyboardNavigation: true, // Screen readers typically use keyboard navigation
  reducedMotion: false,
};

/**
 * Keyboard navigation enabled
 */
export const DEMO_ACCESSIBILITY_KEYBOARD_NAV: DemoAccessibilityState = {
  _brand: 'demo',
  highContrast: false,
  largeText: false,
  screenReader: false,
  keyboardNavigation: true,
  reducedMotion: false,
};

/**
 * Reduced motion enabled
 */
export const DEMO_ACCESSIBILITY_REDUCED_MOTION: DemoAccessibilityState = {
  _brand: 'demo',
  highContrast: false,
  largeText: false,
  screenReader: false,
  keyboardNavigation: false,
  reducedMotion: true,
};

/**
 * Visual impairment scenario - high contrast + large text
 */
export const DEMO_ACCESSIBILITY_VISUAL_IMPAIRED: DemoAccessibilityState = {
  _brand: 'demo',
  highContrast: true,
  largeText: true,
  screenReader: false,
  keyboardNavigation: true,
  reducedMotion: false,
};

/**
 * Complete screen reader setup
 */
export const DEMO_ACCESSIBILITY_SCREEN_READER_FULL: DemoAccessibilityState = {
  _brand: 'demo',
  highContrast: true,
  largeText: true,
  screenReader: true,
  keyboardNavigation: true,
  reducedMotion: true,
};

/**
 * Motor disability scenario - keyboard only + reduced motion
 */
export const DEMO_ACCESSIBILITY_MOTOR_DISABLED: DemoAccessibilityState = {
  _brand: 'demo',
  highContrast: false,
  largeText: false,
  screenReader: false,
  keyboardNavigation: true,
  reducedMotion: true,
};

/**
 * All accessibility enabled - maximum accommodation
 */
export const DEMO_ACCESSIBILITY_ALL_ENABLED: DemoAccessibilityState = {
  _brand: 'demo',
  highContrast: true,
  largeText: true,
  screenReader: true,
  keyboardNavigation: true,
  reducedMotion: true,
};

/**
 * Cognitive accessibility - reduced motion + simplified interface preferences
 */
export const DEMO_ACCESSIBILITY_COGNITIVE: DemoAccessibilityState = {
  _brand: 'demo',
  highContrast: false,
  largeText: true,
  screenReader: false,
  keyboardNavigation: false,
  reducedMotion: true,
};

/**
 * All accessibility demo states for testing
 */
export const ALL_ACCESSIBILITY_DEMO_STATES = [
  DEMO_ACCESSIBILITY_DEFAULT,
  DEMO_ACCESSIBILITY_HIGH_CONTRAST,
  DEMO_ACCESSIBILITY_LARGE_TEXT,
  DEMO_ACCESSIBILITY_SCREEN_READER,
  DEMO_ACCESSIBILITY_KEYBOARD_NAV,
  DEMO_ACCESSIBILITY_REDUCED_MOTION,
  DEMO_ACCESSIBILITY_VISUAL_IMPAIRED,
  DEMO_ACCESSIBILITY_SCREEN_READER_FULL,
  DEMO_ACCESSIBILITY_MOTOR_DISABLED,
  DEMO_ACCESSIBILITY_ALL_ENABLED,
  DEMO_ACCESSIBILITY_COGNITIVE,
] as const;

/**
 * Get accessibility states by feature
 */
export function getAccessibilityStatesByFeature(feature: keyof Omit<DemoAccessibilityState, '_brand'>): DemoAccessibilityState[] {
  return ALL_ACCESSIBILITY_DEMO_STATES.filter(state => state[feature]);
}

/**
 * Get states with high contrast enabled
 */
export function getHighContrastStates(): DemoAccessibilityState[] {
  return getAccessibilityStatesByFeature('highContrast');
}

/**
 * Get states with large text enabled
 */
export function getLargeTextStates(): DemoAccessibilityState[] {
  return getAccessibilityStatesByFeature('largeText');
}

/**
 * Get states with screen reader enabled
 */
export function getScreenReaderStates(): DemoAccessibilityState[] {
  return getAccessibilityStatesByFeature('screenReader');
}

/**
 * Get states with keyboard navigation enabled
 */
export function getKeyboardNavigationStates(): DemoAccessibilityState[] {
  return getAccessibilityStatesByFeature('keyboardNavigation');
}

/**
 * Get states with reduced motion enabled
 */
export function getReducedMotionStates(): DemoAccessibilityState[] {
  return getAccessibilityStatesByFeature('reducedMotion');
}

/**
 * Check if accessibility state has multiple features enabled
 */
export function hasMultipleAccessibilityFeatures(state: DemoAccessibilityState): boolean {
  const features = [
    state.highContrast,
    state.largeText,
    state.screenReader,
    state.keyboardNavigation,
    state.reducedMotion,
  ];
  return features.filter(Boolean).length > 1;
}

/**
 * Get comprehensive accessibility test states (states with multiple features)
 */
export function getComprehensiveAccessibilityStates(): DemoAccessibilityState[] {
  return ALL_ACCESSIBILITY_DEMO_STATES.filter(hasMultipleAccessibilityFeatures);
}

// Validate all demo accessibility states
ALL_ACCESSIBILITY_DEMO_STATES.forEach(validateDemoAccessibilityState);
