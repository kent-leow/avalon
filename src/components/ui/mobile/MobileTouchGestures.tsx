/**
 * Mobile Touch Gesture Handler
 * Custom hook for handling touch gestures on mobile devices
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { detectSwipeGesture, triggerHapticFeedback } from '~/lib/mobile-utils';
import type { SwipeGestureHandlers, TouchGestureConfig } from '~/types/mobile-navigation';

interface UseTouchGesturesOptions extends SwipeGestureHandlers {
  config?: Partial<TouchGestureConfig>;
  hapticFeedback?: boolean;
  preventDefault?: boolean;
}

export function useTouchGestures(options: UseTouchGesturesOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinchZoom,
    onDoubleTap,
    onLongPress,
    config = {},
    hapticFeedback = true,
    preventDefault = true,
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const touchStart = useRef<TouchEvent | null>(null);
  const touchStartTime = useRef<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTap = useRef<number>(0);

  const defaultConfig: TouchGestureConfig = {
    enabled: true,
    threshold: 50,
    velocity: 0.5,
    preventDefault: true,
    ...config,
  };

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!defaultConfig.enabled) return;

    touchStart.current = event;
    touchStartTime.current = Date.now();

    // Setup long press detection
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        if (hapticFeedback) {
          triggerHapticFeedback('medium');
        }
        onLongPress();
      }, 500);
    }

    if (preventDefault && defaultConfig.preventDefault) {
      event.preventDefault();
    }
  }, [defaultConfig, onLongPress, hapticFeedback, preventDefault]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!defaultConfig.enabled || !touchStart.current) return;

    // Clear long press timer on move
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Handle pinch zoom
    if (event.touches.length === 2 && onPinchZoom) {
      const touch1 = event.touches[0]!;
      const touch2 = event.touches[1]!;
      const distance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      
      // Calculate scale based on initial distance
      const initialDistance = Math.hypot(
        touchStart.current.touches[0]!.clientX - touchStart.current.touches[1]!.clientX,
        touchStart.current.touches[0]!.clientY - touchStart.current.touches[1]!.clientY
      );
      
      const scale = distance / initialDistance;
      onPinchZoom(scale);
    }

    if (preventDefault && defaultConfig.preventDefault) {
      event.preventDefault();
    }
  }, [defaultConfig, onPinchZoom, preventDefault]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!defaultConfig.enabled || !touchStart.current) return;

    const touchEnd = event.changedTouches[0];
    const touchStartFirst = touchStart.current.touches[0];
    const endTime = Date.now();

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Handle double tap
    if (onDoubleTap && touchEnd) {
      const timeSinceLastTap = endTime - lastTap.current;
      if (timeSinceLastTap < 300) {
        if (hapticFeedback) {
          triggerHapticFeedback('light');
        }
        onDoubleTap();
        lastTap.current = 0;
      } else {
        lastTap.current = endTime;
      }
    }

    // Handle swipe gestures
    if (touchEnd && touchStartFirst) {
      const direction = detectSwipeGesture(
        touchStartFirst,
        touchEnd,
        touchStartTime.current,
        endTime
      );

      if (direction && hapticFeedback) {
        triggerHapticFeedback('light');
      }

      switch (direction) {
        case 'left':
          onSwipeLeft?.();
          break;
        case 'right':
          onSwipeRight?.();
          break;
        case 'up':
          onSwipeUp?.();
          break;
        case 'down':
          onSwipeDown?.();
          break;
      }
    }

    touchStart.current = null;
    touchStartTime.current = 0;

    if (preventDefault && defaultConfig.preventDefault) {
      event.preventDefault();
    }
  }, [
    defaultConfig,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onDoubleTap,
    hapticFeedback,
    preventDefault,
  ]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault });
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault]);

  return {
    ref: elementRef,
    gestures: {
      enabled: defaultConfig.enabled,
      config: defaultConfig,
    },
  };
}
