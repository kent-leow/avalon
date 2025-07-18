/**
 * Fallback Handler Component
 * 
 * Provides fallback mechanisms when features fail,
 * enabling graceful degradation of functionality.
 */

'use client';

import { useEffect, useState } from 'react';
import type { FallbackHandlerProps } from '~/types/game-error-recovery';

/**
 * FallbackHandler Component
 * 
 * Wraps children with fallback mechanisms and provides
 * graceful degradation when features fail.
 */
export function FallbackHandler({
  children,
  fallbackConfig,
  onFallbackActivated,
  onFallbackDeactivated,
  enabledFeatures,
}: FallbackHandlerProps) {
  const [activeFallbacks, setActiveFallbacks] = useState<Set<string>>(new Set());
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [reducedFunctionality, setReducedFunctionality] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOfflineMode(false);
      if (activeFallbacks.size === 0) {
        setReducedFunctionality(false);
      }
    };

    const handleOffline = () => {
      if (fallbackConfig.enableOfflineMode) {
        setIsOfflineMode(true);
        setReducedFunctionality(true);
        activateFallback('offline-mode');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      // Check initial state
      if (!navigator.onLine && fallbackConfig.enableOfflineMode) {
        handleOffline();
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [fallbackConfig.enableOfflineMode, activeFallbacks.size]);

  const activateFallback = (feature: string) => {
    console.log(`Activating fallback for feature: ${feature}`);
    
    setActiveFallbacks(prev => new Set(prev).add(feature));
    
    if (fallbackConfig.enableReducedFunctionality) {
      setReducedFunctionality(true);
    }
    
    onFallbackActivated?.(feature);
  };

  const deactivateFallback = (feature: string) => {
    console.log(`Deactivating fallback for feature: ${feature}`);
    
    setActiveFallbacks(prev => {
      const newSet = new Set(prev);
      newSet.delete(feature);
      return newSet;
    });
    
    // If no more fallbacks are active, exit reduced functionality
    if (activeFallbacks.size === 1 && activeFallbacks.has(feature)) {
      setReducedFunctionality(false);
      setIsOfflineMode(false);
    }
    
    onFallbackDeactivated?.(feature);
  };

  const getFallbackComponent = (feature: string) => {
    const FallbackComponent = fallbackConfig.fallbackComponents[feature];
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    
    // Default fallback UI
    return (
      <div className="fallback-ui bg-[#1a1a2e] border border-[#f59e0b] rounded-lg p-4 m-4">
        <div className="flex items-center space-x-3">
          <div className="text-[#f59e0b] text-xl">⚠️</div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Limited Functionality
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {feature} is currently unavailable. Using fallback mode.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // If offline mode is active, show offline indicator
  if (isOfflineMode) {
    return (
      <div className="fallback-handler offline-mode">
        {/* Offline indicator */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#f59e0b] text-white p-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <span>📱</span>
            <span>Offline Mode Active - Limited functionality available</span>
          </div>
        </div>
        
        {/* Offline content wrapper */}
        <div className="offline-content pt-12">
          {children}
        </div>
        
        {/* Offline fallback components */}
        {Array.from(activeFallbacks).map(feature => (
          <div key={feature}>
            {getFallbackComponent(feature)}
          </div>
        ))}
      </div>
    );
  }

  // If reduced functionality is active, show warning
  if (reducedFunctionality) {
    return (
      <div className="fallback-handler reduced-functionality">
        {/* Reduced functionality indicator */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#f59e0b] text-white p-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <span>⚠️</span>
            <span>Some features are temporarily unavailable</span>
            <button
              onClick={() => {
                // Clear all fallbacks
                activeFallbacks.forEach(feature => deactivateFallback(feature));
              }}
              className="ml-4 bg-white text-[#f59e0b] px-2 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
            >
              Retry All
            </button>
          </div>
        </div>
        
        {/* Reduced functionality content wrapper */}
        <div className="reduced-content pt-12">
          {children}
        </div>
        
        {/* Fallback components */}
        {Array.from(activeFallbacks).map(feature => (
          <div key={feature}>
            {getFallbackComponent(feature)}
          </div>
        ))}
      </div>
    );
  }

  // Normal mode - render children as-is
  return (
    <div className="fallback-handler normal-mode">
      {children}
    </div>
  );
}
