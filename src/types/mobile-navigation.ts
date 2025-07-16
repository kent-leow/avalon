/**
 * Mobile Navigation Types
 * Type definitions for mobile-first navigation and touch interactions
 */

export type DeviceOrientation = 'portrait' | 'landscape';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export type TouchFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'error';

export interface TouchGestureConfig {
  enabled: boolean;
  threshold: number; // pixels
  velocity: number; // pixels per second
  preventDefault: boolean;
}

export interface SwipeGestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchZoom?: (scale: number) => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
}

export interface TouchTarget {
  id: string;
  element: HTMLElement;
  minSize: number; // minimum touch target size in pixels
  expandedHitArea: number; // expanded invisible hit area
  hapticFeedback: TouchFeedbackType;
}

export interface MobileNavigation {
  currentPage: string;
  pages: MobileNavPage[];
  bottomSafe: boolean; // Safe area handling for devices with home indicators
  gestureNavigation: boolean;
  orientation: DeviceOrientation;
}

export interface MobileNavPage {
  id: string;
  title: string;
  icon: string;
  path: string;
  isActive: boolean;
  badge?: number;
  disabled?: boolean;
}

export interface MobileBreakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
  columns: number;
  fontSize: number;
  padding: number;
  touchTargetSize: number;
}

export interface MobileViewport {
  width: number;
  height: number;
  orientation: DeviceOrientation;
  breakpoint: MobileBreakpoint;
  safeArea: SafeArea;
  hasNotch: boolean;
  pixelRatio: number;
}

export interface SafeArea {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface MobileActionSheet {
  id: string;
  title: string;
  actions: MobileAction[];
  isOpen: boolean;
  onClose: () => void;
  destructive?: boolean;
}

export interface MobileAction {
  id: string;
  title: string;
  icon?: string;
  disabled?: boolean;
  destructive?: boolean;
  haptic?: TouchFeedbackType;
  onPress: () => void;
}

export interface MobileBottomSheet {
  id: string;
  title: string;
  content: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  snapPoints: number[]; // percentage heights
  initialSnap: number;
  backdrop: boolean;
}

export interface MobileFloatingButton {
  id: string;
  icon: string;
  label: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size: 'small' | 'medium' | 'large';
  color: string;
  disabled?: boolean;
  badge?: number;
  haptic?: TouchFeedbackType;
  onPress: () => void;
}

export interface MobilePullToRefresh {
  enabled: boolean;
  threshold: number; // pixels to pull before triggering
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  customIndicator?: React.ReactNode;
}

export interface MobileKeyboard {
  isVisible: boolean;
  height: number;
  onShow: () => void;
  onHide: () => void;
  adjustViewport: boolean;
}

export interface MobileGameBoard {
  orientation: DeviceOrientation;
  players: Array<{
    id: string;
    name: string;
    position: { x: number; y: number };
    selected: boolean;
    touchTarget: TouchTarget;
  }>;
  onPlayerSelect: (playerId: string) => void;
  touchFeedback: boolean;
  zoomEnabled: boolean;
  minZoom: number;
  maxZoom: number;
  currentZoom: number;
  onZoomChange: (zoom: number) => void;
}

export interface MobileConnectionIndicator {
  status: 'connected' | 'disconnected' | 'reconnecting' | 'error';
  signal: 'excellent' | 'good' | 'poor' | 'offline';
  latency: number;
  animation: string;
  color: string;
  tooltip: string;
}

export interface MobileNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration: number;
  haptic?: TouchFeedbackType;
  action?: MobileAction;
  onDismiss: () => void;
}

export interface MobileAccessibility {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  voiceOverEnabled: boolean;
  screenReaderEnabled: boolean;
  focusRingVisible: boolean;
}

export interface MobilePerformance {
  animationFrameRate: number;
  memoryUsage: number;
  batteryLevel: number;
  powerSaveMode: boolean;
  connectionType: 'wifi' | 'cellular' | 'offline';
  bandwidthEstimate: number;
}

export interface MobileGameState {
  isFullscreen: boolean;
  isLandscape: boolean;
  keyboardVisible: boolean;
  backgrounded: boolean;
  visibility: 'visible' | 'hidden' | 'prerender';
  wakeLockActive: boolean;
  installPromptAvailable: boolean;
}

export interface MobileSettingsPreferences {
  hapticFeedback: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  autoRotate: boolean;
  preferredOrientation: DeviceOrientation | 'auto';
  textSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'auto';
  dataUsage: 'full' | 'reduced' | 'minimal';
}

// Mobile-specific constants
export const MOBILE_BREAKPOINTS: MobileBreakpoint[] = [
  {
    name: 'small',
    minWidth: 320,
    maxWidth: 374,
    columns: 1,
    fontSize: 16,
    padding: 16,
    touchTargetSize: 44,
  },
  {
    name: 'medium',
    minWidth: 375,
    maxWidth: 413,
    columns: 1,
    fontSize: 17,
    padding: 20,
    touchTargetSize: 48,
  },
  {
    name: 'large',
    minWidth: 414,
    maxWidth: 767,
    columns: 2,
    fontSize: 18,
    padding: 24,
    touchTargetSize: 56,
  },
  {
    name: 'tablet',
    minWidth: 768,
    columns: 3,
    fontSize: 19,
    padding: 32,
    touchTargetSize: 60,
  },
];

export const TOUCH_TARGET_SIZES = {
  minimum: 44, // Apple guidelines
  recommended: 48, // Material Design
  comfortable: 56, // Large primary actions
  accessible: 60, // Enhanced accessibility
} as const;

export const GESTURE_THRESHOLDS = {
  swipe: 50, // pixels
  velocity: 0.5, // pixels per millisecond
  pinch: 0.1, // scale difference
  doubleTap: 300, // milliseconds between taps
  longPress: 500, // milliseconds
} as const;

export const HAPTIC_PATTERNS = {
  light: [10],
  medium: [20],
  heavy: [30],
  success: [10, 50, 10],
  error: [50, 100, 50],
  notification: [10, 20, 10],
} as const;
