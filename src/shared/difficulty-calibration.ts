import type { Difficulty } from "./difficulty";
import type { ColourBinaryPuzzle } from "../app/puzzle-types/colour-binary/puzzle";
import type { GuzzlePuzzle } from "../app/puzzle-types/guzzle/puzzle";
import { findHint } from "../app/puzzle-types/colour-binary/hint";
import { toSquares as cbToSquares } from "../app/puzzle-types/colour-binary/puzzle";
import { toSquares as guzzleToSquares } from "../app/puzzle-types/guzzle/puzzle";

export type DifficultyAssessment = {
  // Score ranges from 0 (very gentle) to 100 (maximum complexity).
  score: number;
  estimatedDifficulty: Difficulty;
  factors: Record<string, number | string>;
  explanation: string;
};

// Calibrate difficulty for a Colour Binary puzzle based on size, clue density, and initial deduction paths.
export function calibrateColourBinaryDifficulty(puzzle: ColourBinaryPuzzle): DifficultyAssessment {
  const size = puzzle.start.length;
  const totalSquares = size * size;
  const startSquares = cbToSquares(puzzle.start);

  const filledClues = startSquares.filter((sq) => sq !== ".").length;
  const clueDensityPercent = Math.round((filledClues / totalSquares) * 100);

  // Check if an immediate deduction is available from the start position.
  const initialHint = findHint(startSquares);
  const hasDirectStartHint = initialHint !== undefined;

  // Base difficulty primarily determined by grid dimension, modified by clue density.
  let score: number;
  let estimatedDifficulty: Difficulty;

  if (size <= 4) {
    score = Math.max(15, 45 - clueDensityPercent);
    estimatedDifficulty = "easy";
  } else if (size <= 6) {
    score = Math.max(45, 75 - Math.round(clueDensityPercent / 2));
    estimatedDifficulty = "medium";
  } else {
    score = Math.min(100, Math.max(75, 95 - Math.round(clueDensityPercent / 3)));
    estimatedDifficulty = "hard";
  }

  return {
    score,
    estimatedDifficulty,
    factors: {
      gridSize: `${size}x${size}`,
      filledClues,
      clueDensity: `${clueDensityPercent}%`,
      immediateDeductionAvailable: hasDirectStartHint ? "yes" : "no",
    },
    explanation: `Heuristic score ${score}/100 based on ${size}x${size} grid with ${clueDensityPercent}% clues.`,
  };
}

// Calibrate difficulty for a Guzzle puzzle based on grid size and letter diversity.
export function calibrateGuzzleDifficulty(puzzle: GuzzlePuzzle): DifficultyAssessment {
  const size = puzzle.answer.length;
  const squares = guzzleToSquares(puzzle.answer);
  const wordLetters = squares.filter((s) => /^[A-Z]$/u.test(s));

  const uniqueLetters = new Set(wordLetters).size;
  const diversityPercent = Math.round((uniqueLetters / Math.max(1, wordLetters.length)) * 100);

  let score: number;
  let estimatedDifficulty: Difficulty;

  if (size <= 3) {
    score = 25 + Math.round(diversityPercent * 0.15);
    estimatedDifficulty = "easy";
  } else if (size <= 5) {
    score = 55 + Math.round(diversityPercent * 0.2);
    estimatedDifficulty = "medium";
  } else {
    score = 80 + Math.round(diversityPercent * 0.15);
    estimatedDifficulty = "hard";
  }

  return {
    score: Math.min(100, score),
    estimatedDifficulty,
    factors: {
      wordLength: size,
      totalLetterSlots: wordLetters.length,
      uniqueLetters,
      diversity: `${diversityPercent}%`,
    },
    explanation: `Heuristic score ${score}/100 based on word length ${size} and ${uniqueLetters} unique letters.`,
  };
}
