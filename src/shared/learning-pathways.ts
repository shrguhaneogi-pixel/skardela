// Logic Learning Pathways: Guided lessons for puzzle reasoning.
// Follows ASD-STE100 Simplified Technical English.

import { getStoredItem, setStoredItem } from "./storage";

export interface WorkedExampleStep {
  readonly title: string;
  readonly explanation: string;
  readonly visualCues: readonly string[];
}

export interface Lesson {
  readonly id: string;
  readonly title: string;
  readonly skillId: string;
  readonly concept: string;
  readonly workedExample: readonly WorkedExampleStep[];
  readonly practicePuzzleId: string;
}

export interface Pathway {
  readonly id: string;
  readonly title: string;
  readonly puzzleType: "colour-binary" | "guzzle";
  readonly description: string;
  readonly lessons: readonly Lesson[];
}

export const PATHWAYS: readonly Pathway[] = [
  {
    id: "colour-binary-pathway",
    title: "Colour Binary Reasoning",
    puzzleType: "colour-binary",
    description: "Learn the core deduction patterns for Colour Binary boards.",
    lessons: [
      {
        id: "cb-balance",
        title: "Equal Colour Balance",
        skillId: "balance",
        concept:
          "Each row and column must contain an equal number of red and blue squares. In a 4x4 grid, every line needs exactly 2 red and 2 blue squares.",
        workedExample: [
          {
            title: "Count known squares",
            explanation: "Look at row 1. It contains 2 red squares: [R, ., R, .].",
            visualCues: ["Row 1 has 2 red squares.", "Maximum red count reached."],
          },
          {
            title: "Fill remaining empty squares",
            explanation:
              "Because row 1 already has its quota of 2 red squares, all remaining squares must be blue: [R, B, R, B].",
            visualCues: ["Remaining squares filled with B."],
          },
        ],
        practicePuzzleId: "colour-binary-0001",
      },
      {
        id: "cb-three-in-a-row",
        title: "Avoiding Three in a Row",
        skillId: "threeAvoidance",
        concept:
          "Three squares of the same colour must never be adjacent in any line. Watch for double blocks and sandwich gaps.",
        workedExample: [
          {
            title: "Detect adjacent pair",
            explanation: "Squares at indices 0 and 1 are both blue: [B, B, ., .].",
            visualCues: ["Two blue squares adjacent."],
          },
          {
            title: "Cap the ends",
            explanation:
              "Square 2 cannot be blue because that would make 3 blue squares in a row. Therefore square 2 must be red: [B, B, R, .].",
            visualCues: ["Square 2 set to R."],
          },
        ],
        practicePuzzleId: "colour-binary-0002",
      },
    ],
  },
  {
    id: "guzzle-pathway",
    title: "Guzzle Word Intersections",
    puzzleType: "guzzle",
    description: "Learn how intersecting lines and feedback guide lexical deduction.",
    lessons: [
      {
        id: "guzzle-center",
        title: "The Center Intersection",
        skillId: "intersection",
        concept:
          "The center square belongs to all four intersecting words (across, down, diagonal down, diagonal up). Any letter placed here must satisfy all four words.",
        workedExample: [
          {
            title: "Check candidate letter",
            explanation:
              "If you place 'A' in the center square, all four intersecting words must form valid dictionary words containing 'A' at their midpoint.",
            visualCues: ["Center square shared across 4 words."],
          },
        ],
        practicePuzzleId: "guzzle-0001",
      },
    ],
  },
];

const STORAGE_KEY = "skardela:learn:completed";
const STORAGE_VERSION = 1;

function makeOptions() {
  return {
    key: STORAGE_KEY,
    version: STORAGE_VERSION,
    defaultValue: [] as string[],
    validate: (data: unknown): data is string[] =>
      Array.isArray(data) && data.every((item) => typeof item === "string"),
  };
}

/**
 * Loads completed lesson IDs from local storage.
 */
export function loadCompletedLessons(): Set<string> {
  const list = getStoredItem(makeOptions());
  return new Set(list);
}

/**
 * Marks a lesson as completed in local storage.
 */
export function markLessonCompleted(lessonId: string): void {
  const current = loadCompletedLessons();
  current.add(lessonId);
  setStoredItem(makeOptions(), [...current]);
}

/**
 * Clears completed lesson progress.
 */
export function clearLessonProgress(): void {
  setStoredItem(makeOptions(), []);
}
