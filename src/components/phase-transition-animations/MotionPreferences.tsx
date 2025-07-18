'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import type { MotionPreferencesProps, MotionPreferences } from '~/types/phase-transition-animations';
import { useMotionPreferences } from '~/hooks/useMotionPreferences';

// Motion Preferences Context
const MotionPreferencesContext = createContext<{
  preferences: MotionPreferences;
  updatePreferences: (prefs: Partial<MotionPreferences>) => void;
} | null>(null);

export function MotionPreferences({
  children,
  respectReducedMotion = true,
  fallbackMode = 'minimal',
}: MotionPreferencesProps) {
  const { motionPreferences, updatePreferences, respectsReducedMotion } = useMotionPreferences();
  const [isClient, setIsClient] = useState(false);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Apply motion preferences to CSS
  useEffect(() => {
    if (!isClient) return;

    const root = document.documentElement;
    
    // Set CSS custom properties based on preferences
    if (motionPreferences.reducedMotion || (respectReducedMotion && respectsReducedMotion)) {
      root.style.setProperty('--animation-duration-multiplier', '0.5');
      root.style.setProperty('--animation-scale', '0.8');
      root.style.setProperty('--particle-count-multiplier', '0.3');
    } else {
      root.style.setProperty('--animation-duration-multiplier', '1');
      root.style.setProperty('--animation-scale', '1');
      root.style.setProperty('--particle-count-multiplier', '1');
    }
    
    // Set intensity-based properties
    switch (motionPreferences.animationIntensity) {
      case 'subtle':
        root.style.setProperty('--animation-intensity', '0.6');
        root.style.setProperty('--particle-opacity', '0.3');
        break;
      case 'dramatic':
        root.style.setProperty('--animation-intensity', '1.4');
        root.style.setProperty('--particle-opacity', '0.9');
        break;
      default:
        root.style.setProperty('--animation-intensity', '1');
        root.style.setProperty('--particle-opacity', '0.6');
    }
    
    // Apply animation disable class
    if (motionPreferences.disableAnimations) {
      root.classList.add('disable-animations');
    } else {
      root.classList.remove('disable-animations');
    }
    
    // Apply particle disable class
    if (!motionPreferences.enableParticles) {
      root.classList.add('disable-particles');
    } else {
      root.classList.remove('disable-particles');
    }
    
    // Apply shake disable class
    if (!motionPreferences.enableShake) {
      root.classList.add('disable-shake');
    } else {
      root.classList.remove('disable-shake');
    }
    
  }, [motionPreferences, respectReducedMotion, respectsReducedMotion, isClient]);

  // Get fallback content based on mode
  const getFallbackContent = () => {
    if (fallbackMode === 'off') return null;
    
    const shouldShowFallback = motionPreferences.disableAnimations || 
                              (respectReducedMotion && respectsReducedMotion);
    
    if (!shouldShowFallback) return children;
    
    if (fallbackMode === 'static') {
      return (
        <div className="motion-reduced-static">
          {children}
        </div>
      );
    }
    
    // Minimal mode - reduced animations
    return (
      <div className="motion-reduced-minimal">
        {children}
      </div>
    );
  };

  const contextValue = {
    preferences: motionPreferences,
    updatePreferences,
  };

  return (
    <MotionPreferencesContext.Provider value={contextValue}>
      <div
        className={`
          motion-preferences-container
          ${motionPreferences.reducedMotion ? 'reduced-motion' : ''}
          ${motionPreferences.disableAnimations ? 'no-animations' : ''}
          ${!motionPreferences.enableParticles ? 'no-particles' : ''}
          ${!motionPreferences.enableShake ? 'no-shake' : ''}
        `}
        data-testid="motion-preferences"
        data-reduced-motion={motionPreferences.reducedMotion}
        data-disable-animations={motionPreferences.disableAnimations}
        data-animation-intensity={motionPreferences.animationIntensity}
        data-enable-particles={motionPreferences.enableParticles}
        data-enable-shake={motionPreferences.enableShake}
        data-fallback-mode={fallbackMode}
      >
        {getFallbackContent()}
      </div>
    </MotionPreferencesContext.Provider>
  );
}

// Hook to use motion preferences context
export function useMotionPreferencesContext() {
  const context = useContext(MotionPreferencesContext);
  if (!context) {
    throw new Error('useMotionPreferencesContext must be used within a MotionPreferences provider');
  }
  return context;
}

// Motion Preferences Control Panel Component
export function MotionPreferencesPanel() {
  const { preferences, updatePreferences } = useMotionPreferencesContext();

  return (
    <div className="motion-preferences-panel p-4 bg-gray-800 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold text-white">Motion Preferences</h3>
      
      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={preferences.reducedMotion}
            onChange={(e) => updatePreferences({ reducedMotion: e.target.checked })}
            className="rounded"
          />
          <span className="text-white">Reduce motion</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={preferences.disableAnimations}
            onChange={(e) => updatePreferences({ disableAnimations: e.target.checked })}
            className="rounded"
          />
          <span className="text-white">Disable animations</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={preferences.enableParticles}
            onChange={(e) => updatePreferences({ enableParticles: e.target.checked })}
            className="rounded"
          />
          <span className="text-white">Enable particles</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={preferences.enableShake}
            onChange={(e) => updatePreferences({ enableShake: e.target.checked })}
            className="rounded"
          />
          <span className="text-white">Enable shake effects</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={preferences.enableAudio}
            onChange={(e) => updatePreferences({ enableAudio: e.target.checked })}
            className="rounded"
          />
          <span className="text-white">Enable audio</span>
        </label>
        
        <div className="space-y-2">
          <label className="text-white">Animation Intensity</label>
          <select
            value={preferences.animationIntensity}
            onChange={(e) => updatePreferences({ 
              animationIntensity: e.target.value as 'subtle' | 'moderate' | 'dramatic' 
            })}
            className="w-full p-2 bg-gray-700 text-white rounded"
          >
            <option value="subtle">Subtle</option>
            <option value="moderate">Moderate</option>
            <option value="dramatic">Dramatic</option>
          </select>
        </div>
      </div>
    </div>
  );
}
