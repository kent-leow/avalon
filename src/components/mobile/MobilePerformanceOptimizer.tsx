'use client';

import { useEffect, useState, useCallback } from 'react';
import { useMobileExperience } from '~/context/MobileExperienceContext';
import { type PerformanceMetrics, type OptimizationRecommendation } from '~/types/mobile-experience';

interface MobilePerformanceOptimizerProps {
  performanceLevel: 'excellent' | 'good' | 'fair' | 'poor';
  batteryOptimization: boolean;
  autoOptimize?: boolean;
  className?: string;
}

interface PerformanceState {
  frameRateMonitor: number[];
  memoryUsageHistory: number[];
  optimizationActive: boolean;
  lastOptimizationTime: number;
  recommendations: OptimizationRecommendation[];
}

export function MobilePerformanceOptimizer({
  performanceLevel,
  batteryOptimization,
  autoOptimize = true,
  className,
}: MobilePerformanceOptimizerProps) {
  const { state, applyOptimizationRecommendations } = useMobileExperience();
  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    frameRateMonitor: [],
    memoryUsageHistory: [],
    optimizationActive: false,
    lastOptimizationTime: 0,
    recommendations: [],
  });

  // Monitor frame rate
  const monitorFrameRate = useCallback(() => {
    let lastTime = performance.now();
    let frameCount = 0;
    const frameRates: number[] = [];

    const measureFrame = (currentTime: number) => {
      frameCount++;
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameRates.push(fps);
        
        // Keep only last 10 measurements
        if (frameRates.length > 10) {
          frameRates.shift();
        }
        
        setPerformanceState(prev => ({
          ...prev,
          frameRateMonitor: frameRates,
        }));
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      if (performanceState.optimizationActive) {
        requestAnimationFrame(measureFrame);
      }
    };

    return requestAnimationFrame(measureFrame);
  }, [performanceState.optimizationActive]);

  // Monitor memory usage
  const monitorMemoryUsage = useCallback(() => {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      
      setPerformanceState(prev => ({
        ...prev,
        memoryUsageHistory: [...prev.memoryUsageHistory.slice(-9), memoryUsage],
      }));
    }
  }, []);

  // Apply performance optimizations
  const applyPerformanceOptimizations = useCallback(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;
    
    // Apply optimizations based on performance level
    switch (performanceLevel) {
      case 'poor':
        // Aggressive optimizations
        root.style.setProperty('--mobile-animation-duration', '0ms');
        root.style.setProperty('--mobile-transition-duration', '0ms');
        root.style.setProperty('--mobile-backdrop-filter', 'none');
        root.style.setProperty('--mobile-box-shadow', 'none');
        root.style.setProperty('--mobile-border-radius', '0px');
        body.classList.add('mobile-performance-poor');
        break;
        
      case 'fair':
        // Moderate optimizations
        root.style.setProperty('--mobile-animation-duration', '100ms');
        root.style.setProperty('--mobile-transition-duration', '100ms');
        root.style.setProperty('--mobile-backdrop-filter', 'blur(4px)');
        root.style.setProperty('--mobile-box-shadow', '0 2px 4px rgba(0,0,0,0.1)');
        root.style.setProperty('--mobile-border-radius', '4px');
        body.classList.add('mobile-performance-fair');
        break;
        
      case 'good':
        // Light optimizations
        root.style.setProperty('--mobile-animation-duration', '200ms');
        root.style.setProperty('--mobile-transition-duration', '200ms');
        root.style.setProperty('--mobile-backdrop-filter', 'blur(8px)');
        root.style.setProperty('--mobile-box-shadow', '0 4px 8px rgba(0,0,0,0.15)');
        root.style.setProperty('--mobile-border-radius', '8px');
        body.classList.add('mobile-performance-good');
        break;
        
      case 'excellent':
        // Full visual experience
        root.style.setProperty('--mobile-animation-duration', '300ms');
        root.style.setProperty('--mobile-transition-duration', '300ms');
        root.style.setProperty('--mobile-backdrop-filter', 'blur(12px)');
        root.style.setProperty('--mobile-box-shadow', '0 8px 16px rgba(0,0,0,0.2)');
        root.style.setProperty('--mobile-border-radius', '12px');
        body.classList.add('mobile-performance-excellent');
        break;
    }

    // Apply battery optimizations
    if (batteryOptimization) {
      root.style.setProperty('--mobile-refresh-rate', '30Hz');
      root.style.setProperty('--mobile-brightness-filter', 'brightness(0.9)');
      body.classList.add('mobile-battery-optimization');
    } else {
      root.style.setProperty('--mobile-refresh-rate', '60Hz');
      root.style.setProperty('--mobile-brightness-filter', 'brightness(1)');
      body.classList.remove('mobile-battery-optimization');
    }
  }, [performanceLevel, batteryOptimization]);

  // Generate optimization recommendations
  const generateRecommendations = useCallback((): OptimizationRecommendation[] => {
    const recommendations: OptimizationRecommendation[] = [];
    const metrics = state.performanceMetrics;

    // Frame rate recommendations
    if (metrics.frameRate < 30) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'Low Frame Rate Detected',
        description: 'Your device is experiencing low frame rates which may affect gameplay smoothness.',
        action: 'Disable animations and reduce visual effects',
        impact: 'Improve frame rate by 15-25 FPS',
      });
    }

    // Memory usage recommendations
    if (metrics.memoryUsage > 80) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'High Memory Usage',
        description: 'Memory usage is high which may cause app crashes or slowdowns.',
        action: 'Enable memory optimization mode',
        impact: 'Reduce memory usage by 20-30%',
      });
    }

    // Battery optimization recommendations
    if (state.deviceInfo.batteryLevel && state.deviceInfo.batteryLevel < 20) {
      recommendations.push({
        type: 'battery',
        priority: 'high',
        title: 'Low Battery Level',
        description: 'Battery level is low. Consider enabling power saving mode.',
        action: 'Enable battery optimization',
        impact: 'Extend battery life by 30-50%',
      });
    }

    // Performance mode recommendations
    if (metrics.batteryImpact === 'high') {
      recommendations.push({
        type: 'battery',
        priority: 'medium',
        title: 'High Battery Impact',
        description: 'The app is using significant battery power.',
        action: 'Reduce performance mode',
        impact: 'Reduce battery consumption by 20%',
      });
    }

    return recommendations;
  }, [state.performanceMetrics, state.deviceInfo.batteryLevel]);

  // Apply optimizations when performance level changes
  useEffect(() => {
    applyPerformanceOptimizations();
  }, [applyPerformanceOptimizations]);

  // Start monitoring when component mounts
  useEffect(() => {
    if (autoOptimize) {
      setPerformanceState(prev => ({
        ...prev,
        optimizationActive: true,
      }));
      
      // Start frame rate monitoring
      const frameMonitorId = monitorFrameRate();
      
      // Start memory monitoring
      const memoryMonitorId = setInterval(monitorMemoryUsage, 2000);
      
      return () => {
        setPerformanceState(prev => ({
          ...prev,
          optimizationActive: false,
        }));
        cancelAnimationFrame(frameMonitorId);
        clearInterval(memoryMonitorId);
      };
    }
  }, [autoOptimize, monitorFrameRate, monitorMemoryUsage]);

  // Generate and apply recommendations
  useEffect(() => {
    const recommendations = generateRecommendations();
    setPerformanceState(prev => ({
      ...prev,
      recommendations,
    }));
    
    if (autoOptimize && recommendations.length > 0) {
      const now = Date.now();
      const timeSinceLastOptimization = now - performanceState.lastOptimizationTime;
      
      // Apply recommendations if enough time has passed
      if (timeSinceLastOptimization > 5000) { // 5 seconds
        applyOptimizationRecommendations(recommendations);
        setPerformanceState(prev => ({
          ...prev,
          lastOptimizationTime: now,
        }));
      }
    }
  }, [generateRecommendations, autoOptimize, performanceState.lastOptimizationTime, applyOptimizationRecommendations]);

  return (
    <div 
      className={`mobile-performance-optimizer ${className || ''}`}
      data-performance-level={performanceLevel}
      data-battery-optimization={batteryOptimization}
      data-auto-optimize={autoOptimize}
    >
      {/* Performance Optimization Styles */}
      <style jsx global>{`
        /* Performance-based styles */
        .mobile-performance-poor * {
          animation: none !important;
          transition: none !important;
        }
        
        .mobile-performance-poor .mobile-animation,
        .mobile-performance-poor .mobile-transition {
          animation: none !important;
          transition: none !important;
        }
        
        .mobile-performance-poor img,
        .mobile-performance-poor video {
          image-rendering: pixelated;
        }
        
        .mobile-performance-fair .mobile-animation {
          animation-duration: var(--mobile-animation-duration);
          animation-timing-function: linear;
        }
        
        .mobile-performance-fair .mobile-transition {
          transition-duration: var(--mobile-transition-duration);
          transition-timing-function: linear;
        }
        
        .mobile-performance-good .mobile-animation {
          animation-duration: var(--mobile-animation-duration);
          animation-timing-function: ease-in-out;
        }
        
        .mobile-performance-good .mobile-transition {
          transition-duration: var(--mobile-transition-duration);
          transition-timing-function: ease-in-out;
        }
        
        .mobile-performance-excellent .mobile-animation {
          animation-duration: var(--mobile-animation-duration);
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .mobile-performance-excellent .mobile-transition {
          transition-duration: var(--mobile-transition-duration);
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Battery optimization styles */
        .mobile-battery-optimization {
          filter: var(--mobile-brightness-filter);
        }
        
        .mobile-battery-optimization * {
          animation-duration: calc(var(--mobile-animation-duration) / 2);
        }
        
        .mobile-battery-optimization .mobile-expensive-effect {
          display: none;
        }
        
        /* Performance classes */
        .mobile-low-performance {
          transform: translateZ(0);
          will-change: transform;
        }
        
        .mobile-gpu-accelerated {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
        
        .mobile-performance-critical {
          contain: layout style paint;
          content-visibility: auto;
          contain-intrinsic-size: 0 500px;
        }
      `}</style>
      
      {/* Performance Recommendations (Development Mode) */}
      {process.env.NODE_ENV === 'development' && performanceState.recommendations.length > 0 && (
        <div className="mobile-performance-recommendations fixed bottom-52 left-4 z-50 max-w-xs rounded-lg bg-black/80 p-2 text-xs text-white">
          <div className="mb-2 font-semibold">Performance Recommendations:</div>
          {performanceState.recommendations.map((rec, index) => (
            <div key={index} className="mb-1">
              <div className={`font-medium ${rec.priority === 'high' ? 'text-red-400' : rec.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                {rec.title}
              </div>
              <div className="text-gray-300">{rec.description}</div>
              <div className="text-blue-400">{rec.impact}</div>
            </div>
          ))}
        </div>
      )}
      
      {/* Performance Metrics (Development Mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mobile-performance-metrics fixed bottom-68 left-4 z-50 rounded-lg bg-black/80 p-2 text-xs text-white">
          <div>Performance Level: {performanceLevel}</div>
          <div>Battery Optimization: {batteryOptimization ? 'On' : 'Off'}</div>
          {performanceState.frameRateMonitor.length > 0 && (
            <div>Current FPS: {performanceState.frameRateMonitor[performanceState.frameRateMonitor.length - 1]}</div>
          )}
          {performanceState.memoryUsageHistory.length > 0 && (
            <div>Memory: {performanceState.memoryUsageHistory[performanceState.memoryUsageHistory.length - 1]?.toFixed(1)}MB</div>
          )}
          <div>Optimizations: {performanceState.recommendations.length}</div>
        </div>
      )}
    </div>
  );
}
