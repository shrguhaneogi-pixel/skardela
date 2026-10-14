import { beforeEach, describe, expect, it } from "vitest";
import {
  clearPuzzleProgress,
  getPuzzleProgressStatus,
  loadPuzzleProgress,
  markPuzzleProgressSolved,
  savePuzzleProgress,
  type PuzzleProgressRecord,
} from "./puzzle-progress";

const sampleRecord: PuzzleProgressRecord = {
  puzzleId: "test-puzzle-0001",
  puzzleType: "colour-binary",
  difficulty: "easy",
  savedAt: Date.now(),
  isSolved: false,
  timeSpentSeconds: 45,
  hintCount: 1,
  mistakes: 0,
  colourBinaryState: {
    squares: ["R", "B", ".", "."],
  },
};

describe("puzzle progress status and retrieval", () => {
  beforeEach(() => {
    localStorage.clear();
    clearPuzzleProgress("test-puzzle-0001");
  });

  it("reports not_started status when no state exists", () => {
    expect(getPuzzleProgressStatus("test-puzzle-0001")).toBe("not_started");
    expect(loadPuzzleProgress("test-puzzle-0001")).toBeNull();
  });

  it("saves and retrieves active in_progress state", () => {
    savePuzzleProgress(sampleRecord);
    expect(getPuzzleProgressStatus("test-puzzle-0001")).toBe("in_progress");

    const loaded = loadPuzzleProgress("test-puzzle-0001");
    expect(loaded?.puzzleId).toBe("test-puzzle-0001");
    expect(loaded?.colourBinaryState?.squares).toEqual(["R", "B", ".", "."]);
  });
});

describe("puzzle progress resolution and clearing", () => {
  beforeEach(() => {
    localStorage.clear();
    clearPuzzleProgress("test-puzzle-0001");
  });

  it("marks a puzzle as solved with completed metrics", () => {
    markPuzzleProgressSolved("test-puzzle-0001", "colour-binary", "easy", {
      timeSpentSeconds: 120,
      hintCount: 2,
      mistakes: 0,
    });

    expect(getPuzzleProgressStatus("test-puzzle-0001")).toBe("solved");
    const loaded = loadPuzzleProgress("test-puzzle-0001");
    expect(loaded?.isSolved).toBe(true);
    expect(loaded?.timeSpentSeconds).toBe(120);
    expect(loaded?.completedAt).toBeDefined();
  });

  it("clears puzzle progress cleanly", () => {
    savePuzzleProgress(sampleRecord);
    clearPuzzleProgress("test-puzzle-0001");
    expect(getPuzzleProgressStatus("test-puzzle-0001")).toBe("not_started");
  });
});
