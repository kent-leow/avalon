import { type DeviceInfo, type TouchInteraction, type PerformanceMetrics, type ConnectivityStatus, type ViewportInfo, type LayoutInfo, type HapticFeedbackType, type TouchTarget, type OptimizationRecommendation, type MobileAnalytics, MOBILE_BREAKPOINTS, TOUCH_TARGET_SIZES, HAPTIC_FEEDBACK_PATTERNS } from '~/types/mobile-experience';

/**
 * Device Detection Utilities
 */
export const detectDeviceType = (userAgent?: string): DeviceInfo['type'] => {
  if (typeof window === 'undefined') return 'desktop';
  
  const ua = userAgent || navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua) || (window.innerWidth >= MOBILE_BREAKPOINTS.tablet && window.innerWidth < MOBILE_BREAKPOINTS.desktop);
  
  if (isMobile && !isTablet) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
};

export const detectOrientation = (): 'portrait' | 'landscape' => {
  if (typeof window === 'undefined') return 'landscape';
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
};

export const detectTouchSupport = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const detectPlatformOS = (userAgent?: string): DeviceInfo['platformOS'] => {
  if (typeof window === 'undefined') return 'linux';
  
  const ua = userAgent || navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  if (/Win/i.test(ua)) return 'windows';
  if (/Mac/i.test(ua)) return 'macos';
  return 'linux';
};

export const createMockDeviceInfo = (overrides: Partial<DeviceInfo> = {}): DeviceInfo => ({
  type: 'mobile',
  orientation: 'portrait',
  screenSize: { width: 375, height: 667 },
  touchSupport: true,
  batteryLevel: 85,
  connectionType: 'wifi',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  platformOS: 'ios',
  devicePixelRatio: 2,
  ...overrides,
});

/**
 * Touch Optimization Utilities
 */
export const calculateTouchTargetSize = (element: HTMLElement): { width: number; height: number } => {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
  };
};

export const isValidTouchTarget = (element: HTMLElement, minSize: number = TOUCH_TARGET_SIZES.small): boolean => {
  const size = calculateTouchTargetSize(element);
  return size.width >= minSize && size.height >= minSize;
};

export const optimizeTouchTarget = (element: HTMLElement, targetSize: number): void => {
  const currentSize = calculateTouchTargetSize(element);
  
  if (currentSize.width < targetSize) {
    element.style.minWidth = `${targetSize}px`;
    element.style.paddingLeft = `${(targetSize - currentSize.width) / 2}px`;
    element.style.paddingRight = `${(targetSize - currentSize.width) / 2}px`;
  }
  
  if (currentSize.height < targetSize) {
    element.style.minHeight = `${targetSize}px`;
    element.style.paddingTop = `${(targetSize - currentSize.height) / 2}px`;
    element.style.paddingBottom = `${(targetSize - currentSize.height) / 2}px`;
  }
};

export const createMockTouchInteraction = (overrides: Partial<TouchInteraction> = {}): TouchInteraction => ({
  type: 'tap',
  coordinates: { x: 100, y: 200 },
  element: 'button',
  timestamp: Date.now(),
  duration: 150,
  force: 0.5,
  targetSize: { width: 48, height: 48 },
  ...overrides,
});

/**
 * Performance Monitoring Utilities
 */
export const measurePerformanceMetrics = (): PerformanceMetrics => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const memory = (performance as any).memory;
  
  return {
    frameRate: 60, // Would be calculated from requestAnimationFrame
    memoryUsage: memory ? memory.usedJSHeapSize / 1024 / 1024 : 0,
    batteryImpact: 'medium',
    dataUsage: 0, // Would be tracked through network requests
    renderTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
    cpuUsage: 0, // Would be estimated from performance timings
    networkLatency: navigation ? navigation.responseEnd - navigation.requestStart : 0,
    cacheHitRate: 0.85,
  };
};

export const createMockPerformanceMetrics = (overrides: Partial<PerformanceMetrics> = {}): PerformanceMetrics => ({
  frameRate: 60,
  memoryUsage: 45.2,
  batteryImpact: 'medium',
  dataUsage: 1.2,
  renderTime: 150,
  cpuUsage: 25.5,
  networkLatency: 120,
  cacheHitRate: 0.85,
  ...overrides,
});

export const calculateBatteryImpact = (metrics: PerformanceMetrics): 'low' | 'medium' | 'high' => {
  if (metrics.cpuUsage && metrics.cpuUsage > 80) return 'high';
  if (metrics.frameRate < 30) return 'high';
  if (metrics.memoryUsage > 100) return 'high';
  if (metrics.cpuUsage && metrics.cpuUsage > 50) return 'medium';
  if (metrics.frameRate < 45) return 'medium';
  if (metrics.memoryUsage > 50) return 'medium';
  return 'low';
};

/**
 * Connectivity Utilities
 */
export const detectConnectivityStatus = (): ConnectivityStatus => {
  if (typeof navigator === 'undefined') {
    return {
      isOnline: true,
      connectionType: 'wifi',
      bandwidth: 10,
      latency: 50,
      signalStrength: 100,
      dataLimitReached: false,
    };
  }
  
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  return {
    isOnline: navigator.onLine,
    connectionType: connection?.type === 'cellular' ? 'cellular' : navigator.onLine ? 'wifi' : 'offline',
    bandwidth: connection?.downlink || 10,
    latency: connection?.rtt || 50,
    signalStrength: connection?.signalStrength || 100,
    dataLimitReached: false,
  };
};

export const createMockConnectivityStatus = (overrides: Partial<ConnectivityStatus> = {}): ConnectivityStatus => ({
  isOnline: true,
  connectionType: 'wifi',
  bandwidth: 10,
  latency: 50,
  signalStrength: 100,
  dataLimitReached: false,
  ...overrides,
});

/**
 * Viewport Utilities
 */
export const getViewportInfo = (): ViewportInfo => {
  if (typeof window === 'undefined') {
    return {
      width: 375,
      height: 667,
      availableWidth: 375,
      availableHeight: 667,
      safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
    };
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    availableWidth: window.screen.availWidth,
    availableHeight: window.screen.availHeight,
    safeAreaInsets: {
      top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || '0'),
      right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-right') || '0'),
      bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-left') || '0'),
    },
  };
};

export const createMockViewportInfo = (overrides: Partial<ViewportInfo> = {}): ViewportInfo => ({
  width: 375,
  height: 667,
  availableWidth: 375,
  availableHeight: 667,
  safeAreaInsets: { top: 44, right: 0, bottom: 34, left: 0 },
  ...overrides,
});

/**
 * Layout Adaptation Utilities
 */
export const calculateLayoutInfo = (viewport: ViewportInfo, adaptationLevel: LayoutInfo['adaptationLevel']): LayoutInfo => {
  const isMobile = viewport.width < MOBILE_BREAKPOINTS.mobile;
  const isTablet = viewport.width >= MOBILE_BREAKPOINTS.mobile && viewport.width < MOBILE_BREAKPOINTS.tablet;
  
  let layout: LayoutInfo['layout'] = 'regular';
  if (isMobile) layout = 'compact';
  if (viewport.width >= MOBILE_BREAKPOINTS.desktop) layout = 'expanded';
  
  return {
    adaptationLevel,
    layout,
    components: {
      header: { 
        height: isMobile ? 56 : 64, 
        visible: true 
      },
      footer: { 
        height: isMobile ? 80 : 60, 
        visible: true 
      },
      sidebar: { 
        width: isMobile ? 0 : isTablet ? 240 : 280, 
        visible: !isMobile 
      },
      content: {
        width: viewport.width - (isMobile ? 0 : isTablet ? 240 : 280),
        height: viewport.height - (isMobile ? 136 : 124),
      },
    },
  };
};

export const createMockLayoutInfo = (overrides: Partial<LayoutInfo> = {}): LayoutInfo => ({
  adaptationLevel: 'enhanced',
  layout: 'compact',
  components: {
    header: { height: 56, visible: true },
    footer: { height: 80, visible: true },
    sidebar: { width: 0, visible: false },
    content: { width: 375, height: 531 },
  },
  ...overrides,
});

/**
 * Haptic Feedback Utilities
 */
export const triggerHapticFeedback = (type: HapticFeedbackType): void => {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  
  const pattern = HAPTIC_FEEDBACK_PATTERNS[type];
  if (pattern) {
    navigator.vibrate(pattern);
  }
};

export const isHapticFeedbackSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

/**
 * Optimization Utilities
 */
export const generateOptimizationRecommendations = (
  metrics: PerformanceMetrics,
  device: DeviceInfo,
  connectivity: ConnectivityStatus
): OptimizationRecommendation[] => {
  const recommendations: OptimizationRecommendation[] = [];
  
  if (metrics.frameRate < 30) {
    recommendations.push({
      type: 'performance',
      priority: 'high',
      title: 'Low Frame Rate Detected',
      description: 'Your device is experiencing low frame rates which may affect gameplay.',
      action: 'Reduce visual effects or close background apps',
      impact: 'Improve gameplay smoothness by 40%',
    });
  }
  
  if (metrics.memoryUsage > 80) {
    recommendations.push({
      type: 'performance',
      priority: 'high',
      title: 'High Memory Usage',
      description: 'Memory usage is high which may cause app crashes.',
      action: 'Enable memory optimization mode',
      impact: 'Reduce memory usage by 25%',
    });
  }
  
  if (device.batteryLevel && device.batteryLevel < 20) {
    recommendations.push({
      type: 'battery',
      priority: 'medium',
      title: 'Low Battery',
      description: 'Battery level is low. Consider enabling power saving mode.',
      action: 'Enable battery optimization',
      impact: 'Extend battery life by 30%',
    });
  }
  
  if (connectivity.connectionType === 'cellular' && connectivity.bandwidth && connectivity.bandwidth < 1) {
    recommendations.push({
      type: 'connectivity',
      priority: 'medium',
      title: 'Slow Connection',
      description: 'Slow cellular connection detected.',
      action: 'Enable data optimization mode',
      impact: 'Reduce data usage by 50%',
    });
  }
  
  return recommendations;
};

export const createMockOptimizationRecommendations = (): OptimizationRecommendation[] => [
  {
    type: 'performance',
    priority: 'medium',
    title: 'Enable Performance Mode',
    description: 'Your device can handle enhanced performance settings.',
    action: 'Switch to performance mode',
    impact: 'Improve responsiveness by 20%',
  },
  {
    type: 'battery',
    priority: 'low',
    title: 'Battery Optimization Available',
    description: 'You can enable battery saving features.',
    action: 'Enable battery optimization',
    impact: 'Extend battery life by 15%',
  },
];

/**
 * Analytics Utilities
 */
export const createMobileAnalytics = (sessionId: string): MobileAnalytics => ({
  sessionId,
  deviceInfo: createMockDeviceInfo(),
  performanceMetrics: [createMockPerformanceMetrics()],
  touchInteractions: [createMockTouchInteraction()],
  connectivityEvents: [createMockConnectivityStatus()],
  batteryEvents: [{ level: 85, timestamp: Date.now() }],
  crashReports: [],
});

export const trackTouchInteraction = (interaction: TouchInteraction): void => {
  // In a real implementation, this would send analytics data
  console.log('Touch interaction tracked:', interaction);
};

export const trackPerformanceMetrics = (metrics: PerformanceMetrics): void => {
  // In a real implementation, this would send analytics data
  console.log('Performance metrics tracked:', metrics);
};

export const trackConnectivityChange = (status: ConnectivityStatus): void => {
  // In a real implementation, this would send analytics data
  console.log('Connectivity change tracked:', status);
};

/**
 * Safe Area Utilities
 */
export const applySafeAreaInsets = (element: HTMLElement, viewport: ViewportInfo): void => {
  const { safeAreaInsets } = viewport;
  
  element.style.paddingTop = `${safeAreaInsets.top}px`;
  element.style.paddingRight = `${safeAreaInsets.right}px`;
  element.style.paddingBottom = `${safeAreaInsets.bottom}px`;
  element.style.paddingLeft = `${safeAreaInsets.left}px`;
};

export const getSafeAreaCSS = (viewport: ViewportInfo): Record<string, string> => {
  const { safeAreaInsets } = viewport;
  
  return {
    '--safe-area-inset-top': `${safeAreaInsets.top}px`,
    '--safe-area-inset-right': `${safeAreaInsets.right}px`,
    '--safe-area-inset-bottom': `${safeAreaInsets.bottom}px`,
    '--safe-area-inset-left': `${safeAreaInsets.left}px`,
  };
};

/**
 * Data Optimization Utilities
 */
export const shouldOptimizeData = (connectivity: ConnectivityStatus): boolean => {
  return connectivity.connectionType === 'cellular' || (connectivity.bandwidth !== undefined && connectivity.bandwidth < 2);
};

export const getOptimizedImageSrc = (src: string, deviceInfo: DeviceInfo): string => {
  const { devicePixelRatio = 1, screenSize } = deviceInfo;
  const targetWidth = Math.min(screenSize.width * devicePixelRatio, 1200);
  
  // In a real implementation, this would return an optimized image URL
  return src.replace(/\.(jpg|jpeg|png|webp)$/i, `_${targetWidth}w.$1`);
};

export const formatDataUsage = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
};

/**
 * Validation Utilities
 */
export const validateTouchTarget = (element: HTMLElement): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  const size = calculateTouchTargetSize(element);
  
  if (size.width < TOUCH_TARGET_SIZES.small) {
    issues.push(`Touch target width (${size.width}px) is below minimum (${TOUCH_TARGET_SIZES.small}px)`);
  }
  
  if (size.height < TOUCH_TARGET_SIZES.small) {
    issues.push(`Touch target height (${size.height}px) is below minimum (${TOUCH_TARGET_SIZES.small}px)`);
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
};

export const validateMobileExperience = (deviceInfo: DeviceInfo): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  if (deviceInfo.type === 'mobile' && deviceInfo.screenSize.width < 320) {
    issues.push('Screen width is below minimum supported size (320px)');
  }
  
  if (!deviceInfo.touchSupport && deviceInfo.type === 'mobile') {
    issues.push('Touch support is required for mobile devices');
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
};
