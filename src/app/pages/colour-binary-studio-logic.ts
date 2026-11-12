// Pure helpers for validating and exporting Colour Binary puzzles in Puzzle Studio.
// Follows ASD-STE100 Simplified Technical English.

import type { Difficulty } from "../../shared/difficulty";
import { validateColourBinaryPuzzle, type ValidationResult } from "../../shared/puzzle-validator";
import {
  sizes as cbSizes,
  toRows as cbToRows,
  type ColourBinaryPuzzle,
  type Square as CbSquare,
} from "../puzzle-types/colour-binary/puzzle";
import { findAnswers } from "../puzzle-types/colour-binary/solver";

export type { CbSquare, Difficulty, ValidationResult };

export function createEmptyGrid(difficulty: Difficulty): CbSquare[] {
  const size = cbSizes[difficulty];
  return Array.from({ length: size * size }, () => ".");
}

export function gridSizeForDifficulty(difficulty: Difficulty): number {
  return cbSizes[difficulty];
}

export function nextSquareCycle(current: CbSquare): CbSquare {
  if (current === ".") return "R";
  if (current === "R") return "B";
  return ".";
}

function buildCbExportObject(
  difficulty: Difficulty,
  id: string,
  author: string,
  squares: readonly CbSquare[],
  answerSquares: readonly CbSquare[],
): ColourBinaryPuzzle & { readonly schemaVersion: string } {
  return {
    schemaVersion: "skardela-custom-v1",
    type: "colour-binary",
    id,
    difficulty,
    author: author.trim() || "Local Creator",
    license: "CC-BY-4.0",
    start: cbToRows(squares),
    answer: cbToRows(answerSquares),
  };
}

export function validateCbStudio(
  squares: readonly CbSquare[],
  difficulty: Difficulty,
  id: string,
  author: string,
): ValidationResult {
  const answers = findAnswers(squares, 2);
  if (answers.length !== 1 || !answers[0]) {
    return {
      valid: false,
      errors: [`Puzzle has ${answers.length} solutions. Expected exactly 1 unique solution.`],
    };
  }
  const payload = buildCbExportObject(difficulty, id, author, squares, answers[0]);
  return validateColourBinaryPuzzle(payload);
}

export function exportCbStudio(
  squares: readonly CbSquare[],
  difficulty: Difficulty,
  id: string,
  author: string,
): string {
  const answers = findAnswers(squares, 1);
  const ans = answers[0] ?? squares;
  const payload = buildCbExportObject(difficulty, id, author, squares, ans);
  return JSON.stringify(payload, null, 2);
}
