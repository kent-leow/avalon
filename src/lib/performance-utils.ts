/**
 * Performance Utilities
 * 
 * Utility functions for performance monitoring, optimization,
 * and metrics collection.
 */

import type {
  PerformanceMetrics,
  PerformanceIssue,
  PerformanceStatus,
  OptimizationStrategy,
  MemoryMetrics,
  RenderMetrics,
  NetworkMetrics,
  LoadingMetrics,
  MobileMetrics,
  PerformanceConfig,
} from '~/types/performance-optimization';

/**
 * Constants
 */
export const PERFORMANCE_THRESHOLDS = {
  fps: {
    excellent: 60,
    good: 45,
    fair: 30,
    poor: 15,
  },
  memory: {
    excellent: 50, // MB
    good: 100,
    fair: 200,
    poor: 500,
  },
  loadTime: {
    excellent: 1000, // ms
    good: 2000,
    fair: 3000,
    poor: 5000,
  },
  networkLatency: {
    excellent: 50, // ms
    good: 100,
    fair: 200,
    poor: 500,
  },
} as const;

export const OPTIMIZATION_CATEGORIES = [
  'memory',
  'render',
  'network',
  'loading',
  'mobile',
] as const;

export const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

/**
 * Mock Data Creators
 */
export const createMockPerformanceMetrics = (): PerformanceMetrics => ({
  fps: 60,
  loadTime: 1200,
  renderTime: 150,
  memoryUsage: 85,
  networkLatency: 75,
  firstContentfulPaint: 800,
  largestContentfulPaint: 1100,
  cumulativeLayoutShift: 0.02,
  firstInputDelay: 20,
  bundleSize: 250,
  imageOptimization: 85,
  cacheHitRate: 92,
  gameStateUpdates: 45,
  wsConnectionStability: 98,
  lastUpdated: Date.now(),
  collectionStartTime: Date.now() - 30000,
});

export const createMockMemoryMetrics = (): MemoryMetrics => ({
  usedJSHeapSize: 50 * 1024 * 1024,
  totalJSHeapSize: 100 * 1024 * 1024,
  jsHeapSizeLimit: 2 * 1024 * 1024 * 1024,
  usedPercent: 50,
  gcFrequency: 5,
  leakDetected: false,
});

export const createMockRenderMetrics = (): RenderMetrics => ({
  componentRenderTime: 15,
  totalRenderTime: 45,
  rerenderCount: 12,
  virtualScrollEfficiency: 95,
  batchedUpdates: 8,
  skippedFrames: 2,
});

export const createMockNetworkMetrics = (): NetworkMetrics => ({
  requestCount: 25,
  totalTransferSize: 150 * 1024,
  compressionRatio: 0.7,
  cacheHitRate: 85,
  wsConnectionCount: 1,
  wsReconnectCount: 0,
  avgLatency: 75,
  bandwidth: 10 * 1024 * 1024,
});

export const createMockLoadingMetrics = (): LoadingMetrics => ({
  initialLoadTime: 1200,
  codesplitting: true,
  lazyLoadingActive: true,
  preloadingActive: true,
  resourceHints: true,
  compressionActive: true,
  totalResources: 45,
  loadedResources: 45,
});

export const createMockMobileMetrics = (): MobileMetrics => ({
  touchLatency: 16,
  batteryLevel: 0.8,
  connection: '4g',
  deviceMemory: 4,
  hardwareConcurrency: 4,
  orientation: 'portrait',
  viewportSize: { width: 375, height: 667 },
  pixelRatio: 2,
});

/**
 * Performance Analysis
 */
export const analyzePerformance = (metrics: PerformanceMetrics): PerformanceStatus => {
  const status: PerformanceStatus = {
    overall: 'good',
    memory: analyzeMemoryStatus(metrics.memoryUsage),
    render: analyzeRenderStatus(metrics.fps, metrics.renderTime),
    network: analyzeNetworkStatus(metrics.networkLatency),
    loading: analyzeLoadingStatus(metrics.loadTime),
    mobile: 'good', // Default for now
    issues: [],
    recommendations: [],
    lastOptimized: Date.now(),
  };

  // Determine overall status
  const statuses = [status.memory, status.render, status.network, status.loading, status.mobile];
  const poorCount = statuses.filter(s => s === 'poor').length;
  const fairCount = statuses.filter(s => s === 'fair').length;
  const goodCount = statuses.filter(s => s === 'good').length;
  const excellentCount = statuses.filter(s => s === 'excellent').length;

  if (poorCount > 0) {
    status.overall = 'poor';
  } else if (fairCount > 2) {
    status.overall = 'fair';
  } else if (goodCount >= 3 || excellentCount >= 2) {
    status.overall = 'good';
  } else if (excellentCount >= 4) {
    status.overall = 'excellent';
  }

  // Generate issues and recommendations
  status.issues = generatePerformanceIssues(metrics, status);
  status.recommendations = generateRecommendations(status);

  return status;
};

const analyzeMemoryStatus = (memoryUsage: number): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (memoryUsage < PERFORMANCE_THRESHOLDS.memory.excellent) return 'excellent';
  if (memoryUsage < PERFORMANCE_THRESHOLDS.memory.good) return 'good';
  if (memoryUsage < PERFORMANCE_THRESHOLDS.memory.fair) return 'fair';
  return 'poor';
};

const analyzeRenderStatus = (fps: number, renderTime: number): 'excellent' | 'good' | 'fair' | 'poor' => {
  const fpsScore = getFpsScore(fps);
  const renderScore = getRenderScore(renderTime);
  const avgScore = (fpsScore + renderScore) / 2;
  
  if (avgScore >= 90) return 'excellent';
  if (avgScore >= 70) return 'good';
  if (avgScore >= 50) return 'fair';
  return 'poor';
};

const analyzeNetworkStatus = (latency: number): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (latency < PERFORMANCE_THRESHOLDS.networkLatency.excellent) return 'excellent';
  if (latency < PERFORMANCE_THRESHOLDS.networkLatency.good) return 'good';
  if (latency < PERFORMANCE_THRESHOLDS.networkLatency.fair) return 'fair';
  return 'poor';
};

const analyzeLoadingStatus = (loadTime: number): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (loadTime < PERFORMANCE_THRESHOLDS.loadTime.excellent) return 'excellent';
  if (loadTime < PERFORMANCE_THRESHOLDS.loadTime.good) return 'good';
  if (loadTime < PERFORMANCE_THRESHOLDS.loadTime.fair) return 'fair';
  return 'poor';
};

const getFpsScore = (fps: number): number => {
  if (fps >= PERFORMANCE_THRESHOLDS.fps.excellent) return 100;
  if (fps >= PERFORMANCE_THRESHOLDS.fps.good) return 80;
  if (fps >= PERFORMANCE_THRESHOLDS.fps.fair) return 60;
  return 40;
};

const getRenderScore = (renderTime: number): number => {
  if (renderTime <= 16) return 100; // 60 FPS
  if (renderTime <= 33) return 80;  // 30 FPS
  if (renderTime <= 50) return 60;  // 20 FPS
  return 40;
};

/**
 * Issue Generation
 */
export const generatePerformanceIssues = (
  metrics: PerformanceMetrics,
  status: PerformanceStatus
): PerformanceIssue[] => {
  const issues: PerformanceIssue[] = [];

  // Memory issues
  if (status.memory === 'poor') {
    issues.push({
      id: 'memory-high',
      type: 'memory',
      severity: 'high',
      title: 'High Memory Usage',
      description: `Memory usage is ${metrics.memoryUsage}MB, which exceeds recommended limits.`,
      impact: 'May cause browser slowdowns and crashes',
      recommendation: 'Enable memory optimization and garbage collection',
      detectedAt: Date.now(),
      resolved: false,
    });
  }

  // Render issues
  if (status.render === 'poor') {
    issues.push({
      id: 'render-slow',
      type: 'render',
      severity: 'high',
      title: 'Slow Rendering Performance',
      description: `FPS is ${metrics.fps}, below the recommended 60 FPS.`,
      impact: 'Causes choppy animations and poor user experience',
      recommendation: 'Enable render optimization and virtualization',
      detectedAt: Date.now(),
      resolved: false,
    });
  }

  // Network issues
  if (status.network === 'poor') {
    issues.push({
      id: 'network-slow',
      type: 'network',
      severity: 'medium',
      title: 'High Network Latency',
      description: `Network latency is ${metrics.networkLatency}ms, affecting real-time updates.`,
      impact: 'Delays in game state synchronization',
      recommendation: 'Enable network optimization and caching',
      detectedAt: Date.now(),
      resolved: false,
    });
  }

  // Loading issues
  if (status.loading === 'poor') {
    issues.push({
      id: 'loading-slow',
      type: 'loading',
      severity: 'medium',
      title: 'Slow Loading Performance',
      description: `Page load time is ${metrics.loadTime}ms, exceeding recommended limits.`,
      impact: 'Poor initial user experience',
      recommendation: 'Enable code splitting and lazy loading',
      detectedAt: Date.now(),
      resolved: false,
    });
  }

  return issues;
};

/**
 * Recommendation Generation
 */
export const generateRecommendations = (status: PerformanceStatus): string[] => {
  const recommendations: string[] = [];

  if (status.memory === 'poor' || status.memory === 'fair') {
    recommendations.push('Enable memory optimization to reduce memory usage');
    recommendations.push('Implement garbage collection strategies');
    recommendations.push('Use memory-efficient data structures');
  }

  if (status.render === 'poor' || status.render === 'fair') {
    recommendations.push('Enable render optimization for better frame rates');
    recommendations.push('Implement virtualization for large lists');
    recommendations.push('Use React.memo for expensive components');
  }

  if (status.network === 'poor' || status.network === 'fair') {
    recommendations.push('Enable network optimization and compression');
    recommendations.push('Implement request batching and caching');
    recommendations.push('Use WebSocket connection pooling');
  }

  if (status.loading === 'poor' || status.loading === 'fair') {
    recommendations.push('Enable code splitting and lazy loading');
    recommendations.push('Implement resource preloading');
    recommendations.push('Optimize bundle size and compression');
  }

  return recommendations;
};

/**
 * Optimization Strategies
 */
export const createOptimizationStrategies = (): OptimizationStrategy[] => [
  {
    id: 'memory-gc',
    name: 'Garbage Collection',
    description: 'Force garbage collection to free unused memory',
    category: 'memory',
    priority: 'high',
    implementation: async () => {
      // Implementation would go here
      console.log('Implementing garbage collection optimization');
    },
    validation: async () => {
      // Validation would go here
      return true;
    },
    rollback: async () => {
      // Rollback would go here
      console.log('Rolling back garbage collection optimization');
    },
  },
  {
    id: 'render-virtualization',
    name: 'Virtualization',
    description: 'Enable virtual scrolling for large lists',
    category: 'render',
    priority: 'medium',
    implementation: async () => {
      console.log('Implementing virtualization optimization');
    },
    validation: async () => {
      return true;
    },
    rollback: async () => {
      console.log('Rolling back virtualization optimization');
    },
  },
  {
    id: 'network-compression',
    name: 'Compression',
    description: 'Enable request/response compression',
    category: 'network',
    priority: 'medium',
    implementation: async () => {
      console.log('Implementing compression optimization');
    },
    validation: async () => {
      return true;
    },
    rollback: async () => {
      console.log('Rolling back compression optimization');
    },
  },
];

/**
 * Performance Configuration
 */
export const createDefaultPerformanceConfig = (): PerformanceConfig => ({
  enableMetricsCollection: true,
  metricsCollectionInterval: 1000,
  maxMetricsHistory: 100,
  autoOptimization: true,
  optimizationThresholds: {
    fps: 45,
    memory: 200,
    network: 200,
    loading: 3000,
  },
  enableMemoryOptimization: true,
  enableRenderOptimization: true,
  enableNetworkOptimization: true,
  enableMobileOptimization: true,
  enableDebugMode: false,
  logPerformanceMetrics: false,
  showPerformanceOverlay: false,
});

/**
 * Utility Functions
 */
export const formatMetricValue = (value: number, unit: string): string => {
  if (unit === 'ms') {
    return `${Math.round(value)}ms`;
  }
  if (unit === 'MB') {
    return `${Math.round(value)}MB`;
  }
  if (unit === 'fps') {
    return `${Math.round(value)} FPS`;
  }
  if (unit === '%') {
    return `${Math.round(value)}%`;
  }
  return `${Math.round(value)}`;
};

export const getStatusColor = (status: 'excellent' | 'good' | 'fair' | 'poor'): string => {
  switch (status) {
    case 'excellent':
      return '#10B981'; // green-500
    case 'good':
      return '#3B82F6'; // blue-500
    case 'fair':
      return '#F59E0B'; // amber-500
    case 'poor':
      return '#EF4444'; // red-500
    default:
      return '#6B7280'; // gray-500
  }
};

export const calculatePerformanceScore = (metrics: PerformanceMetrics): number => {
  const fpsScore = getFpsScore(metrics.fps);
  const memoryScore = getMemoryScore(metrics.memoryUsage);
  const networkScore = getNetworkScore(metrics.networkLatency);
  const loadingScore = getLoadingScore(metrics.loadTime);
  
  return Math.round((fpsScore + memoryScore + networkScore + loadingScore) / 4);
};

const getMemoryScore = (memoryUsage: number): number => {
  if (memoryUsage < PERFORMANCE_THRESHOLDS.memory.excellent) return 100;
  if (memoryUsage < PERFORMANCE_THRESHOLDS.memory.good) return 80;
  if (memoryUsage < PERFORMANCE_THRESHOLDS.memory.fair) return 60;
  return 40;
};

const getNetworkScore = (latency: number): number => {
  if (latency < PERFORMANCE_THRESHOLDS.networkLatency.excellent) return 100;
  if (latency < PERFORMANCE_THRESHOLDS.networkLatency.good) return 80;
  if (latency < PERFORMANCE_THRESHOLDS.networkLatency.fair) return 60;
  return 40;
};

const getLoadingScore = (loadTime: number): number => {
  if (loadTime < PERFORMANCE_THRESHOLDS.loadTime.excellent) return 100;
  if (loadTime < PERFORMANCE_THRESHOLDS.loadTime.good) return 80;
  if (loadTime < PERFORMANCE_THRESHOLDS.loadTime.fair) return 60;
  return 40;
};
