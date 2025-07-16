/**
 * Mobile Utility Functions
 * Utility functions for mobile device detection, touch handling, and responsive behavior
 */

import type {
  DeviceOrientation,
  MobileBreakpoint,
  MobileViewport,
  SafeArea,
  TouchFeedbackType,
  SwipeDirection,
  MobilePerformance,
  MobileAccessibility,
  MobileGameState,
} from '~/types/mobile-navigation';

import { MOBILE_BREAKPOINTS, TOUCH_TARGET_SIZES, GESTURE_THRESHOLDS, HAPTIC_PATTERNS } from '~/types/mobile-navigation';

/**
 * Device Detection Utilities
 */

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768 ||
         'ontouchstart' in window ||
         navigator.maxTouchPoints > 0;
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window ||
         navigator.maxTouchPoints > 0 ||
         window.matchMedia('(pointer: coarse)').matches;
}

export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android/.test(navigator.userAgent);
}

export function hasNotch(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for iPhone X and newer models
  return isIOS() && (
    window.screen.width === 375 && window.screen.height === 812 || // iPhone X, XS, 11 Pro
    window.screen.width === 414 && window.screen.height === 896 || // iPhone XR, 11, XS Max, 11 Pro Max
    window.screen.width === 390 && window.screen.height === 844 || // iPhone 12, 13 mini
    window.screen.width === 428 && window.screen.height === 926    // iPhone 12 Pro Max, 13 Pro Max
  );
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

/**
 * Viewport and Orientation Utilities
 */

export function getDeviceOrientation(): DeviceOrientation {
  if (typeof window === 'undefined') return 'portrait';
  
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

export function getCurrentBreakpoint(): MobileBreakpoint {
  if (typeof window === 'undefined') return MOBILE_BREAKPOINTS[0]!;
  
  const width = window.innerWidth;
  return MOBILE_BREAKPOINTS.find(bp => 
    width >= bp.minWidth && (bp.maxWidth === undefined || width <= bp.maxWidth)
  ) || MOBILE_BREAKPOINTS[MOBILE_BREAKPOINTS.length - 1]!;
}

export function getSafeArea(): SafeArea {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }
  
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0', 10),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0', 10),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0', 10),
  };
}

export function getMobileViewport(): MobileViewport {
  if (typeof window === 'undefined') {
    return {
      width: 375,
      height: 812,
      orientation: 'portrait',
      breakpoint: MOBILE_BREAKPOINTS[0]!,
      safeArea: { top: 0, bottom: 0, left: 0, right: 0 },
      hasNotch: false,
      pixelRatio: 1,
    };
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    orientation: getDeviceOrientation(),
    breakpoint: getCurrentBreakpoint(),
    safeArea: getSafeArea(),
    hasNotch: hasNotch(),
    pixelRatio: window.devicePixelRatio || 1,
  };
}

/**
 * Touch and Gesture Utilities
 */

export function triggerHapticFeedback(type: TouchFeedbackType): void {
  if (typeof window === 'undefined' || !navigator.vibrate) return;
  
  const pattern = HAPTIC_PATTERNS[type];
  if (pattern) {
    navigator.vibrate(pattern);
  }
}

export function createTouchTarget(
  element: HTMLElement,
  minSize: number = TOUCH_TARGET_SIZES.minimum,
  expandedHitArea: number = 8
): void {
  const rect = element.getBoundingClientRect();
  const actualSize = Math.min(rect.width, rect.height);
  
  if (actualSize < minSize) {
    const expansion = (minSize - actualSize) / 2;
    element.style.padding = `${expansion}px`;
    element.style.margin = `${-expansion}px`;
  }
  
  // Add invisible expanded hit area
  const hitArea = document.createElement('div');
  hitArea.style.position = 'absolute';
  hitArea.style.top = `${-expandedHitArea}px`;
  hitArea.style.left = `${-expandedHitArea}px`;
  hitArea.style.right = `${-expandedHitArea}px`;
  hitArea.style.bottom = `${-expandedHitArea}px`;
  hitArea.style.pointerEvents = 'none';
  
  element.style.position = 'relative';
  element.appendChild(hitArea);
}

export function detectSwipeGesture(
  startTouch: Touch,
  endTouch: Touch,
  startTime: number,
  endTime: number
): SwipeDirection | null {
  const deltaX = endTouch.clientX - startTouch.clientX;
  const deltaY = endTouch.clientY - startTouch.clientY;
  const deltaTime = endTime - startTime;
  
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const velocity = distance / deltaTime;
  
  if (distance < GESTURE_THRESHOLDS.swipe || velocity < GESTURE_THRESHOLDS.velocity) {
    return null;
  }
  
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);
  
  if (absDeltaX > absDeltaY) {
    return deltaX > 0 ? 'right' : 'left';
  } else {
    return deltaY > 0 ? 'down' : 'up';
  }
}

/**
 * Performance and Accessibility Utilities
 */

export function getMobilePerformance(): MobilePerformance {
  if (typeof window === 'undefined') {
    return {
      animationFrameRate: 60,
      memoryUsage: 0,
      batteryLevel: 1,
      powerSaveMode: false,
      connectionType: 'wifi',
      bandwidthEstimate: 10,
    };
  }
  
  const performance = window.performance as any;
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  const battery = (navigator as any).battery || (navigator as any).mozBattery || (navigator as any).webkitBattery;
  
  return {
    animationFrameRate: performance.now ? 60 : 30,
    memoryUsage: performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0,
    batteryLevel: battery ? battery.level : 1,
    powerSaveMode: battery ? battery.charging === false && battery.level < 0.2 : false,
    connectionType: connection ? connection.type : 'wifi',
    bandwidthEstimate: connection ? connection.downlink || 10 : 10,
  };
}

export function getMobileAccessibility(): MobileAccessibility {
  if (typeof window === 'undefined') {
    return {
      reduceMotion: false,
      highContrast: false,
      largeText: false,
      voiceOverEnabled: false,
      screenReaderEnabled: false,
      focusRingVisible: false,
    };
  }
  
  return {
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    highContrast: window.matchMedia('(prefers-contrast: high)').matches,
    largeText: window.matchMedia('(prefers-text-size: large)').matches,
    voiceOverEnabled: !!(window as any).speechSynthesis,
    screenReaderEnabled: !!(document as any).activeElement,
    focusRingVisible: window.matchMedia('(focus-ring: visible)').matches,
  };
}

export function getMobileGameState(): MobileGameState {
  if (typeof window === 'undefined') {
    return {
      isFullscreen: false,
      isLandscape: false,
      keyboardVisible: false,
      backgrounded: false,
      visibility: 'visible',
      wakeLockActive: false,
      installPromptAvailable: false,
    };
  }
  
  return {
    isFullscreen: !!(document as any).fullscreenElement,
    isLandscape: getDeviceOrientation() === 'landscape',
    keyboardVisible: window.visualViewport ? window.visualViewport.height < window.innerHeight : false,
    backgrounded: document.hidden,
    visibility: document.visibilityState as 'visible' | 'hidden' | 'prerender',
    wakeLockActive: !!(navigator as any).wakeLock,
    installPromptAvailable: !!(window as any).deferredPrompt,
  };
}

/**
 * Responsive Design Utilities
 */

export function getOptimalTouchTargetSize(breakpoint: MobileBreakpoint): number {
  if (breakpoint.name === 'small') return TOUCH_TARGET_SIZES.minimum;
  if (breakpoint.name === 'medium') return TOUCH_TARGET_SIZES.recommended;
  if (breakpoint.name === 'large') return TOUCH_TARGET_SIZES.comfortable;
  return TOUCH_TARGET_SIZES.accessible;
}

export function calculateResponsiveFontSize(baseSize: number, breakpoint: MobileBreakpoint): number {
  const scaleFactor = breakpoint.fontSize / 16; // 16px is base font size
  return Math.round(baseSize * scaleFactor);
}

export function calculateResponsiveSpacing(baseSpacing: number, breakpoint: MobileBreakpoint): number {
  const scaleFactor = breakpoint.padding / 16; // 16px is base spacing
  return Math.round(baseSpacing * scaleFactor);
}

export function isLargeEnoughForFeature(minWidth: number, minHeight: number): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.innerWidth >= minWidth && window.innerHeight >= minHeight;
}

/**
 * PWA Utilities
 */

export function canInstallPWA(): boolean {
  if (typeof window === 'undefined') return false;
  
  return !!(window as any).deferredPrompt || isStandalone();
}

export function requestWakeLock(): Promise<void> {
  if (typeof window === 'undefined' || !(navigator as any).wakeLock) {
    return Promise.resolve();
  }
  
  return (navigator as any).wakeLock.request('screen');
}

export function requestFullscreen(element: HTMLElement = document.documentElement): Promise<void> {
  if (element.requestFullscreen) {
    return element.requestFullscreen();
  } else if ((element as any).webkitRequestFullscreen) {
    return (element as any).webkitRequestFullscreen();
  } else if ((element as any).mozRequestFullScreen) {
    return (element as any).mozRequestFullScreen();
  } else if ((element as any).msRequestFullscreen) {
    return (element as any).msRequestFullscreen();
  }
  
  return Promise.resolve();
}

export function exitFullscreen(): Promise<void> {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  } else if ((document as any).webkitExitFullscreen) {
    return (document as any).webkitExitFullscreen();
  } else if ((document as any).mozCancelFullScreen) {
    return (document as any).mozCancelFullScreen();
  } else if ((document as any).msExitFullscreen) {
    return (document as any).msExitFullscreen();
  }
  
  return Promise.resolve();
}

/**
 * Animation and Performance Utilities
 */

export function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function optimizeAnimationPerformance(element: HTMLElement): void {
  element.style.willChange = 'transform, opacity';
  element.style.backfaceVisibility = 'hidden';
  element.style.perspective = '1000px';
  element.style.transform = 'translateZ(0)';
}

export function cleanupAnimationPerformance(element: HTMLElement): void {
  element.style.willChange = 'auto';
  element.style.backfaceVisibility = 'visible';
  element.style.perspective = 'none';
  element.style.transform = 'none';
}

export function createPerformantAnimation(
  element: HTMLElement,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions
): Animation {
  optimizeAnimationPerformance(element);
  
  const animation = element.animate(keyframes, {
    ...options,
    fill: 'both',
  });
  
  animation.addEventListener('finish', () => {
    cleanupAnimationPerformance(element);
  });
  
  return animation;
}

/**
 * Utility Hook for React Components
 */

export function useMobileDetection() {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTouch: false,
      isIOS: false,
      isAndroid: false,
      viewport: getMobileViewport(),
      performance: getMobilePerformance(),
      accessibility: getMobileAccessibility(),
      gameState: getMobileGameState(),
    };
  }
  
  return {
    isMobile: isMobileDevice(),
    isTouch: isTouchDevice(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    viewport: getMobileViewport(),
    performance: getMobilePerformance(),
    accessibility: getMobileAccessibility(),
    gameState: getMobileGameState(),
  };
}
