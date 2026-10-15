import { describe, expect, it } from "vitest";
import { toSquares } from "../app/puzzle-types/colour-binary/puzzle";
import { AdviceTracker, findBoardConflicts } from "./context-aware-help";

describe("context-aware-help engine", () => {
  it("detects half-balance violation when row exceeds capacity", () => {
    // 4x4 board where row 1 has 3 Red squares not adjacent (max allowed is 2)
    const board = toSquares(["RR.R", "....", "....", "...."]);
    const conflict = findBoardConflicts(board, 4);
    expect(conflict).toBeDefined();

    expect(conflict?.type).toBe("exceeds-half");
    expect(conflict?.line).toBe("row");
    expect(conflict?.lineNumber).toBe(1);
    expect(conflict?.message).toContain("Row 1 has 3 red squares");
  });

  it("detects three-in-a-row violation in column", () => {
    // 4x4 board where column 1 has 3 Blue squares in rows 1, 2, 3
    const board = toSquares(["B...", "B...", "B...", "...."]);
    const conflict = findBoardConflicts(board, 4);
    expect(conflict).toBeDefined();

    expect(conflict?.type).toBe("three-in-a-row");
    expect(conflict?.line).toBe("column");
    expect(conflict?.lineNumber).toBe(1);
    expect(conflict?.indices).toEqual([0, 4, 8]);
  });

  it("returns null when no rule conflicts exist", () => {
    const board = toSquares(["RB..", "BR..", "....", "...."]);
    const conflict = findBoardConflicts(board, 4);
    expect(conflict).toBeNull();
  });

  it("tracks advice to avoid repeating the same message", () => {
    const tracker = new AdviceTracker();
    expect(tracker.shouldGiveAdvice("hint-1")).toBe(true);
    expect(tracker.shouldGiveAdvice("hint-1")).toBe(false);
    expect(tracker.shouldGiveAdvice("hint-2")).toBe(true);

    tracker.reset();
    expect(tracker.shouldGiveAdvice("hint-1")).toBe(true);
  });
});
