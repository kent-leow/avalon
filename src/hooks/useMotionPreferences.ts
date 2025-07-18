'use client';

import { useState, useCallback, useEffect } from 'react';
import type { 
  UseMotionPreferencesReturn,
  MotionPreferences,
  AnimationType
} from '~/types/phase-transition-animations';
import { getDefaultMotionPreferences } from '~/lib/animation-utils';

const MOTION_PREFERENCES_KEY = 'avalon-motion-preferences';

export function useMotionPreferences(): UseMotionPreferencesReturn {
  const [motionPreferences, setMotionPreferences] = useState<MotionPreferences>(getDefaultMotionPreferences());
  const [respectsReducedMotion, setRespectsReducedMotion] = useState(false);

  // Detect reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      setRespectsReducedMotion(e.matches);
      
      // Update motion preferences if user prefers reduced motion
      if (e.matches) {
        setMotionPreferences(prev => ({
          ...prev,
          reducedMotion: true,
          enableParticles: false,
          enableShake: false,
          animationIntensity: 'subtle'
        }));
      }
    };
    
    // Set initial value
    setRespectsReducedMotion(mediaQuery.matches);
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleMediaQueryChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(MOTION_PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as MotionPreferences;
        setMotionPreferences(prev => ({
          ...prev,
          ...parsed
        }));
      }
    } catch (error) {
      console.warn('Failed to load motion preferences:', error);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((preferences: MotionPreferences) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(MOTION_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save motion preferences:', error);
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback((newPreferences: Partial<MotionPreferences>) => {
    setMotionPreferences(prev => {
      const updated = {
        ...prev,
        ...newPreferences
      };
      
      // Save to localStorage
      savePreferences(updated);
      
      return updated;
    });
  }, [savePreferences]);

  // Check if animation should be enabled
  const shouldAnimate = useCallback((animationType: AnimationType): boolean => {
    // If animations are completely disabled
    if (motionPreferences.disableAnimations) {
      return false;
    }
    
    // If reduced motion is enabled
    if (motionPreferences.reducedMotion || respectsReducedMotion) {
      // Allow basic phase transitions but disable heavy animations
      switch (animationType) {
        case 'phase':
          return true; // Allow basic phase transitions
        case 'action':
          return true; // Allow action feedback
        case 'celebration':
          return false; // Disable celebration animations
        case 'loading':
          return true; // Allow loading animations
        default:
          return false;
      }
    }
    
    // Check specific animation type preferences
    switch (animationType) {
      case 'phase':
        return true; // Phase transitions are always allowed
      case 'action':
        return true; // Action feedback is always allowed
      case 'celebration':
        return motionPreferences.enableParticles; // Celebrations depend on particles
      case 'loading':
        return true; // Loading animations are always allowed
      default:
        return true;
    }
  }, [motionPreferences, respectsReducedMotion]);

  // Get animation duration multiplier based on preferences
  const getAnimationDurationMultiplier = useCallback((): number => {
    if (motionPreferences.disableAnimations) return 0;
    if (motionPreferences.reducedMotion || respectsReducedMotion) return 0.5;
    
    switch (motionPreferences.animationIntensity) {
      case 'subtle':
        return 0.7;
      case 'dramatic':
        return 1.3;
      default:
        return 1.0;
    }
  }, [motionPreferences, respectsReducedMotion]);

  // Get particle count multiplier based on preferences
  const getParticleCountMultiplier = useCallback((): number => {
    if (!motionPreferences.enableParticles) return 0;
    if (motionPreferences.reducedMotion || respectsReducedMotion) return 0.3;
    
    switch (motionPreferences.animationIntensity) {
      case 'subtle':
        return 0.5;
      case 'dramatic':
        return 1.5;
      default:
        return 1.0;
    }
  }, [motionPreferences, respectsReducedMotion]);

  // Check if specific effects should be enabled
  const shouldEnableEffect = useCallback((effectType: 'particles' | 'shake' | 'audio' | 'glow' | 'pulse'): boolean => {
    if (motionPreferences.disableAnimations) return false;
    
    switch (effectType) {
      case 'particles':
        return motionPreferences.enableParticles && !(motionPreferences.reducedMotion || respectsReducedMotion);
      case 'shake':
        return motionPreferences.enableShake && !(motionPreferences.reducedMotion || respectsReducedMotion);
      case 'audio':
        return motionPreferences.enableAudio;
      case 'glow':
      case 'pulse':
        return !(motionPreferences.reducedMotion || respectsReducedMotion) || motionPreferences.animationIntensity !== 'subtle';
      default:
        return true;
    }
  }, [motionPreferences, respectsReducedMotion]);

  // Reset preferences to default
  const resetPreferences = useCallback(() => {
    const defaultPrefs = getDefaultMotionPreferences();
    setMotionPreferences(defaultPrefs);
    savePreferences(defaultPrefs);
  }, [savePreferences]);

  return {
    motionPreferences,
    updatePreferences,
    respectsReducedMotion,
    shouldAnimate,
  };
}

// Extended return type for additional utilities
interface UseMotionPreferencesReturnExtended extends UseMotionPreferencesReturn {
  getAnimationDurationMultiplier: () => number;
  getParticleCountMultiplier: () => number;
  shouldEnableEffect: (effectType: 'particles' | 'shake' | 'audio' | 'glow' | 'pulse') => boolean;
  resetPreferences: () => void;
}

// Export the extended version
export type { UseMotionPreferencesReturnExtended };
