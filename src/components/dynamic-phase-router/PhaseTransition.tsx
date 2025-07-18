/**
 * Phase Transition Component
 * 
 * Provides smooth transitions between phase components with multiple animation types
 * and proper timing controls.
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import type { PhaseTransitionProps } from '~/types/dynamic-phase-router';

/**
 * Phase Transition Component
 * 
 * Wrapper component that handles smooth transitions between different game phases
 * with support for multiple animation types and timing controls.
 */
export function PhaseTransition({
  children,
  phase,
  previousPhase,
  isTransitioning,
  transitionDuration = 400,
  transitionType = 'fade',
  direction = 'forward',
  onTransitionStart,
  onTransitionComplete,
}: PhaseTransitionProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayPhase, setDisplayPhase] = useState(phase);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle transition start
   */
  const startTransition = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsAnimating(true);
    onTransitionStart?.();

    // Update display phase after transition
    timeoutRef.current = setTimeout(() => {
      setDisplayPhase(phase);
      setIsAnimating(false);
      onTransitionComplete?.();
    }, transitionDuration);
  };

  /**
   * Effect to handle phase changes
   */
  useEffect(() => {
    if (phase !== displayPhase && isTransitioning) {
      startTransition();
    }
  }, [phase, displayPhase, isTransitioning, transitionDuration]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Get transition styles based on type and state
   */
  const getTransitionStyles = () => {
    const baseStyles = {
      transition: `all ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      width: '100%',
      height: '100%',
    };

    if (!isAnimating) {
      return baseStyles;
    }

    switch (transitionType) {
      case 'fade':
        return {
          ...baseStyles,
          opacity: isAnimating ? 0 : 1,
        };

      case 'slide':
        const slideDirection = direction === 'forward' ? '-100%' : '100%';
        return {
          ...baseStyles,
          transform: isAnimating ? `translateX(${slideDirection})` : 'translateX(0)',
        };

      case 'scale':
        return {
          ...baseStyles,
          transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
          opacity: isAnimating ? 0 : 1,
        };

      case 'flip':
        return {
          ...baseStyles,
          transform: isAnimating ? 'rotateY(90deg)' : 'rotateY(0deg)',
          transformStyle: 'preserve-3d' as const,
        };

      default:
        return baseStyles;
    }
  };

  /**
   * Get container styles
   */
  const getContainerStyles = () => {
    return {
      position: 'relative' as const,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      perspective: transitionType === 'flip' ? '1000px' : undefined,
    };
  };

  return (
    <div
      ref={containerRef}
      style={getContainerStyles()}
      data-testid="phase-transition-container"
      data-phase={displayPhase}
      data-transitioning={isAnimating}
      data-transition-type={transitionType}
    >
      {/* Transition Wrapper */}
      <div
        style={getTransitionStyles()}
        data-testid={`phase-transition-${transitionType}`}
      >
        {children}
      </div>

      {/* Transition Overlay */}
      {isAnimating && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: '#0a0a0f',
            opacity: transitionType === 'fade' ? 0.5 : 0,
            transition: `opacity ${transitionDuration}ms ease-in-out`,
            zIndex: 1,
          }}
          data-testid="transition-overlay"
        />
      )}

      {/* Loading Indicator for Long Transitions */}
      {isAnimating && transitionDuration > 500 && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            backgroundColor: 'rgba(26, 26, 46, 0.8)',
            zIndex: 2,
          }}
          data-testid="transition-loading"
        >
          <div className="text-center">
            <div
              className="inline-block w-8 h-8 border-2 border-solid rounded-full animate-spin mb-2"
              style={{
                borderColor: '#3d3d7a',
                borderTopColor: 'transparent',
              }}
            />
            <p
              className="text-sm font-medium"
              style={{ color: '#f8f9fa' }}
            >
              Transitioning...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhaseTransition;
