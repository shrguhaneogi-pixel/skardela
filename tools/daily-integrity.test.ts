import { describe, expect, it } from "vitest";
import { dayNumber, puzzlesForDay, utcDate } from "../src/app/daily";
import { puzzleTypes, type PuzzleType } from "../src/app/puzzle-types/registry";
import { levels } from "../src/shared/difficulty";

describe("daily puzzle resolution across full year", () => {
  it("resolves valid puzzles for every difficulty across 365 days", async () => {
    const types = Object.keys(puzzleTypes) as PuzzleType[];
    const puzzlesByType = await Promise.all(
      types.map(async (type) => ({
        type,
        puzzles: await puzzleTypes[type].loadPuzzles(),
      })),
    );

    for (const { puzzles } of puzzlesByType) {
      const availableIds = new Set(puzzles.map((p) => p.id));
      for (let day = 0; day < 365; day++) {
        const scheduled = puzzlesForDay(puzzles, day);
        expect(scheduled.length).toBe(levels.length);
        for (const item of scheduled) {
          expect(levels).toContain(item.difficulty);
          expect(availableIds.has(item.id)).toBe(true);
        }
      }
    }
  });
});

describe("daily calendar date boundaries", () => {
  it("handles leap year boundaries safely without NaN or pool gaps", () => {
    // 2024 is a leap year (Feb 29 exists).
    const leapDay = { year: 2024, month: 2, day: 29 };
    const nextDay = { year: 2024, month: 3, day: 1 };
    const leapDayNum = dayNumber(leapDay);
    const nextDayNum = dayNumber(nextDay);

    expect(Number.isFinite(leapDayNum)).toBe(true);
    expect(Number.isFinite(nextDayNum)).toBe(true);
    expect(nextDayNum - leapDayNum).toBe(1);
  });

  it("maintains consistent UTC date resolution around midnight", () => {
    const justBeforeMidnight = new Date(Date.UTC(2026, 9, 14, 23, 59, 59, 999));
    const justAfterMidnight = new Date(Date.UTC(2026, 9, 15, 0, 0, 0, 1));
    const dateBefore = utcDate(justBeforeMidnight);
    const dateAfter = utcDate(justAfterMidnight);

    expect(dateBefore).toEqual({ year: 2026, month: 10, day: 14 });
    expect(dateAfter).toEqual({ year: 2026, month: 10, day: 15 });
    expect(dayNumber(dateAfter) - dayNumber(dateBefore)).toBe(1);
  });
});
