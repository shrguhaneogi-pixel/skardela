import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearDiagnostics,
  copyDiagnosticsToClipboard,
  createDiagnosticReport,
  getDiagnosticEvents,
  recordDiagnostic,
  sanitizeDetails,
} from "./diagnostics";

describe("diagnostics sanitization and recording", () => {
  beforeEach(() => {
    clearDiagnostics();
  });

  it("redacts sensitive fields like answer and solution", () => {
    const raw = {
      puzzleId: "colour-binary-0001",
      answer: "RRBBRB",
      solution: "BBRRBR",
      nested: { secret: "12345", safeValue: 42 },
    };
    const cleaned = sanitizeDetails(raw);
    expect(cleaned).toEqual({
      puzzleId: "colour-binary-0001",
      answer: "[REDACTED]",
      solution: "[REDACTED]",
      nested: { secret: "[REDACTED]", safeValue: 42 },
    });
  });

  it("bounds the ring buffer to 50 events max", () => {
    for (let i = 0; i < 60; i++) {
      recordDiagnostic("test", `event-${i}`);
    }
    const events = getDiagnosticEvents();
    expect(events.length).toBe(50);
    expect(events[0]?.message).toBe("event-10");
    expect(events[49]?.message).toBe("event-59");
  });
});

describe("diagnostics report generation and clipboard", () => {
  beforeEach(() => {
    clearDiagnostics();
  });

  it("creates a well-formed anonymous diagnostic report", () => {
    recordDiagnostic("game", "start");
    const report = createDiagnosticReport();
    expect(report.appName).toBe("Skardela");
    expect(report.appVersion).toBe("0.0.0");
    expect(report.recentEvents.length).toBe(1);
    expect(report.recentEvents[0]?.message).toBe("start");
  });

  it("handles clipboard failure gracefully when clipboard is missing", async () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    const success = await copyDiagnosticsToClipboard();
    expect(success).toBe(false);
    Object.defineProperty(navigator, "clipboard", { value: originalClipboard, configurable: true });
  });

  it("writes to clipboard successfully when supported", async () => {
    const writeText = vi.fn<() => Promise<void>>().mockResolvedValue();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    const success = await copyDiagnosticsToClipboard();
    expect(success).toBe(true);
    expect(writeText).toHaveBeenCalledTimes(1);
  });
});
