import { describe, expect, it } from "vitest";
import cbExample from "../app/puzzle-types/colour-binary/examples/colour-binary-0000.json";
import { toSquares as toCbSquares } from "../app/puzzle-types/colour-binary/puzzle";
import gzExample from "../app/puzzle-types/guzzle/examples/guzzle-0000.json";
import { explainColourBinaryLogic, explainGuzzleLogic } from "./logic-explainer";

describe("logic-explainer engine", () => {
  it("generates structured explanation for colour binary balance", () => {
    const squares = toCbSquares(cbExample.start);
    const result = explainColourBinaryLogic(squares, cbExample.start.length);
    expect(result).toBeDefined();

    expect(result?.targetIndex).toBe(1);
    expect(result?.targetRow).toBe(1);
    expect(result?.targetColumn).toBe(2);
    expect(result?.premises.length).toBeGreaterThanOrEqual(1);
    expect(result?.deductionSteps.length).toBe(4);
    expect(result?.deductionSteps[3]).toContain("must be blue");
  });

  it("generates structured explanation for three-in-a-row", () => {
    const board = toCbSquares(["RR....", "......", "......", "......", "......", "......"]);
    const result = explainColourBinaryLogic(board, 6);
    expect(result).toBeDefined();

    expect(result?.targetIndex).toBe(2);
    expect(result?.ruleName).toContain("three in a row");
    expect(result?.deductionSteps[0]).toContain("Three adjacent");
  });

  it("returns undefined for completed board", () => {
    const solved = toCbSquares(cbExample.answer);
    const result = explainColourBinaryLogic(solved, cbExample.answer.length);
    expect(result).toBeUndefined();
  });

  it("generates structured explanation for guzzle word square", () => {
    const answer = gzExample.answer;
    const guesses = {};
    const result = explainGuzzleLogic(answer, guesses, 3, null);
    expect(result).toBeDefined();

    expect(result?.targetIndex).toBe(0);
    expect(result?.deductionSteps.length).toBe(3);
    expect(result?.ruleName).toContain("Word intersection");
  });
});
