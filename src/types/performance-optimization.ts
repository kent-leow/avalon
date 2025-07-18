/**
 * Performance Optimization Types
 * 
 * Defines types for performance monitoring, optimization strategies,
 * and metrics collection across the application.
 */

import type { ReactNode } from 'react';

/**
 * Performance Metrics
 */
export interface PerformanceMetrics {
  // Core performance metrics
  fps: number;
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkLatency: number;
  
  // Web Vitals
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  
  // Resource metrics
  bundleSize: number;
  imageOptimization: number;
  cacheHitRate: number;
  
  // Game-specific metrics
  gameStateUpdates: number;
  wsConnectionStability: number;
  
  // Timestamps
  lastUpdated: number;
  collectionStartTime: number;
}

/**
 * Performance Issues
 */
export interface PerformanceIssue {
  id: string;
  type: 'memory' | 'render' | 'network' | 'loading' | 'mobile';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  detectedAt: number;
  resolved: boolean;
}

/**
 * Optimization Strategy
 */
export interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  category: 'memory' | 'render' | 'network' | 'loading' | 'mobile';
  priority: 'low' | 'medium' | 'high';
  implementation: () => Promise<void>;
  validation: () => Promise<boolean>;
  rollback: () => Promise<void>;
}

/**
 * Memory Metrics
 */
export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedPercent: number;
  gcFrequency: number;
  leakDetected: boolean;
}

/**
 * Render Metrics
 */
export interface RenderMetrics {
  componentRenderTime: number;
  totalRenderTime: number;
  rerenderCount: number;
  virtualScrollEfficiency: number;
  batchedUpdates: number;
  skippedFrames: number;
}

/**
 * Network Metrics
 */
export interface NetworkMetrics {
  requestCount: number;
  totalTransferSize: number;
  compressionRatio: number;
  cacheHitRate: number;
  wsConnectionCount: number;
  wsReconnectCount: number;
  avgLatency: number;
  bandwidth: number;
}

/**
 * Loading Metrics
 */
export interface LoadingMetrics {
  initialLoadTime: number;
  codesplitting: boolean;
  lazyLoadingActive: boolean;
  preloadingActive: boolean;
  resourceHints: boolean;
  compressionActive: boolean;
  totalResources: number;
  loadedResources: number;
}

/**
 * Mobile Metrics
 */
export interface MobileMetrics {
  touchLatency: number;
  batteryLevel: number;
  connection: string;
  deviceMemory: number;
  hardwareConcurrency: number;
  orientation: 'portrait' | 'landscape';
  viewportSize: { width: number; height: number };
  pixelRatio: number;
}

/**
 * Component Props
 */
export interface PerformanceOptimizerProps {
  children: ReactNode;
  enableMemoryOptimization?: boolean;
  enableRenderOptimization?: boolean;
  enableNetworkOptimization?: boolean;
  enableMobileOptimization?: boolean;
  performanceThreshold?: number;
  onPerformanceOptimized?: (metrics: PerformanceMetrics) => void;
}

export interface MemoryManagerProps {
  children: ReactNode;
  memoryThreshold?: number;
  enableGarbageCollection?: boolean;
  enableLeakDetection?: boolean;
  onMemoryOptimized?: (metrics: MemoryMetrics) => void;
}

export interface RenderOptimizerProps {
  children: ReactNode;
  enableVirtualization?: boolean;
  enableBatching?: boolean;
  enableMemoization?: boolean;
  onRenderOptimized?: (metrics: RenderMetrics) => void;
}

export interface NetworkOptimizerProps {
  children: ReactNode;
  enableCompression?: boolean;
  enableCaching?: boolean;
  enablePrefetching?: boolean;
  onNetworkOptimized?: (metrics: NetworkMetrics) => void;
}

export interface LoadingOptimizerProps {
  children: ReactNode;
  enableCodeSplitting?: boolean;
  enableLazyLoading?: boolean;
  enablePreloading?: boolean;
  onLoadingOptimized?: (metrics: LoadingMetrics) => void;
}

export interface MobileOptimizerProps {
  children: ReactNode;
  touchOptimization?: boolean;
  batteryOptimization?: boolean;
  onMobileOptimized?: (metrics: MobileMetrics) => void;
}

/**
 * Performance Configuration
 */
export interface PerformanceConfig {
  // Monitoring settings
  enableMetricsCollection: boolean;
  metricsCollectionInterval: number;
  maxMetricsHistory: number;
  
  // Optimization settings
  autoOptimization: boolean;
  optimizationThresholds: {
    fps: number;
    memory: number;
    network: number;
    loading: number;
  };
  
  // Feature flags
  enableMemoryOptimization: boolean;
  enableRenderOptimization: boolean;
  enableNetworkOptimization: boolean;
  enableMobileOptimization: boolean;
  
  // Debugging
  enableDebugMode: boolean;
  logPerformanceMetrics: boolean;
  showPerformanceOverlay: boolean;
}

/**
 * Performance Status
 */
export interface PerformanceStatus {
  overall: 'excellent' | 'good' | 'fair' | 'poor';
  memory: 'excellent' | 'good' | 'fair' | 'poor';
  render: 'excellent' | 'good' | 'fair' | 'poor';
  network: 'excellent' | 'good' | 'fair' | 'poor';
  loading: 'excellent' | 'good' | 'fair' | 'poor';
  mobile: 'excellent' | 'good' | 'fair' | 'poor';
  issues: PerformanceIssue[];
  recommendations: string[];
  lastOptimized: number;
}
