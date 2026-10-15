import { describe, expect, it } from "vitest";
import cbExample from "../app/puzzle-types/colour-binary/examples/colour-binary-0000.json";
import guzzleExample from "../app/puzzle-types/guzzle/examples/guzzle-0000.json";
import {
  validateColourBinaryPuzzle,
  validateGuzzlePuzzle,
  validatePuzzle,
} from "./puzzle-validator";
import type { ColourBinaryPuzzle } from "../app/puzzle-types/colour-binary/puzzle";
import type { GuzzlePuzzle } from "../app/puzzle-types/guzzle/puzzle";

describe("colour-binary puzzle validation", () => {
  it("validates valid colour binary puzzle example successfully", () => {
    const res = validateColourBinaryPuzzle(cbExample as unknown as ColourBinaryPuzzle);
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual([]);
  });

  it("detects when start board has multiple solutions", () => {
    // An empty 4x4 start board has multiple solutions.
    const ambiguousPuzzle = {
      ...(cbExample as unknown as ColourBinaryPuzzle),
      start: ["....", "....", "....", "...."],
    };
    const res = validateColourBinaryPuzzle(ambiguousPuzzle);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes("must have exactly 1 solution"))).toBe(true);
  });

  it("detects mismatch between start square and answer square", () => {
    // Test square mismatch with answer.
    const mismatch = {
      ...(cbExample as unknown as ColourBinaryPuzzle),
      start: ["B...", "....", "....", "...."],
      answer: ["RBRB", "BRBR", "RBRB", "BRBR"],
    };
    const res = validateColourBinaryPuzzle(mismatch);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes("does not match answer square"))).toBe(true);
  });
});

describe("guzzle puzzle validation", () => {
  it("validates valid guzzle puzzle example successfully", () => {
    const res = validateGuzzlePuzzle(guzzleExample as unknown as GuzzlePuzzle);
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual([]);
  });

  it("detects invalid non-letter characters on words", () => {
    const broken = {
      ...(guzzleExample as unknown as GuzzlePuzzle),
      answer: ["1.C", ".A.", "T.O"],
    };
    const res = validateGuzzlePuzzle(broken);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes("must be uppercase A-Z"))).toBe(true);
  });

  it("rejects non-object or unknown types in universal validator", () => {
    expect(validatePuzzle(null).valid).toBe(false);
    expect(validatePuzzle({ type: "sudoku" }).valid).toBe(false);
  });
});
