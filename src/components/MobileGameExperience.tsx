'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { MobileExperienceProvider, useMobileExperience } from '~/context/MobileExperienceContext';
import { useMobileExperienceEnhanced } from '~/hooks/useMobileExperience';
import { TouchOptimizedInterface } from './TouchOptimizedInterface';
import { MobileLayoutAdapter } from './MobileLayoutAdapter';
import { MobilePerformanceOptimizer } from './MobilePerformanceOptimizer';
import { MobileConnectivityManager } from './MobileConnectivityManager';
import { HapticFeedbackSystem } from './HapticFeedbackSystem';

interface MobileGameExperienceProps {
  children: ReactNode;
  enableTouchOptimization?: boolean;
  enableLayoutAdaptation?: boolean;
  enablePerformanceOptimization?: boolean;
  enableConnectivityManagement?: boolean;
  enableHapticFeedback?: boolean;
  autoOptimize?: boolean;
  className?: string;
}

function MobileGameExperienceContent({
  children,
  enableTouchOptimization = true,
  enableLayoutAdaptation = true,
  enablePerformanceOptimization = true,
  enableConnectivityManagement = true,
  enableHapticFeedback = true,
  autoOptimize = true,
  className,
}: MobileGameExperienceProps) {
  const {
    state,
    deviceCapabilities,
    performanceInsights,
    connectivityInsights,
    autoOptimize: runAutoOptimization,
  } = useMobileExperienceEnhanced();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize mobile experience
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      setIsInitialized(true);
      
      // Run auto-optimization if enabled
      if (autoOptimize) {
        setTimeout(() => {
          runAutoOptimization();
        }, 1000); // Delay to allow DOM to settle
      }
    }
  }, [isInitialized, autoOptimize, runAutoOptimization]);

  // Show loading state on server or during initialization
  if (typeof window === 'undefined' || !isInitialized) {
    return (
      <div className="mobile-experience-loading">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-600">Optimizing mobile experience...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`mobile-game-experience ${className || ''}`}
      data-device-type={state.deviceInfo.type}
      data-orientation={state.deviceInfo.orientation}
      data-touch-support={state.deviceInfo.touchSupport}
      data-performance-level={performanceInsights.level}
      data-connectivity-quality={connectivityInsights.quality}
      style={{
        '--safe-area-inset-top': `${state.viewportInfo.safeAreaInsets.top}px`,
        '--safe-area-inset-right': `${state.viewportInfo.safeAreaInsets.right}px`,
        '--safe-area-inset-bottom': `${state.viewportInfo.safeAreaInsets.bottom}px`,
        '--safe-area-inset-left': `${state.viewportInfo.safeAreaInsets.left}px`,
      } as React.CSSProperties}
    >
      {/* Layout Adaptation */}
      {enableLayoutAdaptation && (
        <MobileLayoutAdapter 
          adaptationLevel={state.layoutAdaptation.level}
          deviceType={state.deviceInfo.type}
          orientation={state.deviceInfo.orientation}
          viewportInfo={state.viewportInfo}
        />
      )}

      {/* Touch Optimization */}
      {enableTouchOptimization && deviceCapabilities.hasTouch && (
        <TouchOptimizedInterface
          targetSize={state.touchOptimization.targetSize}
          enableHapticFeedback={enableHapticFeedback && state.touchOptimization.hapticFeedback}
          autoOptimize={autoOptimize}
        />
      )}

      {/* Performance Optimization */}
      {enablePerformanceOptimization && (
        <MobilePerformanceOptimizer
          performanceLevel={performanceInsights.level}
          batteryOptimization={state.batteryOptimization}
          autoOptimize={autoOptimize}
        />
      )}

      {/* Connectivity Management */}
      {enableConnectivityManagement && (
        <MobileConnectivityManager
          connectivityStatus={state.connectivityStatus}
          dataOptimization={state.dataOptimization}
          offlineMode={state.offlineMode}
        />
      )}

      {/* Haptic Feedback */}
      {enableHapticFeedback && deviceCapabilities.hasHaptics && (
        <HapticFeedbackSystem
          enabled={state.touchOptimization.hapticFeedback}
          deviceType={state.deviceInfo.type}
        />
      )}

      {/* Main Content */}
      <div className="mobile-game-content">
        {children}
      </div>

      {/* Performance Overlay (Development Mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mobile-performance-overlay fixed bottom-4 left-4 z-50 rounded-lg bg-black/80 p-2 text-xs text-white">
          <div>Device: {state.deviceInfo.type}</div>
          <div>Performance: {performanceInsights.level}</div>
          <div>FPS: {performanceInsights.frameRate}</div>
          <div>Memory: {performanceInsights.memoryUsage.toFixed(1)}MB</div>
          <div>Connectivity: {connectivityInsights.quality}</div>
          <div>Battery Impact: {performanceInsights.batteryImpact}</div>
        </div>
      )}
    </div>
  );
}

export function MobileGameExperience(props: MobileGameExperienceProps) {
  return (
    <MobileExperienceProvider>
      <MobileGameExperienceContent {...props} />
    </MobileExperienceProvider>
  );
}

export default MobileGameExperience;
