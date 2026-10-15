import { describe, expect, it } from "vitest";
import cbExample from "../app/puzzle-types/colour-binary/examples/colour-binary-0000.json";
import guzzleExample from "../app/puzzle-types/guzzle/examples/guzzle-0000.json";
import {
  calibrateColourBinaryDifficulty,
  calibrateGuzzleDifficulty,
} from "./difficulty-calibration";
import type { ColourBinaryPuzzle } from "../app/puzzle-types/colour-binary/puzzle";
import type { GuzzlePuzzle } from "../app/puzzle-types/guzzle/puzzle";

describe("colour-binary difficulty calibration", () => {
  it("calibrates easy 4x4 example puzzle consistently", () => {
    const assessment = calibrateColourBinaryDifficulty(cbExample as unknown as ColourBinaryPuzzle);
    expect(assessment.estimatedDifficulty).toBe("easy");
    expect(assessment.score).toBeGreaterThan(0);
    expect(assessment.score).toBeLessThanOrEqual(50);
    expect(assessment.factors.gridSize).toBe("4x4");
  });

  it("calibrates larger 8x8 puzzle as hard", () => {
    const hardPuzzle: ColourBinaryPuzzle = {
      type: "colour-binary",
      id: "colour-binary-0099",
      difficulty: "hard",
      author: "Test",
      license: "CC-BY-4.0",
      start: [
        "........",
        "........",
        "........",
        "........",
        "........",
        "........",
        "........",
        "........",
      ],
      answer: [
        "RBRBRBRB",
        "BRBRBRBR",
        "RBRBRBRB",
        "BRBRBRBR",
        "RBRBRBRB",
        "BRBRBRBR",
        "RBRBRBRB",
        "BRBRBRBR",
      ],
    };
    const assessment = calibrateColourBinaryDifficulty(hardPuzzle);
    expect(assessment.estimatedDifficulty).toBe("hard");
    expect(assessment.score).toBeGreaterThanOrEqual(75);
  });
});

describe("guzzle difficulty calibration", () => {
  it("calibrates 3x3 guzzle example as easy", () => {
    const assessment = calibrateGuzzleDifficulty(guzzleExample as unknown as GuzzlePuzzle);
    expect(assessment.estimatedDifficulty).toBe("easy");
    expect(assessment.factors.wordLength).toBe(3);
    expect(assessment.score).toBeLessThanOrEqual(50);
  });
});
