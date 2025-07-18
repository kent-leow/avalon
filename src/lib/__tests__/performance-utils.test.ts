/**
 * Performance Utils Tests
 * 
 * Unit tests for performance utility functions.
 */

import {
  createMockPerformanceMetrics,
  createMockMemoryMetrics,
  createMockRenderMetrics,
  createMockNetworkMetrics,
  createMockLoadingMetrics,
  createMockMobileMetrics,
  analyzePerformance,
  calculatePerformanceScore,
  formatMetricValue,
  getStatusColor,
} from '~/lib/performance-utils';

describe('Performance Utils', () => {
  describe('Mock Data Creators', () => {
    test('createMockPerformanceMetrics creates valid metrics', () => {
      const metrics = createMockPerformanceMetrics();
      
      expect(metrics.fps).toBeGreaterThan(0);
      expect(metrics.loadTime).toBeGreaterThan(0);
      expect(metrics.memoryUsage).toBeGreaterThan(0);
      expect(metrics.networkLatency).toBeGreaterThan(0);
      expect(metrics.lastUpdated).toBeDefined();
    });

    test('createMockMemoryMetrics creates valid memory metrics', () => {
      const metrics = createMockMemoryMetrics();
      
      expect(metrics.usedJSHeapSize).toBeGreaterThan(0);
      expect(metrics.totalJSHeapSize).toBeGreaterThan(0);
      expect(metrics.jsHeapSizeLimit).toBeGreaterThan(0);
      expect(metrics.usedPercent).toBeGreaterThanOrEqual(0);
      expect(metrics.usedPercent).toBeLessThanOrEqual(100);
    });

    test('createMockRenderMetrics creates valid render metrics', () => {
      const metrics = createMockRenderMetrics();
      
      expect(metrics.componentRenderTime).toBeGreaterThan(0);
      expect(metrics.totalRenderTime).toBeGreaterThan(0);
      expect(metrics.rerenderCount).toBeGreaterThanOrEqual(0);
      expect(metrics.virtualScrollEfficiency).toBeGreaterThanOrEqual(0);
    });

    test('createMockNetworkMetrics creates valid network metrics', () => {
      const metrics = createMockNetworkMetrics();
      
      expect(metrics.requestCount).toBeGreaterThanOrEqual(0);
      expect(metrics.totalTransferSize).toBeGreaterThanOrEqual(0);
      expect(metrics.avgLatency).toBeGreaterThan(0);
      expect(metrics.bandwidth).toBeGreaterThan(0);
    });

    test('createMockLoadingMetrics creates valid loading metrics', () => {
      const metrics = createMockLoadingMetrics();
      
      expect(metrics.initialLoadTime).toBeGreaterThan(0);
      expect(typeof metrics.codesplitting).toBe('boolean');
      expect(typeof metrics.lazyLoadingActive).toBe('boolean');
      expect(metrics.totalResources).toBeGreaterThanOrEqual(0);
    });

    test('createMockMobileMetrics creates valid mobile metrics', () => {
      const metrics = createMockMobileMetrics();
      
      expect(metrics.touchLatency).toBeGreaterThan(0);
      expect(metrics.batteryLevel).toBeGreaterThanOrEqual(0);
      expect(metrics.batteryLevel).toBeLessThanOrEqual(1);
      expect(metrics.deviceMemory).toBeGreaterThan(0);
      expect(['portrait', 'landscape']).toContain(metrics.orientation);
    });
  });

  describe('Performance Analysis', () => {
    test('analyzePerformance returns correct status for good performance', () => {
      const metrics = createMockPerformanceMetrics();
      // Set good performance values
      metrics.fps = 60;
      metrics.memoryUsage = 50;
      metrics.networkLatency = 30;
      metrics.loadTime = 800;
      
      const status = analyzePerformance(metrics);
      
      expect(['excellent', 'good']).toContain(status.overall);
      expect(['excellent', 'good']).toContain(status.memory);
      expect(['excellent', 'good']).toContain(status.render);
      expect(['excellent', 'good']).toContain(status.network);
      expect(['excellent', 'good']).toContain(status.loading);
    });

    test('analyzePerformance returns correct status for poor performance', () => {
      const metrics = createMockPerformanceMetrics();
      // Set poor performance values
      metrics.fps = 15;
      metrics.memoryUsage = 600;
      metrics.networkLatency = 600;
      metrics.loadTime = 6000;
      
      const status = analyzePerformance(metrics);
      
      expect(status.overall).toBe('poor');
      expect(status.memory).toBe('poor');
      expect(status.render).toBe('poor');
      expect(status.network).toBe('poor');
      expect(status.loading).toBe('poor');
    });
  });

  describe('Performance Score Calculation', () => {
    test('calculatePerformanceScore returns high score for good performance', () => {
      const metrics = createMockPerformanceMetrics();
      metrics.fps = 60;
      metrics.memoryUsage = 50;
      metrics.networkLatency = 30;
      metrics.loadTime = 800;
      
      const score = calculatePerformanceScore(metrics);
      
      expect(score).toBeGreaterThan(90);
    });

    test('calculatePerformanceScore returns low score for poor performance', () => {
      const metrics = createMockPerformanceMetrics();
      metrics.fps = 15;
      metrics.memoryUsage = 600;
      metrics.networkLatency = 600;
      metrics.loadTime = 6000;
      
      const score = calculatePerformanceScore(metrics);
      
      expect(score).toBeLessThan(50);
    });
  });

  describe('Utility Functions', () => {
    test('formatMetricValue formats values correctly', () => {
      expect(formatMetricValue(1234.56, 'ms')).toBe('1235ms');
      expect(formatMetricValue(123.45, 'MB')).toBe('123MB');
      expect(formatMetricValue(59.9, 'fps')).toBe('60 FPS');
      expect(formatMetricValue(85.6, '%')).toBe('86%');
    });

    test('getStatusColor returns correct colors', () => {
      expect(getStatusColor('excellent')).toBe('#10B981');
      expect(getStatusColor('good')).toBe('#3B82F6');
      expect(getStatusColor('fair')).toBe('#F59E0B');
      expect(getStatusColor('poor')).toBe('#EF4444');
    });
  });
});
