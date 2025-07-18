export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  screenSize: { width: number; height: number };
  touchSupport: boolean;
  batteryLevel?: number;
  connectionType?: 'wifi' | 'cellular' | 'offline';
  userAgent?: string;
  platformOS?: 'ios' | 'android' | 'windows' | 'macos' | 'linux';
  devicePixelRatio?: number;
}

export interface TouchInteraction {
  type: 'tap' | 'swipe' | 'pinch' | 'long-press';
  coordinates: { x: number; y: number };
  element: string;
  timestamp: number;
  duration?: number;
  force?: number;
  targetSize?: { width: number; height: number };
}

export interface ViewportInfo {
  width: number;
  height: number;
  availableWidth: number;
  availableHeight: number;
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface LayoutInfo {
  adaptationLevel: 'basic' | 'enhanced' | 'native';
  layout: 'compact' | 'regular' | 'expanded';
  components: {
    header: { height: number; visible: boolean };
    footer: { height: number; visible: boolean };
    sidebar: { width: number; visible: boolean };
    content: { width: number; height: number };
  };
}

export interface PerformanceMetrics {
  frameRate: number;
  memoryUsage: number;
  batteryImpact: 'low' | 'medium' | 'high';
  dataUsage: number;
  renderTime: number;
  cpuUsage?: number;
  networkLatency?: number;
  cacheHitRate?: number;
}

export interface ConnectivityStatus {
  isOnline: boolean;
  connectionType: 'wifi' | 'cellular' | 'offline';
  bandwidth?: number;
  latency?: number;
  signalStrength?: number;
  dataLimitReached?: boolean;
}

export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'selection' | 'impact' | 'notification';

export interface HapticFeedbackConfig {
  type: HapticFeedbackType;
  duration?: number;
  intensity?: number;
  pattern?: number[];
}

export interface TouchTarget {
  id: string;
  element: HTMLElement;
  minSize: number;
  currentSize: { width: number; height: number };
  accessible: boolean;
  feedback: HapticFeedbackType;
}

export interface MobileExperienceState {
  deviceInfo: DeviceInfo;
  viewportInfo: ViewportInfo;
  performanceMetrics: PerformanceMetrics;
  connectivityStatus: ConnectivityStatus;
  touchOptimization: {
    enabled: boolean;
    targetSize: 'small' | 'medium' | 'large';
    hapticFeedback: boolean;
  };
  layoutAdaptation: {
    level: 'basic' | 'enhanced' | 'native';
    currentLayout: LayoutInfo;
  };
  optimizationLevel: 'low' | 'medium' | 'high';
  batteryOptimization: boolean;
  dataOptimization: boolean;
  offlineMode: boolean;
}

export interface MobileExperiencePreferences {
  touchTargetSize: 'small' | 'medium' | 'large';
  hapticFeedbackEnabled: boolean;
  adaptationLevel: 'basic' | 'enhanced' | 'native';
  performanceMode: 'battery' | 'performance' | 'balanced';
  dataOptimization: boolean;
  offlineMode: boolean;
}

export interface OptimizationRecommendation {
  type: 'performance' | 'battery' | 'connectivity' | 'accessibility';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  action: string;
  impact: string;
}

export interface MobileAnalytics {
  sessionId: string;
  deviceInfo: DeviceInfo;
  performanceMetrics: PerformanceMetrics[];
  touchInteractions: TouchInteraction[];
  connectivityEvents: ConnectivityStatus[];
  batteryEvents: { level: number; timestamp: number }[];
  crashReports: { error: string; timestamp: number }[];
}

export interface MobileExperienceConfig {
  touchTargetMinSize: number;
  touchTargetPadding: number;
  hapticFeedbackEnabled: boolean;
  performanceMonitoring: boolean;
  analyticsEnabled: boolean;
  batteryOptimization: boolean;
  dataOptimization: boolean;
  offlineSupport: boolean;
}

export const DEFAULT_MOBILE_CONFIG: MobileExperienceConfig = {
  touchTargetMinSize: 44,
  touchTargetPadding: 8,
  hapticFeedbackEnabled: true,
  performanceMonitoring: true,
  analyticsEnabled: true,
  batteryOptimization: true,
  dataOptimization: true,
  offlineSupport: true,
};

export const MOBILE_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const;

export const TOUCH_TARGET_SIZES = {
  small: 44,
  medium: 48,
  large: 56,
} as const;

export const HAPTIC_FEEDBACK_PATTERNS = {
  light: [10],
  medium: [20],
  heavy: [30],
  selection: [10, 10],
  impact: [15, 15, 15],
  notification: [10, 20, 10],
} as const;
