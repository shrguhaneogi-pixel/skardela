import { describe, expect, it } from "vitest";
import { calculateCompletionStats, formatDuration } from "./completion";

describe("completion stats module", () => {
  it("formats duration properly across seconds and minutes", () => {
    expect(formatDuration(0)).toBe("0s");
    expect(formatDuration(45)).toBe("45s");
    expect(formatDuration(60)).toBe("1m 00s");
    expect(formatDuration(75)).toBe("1m 15s");
    expect(formatDuration(125)).toBe("2m 05s");
  });

  it("identifies clean solve when zero hints and zero mistakes", () => {
    const stats = calculateCompletionStats({
      puzzleId: "test-1",
      puzzleType: "colour-binary",
      timeSpentSeconds: 60,
      hintCount: 0,
      mistakes: 0,
    });
    expect(stats.isCleanSolve).toBe(true);
  });

  it("flags not clean solve when hints were used", () => {
    const stats = calculateCompletionStats({
      puzzleId: "test-2",
      puzzleType: "colour-binary",
      timeSpentSeconds: 90,
      hintCount: 1,
      mistakes: 0,
    });
    expect(stats.isCleanSolve).toBe(false);
  });

  it("flags not clean solve when mistakes were made", () => {
    const stats = calculateCompletionStats({
      puzzleId: "test-3",
      puzzleType: "guzzle",
      timeSpentSeconds: 80,
      hintCount: 0,
      mistakes: 2,
    });
    expect(stats.isCleanSolve).toBe(false);
  });
});
