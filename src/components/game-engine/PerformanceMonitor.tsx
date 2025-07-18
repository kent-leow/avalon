/**
 * Performance Monitor Component
 * 
 * Monitors game engine health and performance metrics to ensure
 * smooth gameplay experience.
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { PerformanceMonitorProps } from '~/types/game-engine';
import { 
  updatePerformanceMetrics, 
  validatePerformanceMetrics,
  createInitialPerformanceMetrics
} from '~/lib/game-engine-utils';

/**
 * Performance Monitor Component
 * 
 * Tracks and displays game engine performance metrics.
 */
export function PerformanceMonitor({
  enabled,
  onMetricsUpdate,
  thresholds,
}: PerformanceMonitorProps) {
  
  const [metrics, setMetrics] = useState(() => createInitialPerformanceMetrics());
  const [isExpanded, setIsExpanded] = useState(false);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number | null>(null);

  /**
   * Update frame rate calculation
   */
  const updateFrameRate = useCallback(() => {
    const now = performance.now();
    const delta = now - lastFrameTimeRef.current;
    frameCountRef.current++;
    
    // Calculate FPS every second
    if (delta >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / delta);
      
      const newMetrics = updatePerformanceMetrics(metrics, {
        frameRate: fps,
        lastHealthCheck: new Date(),
      });
      
      setMetrics(newMetrics);
      onMetricsUpdate(newMetrics);
      
      frameCountRef.current = 0;
      lastFrameTimeRef.current = now;
    }
    
    if (enabled) {
      animationFrameRef.current = requestAnimationFrame(updateFrameRate);
    }
  }, [metrics, onMetricsUpdate, enabled]);

  /**
   * Update memory usage
   */
  const updateMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      const memoryUsage = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024); // MB
      
      const newMetrics = updatePerformanceMetrics(metrics, {
        memoryUsage,
        lastHealthCheck: new Date(),
      });
      
      setMetrics(newMetrics);
      onMetricsUpdate(newMetrics);
    }
  }, [metrics, onMetricsUpdate]);

  /**
   * Measure transition time
   */
  const measureTransitionTime = useCallback(() => {
    const transitionStart = performance.now();
    
    // Simulate transition measurement
    setTimeout(() => {
      const transitionTime = performance.now() - transitionStart;
      
      const newMetrics = updatePerformanceMetrics(metrics, {
        transitionTime,
        lastHealthCheck: new Date(),
      });
      
      setMetrics(newMetrics);
      onMetricsUpdate(newMetrics);
    }, 100);
  }, [metrics, onMetricsUpdate]);

  /**
   * Start performance monitoring
   */
  useEffect(() => {
    if (!enabled) return;
    
    // Start frame rate monitoring
    animationFrameRef.current = requestAnimationFrame(updateFrameRate);
    
    // Start memory monitoring
    const memoryInterval = setInterval(updateMemoryUsage, 5000); // Every 5 seconds
    
    // Start transition monitoring
    const transitionInterval = setInterval(measureTransitionTime, 2000); // Every 2 seconds
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearInterval(memoryInterval);
      clearInterval(transitionInterval);
    };
  }, [enabled, updateFrameRate, updateMemoryUsage, measureTransitionTime]);

  /**
   * Validate performance and show warnings
   */
  const performanceIssues = validatePerformanceMetrics(metrics, thresholds);

  /**
   * Get status color based on performance
   */
  const getStatusColor = () => {
    if (performanceIssues.length > 2) return '#ef4444'; // Red
    if (performanceIssues.length > 0) return '#f59e0b'; // Yellow
    return '#22c55e'; // Green
  };

  /**
   * Format metric values for display
   */
  const formatMetric = (value: number, unit: string) => {
    return `${value.toFixed(1)}${unit}`;
  };

  if (!enabled) {
    return null;
  }

  return (
    <div 
      className="fixed top-4 right-4 z-40"
      data-testid="performance-monitor"
    >
      {/* Compact Display */}
      <div 
        className="rounded-lg p-2 cursor-pointer transition-all duration-200 hover:shadow-lg"
        style={{ backgroundColor: '#1a1a2e' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          {/* Status Indicator */}
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getStatusColor() }}
            data-testid="performance-status-indicator"
          />
          
          {/* FPS Display */}
          <span 
            className="text-xs font-mono"
            style={{ color: '#f8f9fa' }}
            data-testid="fps-display"
          >
            {formatMetric(metrics.frameRate, 'fps')}
          </span>
          
          {/* Expand/Collapse Icon */}
          <span 
            className="text-xs"
            style={{ color: '#9ca3af' }}
          >
            {isExpanded ? '▼' : '▲'}
          </span>
        </div>
      </div>

      {/* Expanded Display */}
      {isExpanded && (
        <div 
          className="mt-2 rounded-lg p-4 min-w-48"
          style={{ backgroundColor: '#1a1a2e' }}
          data-testid="performance-details"
        >
          <h3 
            className="text-sm font-semibold mb-3"
            style={{ color: '#f8f9fa' }}
          >
            Performance Metrics
          </h3>
          
          <div className="space-y-2">
            {/* Frame Rate */}
            <div className="flex justify-between">
              <span 
                className="text-xs"
                style={{ color: '#9ca3af' }}
              >
                FPS:
              </span>
              <span 
                className="text-xs font-mono"
                style={{ color: metrics.frameRate < thresholds.maxFrameRate * 0.8 ? '#ef4444' : '#22c55e' }}
                data-testid="detailed-fps"
              >
                {formatMetric(metrics.frameRate, '')}
              </span>
            </div>
            
            {/* Memory Usage */}
            <div className="flex justify-between">
              <span 
                className="text-xs"
                style={{ color: '#9ca3af' }}
              >
                Memory:
              </span>
              <span 
                className="text-xs font-mono"
                style={{ color: metrics.memoryUsage > thresholds.maxMemoryUsage ? '#ef4444' : '#22c55e' }}
                data-testid="memory-usage"
              >
                {formatMetric(metrics.memoryUsage, 'MB')}
              </span>
            </div>
            
            {/* Transition Time */}
            <div className="flex justify-between">
              <span 
                className="text-xs"
                style={{ color: '#9ca3af' }}
              >
                Transition:
              </span>
              <span 
                className="text-xs font-mono"
                style={{ color: metrics.transitionTime > thresholds.maxTransitionTime ? '#ef4444' : '#22c55e' }}
                data-testid="transition-time"
              >
                {formatMetric(metrics.transitionTime, 'ms')}
              </span>
            </div>
            
            {/* Error Count */}
            <div className="flex justify-between">
              <span 
                className="text-xs"
                style={{ color: '#9ca3af' }}
              >
                Errors:
              </span>
              <span 
                className="text-xs font-mono"
                style={{ color: metrics.errorCount > thresholds.maxErrorCount ? '#ef4444' : '#22c55e' }}
                data-testid="error-count"
              >
                {metrics.errorCount}
              </span>
            </div>
          </div>
          
          {/* Performance Issues */}
          {performanceIssues.length > 0 && (
            <div className="mt-3 pt-2 border-t" style={{ borderColor: '#252547' }}>
              <h4 
                className="text-xs font-semibold mb-1"
                style={{ color: '#f59e0b' }}
              >
                Issues:
              </h4>
              <ul className="space-y-1">
                {performanceIssues.map((issue, index) => (
                  <li 
                    key={index}
                    className="text-xs"
                    style={{ color: '#ef4444' }}
                    data-testid={`performance-issue-${index}`}
                  >
                    • {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Last Updated */}
          <div className="mt-3 pt-2 border-t" style={{ borderColor: '#252547' }}>
            <div className="flex justify-between">
              <span 
                className="text-xs"
                style={{ color: '#9ca3af' }}
              >
                Updated:
              </span>
              <span 
                className="text-xs font-mono"
                style={{ color: '#9ca3af' }}
                data-testid="last-updated"
              >
                {metrics.lastHealthCheck.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PerformanceMonitor;
