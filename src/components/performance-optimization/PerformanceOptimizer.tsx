'use client';

import { useEffect, useRef, useState } from 'react';
import type { PerformanceOptimizerProps, PerformanceMetrics } from '~/types/performance-optimization';
import { createMockPerformanceMetrics } from '~/lib/performance-utils';

/**
 * Performance Optimizer Component
 * 
 * Main orchestrator for all performance optimization components.
 * Monitors overall system performance and coordinates optimization strategies.
 */
export function PerformanceOptimizer({
  children,
  enableMemoryOptimization = true,
  enableRenderOptimization = true,
  enableNetworkOptimization = true,
  enableMobileOptimization = true,
  performanceThreshold = 60,
  onPerformanceOptimized,
}: PerformanceOptimizerProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(createMockPerformanceMetrics());
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationLevel, setOptimizationLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const metricsRef = useRef<PerformanceMetrics[]>([]);
  const observerRef = useRef<PerformanceObserver | null>(null);

  // Initialize performance monitoring
  useEffect(() => {
    initializePerformanceMonitoring();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Monitor performance threshold
  useEffect(() => {
    if (metrics.fps < performanceThreshold) {
      optimizePerformance();
    }
  }, [metrics.fps, performanceThreshold]);

  const initializePerformanceMonitoring = () => {
    // Performance observer for various metrics
    if ('PerformanceObserver' in window) {
      observerRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        updateMetricsFromEntries(entries);
      });

      try {
        observerRef.current.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }

    // FPS monitoring
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setMetrics((prev: PerformanceMetrics) => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  };

  const updateMetricsFromEntries = (entries: PerformanceEntry[]) => {
    entries.forEach(entry => {
      if (entry.entryType === 'navigation') {
        const navEntry = entry as PerformanceNavigationTiming;
        setMetrics((prev: PerformanceMetrics) => ({
          ...prev,
          loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
          renderTime: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
        }));
      }
      
      if (entry.entryType === 'paint') {
        if (entry.name === 'first-contentful-paint') {
          setMetrics((prev: PerformanceMetrics) => ({ ...prev, firstContentfulPaint: entry.startTime }));
        }
      }
    });
  };

  const optimizePerformance = async () => {
    if (isOptimizing) return;
    
    setIsOptimizing(true);
    
    try {
      // Determine optimization level based on current performance
      const currentFps = metrics.fps;
      let newOptimizationLevel: 'low' | 'medium' | 'high' = 'medium';
      
      if (currentFps < 30) {
        newOptimizationLevel = 'high';
      } else if (currentFps < 45) {
        newOptimizationLevel = 'medium';
      } else {
        newOptimizationLevel = 'low';
      }
      
      setOptimizationLevel(newOptimizationLevel);
      
      // Apply optimizations based on level
      if (newOptimizationLevel === 'high') {
        await applyAggressiveOptimizations();
      } else if (newOptimizationLevel === 'medium') {
        await applyMediumOptimizations();
      } else {
        await applyLightOptimizations();
      }
      
      // Update metrics after optimization
      const newMetrics = createMockPerformanceMetrics();
      setMetrics((current: PerformanceMetrics) => ({ ...current, ...newMetrics }));
      onPerformanceOptimized?.(metrics);

    } catch (error) {
      console.error('Performance optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const applyAggressiveOptimizations = async () => {
    // Aggressive optimizations for poor performance
    const style = document.createElement('style');
    style.textContent = `
      .performance-optimized * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
      }
      
      .performance-optimized .animate-spin,
      .performance-optimized .animate-pulse,
      .performance-optimized .animate-bounce {
        animation: none !important;
      }
      
      .performance-optimized img {
        image-rendering: pixelated;
      }
      
      .performance-optimized .shadow-lg,
      .performance-optimized .shadow-xl {
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('performance-optimized');
  };

  const applyMediumOptimizations = async () => {
    // Medium optimizations for moderate performance
    const style = document.createElement('style');
    style.textContent = `
      .performance-optimized * {
        animation-duration: 0.2s !important;
        transition-duration: 0.2s !important;
      }
      
      .performance-optimized .animate-spin {
        animation-duration: 2s !important;
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('performance-optimized');
  };

  const applyLightOptimizations = async () => {
    // Light optimizations for good performance
    const style = document.createElement('style');
    style.textContent = `
      .performance-optimized * {
        animation-duration: 0.3s !important;
        transition-duration: 0.3s !important;
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('performance-optimized');
  };

  // Store metrics for analysis
  useEffect(() => {
    metricsRef.current.push(metrics);
    if (metricsRef.current.length > 100) {
      metricsRef.current.shift();
    }
  }, [metrics]);

  return (
    <div className="performance-optimizer w-full h-full">
      {children}
    </div>
  );
}
