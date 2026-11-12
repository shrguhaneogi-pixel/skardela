import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dayNumber, puzzlesForDay, utcDate } from "./daily";
import { homeLoader, loadPuzzle, pickRandomPuzzleId } from "./puzzles";
import { puzzleTypes } from "./puzzle-types/registry";
import { saveImportedPack, type PuzzlePack } from "../shared/puzzle-pack";

// ASD-STE100 Simplified Technical English comments.
// This suite tests puzzle loaders, UTC daily alignment, random selection, and custom packs.

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("homeLoader UTC date alignment", () => {
  it("selects daily puzzles using UTC date", async () => {
    // 2026-06-15T23:30:00Z is still 2026-06-15 in UTC.
    const fixed = new Date(Date.UTC(2026, 5, 15, 23, 30, 0));
    vi.useFakeTimers();
    vi.setSystemTime(fixed);

    const cards = await homeLoader();
    const expectedDay = dayNumber(utcDate(fixed));

    const pools = await Promise.all(
      cards.map(async (card) => ({
        card,
        pool: await puzzleTypes[card.type].loadPuzzles(),
      })),
    );
    for (const { card, pool } of pools) {
      expect(card.levels).toEqual(puzzlesForDay(pool, expectedDay));
    }
  });
});

describe("pickRandomPuzzleId", () => {
  it("picks a valid 4-digit puzzle ID and respects excludeId", async () => {
    const first = await pickRandomPuzzleId({ random: () => 0 });
    expect(first).toMatch(/^[a-z]+(?:-[a-z]+)*-\d{4}$/u);

    const second = await pickRandomPuzzleId({ excludeId: String(first), random: () => 0 });
    expect(second).toMatch(/^[a-z]+(?:-[a-z]+)*-\d{4}$/u);
    expect(second).not.toBe(first);
  });
});

describe("loadPuzzle with imported packs", () => {
  it("loads a puzzle from an imported pack by packId or fallback", async () => {
    const pack: PuzzlePack = {
      format: "skardela-pack-v1",
      id: "pack-loader-test",
      title: "Loader Test Pack",
      author: "Tester",
      version: "1.0.0",
      license: "CC-BY-4.0",
      puzzles: [
        {
          id: "colour-binary-9999",
          type: "colour-binary",
          difficulty: "easy",
          author: "Tester",
          license: "CC-BY-4.0",
          start: ["R..R", "R.BR", "..RB", "..R."],
          answer: ["RBBR", "RBBR", "BRRB", "BRRB"],
        },
      ],
    };
    saveImportedPack(pack);

    const byPack = await loadPuzzle("colour-binary-9999", "pack-loader-test");
    expect(byPack?.puzzle.id).toBe("colour-binary-9999");

    const byFallback = await loadPuzzle("colour-binary-9999");
    expect(byFallback?.puzzle.id).toBe("colour-binary-9999");

    const wrongPack = await loadPuzzle("colour-binary-9999", "missing-pack");
    expect(wrongPack).toBeNull();
  });
});
