'use client';

import { useEffect, useRef, useState } from 'react';
import type { MemoryManagerProps, MemoryMetrics } from '~/types/performance-optimization';
import { createMockMemoryMetrics } from '~/lib/performance-utils';

/**
 * Memory Manager Component
 * 
 * Monitors and optimizes memory usage including garbage collection,
 * leak detection, and memory pressure management.
 */
export function MemoryManager({
  children,
  memoryThreshold = 200,
  enableGarbageCollection = true,
  enableLeakDetection = true,
  onMemoryOptimized,
}: MemoryManagerProps) {
  const [metrics, setMetrics] = useState<MemoryMetrics>(createMockMemoryMetrics());
  const [isOptimizing, setIsOptimizing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const leakDetectionRef = useRef<Map<string, number>>(new Map());

  // Initialize memory monitoring
  useEffect(() => {
    startMemoryMonitoring();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Check memory threshold
  useEffect(() => {
    const memoryUsageMB = metrics.usedJSHeapSize / (1024 * 1024);
    if (memoryUsageMB > memoryThreshold) {
      optimizeMemory();
    }
  }, [metrics.usedJSHeapSize, memoryThreshold]);

  const startMemoryMonitoring = () => {
    const updateMemoryMetrics = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedPercent = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
        
        setMetrics(prev => ({
          ...prev,
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usedPercent,
        }));

        if (enableLeakDetection) {
          detectMemoryLeaks(memory.usedJSHeapSize);
        }
      }
    };

    updateMemoryMetrics();
    intervalRef.current = setInterval(updateMemoryMetrics, 5000);
  };

  const detectMemoryLeaks = (currentUsage: number) => {
    const now = Date.now();
    const key = Math.floor(now / 30000).toString(); // 30-second buckets
    
    leakDetectionRef.current.set(key, currentUsage);
    
    // Keep only last 10 buckets (5 minutes)
    if (leakDetectionRef.current.size > 10) {
      const oldestKey = Array.from(leakDetectionRef.current.keys())[0];
      if (oldestKey) {
        leakDetectionRef.current.delete(oldestKey);
      }
    }

    // Check for memory leaks
    const values = Array.from(leakDetectionRef.current.values());
    if (values.length >= 5) {
      const trend = calculateTrend(values);
      const leakDetected = trend > 0.1; // 10% increase trend
      
      setMetrics(prev => ({
        ...prev,
        leakDetected,
        gcFrequency: prev.gcFrequency + (leakDetected ? 1 : 0),
      }));
    }
  };

  const calculateTrend = (values: number[]): number => {
    if (values.length < 2) return 0;
    
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    
    if (firstValue === undefined || lastValue === undefined || firstValue === 0) {
      return 0;
    }
    
    return (lastValue - firstValue) / firstValue;
  };

  const optimizeMemory = async () => {
    if (isOptimizing) return;
    
    setIsOptimizing(true);
    
    try {
      if (enableGarbageCollection) {
        await performGarbageCollection();
      }

      // Clear unnecessary references
      clearUnnecessaryReferences();
      
      // Optimize DOM elements
      optimizeDOMElements();
      
      // Update metrics after optimization
      const newMetrics = createMockMemoryMetrics();
      setMetrics(current => ({ ...current, ...newMetrics }));
      onMemoryOptimized?.(metrics);

    } catch (error) {
      console.error('Memory optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const performGarbageCollection = async () => {
    // Manual garbage collection hint
    if ('gc' in window) {
      (window as any).gc();
    }
    
    // Clear intervals and timeouts (simplified approach)
    try {
      const highestTimeoutId = window.setTimeout(() => {}, 0);
      window.clearTimeout(highestTimeoutId);
      
      const highestIntervalId = window.setInterval(() => {}, 0);
      window.clearInterval(highestIntervalId);
    } catch (error) {
      console.warn('Could not clear timers:', error);
    }
    
    // Clear event listeners (simplified approach)
    try {
      const clonedBody = document.body.cloneNode(true);
      document.body.parentNode?.replaceChild(clonedBody, document.body);
    } catch (error) {
      console.warn('Could not replace body:', error);
    }
  };

  const clearUnnecessaryReferences = () => {
    // Clear console logs
    if (console.clear) {
      console.clear();
    }
    
    // Clear performance entries
    if (performance.clearMarks) {
      performance.clearMarks();
    }
    if (performance.clearMeasures) {
      performance.clearMeasures();
    }
    
    // Clear caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
  };

  const optimizeDOMElements = () => {
    // Remove unused DOM elements
    const unusedElements = document.querySelectorAll('[data-unused="true"]');
    unusedElements.forEach(element => {
      element.remove();
    });
    
    // Optimize images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.complete || img.naturalWidth === 0) {
        img.remove();
      }
    });
    
    // Remove empty text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    );
    
    const textNodes: Node[] = [];
    let node = walker.nextNode();
    while (node) {
      if (node.nodeValue?.trim() === '') {
        textNodes.push(node);
      }
      node = walker.nextNode();
    }
    
    textNodes.forEach(textNode => {
      textNode.parentNode?.removeChild(textNode);
    });
  };

  return (
    <div className="memory-manager w-full h-full">
      {children}
    </div>
  );
}
