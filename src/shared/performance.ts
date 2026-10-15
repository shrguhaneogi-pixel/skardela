// Performance measurement utilities for Skardela.
// Follows ASD-STE100 Simplified Technical English.

/**
 * Metric data for a component render or task execution.
 */
export interface PerformanceMetric {
  readonly name: string;
  readonly durationMs: number;
  readonly timestamp: number;
}

const metricsBuffer: PerformanceMetric[] = [];
const MAX_METRICS_BUFFER = 50;

/**
 * Records a render or computation duration.
 * Keeps buffer bounded to prevent memory growth.
 */
export function recordPerformanceMetric(name: string, durationMs: number): void {
  const metric: PerformanceMetric = {
    name,
    durationMs: Math.max(0, durationMs),
    timestamp: Date.now(),
  };

  metricsBuffer.push(metric);
  if (metricsBuffer.length > MAX_METRICS_BUFFER) {
    metricsBuffer.shift();
  }
}

/**
 * Returns a copy of recent performance metrics.
 */
export function getRecentPerformanceMetrics(): readonly PerformanceMetric[] {
  return [...metricsBuffer];
}

/**
 * Clears recorded performance metrics.
 */
export function clearPerformanceMetrics(): void {
  metricsBuffer.length = 0;
}
