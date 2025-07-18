/**
 * Mobile Game Experience Components
 * 
 * This module provides all components for mobile game experience optimization.
 * It includes touch optimization, layout adaptation, performance monitoring,
 * connectivity management, and haptic feedback for mobile devices.
 */

// Core Mobile Experience Components
export { MobileGameExperience } from './MobileGameExperience';
export { TouchOptimizedInterface } from './TouchOptimizedInterface';
export { MobileLayoutAdapter } from './MobileLayoutAdapter';
export { MobilePerformanceOptimizer } from './MobilePerformanceOptimizer';
export { MobileConnectivityManager } from './MobileConnectivityManager';
export { HapticFeedbackSystem } from './HapticFeedbackSystem';

// Types and Utilities
export type {
  DeviceInfo,
  TouchInteraction,
  ViewportInfo,
  LayoutInfo,
  PerformanceMetrics,
  ConnectivityStatus,
  HapticFeedbackType,
  HapticFeedbackConfig,
  TouchTarget,
  MobileExperienceState,
  MobileExperiencePreferences,
  OptimizationRecommendation,
  MobileAnalytics,
  MobileExperienceConfig,
} from '~/types/mobile-experience';

// Context and Hooks
export { MobileExperienceProvider } from '~/context/MobileExperienceContext';
export { useMobileExperience } from '~/hooks/useMobileExperience';
export { useTouchOptimization } from '~/hooks/useTouchOptimization';

// Constants and Configuration
export {
  DEFAULT_MOBILE_CONFIG,
  MOBILE_BREAKPOINTS,
  TOUCH_TARGET_SIZES,
  HAPTIC_FEEDBACK_PATTERNS,
} from '~/types/mobile-experience';

// Utility Functions
export {
  detectDeviceType,
  detectOrientation,
  detectTouchSupport,
  detectPlatformOS,
  createMockDeviceInfo,
  calculateTouchTargetSize,
  isValidTouchTarget,
  optimizeTouchTarget,
  measurePerformanceMetrics,
  calculateBatteryImpact,
  detectConnectivityStatus,
  getViewportInfo,
  calculateLayoutInfo,
  triggerHapticFeedback,
  isHapticFeedbackSupported,
  generateOptimizationRecommendations,
  createMobileAnalytics,
  trackTouchInteraction,
  trackPerformanceMetrics,
  trackConnectivityChange,
  applySafeAreaInsets,
  getSafeAreaCSS,
  shouldOptimizeData,
  getOptimizedImageSrc,
  formatDataUsage,
  validateTouchTarget,
  validateMobileExperience,
} from '~/lib/mobile-experience-utils';

// Mock Data
export {
  MOCK_DEVICE_PROFILES,
  MOCK_PERFORMANCE_SCENARIOS,
  MOCK_CONNECTIVITY_SCENARIOS,
  MOCK_TOUCH_INTERACTIONS,
  MOCK_VIEWPORT_CONFIGS,
  MOCK_LAYOUT_CONFIGS,
  MOCK_OPTIMIZATION_RECOMMENDATIONS,
  MOCK_USER_PREFERENCES,
  MOCK_ANALYTICS_DATA,
  MOCK_HAPTIC_SCENARIOS,
  MOCK_STATE_TEMPLATES,
  MOCK_TOUCH_TARGET_SCENARIOS,
} from '~/data/mobile-experience-mock';

/**
 * Quick Start Guide for Mobile Experience Components
 * 
 * 1. Wrap your app with MobileExperienceProvider:
 * ```tsx
 * import { MobileExperienceProvider } from '~/context/MobileExperienceContext';
 * 
 * function App() {
 *   return (
 *     <MobileExperienceProvider>
 *       <YourAppContent />
 *     </MobileExperienceProvider>
 *   );
 * }
 * ```
 * 
 * 2. Use the main coordinator component:
 * ```tsx
 * import { MobileGameExperience } from '~/components/mobile/MobileGameExperience';
 * 
 * function GamePage() {
 *   return (
 *     <MobileGameExperience>
 *       <YourGameContent />
 *     </MobileGameExperience>
 *   );
 * }
 * ```
 * 
 * 3. Access mobile experience state and controls:
 * ```tsx
 * import { useMobileExperience } from '~/hooks/useMobileExperience';
 * 
 * function MyComponent() {
 *   const { state, deviceInfo, performanceMetrics, optimizeForMobile } = useMobileExperience();
 *   
 *   useEffect(() => {
 *     if (deviceInfo.type === 'mobile') {
 *       optimizeForMobile();
 *     }
 *   }, [deviceInfo.type, optimizeForMobile]);
 *   
 *   return <div>...</div>;
 * }
 * ```
 * 
 * 4. Use individual components for specific functionality:
 * ```tsx
 * import { 
 *   TouchOptimizedInterface, 
 *   MobileLayoutAdapter, 
 *   HapticFeedbackSystem 
 * } from '~/components/mobile';
 * 
 * function SpecificComponent() {
 *   return (
 *     <div>
 *       <TouchOptimizedInterface />
 *       <MobileLayoutAdapter />
 *       <HapticFeedbackSystem enabled={true} deviceType="mobile" />
 *     </div>
 *   );
 * }
 * ```
 */
