'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useMobileExperience } from '~/context/MobileExperienceContext';
import { type TouchInteraction, type TouchTarget, TOUCH_TARGET_SIZES } from '~/types/mobile-experience';
import { calculateTouchTargetSize, isValidTouchTarget, optimizeTouchTarget, triggerHapticFeedback, isHapticFeedbackSupported } from '~/lib/mobile-experience-utils';

interface TouchOptimizationOptions {
  minTouchTargetSize?: number;
  enableHapticFeedback?: boolean;
  trackInteractions?: boolean;
  autoOptimize?: boolean;
  adaptToFingerSize?: boolean;
}

interface TouchMetrics {
  accuracy: number;
  averageTargetSize: number;
  missRate: number;
  averageTouchDuration: number;
  interactionCount: number;
}

export function useTouchOptimization(options: TouchOptimizationOptions = {}) {
  const {
    minTouchTargetSize = TOUCH_TARGET_SIZES.medium,
    enableHapticFeedback = true,
    trackInteractions = true,
    autoOptimize = true,
    adaptToFingerSize: shouldAdaptToFingerSize = true,
  } = options;

  const { state, recordTouchInteraction, preferences } = useMobileExperience();
  const [touchMetrics, setTouchMetrics] = useState<TouchMetrics>({
    accuracy: 0,
    averageTargetSize: 0,
    missRate: 0,
    averageTouchDuration: 0,
    interactionCount: 0,
  });
  
  const touchTargetsRef = useRef<Map<string, TouchTarget>>(new Map());
  const touchHistoryRef = useRef<TouchInteraction[]>([]);
  const observerRef = useRef<MutationObserver | null>(null);

  // Initialize touch target detection
  useEffect(() => {
    if (typeof window === 'undefined' || !state.deviceInfo.touchSupport) return;

    const detectTouchTargets = () => {
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [tabindex], [onclick]');
      const newTargets = new Map<string, TouchTarget>();

      interactiveElements.forEach((element, index) => {
        const htmlElement = element as HTMLElement;
        const id = htmlElement.id || `touch-target-${index}`;
        const size = calculateTouchTargetSize(htmlElement);
        
        const touchTarget: TouchTarget = {
          id,
          element: htmlElement,
          minSize: minTouchTargetSize,
          currentSize: size,
          accessible: isValidTouchTarget(htmlElement, minTouchTargetSize),
          feedback: 'light',
        };

        newTargets.set(id, touchTarget);

        // Auto-optimize if enabled
        if (autoOptimize && !touchTarget.accessible) {
          optimizeTouchTarget(htmlElement, minTouchTargetSize);
          touchTarget.currentSize = calculateTouchTargetSize(htmlElement);
          touchTarget.accessible = true;
        }
      });

      touchTargetsRef.current = newTargets;
    };

    // Initial detection
    detectTouchTargets();

    // Watch for DOM changes
    if (autoOptimize) {
      observerRef.current = new MutationObserver(() => {
        detectTouchTargets();
      });

      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [minTouchTargetSize, autoOptimize, state.deviceInfo.touchSupport]);

  // Track touch interactions
  const handleTouchInteraction = useCallback((
    type: TouchInteraction['type'],
    element: HTMLElement,
    event: TouchEvent | MouseEvent
  ) => {
    if (!trackInteractions) return;

    const rect = element.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0]?.clientX ?? 0 : event.clientX;
    const clientY = 'touches' in event ? event.touches[0]?.clientY ?? 0 : event.clientY;

    const interaction: TouchInteraction = {
      type,
      coordinates: { x: clientX, y: clientY },
      element: element.tagName.toLowerCase(),
      timestamp: Date.now(),
      duration: type === 'tap' ? 150 : 0,
      force: 'touches' in event ? event.touches[0]?.force : 0.5,
      targetSize: { width: rect.width, height: rect.height },
    };

    // Record interaction
    recordTouchInteraction(interaction);
    touchHistoryRef.current.push(interaction);

    // Limit history size
    if (touchHistoryRef.current.length > 100) {
      touchHistoryRef.current = touchHistoryRef.current.slice(-50);
    }

    // Provide haptic feedback
    if (enableHapticFeedback && preferences.hapticFeedbackEnabled && isHapticFeedbackSupported()) {
      const target = touchTargetsRef.current.get(element.id);
      triggerHapticFeedback(target?.feedback || 'light');
    }

    // Update metrics
    updateTouchMetrics();
  }, [trackInteractions, recordTouchInteraction, enableHapticFeedback, preferences.hapticFeedbackEnabled]);

  // Update touch metrics
  const updateTouchMetrics = useCallback(() => {
    const history = touchHistoryRef.current;
    if (history.length === 0) return;

    const totalTargetSize = history.reduce((sum, touch) => {
      return sum + (touch.targetSize ? touch.targetSize.width * touch.targetSize.height : 0);
    }, 0);

    const totalDuration = history.reduce((sum, touch) => {
      return sum + (touch.duration || 0);
    }, 0);

    const validTargets = history.filter(touch => 
      touch.targetSize && 
      touch.targetSize.width >= minTouchTargetSize && 
      touch.targetSize.height >= minTouchTargetSize
    );

    const missedTargets = history.filter(touch => 
      touch.targetSize && 
      (touch.targetSize.width < minTouchTargetSize || touch.targetSize.height < minTouchTargetSize)
    );

    setTouchMetrics({
      accuracy: validTargets.length / history.length,
      averageTargetSize: totalTargetSize / history.length,
      missRate: missedTargets.length / history.length,
      averageTouchDuration: totalDuration / history.length,
      interactionCount: history.length,
    });
  }, [minTouchTargetSize]);

  // Optimize specific element
  const optimizeElement = useCallback((element: HTMLElement) => {
    const currentSize = calculateTouchTargetSize(element);
    const targetId = element.id || `optimized-${Date.now()}`;
    
    if (!isValidTouchTarget(element, minTouchTargetSize)) {
      optimizeTouchTarget(element, minTouchTargetSize);
      
      const optimizedSize = calculateTouchTargetSize(element);
      const touchTarget: TouchTarget = {
        id: targetId,
        element,
        minSize: minTouchTargetSize,
        currentSize: optimizedSize,
        accessible: true,
        feedback: 'light',
      };
      
      touchTargetsRef.current.set(targetId, touchTarget);
      return touchTarget;
    }
    
    return null;
  }, [minTouchTargetSize]);

  // Optimize all touch targets
  const optimizeAllTargets = useCallback(() => {
    const optimizedTargets: TouchTarget[] = [];
    
    touchTargetsRef.current.forEach((target) => {
      if (!target.accessible) {
        optimizeTouchTarget(target.element, minTouchTargetSize);
        target.currentSize = calculateTouchTargetSize(target.element);
        target.accessible = true;
        optimizedTargets.push(target);
      }
    });
    
    return optimizedTargets;
  }, [minTouchTargetSize]);

  // Get touch targets by accessibility
  const getInaccessibleTargets = useCallback(() => {
    return Array.from(touchTargetsRef.current.values()).filter(target => !target.accessible);
  }, []);

  const getAccessibleTargets = useCallback(() => {
    return Array.from(touchTargetsRef.current.values()).filter(target => target.accessible);
  }, []);

  // Validate touch target
  const validateTouchTarget = useCallback((element: HTMLElement) => {
    const size = calculateTouchTargetSize(element);
    const isValid = isValidTouchTarget(element, minTouchTargetSize);
    
    return {
      isValid,
      currentSize: size,
      requiredSize: minTouchTargetSize,
      needsOptimization: !isValid,
    };
  }, [minTouchTargetSize]);

  // Get touch target recommendations
  const getTouchTargetRecommendations = useCallback(() => {
    const recommendations: Array<{
      element: HTMLElement;
      currentSize: { width: number; height: number };
      recommendedSize: number;
      reason: string;
    }> = [];

    touchTargetsRef.current.forEach((target) => {
      if (!target.accessible) {
        recommendations.push({
          element: target.element,
          currentSize: target.currentSize,
          recommendedSize: minTouchTargetSize,
          reason: `Target size ${target.currentSize.width}x${target.currentSize.height} is below minimum ${minTouchTargetSize}px`,
        });
      }
    });

    return recommendations;
  }, [minTouchTargetSize]);

  // Finger size adaptation
  const adaptToFingerSize = useCallback((fingerSize: 'small' | 'medium' | 'large') => {
    let targetSize = minTouchTargetSize;
    
    switch (fingerSize) {
      case 'small':
        targetSize = TOUCH_TARGET_SIZES.small;
        break;
      case 'medium':
        targetSize = TOUCH_TARGET_SIZES.medium;
        break;
      case 'large':
        targetSize = TOUCH_TARGET_SIZES.large;
        break;
    }

    touchTargetsRef.current.forEach((target) => {
      if (target.currentSize.width < targetSize || target.currentSize.height < targetSize) {
        optimizeTouchTarget(target.element, targetSize);
        target.currentSize = calculateTouchTargetSize(target.element);
        target.accessible = isValidTouchTarget(target.element, targetSize);
      }
    });
  }, [minTouchTargetSize]);

  // Touch event handlers
  const createTouchHandler = useCallback((type: TouchInteraction['type']) => {
    return (event: TouchEvent | MouseEvent) => {
      const element = event.currentTarget as HTMLElement;
      handleTouchInteraction(type, element, event);
    };
  }, [handleTouchInteraction]);

  // Performance monitoring
  const getPerformanceMetrics = useCallback(() => {
    const totalTargets = touchTargetsRef.current.size;
    const accessibleTargets = getAccessibleTargets().length;
    const inaccessibleTargets = getInaccessibleTargets().length;
    
    return {
      totalTargets,
      accessibleTargets,
      inaccessibleTargets,
      accessibilityScore: totalTargets > 0 ? accessibleTargets / totalTargets : 0,
      touchMetrics,
    };
  }, [getAccessibleTargets, getInaccessibleTargets, touchMetrics]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    // Touch targets
    touchTargets: Array.from(touchTargetsRef.current.values()),
    inaccessibleTargets: getInaccessibleTargets(),
    accessibleTargets: getAccessibleTargets(),
    
    // Optimization
    optimizeElement,
    optimizeAllTargets,
    validateTouchTarget,
    getTouchTargetRecommendations,
    adaptToFingerSize,
    
    // Event handlers
    createTouchHandler,
    onTouchStart: createTouchHandler('tap'),
    onTouchEnd: createTouchHandler('tap'),
    onTouchMove: createTouchHandler('swipe'),
    
    // Metrics
    touchMetrics,
    getPerformanceMetrics,
    
    // Configuration
    minTouchTargetSize,
    isOptimizationEnabled: autoOptimize,
    isHapticFeedbackEnabled: enableHapticFeedback && preferences.hapticFeedbackEnabled,
    
    // State
    isTouch: state.deviceInfo.touchSupport,
    deviceType: state.deviceInfo.type,
  };
}
