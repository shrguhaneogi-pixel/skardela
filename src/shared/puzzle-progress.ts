import type { Difficulty } from "./difficulty";
import {
  clearStoredNamespace,
  getStoredItem,
  listStoredKeys,
  removeStoredItem,
  setStoredItem,
} from "./storage";

export { calculateCompletionStats, formatDuration, type CompletionStats } from "./completion";

export type PuzzleProgressStatus = "not_started" | "in_progress" | "solved";

export type PuzzleProgressRecord = {
  puzzleId: string;
  puzzleType: string;
  difficulty: Difficulty;
  savedAt: number;
  isSolved: boolean;
  completedAt?: number;
  timeSpentSeconds: number;
  hintCount: number;
  mistakes: number;
  colourBinaryState?: {
    squares: string[];
  };
  guzzleState?: {
    guesses: (
      | {
          letter: string;
          mark: "correct" | "present" | "absent";
        }
      | undefined
    )[];
    mode?: "bank" | "noBank";
  };
};

const STORAGE_PREFIX = "skardela:progress:";
const CURRENT_VERSION = 1;

function makeOptions(puzzleId: string) {
  return {
    key: `${STORAGE_PREFIX}${puzzleId}`,
    version: CURRENT_VERSION,
    defaultValue: null as PuzzleProgressRecord | null,
    validate: (data: unknown): data is PuzzleProgressRecord => {
      if (typeof data !== "object" || data === null) return false;
      const r = data as Partial<PuzzleProgressRecord>;
      return (
        typeof r.puzzleId === "string" &&
        typeof r.puzzleType === "string" &&
        typeof r.isSolved === "boolean"
      );
    },
  };
}

// Load saved progress for a puzzle if present.
export function loadPuzzleProgress(puzzleId: string): PuzzleProgressRecord | null {
  return getStoredItem(makeOptions(puzzleId));
}

// Save or update progress for a puzzle.
export function savePuzzleProgress(record: PuzzleProgressRecord): boolean {
  return setStoredItem(makeOptions(record.puzzleId), {
    ...record,
    savedAt: Date.now(),
  });
}

// Get the current progress status of a puzzle.
export function getPuzzleProgressStatus(puzzleId: string): PuzzleProgressStatus {
  const record = loadPuzzleProgress(puzzleId);
  if (!record) return "not_started";
  if (record.isSolved) return "solved";
  return "in_progress";
}

// Mark a puzzle as solved with metrics.
export function markPuzzleProgressSolved(
  puzzleId: string,
  puzzleType: string,
  difficulty: Difficulty,
  stats: { timeSpentSeconds: number; hintCount: number; mistakes: number },
): boolean {
  const current = loadPuzzleProgress(puzzleId);
  const updated: PuzzleProgressRecord = {
    ...(current ?? {
      puzzleId,
      puzzleType,
      difficulty,
      savedAt: Date.now(),
      isSolved: true,
      timeSpentSeconds: stats.timeSpentSeconds,
      hintCount: stats.hintCount,
      mistakes: stats.mistakes,
    }),
    isSolved: true,
    completedAt: Date.now(),
    timeSpentSeconds: stats.timeSpentSeconds,
    hintCount: stats.hintCount,
    mistakes: stats.mistakes,
  };
  return savePuzzleProgress(updated);
}

// Remove saved progress for one puzzle.
export function clearPuzzleProgress(puzzleId: string): void {
  removeStoredItem(`${STORAGE_PREFIX}${puzzleId}`);
}

// Retrieve all stored puzzle progress records.
export function getAllProgressRecords(): PuzzleProgressRecord[] {
  const keys = listStoredKeys(STORAGE_PREFIX);
  const records: PuzzleProgressRecord[] = [];
  for (const key of keys) {
    const id = key.slice(STORAGE_PREFIX.length);
    const record = loadPuzzleProgress(id);
    if (record) records.push(record);
  }
  return records;
}

// Clear all stored puzzle progress records.
export function clearAllPuzzleProgress(): void {
  clearStoredNamespace(STORAGE_PREFIX);
}
