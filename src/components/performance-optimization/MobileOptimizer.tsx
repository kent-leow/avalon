'use client';

import { useEffect, useRef, useState } from 'react';
import type { MobileOptimizerProps, MobileMetrics } from '~/types/performance-optimization';
import { createMockMobileMetrics } from '~/lib/performance-utils';

/**
 * Mobile Optimizer Component
 * 
 * Implements mobile-specific performance optimizations including
 * touch optimization, battery optimization, and adaptive quality.
 */
export function MobileOptimizer({
  children,
  touchOptimization = true,
  batteryOptimization = true,
  onMobileOptimized,
}: MobileOptimizerProps) {
  const [metrics, setMetrics] = useState<MobileMetrics>(createMockMobileMetrics());
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [adaptiveQuality, setAdaptiveQuality] = useState<'high' | 'medium' | 'low'>('high');
  const touchLatencyRef = useRef<number[]>([]);
  const batteryRef = useRef<any>(null);
  const networkRef = useRef<any>(null);

  // Initialize mobile optimization
  useEffect(() => {
    optimizeMobile();
  }, []);

  // Battery optimization
  useEffect(() => {
    if (batteryOptimization && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryRef.current = battery;
        
        const updateBatteryOptimization = () => {
          const batteryLevel = battery.level;
          setMetrics(prev => ({ ...prev, batteryLevel }));
          
          // Adjust quality based on battery level
          if (batteryLevel < 0.2) {
            setAdaptiveQuality('low');
          } else if (batteryLevel < 0.5) {
            setAdaptiveQuality('medium');
          } else {
            setAdaptiveQuality('high');
          }
        };

        battery.addEventListener('levelchange', updateBatteryOptimization);
        battery.addEventListener('chargingchange', updateBatteryOptimization);
        updateBatteryOptimization();
      });
    }
  }, [batteryOptimization]);

  // Network optimization
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      networkRef.current = connection;
      
      const updateNetworkOptimization = () => {
        const effectiveType = connection.effectiveType;
        setMetrics(prev => ({ ...prev, connection: effectiveType }));
        
        // Adjust quality based on connection
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          setAdaptiveQuality('low');
        } else if (effectiveType === '3g') {
          setAdaptiveQuality('medium');
        }
      };

      connection.addEventListener('change', updateNetworkOptimization);
      updateNetworkOptimization();
    }
  }, []);

  // Touch optimization
  useEffect(() => {
    if (touchOptimization) {
      const handleTouchStart = (e: TouchEvent) => {
        const startTime = performance.now();
        
        const handleTouchEnd = () => {
          const endTime = performance.now();
          const latency = endTime - startTime;
          
          touchLatencyRef.current.push(latency);
          if (touchLatencyRef.current.length > 10) {
            touchLatencyRef.current.shift();
          }
          
          const avgLatency = touchLatencyRef.current.reduce((a, b) => a + b, 0) / touchLatencyRef.current.length;
          setMetrics(prev => ({ ...prev, touchLatency: avgLatency }));
          
          document.removeEventListener('touchend', handleTouchEnd);
        };
        
        document.addEventListener('touchend', handleTouchEnd);
      };

      document.addEventListener('touchstart', handleTouchStart);
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
      };
    }
  }, [touchOptimization]);

  const optimizeMobile = async () => {
    if (isOptimizing) return;
    
    setIsOptimizing(true);
    
    try {
      // Device capabilities detection
      const deviceMemory = (navigator as any).deviceMemory || 4;
      const hardwareConcurrency = navigator.hardwareConcurrency || 4;
      
      setMetrics(prev => ({
        ...prev,
        deviceMemory,
        hardwareConcurrency,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      }));

      // Apply mobile-specific optimizations
      if (touchOptimization) {
        optimizeTouchInteractions();
      }

      if (batteryOptimization) {
        optimizeBatteryUsage();
      }

      // Update metrics
      const newMetrics = createMockMobileMetrics();
      setMetrics(current => ({ ...current, ...newMetrics }));
      onMobileOptimized?.(metrics);

    } catch (error) {
      console.error('Mobile optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const optimizeTouchInteractions = () => {
    // Add touch-action CSS for better touch handling
    const style = document.createElement('style');
    style.textContent = `
      .touch-optimized {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }
      
      .touch-optimized button,
      .touch-optimized [role="button"] {
        min-height: 44px;
        min-width: 44px;
        padding: 8px 16px;
      }
      
      .touch-optimized input,
      .touch-optimized textarea,
      .touch-optimized select {
        font-size: 16px; /* Prevents zoom on iOS */
      }
    `;
    document.head.appendChild(style);

    // Apply touch optimization class to interactive elements
    const interactiveElements = document.querySelectorAll('button, [role="button"], a, input, textarea, select');
    interactiveElements.forEach(element => {
      element.classList.add('touch-optimized');
    });
  };

  const optimizeBatteryUsage = () => {
    // Reduce animations and effects based on battery level
    const style = document.createElement('style');
    
    if (adaptiveQuality === 'low') {
      style.textContent = `
        .battery-optimized * {
          animation-duration: 0.1s !important;
          transition-duration: 0.1s !important;
        }
        
        .battery-optimized .animate-spin,
        .battery-optimized .animate-pulse,
        .battery-optimized .animate-bounce {
          animation: none !important;
        }
        
        .battery-optimized video {
          display: none !important;
        }
      `;
    } else if (adaptiveQuality === 'medium') {
      style.textContent = `
        .battery-optimized * {
          animation-duration: 0.2s !important;
          transition-duration: 0.2s !important;
        }
        
        .battery-optimized .animate-spin {
          animation-duration: 2s !important;
        }
      `;
    }
    
    document.head.appendChild(style);
    document.body.classList.add('battery-optimized');
  };

  // Adaptive quality based on device capabilities
  const applyAdaptiveQuality = () => {
    const style = document.createElement('style');
    
    if (adaptiveQuality === 'low') {
      style.textContent = `
        .adaptive-quality img {
          image-rendering: pixelated;
        }
        
        .adaptive-quality video {
          max-height: 480px;
        }
        
        .adaptive-quality .shadow-lg {
          box-shadow: none !important;
        }
      `;
    } else if (adaptiveQuality === 'medium') {
      style.textContent = `
        .adaptive-quality img {
          image-rendering: auto;
        }
        
        .adaptive-quality video {
          max-height: 720px;
        }
      `;
    }
    
    document.head.appendChild(style);
    document.body.classList.add('adaptive-quality');
  };

  // Apply adaptive quality when it changes
  useEffect(() => {
    applyAdaptiveQuality();
  }, [adaptiveQuality]);

  // Orientation change optimization
  useEffect(() => {
    const handleOrientationChange = () => {
      setTimeout(() => {
        setMetrics(prev => ({
          ...prev,
          orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
        }));
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return (
    <div className="mobile-optimized w-full h-full">
      {children}
    </div>
  );
}
