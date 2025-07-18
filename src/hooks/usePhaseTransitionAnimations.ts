'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { 
  UsePhaseTransitionAnimationsReturn,
  AnimationState,
  AnimationConfig,
  QueuedAnimation,
  MotionPreferences,
  AnimationEvent,
  AnimationMetrics
} from '~/types/phase-transition-animations';
import { 
  createInitialAnimationState,
  createQueuedAnimation,
  sortAnimationQueue,
  getNextAnimation,
  removeAnimationFromQueue,
  shouldAnimate,
  createAnimationEvent,
  createAnimationMetrics,
  updateAnimationMetrics,
  getDefaultMotionPreferences
} from '~/lib/animation-utils';

export function usePhaseTransitionAnimations(): UsePhaseTransitionAnimationsReturn {
  const [animationState, setAnimationState] = useState<AnimationState>(createInitialAnimationState);
  const [metrics, setMetrics] = useState<AnimationMetrics>(createAnimationMetrics);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationQueueRef = useRef<QueuedAnimation[]>([]);
  const currentAnimationRef = useRef<string | null>(null);

  // Update animation queue ref when state changes
  useEffect(() => {
    animationQueueRef.current = animationState.animationQueue;
  }, [animationState.animationQueue]);

  // Process animation queue
  const processAnimationQueue = useCallback(() => {
    if (animationState.isAnimating) return;
    
    const nextAnimation = getNextAnimation(animationQueueRef.current);
    if (!nextAnimation) return;
    
    const canAnimate = shouldAnimate(nextAnimation.type, animationState.motionPreferences);
    if (!canAnimate) {
      // Remove animation from queue if it shouldn't animate
      setAnimationState(prev => ({
        ...prev,
        animationQueue: removeAnimationFromQueue(prev.animationQueue, nextAnimation.id)
      }));
      return;
    }
    
    // Start the animation
    setAnimationState(prev => ({
      ...prev,
      currentAnimation: nextAnimation.type,
      isAnimating: true,
      animationQueue: removeAnimationFromQueue(prev.animationQueue, nextAnimation.id)
    }));
    
    currentAnimationRef.current = nextAnimation.id;
    
    // Create animation start event
    const startEvent = createAnimationEvent('start', nextAnimation.id);
    
    // Set timeout for animation completion
    animationTimeoutRef.current = setTimeout(() => {
      completeAnimation(nextAnimation.id, nextAnimation.config.duration);
    }, nextAnimation.config.duration + (nextAnimation.delay || 0));
    
  }, [animationState.isAnimating, animationState.motionPreferences]);

  // Complete animation
  const completeAnimation = useCallback((animationId: string, duration: number) => {
    setAnimationState(prev => ({
      ...prev,
      currentAnimation: null,
      isAnimating: false,
    }));
    
    // Update metrics
    setMetrics(prev => updateAnimationMetrics(prev, duration));
    
    // Create animation complete event
    const completeEvent = createAnimationEvent('complete', animationId, undefined, duration);
    
    currentAnimationRef.current = null;
    
    // Process next animation in queue
    setTimeout(() => {
      processAnimationQueue();
    }, 50); // Small delay to prevent rapid animations
    
  }, [processAnimationQueue]);

  // Start animation
  const startAnimation = useCallback((config: AnimationConfig) => {
    const animation = createQueuedAnimation('phase', config, 1);
    
    setAnimationState(prev => ({
      ...prev,
      animationQueue: [...prev.animationQueue, animation]
    }));
    
    // Process queue if not currently animating
    if (!animationState.isAnimating) {
      setTimeout(processAnimationQueue, 0);
    }
  }, [animationState.isAnimating, processAnimationQueue]);

  // Stop animation
  const stopAnimation = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    
    if (currentAnimationRef.current) {
      const interruptEvent = createAnimationEvent('interrupt', currentAnimationRef.current);
      currentAnimationRef.current = null;
    }
    
    setAnimationState(prev => ({
      ...prev,
      currentAnimation: null,
      isAnimating: false,
    }));
  }, []);

  // Queue animation
  const queueAnimation = useCallback((animation: QueuedAnimation) => {
    setAnimationState(prev => ({
      ...prev,
      animationQueue: [...prev.animationQueue, animation]
    }));
    
    // Process queue if not currently animating
    if (!animationState.isAnimating) {
      setTimeout(processAnimationQueue, 0);
    }
  }, [animationState.isAnimating, processAnimationQueue]);

  // Clear animation queue
  const clearQueue = useCallback(() => {
    setAnimationState(prev => ({
      ...prev,
      animationQueue: []
    }));
  }, []);

  // Set motion preferences
  const setMotionPreferences = useCallback((preferences: Partial<MotionPreferences>) => {
    setAnimationState(prev => ({
      ...prev,
      motionPreferences: {
        ...prev.motionPreferences,
        ...preferences
      }
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Auto-process queue when animations complete
  useEffect(() => {
    if (!animationState.isAnimating && animationState.animationQueue.length > 0) {
      const timer = setTimeout(processAnimationQueue, 100);
      return () => clearTimeout(timer);
    }
  }, [animationState.isAnimating, animationState.animationQueue.length, processAnimationQueue]);

  return {
    animationState,
    startAnimation,
    stopAnimation,
    queueAnimation,
    clearQueue,
    setMotionPreferences,
  };
}
