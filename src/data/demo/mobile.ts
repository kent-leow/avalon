import type { DemoMobileState } from './types';
import { validateDemoMobileState, ensureDemoEnvironment } from './validation';

/**
 * Demo mobile states for testing responsive design and touch interactions
 * All data is marked with _brand: 'demo' and validated
 */

// Only enforce demo environment check at runtime, not during build
if (typeof window !== 'undefined') {
  ensureDemoEnvironment();
}

/**
 * iPhone SE - Small mobile screen in portrait
 */
export const DEMO_MOBILE_IPHONE_SE: DemoMobileState = {
  _brand: 'demo',
  deviceType: 'mobile',
  orientation: 'portrait',
  touchEnabled: true,
  viewportSize: {
    width: 375,
    height: 667,
  },
};

/**
 * iPhone 14 Pro - Modern mobile screen in portrait
 */
export const DEMO_MOBILE_IPHONE_14_PRO: DemoMobileState = {
  _brand: 'demo',
  deviceType: 'mobile',
  orientation: 'portrait',
  touchEnabled: true,
  viewportSize: {
    width: 393,
    height: 852,
  },
};

/**
 * iPhone 14 Pro Max - Large mobile screen in portrait
 */
export const DEMO_MOBILE_IPHONE_14_PRO_MAX: DemoMobileState = {
  _brand: 'demo',
  deviceType: 'mobile',
  orientation: 'portrait',
  touchEnabled: true,
  viewportSize: {
    width: 430,
    height: 932,
  },
};

/**
 * Samsung Galaxy S21 - Android mobile in portrait
 */
export const DEMO_MOBILE_GALAXY_S21: DemoMobileState = {
  _brand: 'demo',
  deviceType: 'mobile',
  orientation: 'portrait',
  touchEnabled: true,
  viewportSize: {
    width: 360,
    height: 800,
  },
};

/**
 * iPhone in landscape mode
 */
export const DEMO_MOBILE_LANDSCAPE: DemoMobileState = {
  _brand: 'demo',
  deviceType: 'mobile',
  orientation: 'landscape',
  touchEnabled: true,
  viewportSize: {
    width: 852,
    height: 393,
  },
};

/**
 * iPad Air - Tablet in portrait
 */
export const DEMO_TABLET_IPAD_AIR: DemoMobileState = {
  _brand: 'demo',
  deviceType: 'tablet',
  orientation: 'portrait',
  touchEnabled: true,
  viewportSize: {
    width: 820,
    height: 1180,
  },
};

/**
 * iPad Pro - Large tablet in portrait
 */
export const DEMO_TABLET_IPAD_PRO: DemoMobileState = {
  _brand: 'demo',
  deviceType: 'tablet',
  orientation: 'portrait',
  touchEnabled: true,
  viewportSize: {
    width: 1024,
    height: 1366,
  },
};

/**
 * iPad in landscape mode
 */
export const DEMO_TABLET_LANDSCAPE: DemoMobileState = {
  _brand: 'demo',
  deviceType: 'tablet',
  orientation: 'landscape',
  touchEnabled: true,
  viewportSize: {
    width: 1180,
    height: 820,
  },
};

/**
 * Desktop - Standard screen without touch
 */
export const DEMO_DESKTOP_STANDARD: DemoMobileState = {
  _brand: 'demo',
  deviceType: 'desktop',
  orientation: 'landscape',
  touchEnabled: false,
  viewportSize: {
    width: 1920,
    height: 1080,
  },
};

/**
 * Desktop - Ultrawide screen
 */
export const DEMO_DESKTOP_ULTRAWIDE: DemoMobileState = {
  _brand: 'demo',
  deviceType: 'desktop',
  orientation: 'landscape',
  touchEnabled: false,
  viewportSize: {
    width: 3440,
    height: 1440,
  },
};

/**
 * Desktop with touch (Surface Studio style)
 */
export const DEMO_DESKTOP_TOUCH: DemoMobileState = {
  _brand: 'demo',
  deviceType: 'desktop',
  orientation: 'landscape',
  touchEnabled: true,
  viewportSize: {
    width: 2880,
    height: 1920,
  },
};

/**
 * All mobile demo states for testing
 */
export const ALL_MOBILE_DEMO_STATES = [
  DEMO_MOBILE_IPHONE_SE,
  DEMO_MOBILE_IPHONE_14_PRO,
  DEMO_MOBILE_IPHONE_14_PRO_MAX,
  DEMO_MOBILE_GALAXY_S21,
  DEMO_MOBILE_LANDSCAPE,
  DEMO_TABLET_IPAD_AIR,
  DEMO_TABLET_IPAD_PRO,
  DEMO_TABLET_LANDSCAPE,
  DEMO_DESKTOP_STANDARD,
  DEMO_DESKTOP_ULTRAWIDE,
  DEMO_DESKTOP_TOUCH,
] as const;

/**
 * Get mobile state by device type
 */
export function getMobileStateByDevice(deviceType: 'mobile' | 'tablet' | 'desktop'): DemoMobileState[] {
  return ALL_MOBILE_DEMO_STATES.filter(state => state.deviceType === deviceType);
}

/**
 * Get mobile state by orientation
 */
export function getMobileStateByOrientation(orientation: 'portrait' | 'landscape'): DemoMobileState[] {
  return ALL_MOBILE_DEMO_STATES.filter(state => state.orientation === orientation);
}

/**
 * Get touch-enabled states
 */
export function getTouchEnabledStates(): DemoMobileState[] {
  return ALL_MOBILE_DEMO_STATES.filter(state => state.touchEnabled);
}

/**
 * Get states for small screens (width < 768px)
 */
export function getSmallScreenStates(): DemoMobileState[] {
  return ALL_MOBILE_DEMO_STATES.filter(state => state.viewportSize.width < 768);
}

/**
 * Get states for medium screens (768px <= width < 1024px)
 */
export function getMediumScreenStates(): DemoMobileState[] {
  return ALL_MOBILE_DEMO_STATES.filter(state => 
    state.viewportSize.width >= 768 && state.viewportSize.width < 1024
  );
}

/**
 * Get states for large screens (width >= 1024px)
 */
export function getLargeScreenStates(): DemoMobileState[] {
  return ALL_MOBILE_DEMO_STATES.filter(state => state.viewportSize.width >= 1024);
}

// Validate all demo mobile states
ALL_MOBILE_DEMO_STATES.forEach(validateDemoMobileState);
