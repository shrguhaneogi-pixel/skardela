import type { Difficulty } from "./difficulty";

// ASD-STE100 Simplified Technical English comments.
// Lightweight metadata index for practice recommendations.
// This avoids importing full puzzle JSON files in the main bundle.

export type PracticePuzzleItem = { readonly id: string; readonly difficulty: Difficulty };

function parseItems(
  prefix: string,
  items: readonly (readonly [number, number, Difficulty])[],
): PracticePuzzleItem[] {
  return items.flatMap(([start, end, difficulty]) => {
    const list: PracticePuzzleItem[] = [];
    for (let i = start; i <= end; i++) {
      list.push({ id: `${prefix}-${String(i).padStart(4, "0")}`, difficulty });
    }
    return list;
  });
}

export const practicePuzzlePools: Record<
  "colour-binary" | "guzzle",
  readonly PracticePuzzleItem[]
> = {
  "colour-binary": parseItems("colour-binary", [
    [1, 10, "easy"],
    [11, 20, "medium"],
    [21, 30, "hard"],
    [31, 40, "easy"],
    [41, 50, "medium"],
    [51, 60, "hard"],
  ]),
  guzzle: parseItems("guzzle", [
    [1, 5, "easy"],
    [6, 10, "medium"],
    [11, 15, "hard"],
    [16, 20, "easy"],
    [21, 25, "medium"],
    [26, 30, "hard"],
  ]),
};
