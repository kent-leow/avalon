import { type DeviceInfo, type TouchInteraction, type PerformanceMetrics, type ConnectivityStatus, type ViewportInfo, type LayoutInfo, type MobileExperienceState, type MobileExperiencePreferences, type OptimizationRecommendation, type MobileAnalytics, type HapticFeedbackType, TOUCH_TARGET_SIZES } from '~/types/mobile-experience';

/**
 * Mock Device Profiles
 */
export const MOCK_DEVICE_PROFILES: Record<string, DeviceInfo> = {
  iPhone13: {
    type: 'mobile',
    orientation: 'portrait',
    screenSize: { width: 390, height: 844 },
    touchSupport: true,
    batteryLevel: 78,
    connectionType: 'wifi',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    platformOS: 'ios',
    devicePixelRatio: 3,
  },
  samsungGalaxyS21: {
    type: 'mobile',
    orientation: 'portrait',
    screenSize: { width: 384, height: 854 },
    touchSupport: true,
    batteryLevel: 65,
    connectionType: 'cellular',
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.181 Mobile Safari/537.36',
    platformOS: 'android',
    devicePixelRatio: 2.75,
  },
  iPadPro: {
    type: 'tablet',
    orientation: 'landscape',
    screenSize: { width: 1194, height: 834 },
    touchSupport: true,
    batteryLevel: 92,
    connectionType: 'wifi',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    platformOS: 'ios',
    devicePixelRatio: 2,
  },
  desktopLaptop: {
    type: 'desktop',
    orientation: 'landscape',
    screenSize: { width: 1440, height: 900 },
    touchSupport: false,
    batteryLevel: undefined,
    connectionType: 'wifi',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    platformOS: 'macos',
    devicePixelRatio: 2,
  },
};

/**
 * Mock Performance Scenarios
 */
export const MOCK_PERFORMANCE_SCENARIOS: Record<string, PerformanceMetrics> = {
  excellent: {
    frameRate: 60,
    memoryUsage: 25.5,
    batteryImpact: 'low',
    dataUsage: 0.8,
    renderTime: 45,
    cpuUsage: 15.2,
    networkLatency: 35,
    cacheHitRate: 0.95,
  },
  good: {
    frameRate: 50,
    memoryUsage: 45.3,
    batteryImpact: 'medium',
    dataUsage: 1.5,
    renderTime: 85,
    cpuUsage: 35.7,
    networkLatency: 80,
    cacheHitRate: 0.85,
  },
  poor: {
    frameRate: 25,
    memoryUsage: 78.9,
    batteryImpact: 'high',
    dataUsage: 3.2,
    renderTime: 180,
    cpuUsage: 65.4,
    networkLatency: 250,
    cacheHitRate: 0.65,
  },
  critical: {
    frameRate: 15,
    memoryUsage: 95.2,
    batteryImpact: 'high',
    dataUsage: 5.8,
    renderTime: 350,
    cpuUsage: 85.8,
    networkLatency: 500,
    cacheHitRate: 0.45,
  },
};

/**
 * Mock Connectivity Scenarios
 */
export const MOCK_CONNECTIVITY_SCENARIOS: Record<string, ConnectivityStatus> = {
  excellentWifi: {
    isOnline: true,
    connectionType: 'wifi',
    bandwidth: 50,
    latency: 15,
    signalStrength: 100,
    dataLimitReached: false,
  },
  goodWifi: {
    isOnline: true,
    connectionType: 'wifi',
    bandwidth: 10,
    latency: 35,
    signalStrength: 80,
    dataLimitReached: false,
  },
  cellular5G: {
    isOnline: true,
    connectionType: 'cellular',
    bandwidth: 25,
    latency: 25,
    signalStrength: 90,
    dataLimitReached: false,
  },
  cellular4G: {
    isOnline: true,
    connectionType: 'cellular',
    bandwidth: 5,
    latency: 80,
    signalStrength: 70,
    dataLimitReached: false,
  },
  cellular3G: {
    isOnline: true,
    connectionType: 'cellular',
    bandwidth: 0.5,
    latency: 200,
    signalStrength: 50,
    dataLimitReached: false,
  },
  poorConnection: {
    isOnline: true,
    connectionType: 'wifi',
    bandwidth: 0.1,
    latency: 800,
    signalStrength: 20,
    dataLimitReached: false,
  },
  offline: {
    isOnline: false,
    connectionType: 'offline',
    bandwidth: 0,
    latency: 0,
    signalStrength: 0,
    dataLimitReached: false,
  },
};

/**
 * Mock Touch Interactions
 */
export const MOCK_TOUCH_INTERACTIONS: TouchInteraction[] = [
  {
    type: 'tap',
    coordinates: { x: 100, y: 200 },
    element: 'vote-button',
    timestamp: Date.now() - 1000,
    duration: 120,
    force: 0.6,
    targetSize: { width: 48, height: 48 },
  },
  {
    type: 'long-press',
    coordinates: { x: 200, y: 300 },
    element: 'player-card',
    timestamp: Date.now() - 2000,
    duration: 800,
    force: 0.8,
    targetSize: { width: 80, height: 120 },
  },
  {
    type: 'swipe',
    coordinates: { x: 150, y: 400 },
    element: 'mission-card',
    timestamp: Date.now() - 3000,
    duration: 300,
    force: 0.4,
    targetSize: { width: 120, height: 80 },
  },
  {
    type: 'pinch',
    coordinates: { x: 180, y: 250 },
    element: 'game-board',
    timestamp: Date.now() - 4000,
    duration: 500,
    force: 0.7,
    targetSize: { width: 300, height: 200 },
  },
];

/**
 * Mock Viewport Configurations
 */
export const MOCK_VIEWPORT_CONFIGS: Record<string, ViewportInfo> = {
  iphoneSE: {
    width: 375,
    height: 667,
    availableWidth: 375,
    availableHeight: 667,
    safeAreaInsets: { top: 20, right: 0, bottom: 0, left: 0 },
  },
  iphoneX: {
    width: 375,
    height: 812,
    availableWidth: 375,
    availableHeight: 812,
    safeAreaInsets: { top: 44, right: 0, bottom: 34, left: 0 },
  },
  iphone14Pro: {
    width: 393,
    height: 852,
    availableWidth: 393,
    availableHeight: 852,
    safeAreaInsets: { top: 47, right: 0, bottom: 34, left: 0 },
  },
  androidPhone: {
    width: 360,
    height: 640,
    availableWidth: 360,
    availableHeight: 640,
    safeAreaInsets: { top: 24, right: 0, bottom: 0, left: 0 },
  },
  tabletPortrait: {
    width: 768,
    height: 1024,
    availableWidth: 768,
    availableHeight: 1024,
    safeAreaInsets: { top: 20, right: 0, bottom: 0, left: 0 },
  },
  tabletLandscape: {
    width: 1024,
    height: 768,
    availableWidth: 1024,
    availableHeight: 768,
    safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
  },
};

/**
 * Mock Layout Configurations
 */
export const MOCK_LAYOUT_CONFIGS: Record<string, LayoutInfo> = {
  mobileCompact: {
    adaptationLevel: 'enhanced',
    layout: 'compact',
    components: {
      header: { height: 56, visible: true },
      footer: { height: 80, visible: true },
      sidebar: { width: 0, visible: false },
      content: { width: 375, height: 611 },
    },
  },
  mobileExpanded: {
    adaptationLevel: 'enhanced',
    layout: 'regular',
    components: {
      header: { height: 64, visible: true },
      footer: { height: 72, visible: true },
      sidebar: { width: 0, visible: false },
      content: { width: 375, height: 640 },
    },
  },
  tabletPortrait: {
    adaptationLevel: 'enhanced',
    layout: 'regular',
    components: {
      header: { height: 64, visible: true },
      footer: { height: 60, visible: true },
      sidebar: { width: 240, visible: true },
      content: { width: 528, height: 900 },
    },
  },
  tabletLandscape: {
    adaptationLevel: 'enhanced',
    layout: 'expanded',
    components: {
      header: { height: 64, visible: true },
      footer: { height: 60, visible: true },
      sidebar: { width: 280, visible: true },
      content: { width: 744, height: 644 },
    },
  },
  desktop: {
    adaptationLevel: 'basic',
    layout: 'expanded',
    components: {
      header: { height: 64, visible: true },
      footer: { height: 60, visible: true },
      sidebar: { width: 320, visible: true },
      content: { width: 1120, height: 776 },
    },
  },
};

/**
 * Mock Optimization Recommendations
 */
export const MOCK_OPTIMIZATION_RECOMMENDATIONS: Record<string, OptimizationRecommendation[]> = {
  excellentDevice: [
    {
      type: 'performance',
      priority: 'low',
      title: 'Enable Enhanced Graphics',
      description: 'Your device can handle enhanced visual effects.',
      action: 'Enable high-quality graphics mode',
      impact: 'Improve visual quality by 30%',
    },
  ],
  goodDevice: [
    {
      type: 'performance',
      priority: 'medium',
      title: 'Optimize Performance',
      description: 'Enable balanced performance mode for optimal experience.',
      action: 'Switch to balanced mode',
      impact: 'Improve responsiveness by 20%',
    },
  ],
  poorDevice: [
    {
      type: 'performance',
      priority: 'high',
      title: 'Enable Low Power Mode',
      description: 'Your device is struggling with performance.',
      action: 'Enable low power mode',
      impact: 'Improve stability by 40%',
    },
    {
      type: 'battery',
      priority: 'high',
      title: 'Reduce Background Activity',
      description: 'High battery usage detected.',
      action: 'Disable animations and effects',
      impact: 'Extend battery life by 50%',
    },
  ],
  slowConnection: [
    {
      type: 'connectivity',
      priority: 'high',
      title: 'Enable Data Saver Mode',
      description: 'Slow connection detected.',
      action: 'Enable data optimization',
      impact: 'Reduce data usage by 60%',
    },
  ],
};

/**
 * Mock User Preferences
 */
export const MOCK_USER_PREFERENCES: Record<string, MobileExperiencePreferences> = {
  powerUser: {
    touchTargetSize: 'medium',
    hapticFeedbackEnabled: true,
    adaptationLevel: 'enhanced',
    performanceMode: 'performance',
    dataOptimization: false,
    offlineMode: false,
  },
  casualUser: {
    touchTargetSize: 'medium',
    hapticFeedbackEnabled: true,
    adaptationLevel: 'enhanced',
    performanceMode: 'balanced',
    dataOptimization: true,
    offlineMode: true,
  },
  accessibilityUser: {
    touchTargetSize: 'large',
    hapticFeedbackEnabled: true,
    adaptationLevel: 'native',
    performanceMode: 'balanced',
    dataOptimization: true,
    offlineMode: true,
  },
  batteryConscious: {
    touchTargetSize: 'medium',
    hapticFeedbackEnabled: false,
    adaptationLevel: 'basic',
    performanceMode: 'battery',
    dataOptimization: true,
    offlineMode: true,
  },
};

/**
 * Mock Analytics Data
 */
export const MOCK_ANALYTICS_DATA: MobileAnalytics = {
  sessionId: 'session_123456789',
  deviceInfo: MOCK_DEVICE_PROFILES.iPhone13!,
  performanceMetrics: [
    MOCK_PERFORMANCE_SCENARIOS.excellent!,
    MOCK_PERFORMANCE_SCENARIOS.good!,
    MOCK_PERFORMANCE_SCENARIOS.good!,
  ],
  touchInteractions: MOCK_TOUCH_INTERACTIONS,
  connectivityEvents: [
    MOCK_CONNECTIVITY_SCENARIOS.excellentWifi!,
    MOCK_CONNECTIVITY_SCENARIOS.goodWifi!,
    MOCK_CONNECTIVITY_SCENARIOS.cellular4G!,
  ],
  batteryEvents: [
    { level: 100, timestamp: Date.now() - 3600000 },
    { level: 85, timestamp: Date.now() - 1800000 },
    { level: 78, timestamp: Date.now() },
  ],
  crashReports: [],
};

/**
 * Mock Haptic Feedback Scenarios
 */
export const MOCK_HAPTIC_SCENARIOS: Record<string, { type: HapticFeedbackType; context: string }[]> = {
  gameStart: [
    { type: 'notification', context: 'Game successfully created' },
    { type: 'medium', context: 'All players joined' },
    { type: 'light', context: 'Game starting in 3 seconds' },
  ],
  voting: [
    { type: 'light', context: 'Vote cast' },
    { type: 'medium', context: 'Vote changed' },
    { type: 'heavy', context: 'Voting complete' },
  ],
  mission: [
    { type: 'notification', context: 'Mission succeeded' },
    { type: 'impact', context: 'Mission failed' },
    { type: 'selection', context: 'Mission about to start' },
  ],
  gameEnd: [
    { type: 'notification', context: 'Good wins' },
    { type: 'heavy', context: 'Evil wins' },
    { type: 'medium', context: 'Game over' },
  ],
};

/**
 * Mock State Templates
 */
export const MOCK_STATE_TEMPLATES: Record<string, Partial<MobileExperienceState>> = {
  initial: {
    deviceInfo: MOCK_DEVICE_PROFILES.iPhone13!,
    performanceMetrics: MOCK_PERFORMANCE_SCENARIOS.excellent!,
    connectivityStatus: MOCK_CONNECTIVITY_SCENARIOS.excellentWifi!,
    viewportInfo: MOCK_VIEWPORT_CONFIGS.iphoneX!,
    touchOptimization: {
      enabled: true,
      targetSize: 'medium',
      hapticFeedback: true,
    },
    layoutAdaptation: {
      level: 'enhanced',
      currentLayout: MOCK_LAYOUT_CONFIGS.mobileCompact!,
    },
    optimizationLevel: 'medium',
    batteryOptimization: true,
    dataOptimization: true,
    offlineMode: false,
  },
  optimizing: {
    optimizationLevel: 'high',
    performanceMetrics: MOCK_PERFORMANCE_SCENARIOS.poor!,
    batteryOptimization: true,
    dataOptimization: true,
  },
  offline: {
    connectivityStatus: MOCK_CONNECTIVITY_SCENARIOS.offline!,
    offlineMode: true,
    dataOptimization: true,
  },
  lowBattery: {
    deviceInfo: { ...MOCK_DEVICE_PROFILES.iPhone13!, batteryLevel: 15 },
    performanceMetrics: MOCK_PERFORMANCE_SCENARIOS.poor!,
    optimizationLevel: 'high',
    batteryOptimization: true,
    dataOptimization: true,
  },
};

/**
 * Mock Touch Target Scenarios
 */
export const MOCK_TOUCH_TARGET_SCENARIOS: Record<string, { element: string; size: { width: number; height: number }; valid: boolean }[]> = {
  compliant: [
    { element: 'vote-button', size: { width: 48, height: 48 }, valid: true },
    { element: 'player-card', size: { width: 80, height: 120 }, valid: true },
    { element: 'mission-card', size: { width: 120, height: 80 }, valid: true },
  ],
  nonCompliant: [
    { element: 'small-icon', size: { width: 24, height: 24 }, valid: false },
    { element: 'thin-button', size: { width: 100, height: 32 }, valid: false },
    { element: 'tiny-checkbox', size: { width: 16, height: 16 }, valid: false },
  ],
  mixed: [
    { element: 'vote-button', size: { width: 48, height: 48 }, valid: true },
    { element: 'small-icon', size: { width: 24, height: 24 }, valid: false },
    { element: 'player-card', size: { width: 80, height: 120 }, valid: true },
    { element: 'thin-button', size: { width: 100, height: 32 }, valid: false },
  ],
};

/**
 * Helper Functions for Mock Data
 */
export const getRandomMockDevice = (): DeviceInfo => {
  const devices = Object.values(MOCK_DEVICE_PROFILES);
  return devices[Math.floor(Math.random() * devices.length)]!;
};

export const getRandomMockPerformance = (): PerformanceMetrics => {
  const scenarios = Object.values(MOCK_PERFORMANCE_SCENARIOS);
  return scenarios[Math.floor(Math.random() * scenarios.length)]!;
};

export const getRandomMockConnectivity = (): ConnectivityStatus => {
  const scenarios = Object.values(MOCK_CONNECTIVITY_SCENARIOS);
  return scenarios[Math.floor(Math.random() * scenarios.length)]!;
};

export const createMockMobileState = (overrides: Partial<MobileExperienceState> = {}): MobileExperienceState => ({
  ...MOCK_STATE_TEMPLATES.initial,
  ...overrides,
} as MobileExperienceState);

export const createMockTouchInteraction = (overrides: Partial<TouchInteraction> = {}): TouchInteraction => ({
  type: 'tap',
  coordinates: { x: 100, y: 200 },
  element: 'button',
  timestamp: Date.now(),
  duration: 150,
  force: 0.5,
  targetSize: { width: TOUCH_TARGET_SIZES.medium, height: TOUCH_TARGET_SIZES.medium },
  ...overrides,
});

export const createMockOptimizationRecommendation = (overrides: Partial<OptimizationRecommendation> = {}): OptimizationRecommendation => ({
  type: 'performance',
  priority: 'medium',
  title: 'Mock Optimization',
  description: 'A mock optimization recommendation for testing.',
  action: 'Enable optimization',
  impact: 'Improve performance by 20%',
  ...overrides,
});
