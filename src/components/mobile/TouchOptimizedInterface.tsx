'use client';

import { useEffect, useRef } from 'react';
import { useTouchOptimization } from '~/hooks/useTouchOptimization';
import { type TouchInteraction, TOUCH_TARGET_SIZES } from '~/types/mobile-experience';

interface TouchOptimizedInterfaceProps {
  targetSize: 'small' | 'medium' | 'large';
  enableHapticFeedback?: boolean;
  autoOptimize?: boolean;
  className?: string;
}

export function TouchOptimizedInterface({
  targetSize,
  enableHapticFeedback = true,
  autoOptimize = true,
  className,
}: TouchOptimizedInterfaceProps) {
  const {
    touchTargets,
    inaccessibleTargets,
    optimizeAllTargets,
    touchMetrics,
    isTouch,
    deviceType,
    createTouchHandler,
  } = useTouchOptimization({
    minTouchTargetSize: TOUCH_TARGET_SIZES[targetSize],
    enableHapticFeedback,
    autoOptimize,
  });

  const overlayRef = useRef<HTMLDivElement>(null);

  // Auto-optimize touch targets when component mounts
  useEffect(() => {
    if (autoOptimize && isTouch) {
      const timer = setTimeout(() => {
        optimizeAllTargets();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoOptimize, isTouch, optimizeAllTargets]);

  // Add touch event listeners to interactive elements
  useEffect(() => {
    if (!isTouch) return;

    const handleTouchStart = (event: Event) => {
      createTouchHandler('tap')(event as TouchEvent);
    };
    
    const handleTouchMove = (event: Event) => {
      createTouchHandler('swipe')(event as TouchEvent);
    };
    
    const handleTouchEnd = (event: Event) => {
      createTouchHandler('tap')(event as TouchEvent);
    };

    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [tabindex]');
    
    interactiveElements.forEach(element => {
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchmove', handleTouchMove, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
    });

    return () => {
      interactiveElements.forEach(element => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      });
    };
  }, [isTouch, createTouchHandler]);

  // Don't render if device doesn't support touch
  if (!isTouch) {
    return null;
  }

  return (
    <div 
      ref={overlayRef}
      className={`touch-optimized-interface ${className || ''}`}
      data-device-type={deviceType}
      data-target-size={targetSize}
      data-haptic-feedback={enableHapticFeedback}
    >
      {/* Touch Target Visualization (Development Mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="touch-targets-overlay fixed inset-0 pointer-events-none z-40">
          {touchTargets.map((target) => {
            const rect = target.element.getBoundingClientRect();
            return (
              <div
                key={target.id}
                className={`absolute border-2 ${
                  target.accessible ? 'border-green-400' : 'border-red-400'
                } bg-black/10`}
                style={{
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Touch Metrics Display (Development Mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="touch-metrics-display fixed bottom-20 left-4 z-50 rounded-lg bg-black/80 p-2 text-xs text-white">
          <div>Touch Targets: {touchTargets.length}</div>
          <div>Inaccessible: {inaccessibleTargets.length}</div>
          <div>Accuracy: {(touchMetrics.accuracy * 100).toFixed(1)}%</div>
          <div>Miss Rate: {(touchMetrics.missRate * 100).toFixed(1)}%</div>
          <div>Interactions: {touchMetrics.interactionCount}</div>
        </div>
      )}

      {/* Touch Target Size Styles */}
      <style jsx>{`
        .touch-optimized-interface {
          --touch-target-size: ${TOUCH_TARGET_SIZES[targetSize]}px;
        }
        
        .touch-optimized-interface button,
        .touch-optimized-interface a,
        .touch-optimized-interface input,
        .touch-optimized-interface select,
        .touch-optimized-interface textarea,
        .touch-optimized-interface [role="button"],
        .touch-optimized-interface [tabindex] {
          min-width: var(--touch-target-size);
          min-height: var(--touch-target-size);
          touch-action: manipulation;
        }
        
        .touch-optimized-interface button {
          cursor: pointer;
        }
        
        .touch-optimized-interface input,
        .touch-optimized-interface select,
        .touch-optimized-interface textarea {
          -webkit-appearance: none;
          appearance: none;
          font-size: 16px; /* Prevent zoom on iOS */
        }
        
        /* Increase padding for better touch targets */
        .touch-optimized-interface button,
        .touch-optimized-interface a {
          padding: 12px 16px;
        }
        
        /* Larger touch targets for small screens */
        @media (max-width: 768px) {
          .touch-optimized-interface button,
          .touch-optimized-interface a,
          .touch-optimized-interface input,
          .touch-optimized-interface select,
          .touch-optimized-interface textarea {
            min-width: ${TOUCH_TARGET_SIZES.large}px;
            min-height: ${TOUCH_TARGET_SIZES.large}px;
          }
        }
      `}</style>
    </div>
  );
}
