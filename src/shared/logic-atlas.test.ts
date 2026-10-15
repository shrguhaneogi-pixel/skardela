import { beforeEach, describe, expect, it } from "vitest";
import type { LocalDate } from "../app/daily";
import {
  calculateAtlasStats,
  calculateDailyStreak,
  clearAtlasData,
  isAtlasEnabled,
  loadCurrentAtlasStats,
  setAtlasEnabled,
} from "./logic-atlas";
import {
  clearAllPuzzleProgress,
  savePuzzleProgress,
  type PuzzleProgressRecord,
} from "./puzzle-progress";

// ASD-STE100 Simplified Technical English comments.
// Test suite for the Personal Logic Atlas module.

const refDate: LocalDate = { year: 2026, month: 10, day: 15 };

function makeRecord(
  id: string,
  type: "colour-binary" | "guzzle",
  isSolved: boolean,
  completedTimestamp?: number,
  hints = 0,
  mistakes = 0,
): PuzzleProgressRecord {
  return {
    puzzleId: id,
    puzzleType: type,
    difficulty: "easy",
    savedAt: completedTimestamp ?? Date.UTC(2026, 9, 15, 10, 0, 0),
    isSolved,
    completedAt: completedTimestamp,
    timeSpentSeconds: 60,
    hintCount: hints,
    mistakes,
  };
}

describe("streak calculation engine", () => {
  it("returns zero when no records exist", () => {
    expect(calculateDailyStreak([], refDate)).toBe(0);
  });

  it("returns 1 when puzzle was solved today", () => {
    const todayMs = Date.UTC(2026, 9, 15, 12, 0, 0);
    const records = [makeRecord("cb-1", "colour-binary", true, todayMs)];
    expect(calculateDailyStreak(records, refDate)).toBe(1);
  });

  it("returns 2 when puzzle was solved today and yesterday", () => {
    const todayMs = Date.UTC(2026, 9, 15, 12, 0, 0);
    const yestMs = Date.UTC(2026, 9, 14, 11, 0, 0);
    const records = [
      makeRecord("cb-1", "colour-binary", true, todayMs),
      makeRecord("cb-2", "colour-binary", true, yestMs),
    ];
    expect(calculateDailyStreak(records, refDate)).toBe(2);
  });

  it("handles solve yesterday when today is not yet solved", () => {
    const yestMs = Date.UTC(2026, 9, 14, 11, 0, 0);
    const records = [makeRecord("cb-2", "colour-binary", true, yestMs)];
    expect(calculateDailyStreak(records, refDate)).toBe(1);
  });
});

describe("atlas statistics computation", () => {
  it("accurately aggregates solved counts and clean solves", () => {
    const todayMs = Date.UTC(2026, 9, 15, 12, 0, 0);
    const yestMs = Date.UTC(2026, 9, 14, 11, 0, 0);
    const records = [
      makeRecord("cb-1", "colour-binary", true, todayMs, 0, 0),
      makeRecord("cb-2", "colour-binary", true, yestMs, 2, 1),
      makeRecord("gz-1", "guzzle", true, todayMs, 0, 0),
      makeRecord("cb-3", "colour-binary", false),
    ];

    const stats = calculateAtlasStats(records, true, refDate);
    expect(stats.totalSolved).toBe(3);
    expect(stats.cleanSolves).toBe(2);
    expect(stats.byType["colour-binary"]).toBe(2);
    expect(stats.byType.guzzle).toBe(1);
    expect(stats.skills.length).toBe(4);
    expect(stats.skills.find((s) => s.id === "balance")?.puzzlesCount).toBe(2);
  });

  it("returns zeroed statistics when feature is disabled", () => {
    const todayMs = Date.UTC(2026, 9, 15, 12, 0, 0);
    const records = [makeRecord("cb-1", "colour-binary", true, todayMs, 0, 0)];
    const stats = calculateAtlasStats(records, false, refDate);
    expect(stats.isEnabled).toBe(false);
    expect(stats.totalSolved).toBe(0);
  });
});

describe("atlas settings and data lifecycle", () => {
  beforeEach(() => {
    clearAllPuzzleProgress();
    setAtlasEnabled(true);
  });

  it("persists and reads atlas enabled setting", () => {
    expect(isAtlasEnabled()).toBe(true);
    setAtlasEnabled(false);
    expect(isAtlasEnabled()).toBe(false);
    setAtlasEnabled(true);
    expect(isAtlasEnabled()).toBe(true);
  });

  it("clears data safely from storage adapter", () => {
    savePuzzleProgress(makeRecord("cb-001", "colour-binary", true));
    expect(loadCurrentAtlasStats().totalSolved).toBe(1);
    clearAtlasData();
    expect(loadCurrentAtlasStats().totalSolved).toBe(0);
  });
});
