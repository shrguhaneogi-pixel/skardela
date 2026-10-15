import { dayNumber, formatDateString, utcDate, type LocalDate } from "../app/daily";
import {
  clearAllPuzzleProgress,
  getAllProgressRecords,
  type PuzzleProgressRecord,
} from "./puzzle-progress";
import { getStoredItem, setStoredItem } from "./storage";

// ASD-STE100 Simplified Technical English comments.
// This module computes local logic skill metrics and practice summaries.
// It does not claim to measure general intelligence or cognitive ability.

const ATLAS_ENABLED_KEY = "skardela:atlas:enabled";

const enabledOptions = {
  key: ATLAS_ENABLED_KEY,
  version: 1,
  defaultValue: true,
  validate: (v: unknown): v is boolean => typeof v === "boolean",
};

export type LogicSkillId = "balance" | "triplet" | "intersection" | "elimination";

export type LogicSkill = {
  id: LogicSkillId;
  name: string;
  description: string;
  puzzlesCount: number;
  proficiencyPercent: number;
};

export type LogicAtlasStats = {
  isEnabled: boolean;
  totalSolved: number;
  cleanSolves: number;
  currentStreak: number;
  totalTimeSeconds: number;
  byType: {
    "colour-binary": number;
    guzzle: number;
  };
  skills: LogicSkill[];
};

export function isAtlasEnabled(): boolean {
  return getStoredItem(enabledOptions);
}

export function setAtlasEnabled(enabled: boolean): void {
  setStoredItem(enabledOptions, enabled);
}

export function clearAtlasData(): void {
  clearAllPuzzleProgress();
}

export function calculateDailyStreak(
  records: PuzzleProgressRecord[],
  referenceDate: LocalDate = utcDate(),
): number {
  const solvedDates = new Set<string>();
  for (const record of records) {
    if (record.isSolved) {
      const timestamp = record.completedAt ?? record.savedAt;
      const d = utcDate(new Date(timestamp));
      solvedDates.add(formatDateString(d));
    }
  }

  const todayStr = formatDateString(referenceDate);
  const todayNum = dayNumber(referenceDate);
  let streak = 0;
  let checkDay = solvedDates.has(todayStr) ? todayNum : todayNum - 1;

  while (checkDay >= 0) {
    const timestampMs = Date.UTC(2024, 0, 1) + checkDay * 86_400_000;
    const dateStr = formatDateString(utcDate(new Date(timestampMs)));
    if (solvedDates.has(dateStr)) {
      streak += 1;
      checkDay -= 1;
    } else {
      break;
    }
  }
  return streak;
}

function buildSkills(cbSolved: number, guzzleSolved: number): LogicSkill[] {
  const cbProficiency = Math.min(100, cbSolved * 15);
  const guzzleProficiency = Math.min(100, guzzleSolved * 15);

  return [
    {
      id: "balance",
      name: "Line Balance",
      description: "Ability to balance red and blue squares in rows and columns.",
      puzzlesCount: cbSolved,
      proficiencyPercent: cbProficiency,
    },
    {
      id: "triplet",
      name: "Triplet Avoidance",
      description: "Skill in preventing three consecutive identical squares.",
      puzzlesCount: cbSolved,
      proficiencyPercent: cbProficiency,
    },
    {
      id: "intersection",
      name: "Word Intersection",
      description: "Skill in coordinating crossing letters at shared center square.",
      puzzlesCount: guzzleSolved,
      proficiencyPercent: guzzleProficiency,
    },
    {
      id: "elimination",
      name: "Letter Elimination",
      description: "Skill in ruling out absent candidates using positional feedback.",
      puzzlesCount: guzzleSolved,
      proficiencyPercent: guzzleProficiency,
    },
  ];
}

export function calculateAtlasStats(
  records: PuzzleProgressRecord[],
  enabled: boolean = true,
  refDate: LocalDate = utcDate(),
): LogicAtlasStats {
  if (!enabled) {
    return {
      isEnabled: false,
      totalSolved: 0,
      cleanSolves: 0,
      currentStreak: 0,
      totalTimeSeconds: 0,
      byType: { "colour-binary": 0, guzzle: 0 },
      skills: buildSkills(0, 0),
    };
  }

  let totalSolved = 0;
  let cleanSolves = 0;
  let totalTimeSeconds = 0;
  let cbSolved = 0;
  let guzzleSolved = 0;

  for (const record of records) {
    if (record.isSolved) {
      totalSolved += 1;
      totalTimeSeconds += record.timeSpentSeconds;
      if (record.hintCount === 0 && record.mistakes === 0) {
        cleanSolves += 1;
      }
      if (record.puzzleType === "colour-binary") cbSolved += 1;
      if (record.puzzleType === "guzzle") guzzleSolved += 1;
    }
  }

  return {
    isEnabled: true,
    totalSolved,
    cleanSolves,
    currentStreak: calculateDailyStreak(records, refDate),
    totalTimeSeconds,
    byType: {
      "colour-binary": cbSolved,
      guzzle: guzzleSolved,
    },
    skills: buildSkills(cbSolved, guzzleSolved),
  };
}

export function loadCurrentAtlasStats(refDate: LocalDate = utcDate()): LogicAtlasStats {
  const enabled = isAtlasEnabled();
  if (!enabled) return calculateAtlasStats([], false, refDate);

  const records = getAllProgressRecords();
  return calculateAtlasStats(records, enabled, refDate);
}
