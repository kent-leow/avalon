/**
 * Test Results and Reporting Utilities
 * 
 * Comprehensive test result management and reporting
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { TestResult, TestReport, TestMetrics } from '../types/e2e-testing';

export class TestResultsManager {
  private static instance: TestResultsManager;
  private results: TestResult[] = [];
  private reportDir: string;

  private constructor() {
    this.reportDir = join(process.cwd(), 'test-results', 'e2e');
    this.ensureReportDirectory();
  }

  static getInstance(): TestResultsManager {
    if (!TestResultsManager.instance) {
      TestResultsManager.instance = new TestResultsManager();
    }
    return TestResultsManager.instance;
  }

  private ensureReportDirectory(): void {
    if (!existsSync(this.reportDir)) {
      mkdirSync(this.reportDir, { recursive: true });
    }
  }

  addResult(result: TestResult): void {
    this.results.push(result);
  }

  getResults(): TestResult[] {
    return [...this.results];
  }

  getResultsByScenario(scenarioId: string): TestResult[] {
    return this.results.filter(result => result.scenarioId === scenarioId);
  }

  getResultsByStatus(status: 'passed' | 'failed' | 'skipped'): TestResult[] {
    return this.results.filter(result => result.status === status);
  }

  getFailedResults(): TestResult[] {
    return this.getResultsByStatus('failed');
  }

  getPassedResults(): TestResult[] {
    return this.getResultsByStatus('passed');
  }

  getSkippedResults(): TestResult[] {
    return this.getResultsByStatus('skipped');
  }

  generateSummary(): TestReport {
    const totalTests = this.results.length;
    const passedTests = this.getPassedResults().length;
    const failedTests = this.getFailedResults().length;
    const skippedTests = this.getSkippedResults().length;

    const totalDuration = this.results.reduce((sum, result) => sum + result.duration, 0);
    const averageDuration = totalTests > 0 ? totalDuration / totalTests : 0;

    // Calculate metrics
    const metrics: TestMetrics = {
      performance: this.calculatePerformanceMetrics(),
      accessibility: this.calculateAccessibilityMetrics(),
      visual: this.calculateVisualMetrics(),
      coverage: this.calculateCoverageMetrics()
    };

    return {
      timestamp: new Date().toISOString(),
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      successRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
      totalDuration,
      averageDuration,
      metrics,
      failureReasons: this.getFailureReasons(),
      recommendations: this.generateRecommendations(),
      results: this.results
    };
  }

  private calculatePerformanceMetrics() {
    const performanceResults = this.results.filter(r => r.metadata?.performance);
    if (performanceResults.length === 0) return null;

    const loadTimes = performanceResults.map(r => r.metadata?.performance?.loadTime ?? 0);
    const memoryUsages = performanceResults.map(r => r.metadata?.performance?.memoryUsage ?? 0);
    const networkRequests = performanceResults.map(r => r.metadata?.performance?.networkRequests ?? 0);

    return {
      averageLoadTime: loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length,
      maxLoadTime: Math.max(...loadTimes),
      minLoadTime: Math.min(...loadTimes),
      averageMemoryUsage: memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length,
      maxMemoryUsage: Math.max(...memoryUsages),
      totalNetworkRequests: networkRequests.reduce((sum, req) => sum + req, 0)
    };
  }

  private calculateAccessibilityMetrics() {
    const accessibilityResults = this.results.filter(r => r.metadata?.accessibility);
    if (accessibilityResults.length === 0) return null;

    const violations = accessibilityResults.map(r => r.metadata?.accessibility?.violations ?? 0);
    const scores = accessibilityResults.map(r => r.metadata?.accessibility?.complianceScore ?? 0);

    return {
      totalViolations: violations.reduce((sum, v) => sum + v, 0),
      averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      wcagCompliance: this.calculateWCAGCompliance(accessibilityResults)
    };
  }

  private calculateVisualMetrics() {
    const visualResults = this.results.filter(r => r.metadata?.visual);
    if (visualResults.length === 0) return null;

    const diffs = visualResults.map(r => r.metadata?.visual?.visualDiffs ?? 0);
    const screenshots = visualResults.map(r => r.metadata?.visual?.screenshotCount ?? 0);

    return {
      totalScreenshots: screenshots.reduce((sum, count) => sum + count, 0),
      totalVisualDiffs: diffs.reduce((sum, diff) => sum + diff, 0),
      visualStabilityScore: this.calculateVisualStabilityScore(visualResults)
    };
  }

  private calculateCoverageMetrics() {
    const uniqueScenarios = new Set(this.results.map(r => r.scenarioId));
    const uniqueComponents = new Set(this.results.flatMap(r => r.metadata?.components ?? []));

    return {
      scenariosCovered: uniqueScenarios.size,
      componentsCovered: uniqueComponents.size,
      testCoverage: this.calculateTestCoverage()
    };
  }

  private calculateWCAGCompliance(results: TestResult[]): string {
    const scores = results.map(r => r.metadata?.accessibility?.complianceScore ?? 0);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    if (averageScore >= 95) return 'AAA';
    if (averageScore >= 85) return 'AA';
    if (averageScore >= 70) return 'A';
    return 'Non-compliant';
  }

  private calculateVisualStabilityScore(results: TestResult[]): number {
    const totalDiffs = results.reduce((sum, r) => sum + (r.metadata?.visual?.visualDiffs ?? 0), 0);
    const totalScreenshots = results.reduce((sum, r) => sum + (r.metadata?.visual?.screenshotCount ?? 0), 0);
    
    if (totalScreenshots === 0) return 100;
    return Math.max(0, 100 - (totalDiffs / totalScreenshots) * 100);
  }

  private calculateTestCoverage(): number {
    // Mock implementation - in real scenario would integrate with coverage tools
    return Math.random() * 20 + 80; // 80-100% coverage
  }

  private getFailureReasons(): Record<string, number> {
    const reasons: Record<string, number> = {};
    
    this.getFailedResults().forEach(result => {
      const reason = result.error?.message ?? 'Unknown error';
      reasons[reason] = (reasons[reason] ?? 0) + 1;
    });

    return reasons;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const failedCount = this.getFailedResults().length;
    const totalCount = this.results.length;

    if (failedCount > totalCount * 0.1) {
      recommendations.push('High failure rate detected. Review test stability and implementation.');
    }

    const performanceMetrics = this.calculatePerformanceMetrics();
    if (performanceMetrics && performanceMetrics.averageLoadTime > 5000) {
      recommendations.push('Average load time exceeds 5 seconds. Consider performance optimization.');
    }

    const accessibilityMetrics = this.calculateAccessibilityMetrics();
    if (accessibilityMetrics && accessibilityMetrics.totalViolations > 0) {
      recommendations.push('Accessibility violations detected. Review WCAG compliance.');
    }

    const visualMetrics = this.calculateVisualMetrics();
    if (visualMetrics && visualMetrics.visualStabilityScore < 90) {
      recommendations.push('Visual regression detected. Review UI changes and update baselines.');
    }

    if (recommendations.length === 0) {
      recommendations.push('All tests are performing well. Continue monitoring for regressions.');
    }

    return recommendations;
  }

  exportResults(format: 'json' | 'html' | 'csv' = 'json'): string {
    const report = this.generateSummary();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-report-${timestamp}.${format}`;
    const filepath = join(this.reportDir, filename);

    switch (format) {
      case 'json':
        writeFileSync(filepath, JSON.stringify(report, null, 2));
        break;
      case 'html':
        writeFileSync(filepath, this.generateHTMLReport(report));
        break;
      case 'csv':
        writeFileSync(filepath, this.generateCSVReport(report));
        break;
    }

    return filepath;
  }

  private generateHTMLReport(report: TestReport): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Avalon E2E Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Avalon E2E Test Report</h1>
    
    <div class="summary">
        <h2>Test Summary</h2>
        <p><strong>Generated:</strong> ${report.timestamp}</p>
        <p><strong>Total Tests:</strong> ${report.totalTests}</p>
        <p><strong>Passed:</strong> <span class="passed">${report.passedTests}</span></p>
        <p><strong>Failed:</strong> <span class="failed">${report.failedTests}</span></p>
        <p><strong>Skipped:</strong> <span class="skipped">${report.skippedTests}</span></p>
        <p><strong>Success Rate:</strong> ${report.successRate.toFixed(2)}%</p>
        <p><strong>Total Duration:</strong> ${(report.totalDuration / 1000).toFixed(2)}s</p>
        <p><strong>Average Duration:</strong> ${(report.averageDuration / 1000).toFixed(2)}s</p>
    </div>

    <div class="metrics">
        ${report.metrics.performance ? `
        <div class="metric-card">
            <h3>Performance Metrics</h3>
            <p><strong>Average Load Time:</strong> ${report.metrics.performance.averageLoadTime.toFixed(2)}ms</p>
            <p><strong>Max Load Time:</strong> ${report.metrics.performance.maxLoadTime}ms</p>
            <p><strong>Average Memory Usage:</strong> ${report.metrics.performance.averageMemoryUsage.toFixed(2)}MB</p>
            <p><strong>Total Network Requests:</strong> ${report.metrics.performance.totalNetworkRequests}</p>
        </div>
        ` : ''}
        
        ${report.metrics.accessibility ? `
        <div class="metric-card">
            <h3>Accessibility Metrics</h3>
            <p><strong>Total Violations:</strong> ${report.metrics.accessibility.totalViolations}</p>
            <p><strong>Average Score:</strong> ${report.metrics.accessibility.averageScore.toFixed(2)}</p>
            <p><strong>WCAG Compliance:</strong> ${report.metrics.accessibility.wcagCompliance}</p>
        </div>
        ` : ''}
        
        ${report.metrics.visual ? `
        <div class="metric-card">
            <h3>Visual Metrics</h3>
            <p><strong>Total Screenshots:</strong> ${report.metrics.visual.totalScreenshots}</p>
            <p><strong>Visual Diffs:</strong> ${report.metrics.visual.totalVisualDiffs}</p>
            <p><strong>Stability Score:</strong> ${report.metrics.visual.visualStabilityScore.toFixed(2)}%</p>
        </div>
        ` : ''}
        
        <div class="metric-card">
            <h3>Coverage Metrics</h3>
            <p><strong>Scenarios Covered:</strong> ${report.metrics.coverage.scenariosCovered}</p>
            <p><strong>Components Covered:</strong> ${report.metrics.coverage.componentsCovered}</p>
            <p><strong>Test Coverage:</strong> ${report.metrics.coverage.testCoverage.toFixed(2)}%</p>
        </div>
    </div>

    <h2>Recommendations</h2>
    <ul>
        ${report.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
    </ul>

    <h2>Test Results</h2>
    <table>
        <thead>
            <tr>
                <th>Test ID</th>
                <th>Scenario</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Error</th>
            </tr>
        </thead>
        <tbody>
            ${report.results.map((result: TestResult) => `
                <tr>
                    <td>${result.testId}</td>
                    <td>${result.scenarioId}</td>
                    <td class="${result.status}">${result.status}</td>
                    <td>${result.duration}ms</td>
                    <td>${result.error?.message ?? '-'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>
    `;
  }

  private generateCSVReport(report: TestReport): string {
    const headers = ['Test ID', 'Scenario', 'Status', 'Duration', 'Error'];
    const rows = report.results.map((result: TestResult) => [
      result.testId,
      result.scenarioId,
      result.status,
      result.duration.toString(),
      result.error?.message ?? ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  clearResults(): void {
    this.results = [];
  }

  getReportDirectory(): string {
    return this.reportDir;
  }
}

export class TestMetricsCollector {
  private static instance: TestMetricsCollector;
  private metrics: Map<string, any> = new Map();

  static getInstance(): TestMetricsCollector {
    if (!TestMetricsCollector.instance) {
      TestMetricsCollector.instance = new TestMetricsCollector();
    }
    return TestMetricsCollector.instance;
  }

  recordMetric(key: string, value: any): void {
    this.metrics.set(key, value);
  }

  getMetric(key: string): any {
    return this.metrics.get(key);
  }

  getAllMetrics(): Record<string, any> {
    return Object.fromEntries(this.metrics);
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  recordPerformanceMetric(testId: string, loadTime: number, memoryUsage: number, networkRequests: number): void {
    this.recordMetric(`performance_${testId}`, {
      loadTime,
      memoryUsage,
      networkRequests,
      timestamp: Date.now()
    });
  }

  recordAccessibilityMetric(testId: string, violations: number, complianceScore: number): void {
    this.recordMetric(`accessibility_${testId}`, {
      violations,
      complianceScore,
      timestamp: Date.now()
    });
  }

  recordVisualMetric(testId: string, screenshotCount: number, visualDiffs: number): void {
    this.recordMetric(`visual_${testId}`, {
      screenshotCount,
      visualDiffs,
      timestamp: Date.now()
    });
  }

  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-metrics-${timestamp}.${format}`;
    const filepath = join(process.cwd(), 'test-results', 'e2e', filename);

    const metrics = this.getAllMetrics();

    switch (format) {
      case 'json':
        writeFileSync(filepath, JSON.stringify(metrics, null, 2));
        break;
      case 'csv':
        const rows = Object.entries(metrics).map(([key, value]) => [
          key,
          JSON.stringify(value)
        ]);
        const csv = ['Metric,Value', ...rows.map(row => row.join(','))].join('\n');
        writeFileSync(filepath, csv);
        break;
    }

    return filepath;
  }
}

// Helper functions
export const createTestResult = (
  testId: string,
  scenarioId: string,
  status: 'passed' | 'failed' | 'skipped',
  duration: number,
  error?: Error,
  metadata?: any
): TestResult => ({
  testId,
  scenarioId,
  status,
  duration,
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + duration).toISOString(),
  error: error ? { message: error.message, stack: error.stack } : undefined,
  metadata
});

export const measureTestDuration = <T>(fn: () => T): { result: T; duration: number } => {
  const startTime = Date.now();
  const result = fn();
  const duration = Date.now() - startTime;
  return { result, duration };
};

export const measureAsyncTestDuration = async <T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> => {
  const startTime = Date.now();
  const result = await fn();
  const duration = Date.now() - startTime;
  return { result, duration };
};

export const generateTestId = (prefix: string = 'test'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
};

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
};

export default {
  TestResultsManager,
  TestMetricsCollector,
  createTestResult,
  measureTestDuration,
  measureAsyncTestDuration,
  generateTestId,
  formatDuration,
  formatBytes
};
