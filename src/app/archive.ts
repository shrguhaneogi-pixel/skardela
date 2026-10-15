import {
  dayNumber,
  formatDateString,
  parseDateString,
  puzzlesForDay,
  utcDate,
  type LocalDate,
} from "./daily";
import { puzzleTypes, type PuzzleType } from "./puzzle-types/registry";
import type { Difficulty } from "../shared/difficulty";

// ASD-STE100 Simplified Technical English comments.
// This module provides deterministic date calculation and puzzle loading for the archive.

export type ArchiveLevelItem = {
  id: string;
  difficulty: Difficulty;
};

export type ArchiveTypeGroup = {
  type: PuzzleType;
  levels: ArchiveLevelItem[];
};

export type ArchiveDayData = {
  date: LocalDate;
  dateString: string;
  isToday: boolean;
  types: ArchiveTypeGroup[];
};

// Return the earliest and latest valid archive dates in YYYY-MM-DD format.
export function getArchiveDateRange(referenceDate: LocalDate = utcDate()): {
  minDate: string;
  maxDate: string;
} {
  return {
    minDate: "2024-01-01",
    maxDate: formatDateString(referenceDate),
  };
}

// Check if a date is in the future compared to the reference date.
export function isDateInFuture(date: LocalDate, referenceDate: LocalDate = utcDate()): boolean {
  return dayNumber(date) > dayNumber(referenceDate);
}

// Generate a list of recent archive dates going backwards from reference date.
export function getRecentArchiveDates(
  count: number = 14,
  referenceDate: LocalDate = utcDate(),
): LocalDate[] {
  const dates: LocalDate[] = [];
  const startDay = dayNumber(referenceDate);
  for (let offset = 0; offset < count; offset++) {
    const day = startDay - offset;
    if (day < 0) break;
    const timestampMs = Date.UTC(2024, 0, 1) + day * 86_400_000;
    dates.push(utcDate(new Date(timestampMs)));
  }
  return dates;
}

// Load daily puzzles for a specific date string, or fall back to today.
export async function loadArchiveDay(
  dateString?: string | null,
  referenceDate: LocalDate = utcDate(),
): Promise<ArchiveDayData> {
  const parsed = dateString ? parseDateString(dateString) : null;
  const targetDate = !parsed || isDateInFuture(parsed, referenceDate) ? referenceDate : parsed;

  const day = dayNumber(targetDate);
  const types = await Promise.all(
    (Object.keys(puzzleTypes) as PuzzleType[]).map(async (type) => ({
      type,
      levels: puzzlesForDay(await puzzleTypes[type].loadPuzzles(), day),
    })),
  );

  return {
    date: targetDate,
    dateString: formatDateString(targetDate),
    isToday: dayNumber(targetDate) === dayNumber(referenceDate),
    types,
  };
}
