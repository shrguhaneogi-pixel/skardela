import { levels, type Difficulty } from "../shared/difficulty";

export type LocalDate = { year: number; month: number; day: number };

// This keeps the date in a simple structure that is easy to compare and reuse.
// It avoids time-zone issues when a user opens the app in a local browser.
export function localDate(now: Date): LocalDate {
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

// Official Skardela daily challenges use UTC to keep puzzle rotation identical everywhere.
export function utcDate(now: Date = new Date()): LocalDate {
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1, day: now.getUTCDate() };
}

// Convert a date into standard YYYY-MM-DD string.
export function formatDateString(date: LocalDate): string {
  const y = String(date.year).padStart(4, "0");
  const m = String(date.month).padStart(2, "0");
  const d = String(date.day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Parse YYYY-MM-DD string safely into a LocalDate.
export function parseDateString(value: string): LocalDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

// The day number gives each date a stable index from a fixed origin date.
// This makes it easy to select a repeatable puzzle set for each day.
export function dayNumber(date: LocalDate): number {
  return Math.round(
    (Date.UTC(date.year, date.month - 1, date.day) - Date.UTC(2024, 0, 1)) / 86_400_000,
  );
}

// Each difficulty level gets one puzzle for the current day.
// The chosen puzzle is based on the day number and the pool of puzzles for that level.
export function puzzlesForDay(
  puzzles: readonly { id: string; difficulty: Difficulty }[],
  day: number,
): { id: string; difficulty: Difficulty }[] {
  return levels.flatMap((difficulty) => {
    const pool = puzzles
      .filter((puzzle) => puzzle.difficulty === difficulty)
      .map((puzzle) => puzzle.id)
      .toSorted();
    const id = pool[((day % pool.length) + pool.length) % pool.length];
    return id === undefined ? [] : [{ id, difficulty }];
  });
}

// Fast 32-bit FNV-1a hash for deterministic challenge verification.
// Note: This is an ordinary integrity check, not a cryptographic signature.
export function computeChallengeChecksum(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.codePointAt(i) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

// Build a canonical, spoiler-free challenge identifier for official challenges.
export function createDailyChallengeId(
  date: LocalDate,
  type: string,
  difficulty: Difficulty,
  puzzleId: string,
): { canonicalId: string; verificationCode: string } {
  const dateStr = formatDateString(date);
  const canonicalId = `SKD:${dateStr}:${type}:${difficulty}:${puzzleId}`;
  const verificationCode = computeChallengeChecksum(canonicalId);
  return { canonicalId, verificationCode };
}

// Verify that a challenge ID matches its claimed verification code.
export function verifyChallengeIdentity(canonicalId: string, verificationCode: string): boolean {
  return computeChallengeChecksum(canonicalId) === verificationCode;
}
