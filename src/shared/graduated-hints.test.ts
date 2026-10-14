import { describe, expect, it } from "vitest";
import cbExample from "../app/puzzle-types/colour-binary/examples/colour-binary-0000.json";
import { toSquares as toCbSquares } from "../app/puzzle-types/colour-binary/puzzle";
import gzExample from "../app/puzzle-types/guzzle/examples/guzzle-0000.json";
import {
  advanceTier,
  createColourBinaryHint,
  createGuzzleHint,
  getHintTierText,
} from "./graduated-hints";

describe("graduated-hints engine", () => {
  it("advances tiers correctly from nudge to explanation to solution", () => {
    expect(advanceTier("nudge")).toBe("explanation");
    expect(advanceTier("explanation")).toBe("solution");
    expect(advanceTier("solution")).toBe("solution");
  });

  it("builds a graduated hint for colour binary starting at nudge", () => {
    const squares = toCbSquares(cbExample.start);
    const hint = createColourBinaryHint(squares, cbExample.start.length, "nudge");
    expect(hint).toBeDefined();

    expect(hint?.tier).toBe("nudge");
    expect(hint?.index).toBe(1);
    expect(hint?.highlightIndices.length).toBe(cbExample.start.length);
    expect(getHintTierText(hint!, "nudge")).toContain("Row 1, column 2: Column 2");
    expect(getHintTierText(hint!, "explanation")).toContain("already has half");
    expect(getHintTierText(hint!, "solution")).toContain("Thus this square is blue.");
  });

  it("returns undefined for solved colour binary puzzle", () => {
    const solved = toCbSquares(cbExample.answer);
    const hint = createColourBinaryHint(solved, cbExample.answer.length);
    expect(hint).toBeUndefined();
  });

  it("builds a graduated hint for guzzle starting at nudge", () => {
    const answer = gzExample.answer;
    const guesses = {};
    const hint = createGuzzleHint(answer, guesses, 3, null, "nudge");
    expect(hint).toBeDefined();

    expect(hint?.tier).toBe("nudge");
    expect(getHintTierText(hint!, "nudge")).toContain("Row 1, column 1:");
    expect(getHintTierText(hint!, "explanation")).toContain("crossing words");
    expect(getHintTierText(hint!, "solution")).toContain("Place letter");
  });
});
