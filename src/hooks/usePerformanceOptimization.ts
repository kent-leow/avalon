/**
 * Performance Optimization Hook
 * 
 * Custom hook for managing performance optimization across the application.
 * Provides centralized performance monitoring and optimization controls.
 */

import { useEffect, useRef, useState } from 'react';
import type {
  PerformanceMetrics,
  PerformanceConfig,
  PerformanceStatus,
  PerformanceIssue,
} from '~/types/performance-optimization';
import {
  createMockPerformanceMetrics,
  createDefaultPerformanceConfig,
  analyzePerformance,
  calculatePerformanceScore,
} from '~/lib/performance-utils';

export interface UsePerformanceOptimizationOptions {
  enableAutoOptimization?: boolean;
  metricsCollectionInterval?: number;
  performanceThreshold?: number;
  onPerformanceOptimized?: (metrics: PerformanceMetrics) => void;
  onIssueDetected?: (issue: PerformanceIssue) => void;
}

export function usePerformanceOptimization(options: UsePerformanceOptimizationOptions = {}) {
  const {
    enableAutoOptimization = true,
    metricsCollectionInterval = 5000,
    performanceThreshold = 60,
    onPerformanceOptimized,
    onIssueDetected,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>(createMockPerformanceMetrics());
  const [config, setConfig] = useState<PerformanceConfig>(createDefaultPerformanceConfig());
  const [status, setStatus] = useState<PerformanceStatus>(() => analyzePerformance(metrics));
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [performanceScore, setPerformanceScore] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const metricsHistoryRef = useRef<PerformanceMetrics[]>([]);

  // Initialize performance monitoring
  useEffect(() => {
    if (config.enableMetricsCollection) {
      startMetricsCollection();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [config.enableMetricsCollection, metricsCollectionInterval]);

  // Analyze performance when metrics change
  useEffect(() => {
    const newStatus = analyzePerformance(metrics);
    setStatus(newStatus);
    
    const score = calculatePerformanceScore(metrics);
    setPerformanceScore(score);
    
    // Store metrics history
    metricsHistoryRef.current.push(metrics);
    if (metricsHistoryRef.current.length > config.maxMetricsHistory) {
      metricsHistoryRef.current.shift();
    }
    
    // Check for new issues
    newStatus.issues.forEach(issue => {
      if (!issue.resolved) {
        onIssueDetected?.(issue);
      }
    });
    
    // Auto-optimize if enabled and threshold exceeded
    if (enableAutoOptimization && score < performanceThreshold) {
      optimizePerformance();
    }
  }, [metrics, config.maxMetricsHistory, enableAutoOptimization, performanceThreshold]);

  const startMetricsCollection = () => {
    const collectMetrics = () => {
      const newMetrics = createMockPerformanceMetrics();
      setMetrics(newMetrics);
    };
    
    // Initial collection
    collectMetrics();
    
    // Set up interval
    intervalRef.current = setInterval(collectMetrics, metricsCollectionInterval);
  };

  const optimizePerformance = async () => {
    if (isOptimizing) return;
    
    setIsOptimizing(true);
    
    try {
      // Simulate optimization delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create optimized metrics
      const optimizedMetrics: PerformanceMetrics = {
        ...metrics,
        fps: Math.min(60, metrics.fps * 1.2),
        memoryUsage: Math.max(50, metrics.memoryUsage * 0.8),
        networkLatency: Math.max(20, metrics.networkLatency * 0.9),
        renderTime: Math.max(10, metrics.renderTime * 0.8),
        loadTime: Math.max(500, metrics.loadTime * 0.9),
        lastUpdated: Date.now(),
      };
      
      setMetrics(optimizedMetrics);
      onPerformanceOptimized?.(optimizedMetrics);
      
    } catch (error) {
      console.error('Performance optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const updateConfig = (newConfig: Partial<PerformanceConfig>) => {
    setConfig(current => ({ ...current, ...newConfig }));
  };

  const resetMetrics = () => {
    setMetrics(createMockPerformanceMetrics());
    metricsHistoryRef.current = [];
  };

  const getMetricsHistory = () => {
    return metricsHistoryRef.current.slice();
  };

  const forceOptimization = () => {
    optimizePerformance();
  };

  return {
    // State
    metrics,
    config,
    status,
    isOptimizing,
    performanceScore,
    
    // Actions
    updateConfig,
    resetMetrics,
    getMetricsHistory,
    forceOptimization,
    
    // Computed values
    isPerformanceGood: performanceScore >= performanceThreshold,
    hasIssues: status.issues.length > 0,
    needsOptimization: performanceScore < performanceThreshold,
  };
}
