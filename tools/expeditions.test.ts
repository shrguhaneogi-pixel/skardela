// Validation test verifying expeditions content manifest integrity.
// Follows ASD-STE100 Simplified Technical English.

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_EXPEDITIONS, type ExpeditionChapter } from "../src/shared/expeditions";

const CB_PATH = path.resolve(process.cwd(), "puzzles/colour-binary.json");
const GUZZLE_PATH = path.resolve(process.cwd(), "puzzles/guzzle.json");

interface RawPuzzle {
  id: string;
}

function loadAllPuzzleIds(): Set<string> {
  const cb = JSON.parse(fs.readFileSync(CB_PATH, "utf8")) as RawPuzzle[];
  const guzzle = JSON.parse(fs.readFileSync(GUZZLE_PATH, "utf8")) as RawPuzzle[];
  const ids = new Set<string>();

  for (const p of cb) ids.add(p.id);
  for (const p of guzzle) ids.add(p.id);
  return ids;
}

function findMissingPuzzleIds(
  chapters: readonly ExpeditionChapter[],
  allIds: Set<string>,
): string[] {
  const missing: string[] = [];
  for (const chapter of chapters) {
    for (const stage of chapter.stages) {
      if (!allIds.has(stage.puzzleId)) {
        missing.push(stage.puzzleId);
      }
    }
  }
  return missing;
}

function findInvalidPrerequisites(chapters: readonly ExpeditionChapter[]): string[] {
  const invalid: string[] = [];
  for (const chapter of chapters) {
    const stageIds = new Set(chapter.stages.map((s) => s.id));
    for (const stage of chapter.stages) {
      const prereq = stage.prerequisiteStageId;
      if (prereq && !stageIds.has(prereq)) {
        invalid.push(`${stage.id} -> ${prereq}`);
      }
    }
  }
  return invalid;
}

describe("expeditions manifest integrity", () => {
  it("verifies every referenced puzzleId exists in puzzle datasets", () => {
    const puzzleIds = loadAllPuzzleIds();
    const missing = findMissingPuzzleIds(DEFAULT_EXPEDITIONS.chapters, puzzleIds);
    expect(missing).toEqual([]);
  });

  it("verifies prerequisites exist within the same chapter", () => {
    const invalid = findInvalidPrerequisites(DEFAULT_EXPEDITIONS.chapters);
    expect(invalid).toEqual([]);
  });
});
