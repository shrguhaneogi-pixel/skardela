import { describe, it, expect } from "vitest";
import { DEFAULT_EXPEDITIONS, getChapterProgress, type ExpeditionChapter } from "./expeditions";

describe("expedition progression logic", () => {
  const chapter: ExpeditionChapter = DEFAULT_EXPEDITIONS.chapters[0]!;

  it("calculates initial state when no puzzles are solved", () => {
    const solved = new Set<string>();
    const progress = getChapterProgress(chapter, solved);

    expect(progress.completedCount).toBe(0);
    expect(progress.percentage).toBe(0);
    expect(progress.stages[0]?.status).toBe("available");
    expect(progress.stages[1]?.status).toBe("locked");
    expect(progress.stages[2]?.status).toBe("locked");
  });

  it("unlocks next stage when prerequisite puzzle is solved", () => {
    const solved = new Set<string>(["colour-binary-0001"]);
    const progress = getChapterProgress(chapter, solved);

    expect(progress.completedCount).toBe(1);
    expect(progress.stages[0]?.status).toBe("completed");
    expect(progress.stages[1]?.status).toBe("available");
    expect(progress.stages[2]?.status).toBe("locked");
  });

  it("calculates full completion when all stages are solved", () => {
    const solved = new Set<string>([
      "colour-binary-0001",
      "colour-binary-0002",
      "colour-binary-0003",
    ]);
    const progress = getChapterProgress(chapter, solved);

    expect(progress.completedCount).toBe(3);
    expect(progress.percentage).toBe(100);
    expect(progress.stages.every((s) => s.status === "completed")).toBe(true);
  });
});
