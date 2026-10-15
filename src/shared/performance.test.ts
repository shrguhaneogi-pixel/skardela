import { describe, it, expect, beforeEach } from "vitest";
import {
  recordPerformanceMetric,
  getRecentPerformanceMetrics,
  clearPerformanceMetrics,
} from "./performance";

describe("performance metrics", () => {
  beforeEach(() => {
    clearPerformanceMetrics();
  });

  it("records and retrieves a metric", () => {
    recordPerformanceMetric("RenderGrid", 4.2);
    const metrics = getRecentPerformanceMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0]?.name).toBe("RenderGrid");
    expect(metrics[0]?.durationMs).toBe(4.2);
  });

  it("clamps negative durations to zero", () => {
    recordPerformanceMetric("NegativeCheck", -5);
    const metrics = getRecentPerformanceMetrics();
    expect(metrics[0]?.durationMs).toBe(0);
  });

  it("bounds buffer length to maximum limit", () => {
    for (let i = 0; i < 60; i += 1) {
      recordPerformanceMetric(`Metric-${i}`, 1);
    }
    const metrics = getRecentPerformanceMetrics();
    expect(metrics.length).toBeLessThanOrEqual(50);
  });

  it("clears recorded metrics", () => {
    recordPerformanceMetric("Temporary", 10);
    clearPerformanceMetrics();
    expect(getRecentPerformanceMetrics()).toHaveLength(0);
  });
});
