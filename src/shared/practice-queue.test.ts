import { beforeEach, describe, expect, it } from "vitest";
import { parseDateString } from "../app/daily";
import { loadPuzzle } from "../app/puzzles";
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

  it("recommends unplayed archive puzzles with valid puzzle routes", () => {
    saveTestProgress("colour-binary-easy", "colour-binary", "easy");
    saveTestProgress("colour-binary-medium", "colour-binary", "medium");
    const recs = getPracticeRecommendations(parseDateString("2026-10-14")!, 3);
    expect(recs.length).toBeGreaterThan(0);
    const archiveRec = recs.find((r) => r.isArchive);
    expect(archiveRec).toBeDefined();
    expect(archiveRec?.href).toMatch(/^\/puzzles\/colour-binary-\d{4}\?date=\d{4}-\d{2}-\d{2}$/u);
  });

  it("resolves every recommendation href to an existing 4-digit puzzle", async () => {
    const refDate = parseDateString("2026-10-14")!;
    const warmupRecs = getPracticeRecommendations(refDate, 3);
    expect(warmupRecs.length).toBeGreaterThan(0);

    saveTestProgress("colour-binary-0001", "colour-binary", "easy");
    const progressionRecs = getPracticeRecommendations(refDate, 3);

    const ids = [...warmupRecs, ...progressionRecs].map((rec) => {
      const pathOnly = new URL(rec.href, "http://localhost").pathname;
      return pathOnly.replace(/^\/puzzles\//u, "");
    });
    for (const puzzleId of ids) {
      expect(puzzleId).toMatch(/^[a-z]+(?:-[a-z]+)*-\d{4}$/u);
    }
    const loadedList = await Promise.all(ids.map((id) => loadPuzzle(id)));
    for (const loaded of loadedList) {
      expect(loaded).not.toBeNull();
    }
  });
});

describe("practice-queue custom pack resilience", () => {
  beforeEach(() => {
    localStorage.clear();
    setPracticeQueueEnabled(true);
  });

  it("resolves valid built-in puzzle routes even when progress only has custom pack IDs", async () => {
    const refDate = parseDateString("2026-10-14")!;
    saveTestProgress("colour-binary-9999", "colour-binary", "easy");

    const recs = getPracticeRecommendations(refDate, 3);
    expect(recs.length).toBeGreaterThan(0);

    for (const rec of recs) {
      const id = new URL(rec.href, "http://localhost").pathname.replace(/^\/puzzles\//u, "");
      expect(id).toMatch(/^[a-z]+(?:-[a-z]+)*-\d{4}$/u);
      expect(id).not.toBe("colour-binary-9999");
      // oxlint-disable-next-line no-await-in-loop -- check each resolved recommendation sequentially.
      const loaded = await loadPuzzle(id);
      expect(loaded).not.toBeNull();
    }
  });
});
