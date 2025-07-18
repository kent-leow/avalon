'use client';

import { useMobileExperience } from '~/context/MobileExperienceContext';
import { useEffect, useCallback, useRef } from 'react';
import { type TouchInteraction, type PerformanceMetrics, type ConnectivityStatus, type OptimizationRecommendation } from '~/types/mobile-experience';
import { triggerHapticFeedback, isHapticFeedbackSupported } from '~/lib/mobile-experience-utils';

/**
 * Enhanced mobile experience hook with additional mobile-specific functionality
 */
export function useMobileExperienceEnhanced() {
  const context = useMobileExperience();
  const lastTouchRef = useRef<TouchInteraction | null>(null);
  const performanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced touch interaction recording with haptic feedback
  const recordTouchWithHaptics = useCallback((interaction: TouchInteraction) => {
    context.recordTouchInteraction(interaction);
    
    // Provide haptic feedback if enabled and supported
    if (context.preferences.hapticFeedbackEnabled && isHapticFeedbackSupported()) {
      switch (interaction.type) {
        case 'tap':
          triggerHapticFeedback('light');
          break;
        case 'long-press':
          triggerHapticFeedback('medium');
          break;
        case 'swipe':
          triggerHapticFeedback('selection');
          break;
        case 'pinch':
          triggerHapticFeedback('heavy');
          break;
      }
    }
    
    lastTouchRef.current = interaction;
  }, [context.recordTouchInteraction, context.preferences.hapticFeedbackEnabled]);

  // Performance monitoring with automatic optimization
  const startPerformanceMonitoring = useCallback(() => {
    if (performanceTimerRef.current) return;

    performanceTimerRef.current = setInterval(() => {
      const metrics = context.state.performanceMetrics;
      
      // Auto-optimize if performance drops below threshold
      if (metrics.frameRate < 30 || metrics.memoryUsage > 80) {
        context.runOptimization();
      }
    }, 2000);
  }, [context.state.performanceMetrics, context.runOptimization]);

  const stopPerformanceMonitoring = useCallback(() => {
    if (performanceTimerRef.current) {
      clearInterval(performanceTimerRef.current);
      performanceTimerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPerformanceMonitoring();
    };
  }, [stopPerformanceMonitoring]);

  // Battery optimization helpers
  const enableBatteryOptimization = useCallback(() => {
    context.updatePreferences({
      performanceMode: 'battery',
      hapticFeedbackEnabled: false,
    });
  }, [context.updatePreferences]);

  const disableBatteryOptimization = useCallback(() => {
    context.updatePreferences({
      performanceMode: 'performance',
      hapticFeedbackEnabled: true,
    });
  }, [context.updatePreferences]);

  // Data optimization helpers
  const enableDataOptimization = useCallback(() => {
    context.updatePreferences({
      dataOptimization: true,
    });
  }, [context.updatePreferences]);

  const disableDataOptimization = useCallback(() => {
    context.updatePreferences({
      dataOptimization: false,
    });
  }, [context.updatePreferences]);

  // Adaptive layout helpers
  const optimizeForMobile = useCallback(() => {
    context.setAdaptationLevel('enhanced');
    context.updatePreferences({
      touchTargetSize: 'large',
      adaptationLevel: 'enhanced',
    });
  }, [context.setAdaptationLevel, context.updatePreferences]);

  const optimizeForTablet = useCallback(() => {
    context.setAdaptationLevel('enhanced');
    context.updatePreferences({
      touchTargetSize: 'medium',
      adaptationLevel: 'enhanced',
    });
  }, [context.setAdaptationLevel, context.updatePreferences]);

  const optimizeForDesktop = useCallback(() => {
    context.setAdaptationLevel('basic');
    context.updatePreferences({
      touchTargetSize: 'small',
      adaptationLevel: 'basic',
    });
  }, [context.setAdaptationLevel, context.updatePreferences]);

  // Connectivity helpers
  const handleConnectivityChange = useCallback((isOnline: boolean) => {
    if (!isOnline) {
      // Enable offline mode and data optimization
      context.updatePreferences({
        offlineMode: true,
        dataOptimization: true,
      });
    } else {
      // Restore normal mode
      context.updatePreferences({
        offlineMode: false,
      });
    }
  }, [context.updatePreferences]);

  // Performance helpers
  const getCurrentPerformanceLevel = useCallback((): 'excellent' | 'good' | 'fair' | 'poor' => {
    const metrics = context.state.performanceMetrics;
    
    if (metrics.frameRate >= 55 && metrics.memoryUsage <= 50) {
      return 'excellent';
    } else if (metrics.frameRate >= 45 && metrics.memoryUsage <= 70) {
      return 'good';
    } else if (metrics.frameRate >= 30 && metrics.memoryUsage <= 85) {
      return 'fair';
    } else {
      return 'poor';
    }
  }, [context.state.performanceMetrics]);

  const getConnectivityQuality = useCallback((): 'excellent' | 'good' | 'fair' | 'poor' => {
    const connectivity = context.state.connectivityStatus;
    
    if (!connectivity.isOnline) return 'poor';
    if (connectivity.bandwidth && connectivity.bandwidth >= 10) return 'excellent';
    if (connectivity.bandwidth && connectivity.bandwidth >= 5) return 'good';
    if (connectivity.bandwidth && connectivity.bandwidth >= 1) return 'fair';
    return 'poor';
  }, [context.state.connectivityStatus]);

  // Touch optimization helpers
  const optimizeTouchTargetsForFingers = useCallback(() => {
    context.optimizeTouchTargets(true);
    context.updatePreferences({
      touchTargetSize: 'large',
    });
  }, [context.optimizeTouchTargets, context.updatePreferences]);

  const optimizeTouchTargetsForPrecision = useCallback(() => {
    context.optimizeTouchTargets(true);
    context.updatePreferences({
      touchTargetSize: 'medium',
    });
  }, [context.optimizeTouchTargets, context.updatePreferences]);

  // Auto-optimization based on device characteristics
  const autoOptimize = useCallback(() => {
    const { deviceInfo, performanceMetrics, connectivityStatus } = context.state;
    
    // Auto-optimize based on device type
    if (deviceInfo.type === 'mobile') {
      optimizeForMobile();
    } else if (deviceInfo.type === 'tablet') {
      optimizeForTablet();
    } else {
      optimizeForDesktop();
    }
    
    // Auto-optimize based on performance
    const performanceLevel = getCurrentPerformanceLevel();
    if (performanceLevel === 'poor') {
      enableBatteryOptimization();
    } else if (performanceLevel === 'excellent') {
      disableBatteryOptimization();
    }
    
    // Auto-optimize based on connectivity
    if (connectivityStatus.connectionType === 'cellular') {
      enableDataOptimization();
    } else if (connectivityStatus.connectionType === 'wifi') {
      disableDataOptimization();
    }
    
    // Auto-optimize based on battery level
    if (deviceInfo.batteryLevel && deviceInfo.batteryLevel < 20) {
      enableBatteryOptimization();
    }
  }, [
    context.state,
    getCurrentPerformanceLevel,
    optimizeForMobile,
    optimizeForTablet,
    optimizeForDesktop,
    enableBatteryOptimization,
    disableBatteryOptimization,
    enableDataOptimization,
    disableDataOptimization,
  ]);

  // Accessibility helpers
  const enableAccessibilityMode = useCallback(() => {
    context.updatePreferences({
      touchTargetSize: 'large',
      hapticFeedbackEnabled: true,
    });
  }, [context.updatePreferences]);

  const disableAccessibilityMode = useCallback(() => {
    context.updatePreferences({
      touchTargetSize: 'medium',
      hapticFeedbackEnabled: false,
    });
  }, [context.updatePreferences]);

  // Device capability checks
  const deviceCapabilities = {
    hasTouch: context.hasTouch(),
    isMobile: context.isMobileDevice(),
    isTablet: context.isTabletDevice(),
    isDesktop: context.isDesktopDevice(),
    hasHaptics: isHapticFeedbackSupported(),
    isOnline: !context.isOffline(),
    supportsOffline: context.preferences.offlineMode,
  };

  // Performance insights
  const performanceInsights = {
    level: getCurrentPerformanceLevel(),
    frameRate: context.state.performanceMetrics.frameRate,
    memoryUsage: context.state.performanceMetrics.memoryUsage,
    batteryImpact: context.state.performanceMetrics.batteryImpact,
    shouldOptimize: getCurrentPerformanceLevel() === 'poor',
  };

  // Connectivity insights
  const connectivityInsights = {
    quality: getConnectivityQuality(),
    type: context.state.connectivityStatus.connectionType,
    isOnline: context.state.connectivityStatus.isOnline,
    bandwidth: context.state.connectivityStatus.bandwidth,
    shouldOptimizeData: context.state.connectivityStatus.connectionType === 'cellular',
  };

  return {
    // Core context
    ...context,
    
    // Enhanced touch interaction
    recordTouchWithHaptics,
    lastTouch: lastTouchRef.current,
    
    // Performance monitoring
    startPerformanceMonitoring,
    stopPerformanceMonitoring,
    
    // Battery optimization
    enableBatteryOptimization,
    disableBatteryOptimization,
    
    // Data optimization
    enableDataOptimization,
    disableDataOptimization,
    
    // Adaptive layout
    optimizeForMobile,
    optimizeForTablet,
    optimizeForDesktop,
    
    // Connectivity
    handleConnectivityChange,
    
    // Performance helpers
    getCurrentPerformanceLevel,
    getConnectivityQuality,
    
    // Touch optimization
    optimizeTouchTargetsForFingers,
    optimizeTouchTargetsForPrecision,
    
    // Auto-optimization
    autoOptimize,
    
    // Accessibility
    enableAccessibilityMode,
    disableAccessibilityMode,
    
    // Device insights
    deviceCapabilities,
    performanceInsights,
    connectivityInsights,
  };
}

export { useMobileExperience };
