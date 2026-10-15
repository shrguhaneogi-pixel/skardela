import { beforeEach, describe, expect, it } from "vitest";
import { parseDateString } from "../app/daily";
import type { Difficulty } from "./difficulty";
import {
  getPracticeRecommendations,
  isPracticeQueueEnabled,
  setPracticeQueueEnabled,
} from "./practice-queue";
import { savePuzzleProgress } from "./puzzle-progress";

function saveTestProgress(puzzleId: string, puzzleType: string, difficulty: Difficulty) {
  savePuzzleProgress({
    puzzleId,
    puzzleType,
    difficulty,
    isSolved: true,
    savedAt: Date.now(),
    timeSpentSeconds: 60,
    hintCount: 0,
    mistakes: 0,
  });
}

describe("practice-queue basics", () => {
  beforeEach(() => {
    localStorage.clear();
    setPracticeQueueEnabled(true);
  });

  it("returns warmup recommendations when history is empty", () => {
    const recommendations = getPracticeRecommendations(parseDateString("2026-10-14")!, 2);
    expect(recommendations).toHaveLength(2);
    expect(recommendations[0]?.type).toBe("colour-binary");
    expect(recommendations[0]?.difficulty).toBe("easy");
    expect(recommendations[1]?.type).toBe("guzzle");
    expect(recommendations[1]?.difficulty).toBe("easy");
  });

  it("returns empty array when queue is disabled", () => {
    setPracticeQueueEnabled(false);
    expect(isPracticeQueueEnabled()).toBe(false);
    const recommendations = getPracticeRecommendations(parseDateString("2026-10-14")!);
    expect(recommendations).toEqual([]);
  });
});

describe("practice-queue progressions", () => {
  beforeEach(() => {
    localStorage.clear();
    setPracticeQueueEnabled(true);
  });

  it("recommends next difficulty level when a level is completed", () => {
    saveTestProgress("colour-binary-easy", "colour-binary", "easy");
    const recs = getPracticeRecommendations(parseDateString("2026-10-14")!, 3);
    const progression = recs.find((r) => r.id === "progression-colour-binary-medium");
    expect(progression).toBeDefined();
    expect(progression?.difficulty).toBe("medium");
    expect(progression?.title).toContain("Medium");
    expect(progression?.reason).toContain("Easy");
  });

  it("recommends unplayed archive puzzles", () => {
    saveTestProgress("colour-binary-easy", "colour-binary", "easy");
    saveTestProgress("colour-binary-medium", "colour-binary", "medium");
    const recs = getPracticeRecommendations(parseDateString("2026-10-14")!, 3);
    expect(recs.length).toBeGreaterThan(0);
    const archiveRec = recs.find((r) => r.isArchive);
    expect(archiveRec).toBeDefined();
    expect(archiveRec?.href).toContain("/archive/");
  });
});
