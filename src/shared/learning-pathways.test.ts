import { describe, it, expect, beforeEach } from "vitest";
import {
  PATHWAYS,
  loadCompletedLessons,
  markLessonCompleted,
  clearLessonProgress,
} from "./learning-pathways";

describe("learning pathways data and progress", () => {
  beforeEach(() => {
    clearLessonProgress();
  });

  it("provides structured pathways with lessons and practice IDs", () => {
    expect(PATHWAYS.length).toBeGreaterThan(0);
    const firstPathway = PATHWAYS[0];
    expect(firstPathway?.lessons.length).toBeGreaterThan(0);

    const firstLesson = firstPathway?.lessons[0];
    expect(firstLesson?.practicePuzzleId).toBeDefined();
    expect(firstLesson?.workedExample.length).toBeGreaterThan(0);
  });

  it("records and persists completed lesson progress locally", () => {
    expect(loadCompletedLessons().size).toBe(0);

    markLessonCompleted("cb-balance");
    const completed = loadCompletedLessons();

    expect(completed.has("cb-balance")).toBe(true);
    expect(completed.size).toBe(1);
  });

  it("clears lesson progress when requested", () => {
    markLessonCompleted("cb-balance");
    clearLessonProgress();

    expect(loadCompletedLessons().size).toBe(0);
  });
});
