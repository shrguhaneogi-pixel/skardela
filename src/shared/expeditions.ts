// Puzzle Seasons and Themed Expeditions.
// Follows ASD-STE100 Simplified Technical English.

import type { Difficulty } from "./difficulty";

export interface ExpeditionStage {
  readonly id: string;
  readonly title: string;
  readonly puzzleId: string;
  readonly puzzleType: "colour-binary" | "guzzle";
  readonly difficulty: Difficulty;
  readonly prerequisiteStageId?: string;
}

export interface ExpeditionChapter {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly season: string;
  readonly stages: readonly ExpeditionStage[];
}

export interface ExpeditionManifest {
  readonly version: string;
  readonly chapters: readonly ExpeditionChapter[];
}

export const DEFAULT_EXPEDITIONS: ExpeditionManifest = {
  version: "1.0.0",
  chapters: [
    {
      id: "binary-odyssey",
      title: "Binary Odyssey: Foundations",
      description: "Learn the core balance and parity rules of Colour Binary step by step.",
      season: "Season 1: Pioneers of Logic",
      stages: [
        {
          id: "bo-1",
          title: "The Balance Principle",
          puzzleId: "colour-binary-0001",
          puzzleType: "colour-binary",
          difficulty: "easy",
        },
        {
          id: "bo-2",
          title: "Trio Avoidance",
          puzzleId: "colour-binary-0002",
          puzzleType: "colour-binary",
          difficulty: "easy",
          prerequisiteStageId: "bo-1",
        },
        {
          id: "bo-3",
          title: "Parity Deduction",
          puzzleId: "colour-binary-0003",
          puzzleType: "colour-binary",
          difficulty: "easy",
          prerequisiteStageId: "bo-2",
        },
      ],
    },
    {
      id: "word-crossing",
      title: "Word Crossing: The Core",
      description: "Master intersecting deduction and positional constraints in Guzzle.",
      season: "Season 1: Pioneers of Logic",
      stages: [
        {
          id: "wc-1",
          title: "Central Intersection",
          puzzleId: "guzzle-0001",
          puzzleType: "guzzle",
          difficulty: "easy",
        },
        {
          id: "wc-2",
          title: "Diagonal Alignment",
          puzzleId: "guzzle-0002",
          puzzleType: "guzzle",
          difficulty: "easy",
          prerequisiteStageId: "wc-1",
        },
        {
          id: "wc-3",
          title: "Lexical Synthesis",
          puzzleId: "guzzle-0003",
          puzzleType: "guzzle",
          difficulty: "easy",
          prerequisiteStageId: "wc-2",
        },
      ],
    },
  ],
};

export type StageState = "locked" | "available" | "completed";

export interface StageStatus {
  readonly stageId: string;
  readonly status: StageState;
}

export interface ChapterProgress {
  readonly chapterId: string;
  readonly completedCount: number;
  readonly totalCount: number;
  readonly percentage: number;
  readonly stages: readonly StageStatus[];
}

function resolveStageState(
  stage: ExpeditionStage,
  solvedPuzzleIds: ReadonlySet<string>,
  completedStageIds: ReadonlySet<string>,
): StageState {
  if (solvedPuzzleIds.has(stage.puzzleId)) {
    return "completed";
  }
  if (!stage.prerequisiteStageId) {
    return "available";
  }
  if (completedStageIds.has(stage.prerequisiteStageId)) {
    return "available";
  }
  return "locked";
}

/**
 * Calculates chapter progress and unlock states based on solved puzzles.
 */
export function getChapterProgress(
  chapter: ExpeditionChapter,
  solvedPuzzleIds: ReadonlySet<string>,
): ChapterProgress {
  const completedStageIds = new Set<string>();
  const stages: StageStatus[] = [];

  for (const stage of chapter.stages) {
    const status = resolveStageState(stage, solvedPuzzleIds, completedStageIds);
    if (status === "completed") {
      completedStageIds.add(stage.id);
    }
    stages.push({ stageId: stage.id, status });
  }

  const completedCount = completedStageIds.size;
  const totalCount = chapter.stages.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    chapterId: chapter.id,
    completedCount,
    totalCount,
    percentage,
    stages,
  };
}
