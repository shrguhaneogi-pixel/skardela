import { describe, it, expect } from "vitest";
import { encodeDuelResult, decodeDuelResult, compareDuelResults, type DuelResult } from "./duel";

const mockResult: DuelResult = {
  puzzleId: "colour-binary-0001",
  timeSeconds: 95,
  hints: 0,
  mistakes: 1,
  cleanSolve: false,
  date: "2026-10-15",
};

describe("duel encoding and decoding", () => {
  it("encodes and decodes a valid result round-trip", () => {
    const code = encodeDuelResult(mockResult);
    expect(code).toBeDefined();

    const decoded = decodeDuelResult(code);
    expect(decoded).toEqual(mockResult);
  });

  it("handles clean solve flag correctly", () => {
    const cleanResult: DuelResult = {
      ...mockResult,
      cleanSolve: true,
      hints: 0,
      mistakes: 0,
    };
    const code = encodeDuelResult(cleanResult);
    const decoded = decodeDuelResult(code);
    expect(decoded?.cleanSolve).toBe(true);
  });

  it("returns null for malformed or corrupted codes", () => {
    expect(decodeDuelResult("not-a-valid-base64")).toBeNull();
    expect(decodeDuelResult("")).toBeNull();
    expect(decodeDuelResult(btoa("too|few|parts"))).toBeNull();
  });
});

describe("duel result comparison", () => {
  it("determines player as overall winner when winning more categories", () => {
    const opponentResult: DuelResult = {
      puzzleId: "colour-binary-0001",
      timeSeconds: 150,
      hints: 2,
      mistakes: 2,
      cleanSolve: false,
      date: "2026-10-15",
    };

    const comparison = compareDuelResults(mockResult, opponentResult);
    expect(comparison.overallWinner).toBe("player");
    expect(comparison.timeComparison.winner).toBe("player");
    expect(comparison.hintsComparison.winner).toBe("player");
    expect(comparison.mistakesComparison.winner).toBe("player");
  });

  it("determines tie when metrics balance equally", () => {
    const opponentResult: DuelResult = {
      ...mockResult,
    };

    const comparison = compareDuelResults(mockResult, opponentResult);
    expect(comparison.overallWinner).toBe("tie");
  });
});
