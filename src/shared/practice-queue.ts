import colourBinaryPuzzles from "../../puzzles/colour-binary.json";
import guzzlePuzzles from "../../puzzles/guzzle.json";
import { getRecentArchiveDates } from "../app/archive";
import { dayNumber, formatDateString, puzzlesForDay, utcDate, type LocalDate } from "../app/daily";
import type { Difficulty } from "./difficulty";
import {
  getAllProgressRecords,
  getPuzzleProgressStatus,
  type PuzzleProgressRecord,
} from "./puzzle-progress";
import { getStoredItem, setStoredItem } from "./storage";
import { text } from "../text/en";

// ASD-STE100 Simplified Technical English comments.
// This module provides deterministic, local practice recommendations.
// It does not use remote AI or send data to external servers.

const QUEUE_ENABLED_KEY = "skardela:practice-queue:enabled";

const queueEnabledOptions = {
  key: QUEUE_ENABLED_KEY,
  version: 1,
  defaultValue: true,
  validate: (v: unknown): v is boolean => typeof v === "boolean",
};

const puzzlePools: Record<
  "colour-binary" | "guzzle",
  readonly { id: string; difficulty: Difficulty }[]
> = {
  "colour-binary": colourBinaryPuzzles as readonly { id: string; difficulty: Difficulty }[],
  guzzle: guzzlePuzzles as readonly { id: string; difficulty: Difficulty }[],
};

// Resolve a valid 4-digit puzzle ID for the given type, difficulty, and UTC date.
function resolvePuzzleId(
  type: "colour-binary" | "guzzle",
  difficulty: Difficulty,
  date: LocalDate,
): string {
  const forDay = puzzlesForDay(puzzlePools[type], dayNumber(date));
  const match = forDay.find((item) => item.difficulty === difficulty);
  if (match) return match.id;
  const fallback = puzzlePools[type].find((item) => item.difficulty === difficulty);
  return fallback?.id ?? `${type}-0001`;
}

export type PracticeRecommendation = {
  id: string;
  type: "colour-binary" | "guzzle";
  difficulty: "easy" | "medium" | "hard";
  title: string;
  reason: string;
  href: string;
  isArchive: boolean;
  dateString?: string;
};

export function isPracticeQueueEnabled(): boolean {
  return getStoredItem(queueEnabledOptions);
}

export function setPracticeQueueEnabled(enabled: boolean): void {
  setStoredItem(queueEnabledOptions, enabled);
}

function getWarmupRecommendations(
  limit: number,
  referenceDate: LocalDate,
): PracticeRecommendation[] {
  const binaryName = text["colour-binary"].name;
  const guzzleName = text.guzzle.name;
  const binaryId = resolvePuzzleId("colour-binary", "easy", referenceDate);
  const guzzleId = resolvePuzzleId("guzzle", "easy", referenceDate);
  const warmups: PracticeRecommendation[] = [
    {
      id: "warmup-binary-easy",
      type: "colour-binary",
      difficulty: "easy",
      title: `${binaryName} — ${text.levels.easy}`,
      reason: text.practiceQueue.emptyWarmupReason(binaryName),
      href: `/puzzles/${binaryId}`,
      isArchive: false,
    },
    {
      id: "warmup-guzzle-easy",
      type: "guzzle",
      difficulty: "easy",
      title: `${guzzleName} — ${text.levels.easy}`,
      reason: text.practiceQueue.emptyWarmupReason(guzzleName),
      href: `/puzzles/${guzzleId}`,
      isArchive: false,
    },
  ];
  return warmups.slice(0, limit);
}

const progressions: Array<{
  type: "colour-binary" | "guzzle";
  completedDiff: "easy" | "medium";
  nextDiff: "medium" | "hard";
}> = [
  { type: "colour-binary", completedDiff: "easy", nextDiff: "medium" },
  { type: "colour-binary", completedDiff: "medium", nextDiff: "hard" },
  { type: "guzzle", completedDiff: "easy", nextDiff: "medium" },
  { type: "guzzle", completedDiff: "medium", nextDiff: "hard" },
];

function getProgressionRecommendations(
  records: PuzzleProgressRecord[],
  referenceDate: LocalDate,
): PracticeRecommendation[] {
  const results: PracticeRecommendation[] = [];
  const solvedIds = new Set(records.filter((r) => r.isSolved).map((r) => r.puzzleId));

  for (const prog of progressions) {
    const isCompleted = records.some(
      (r) =>
        r.isSolved &&
        (r.puzzleType === prog.type || r.puzzleId.includes(prog.type)) &&
        (r.difficulty === prog.completedDiff || r.puzzleId.includes(prog.completedDiff)),
    );
    const isNextDone = records.some(
      (r) =>
        r.isSolved &&
        (r.puzzleType === prog.type || r.puzzleId.includes(prog.type)) &&
        (r.difficulty === prog.nextDiff || r.puzzleId.includes(prog.nextDiff)),
    );

    if (isCompleted && !isNextDone) {
      const typeName = text[prog.type].name;
      const dailyId = resolvePuzzleId(prog.type, prog.nextDiff, referenceDate);
      const nextId = solvedIds.has(dailyId)
        ? (puzzlePools[prog.type].find(
            (item) => item.difficulty === prog.nextDiff && !solvedIds.has(item.id),
          )?.id ?? dailyId)
        : dailyId;

      results.push({
        id: `progression-${prog.type}-${prog.nextDiff}`,
        type: prog.type,
        difficulty: prog.nextDiff,
        title: `${typeName} — ${text.levels[prog.nextDiff]}`,
        reason: text.practiceQueue.nextLevelReason(typeName, text.levels[prog.completedDiff]),
        href: `/puzzles/${nextId}`,
        isArchive: false,
      });
    }
  }
  return results;
}

function getArchiveRecommendations(
  referenceDate: LocalDate,
  todayStr: string,
  limit: number,
): PracticeRecommendation[] {
  const results: PracticeRecommendation[] = [];
  const recentDates = getRecentArchiveDates(5, referenceDate);
  for (const date of recentDates) {
    const dateStr = formatDateString(date);
    if (dateStr === todayStr) continue;

    const archiveBinaryId = resolvePuzzleId("colour-binary", "easy", date);
    if (getPuzzleProgressStatus(archiveBinaryId) === "not_started") {
      results.push({
        id: `rec-archive-${dateStr}-${archiveBinaryId}`,
        type: "colour-binary",
        difficulty: "easy",
        title: `${text["colour-binary"].name} (${dateStr})`,
        reason: text.practiceQueue.archivePracticeReason(text["colour-binary"].name, dateStr),
        href: `/puzzles/${archiveBinaryId}?date=${dateStr}`,
        isArchive: true,
        dateString: dateStr,
      });
    }

    if (results.length >= limit) break;
  }
  return results;
}

// Generate explainable practice recommendations from local progress records.
export function getPracticeRecommendations(
  referenceDate: LocalDate = utcDate(),
  limit: number = 3,
): PracticeRecommendation[] {
  if (!isPracticeQueueEnabled()) return [];

  const records = getAllProgressRecords();
  if (records.length === 0) {
    return getWarmupRecommendations(limit, referenceDate);
  }

  const todayStr = formatDateString(referenceDate);
  const recommendations = [
    ...getProgressionRecommendations(records, referenceDate),
    ...getArchiveRecommendations(referenceDate, todayStr, limit),
  ];

  if (recommendations.length === 0) {
    const masteryId = resolvePuzzleId("colour-binary", "medium", referenceDate);
    recommendations.push({
      id: "review-binary-medium",
      type: "colour-binary",
      difficulty: "medium",
      title: `${text["colour-binary"].name} — ${text.levels.medium}`,
      reason: text.practiceQueue.masteryReason(text["colour-binary"].name),
      href: `/puzzles/${masteryId}`,
      isArchive: false,
    });
  }

  return recommendations.slice(0, limit);
}
