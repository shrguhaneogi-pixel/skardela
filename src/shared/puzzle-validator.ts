import { levels, type Difficulty } from "./difficulty";
import { countSolutions } from "../app/puzzle-types/colour-binary/solver";
import { obeysRules } from "../app/puzzle-types/colour-binary/rules-check";
import {
  sizes as cbSizes,
  toSquares as cbToSquares,
  type ColourBinaryPuzzle,
} from "../app/puzzle-types/colour-binary/puzzle";
import {
  lineOf,
  sizes as guzzleSizes,
  toSquares as guzzleToSquares,
  type GuzzlePuzzle,
} from "../app/puzzle-types/guzzle/puzzle";

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

// Validate common metadata present in every puzzle file.
export function validateCommonMetadata(puzzle: Record<string, unknown>): string[] {
  const errors: string[] = [];
  const type = puzzle.type;
  const id = puzzle.id;
  const difficulty = puzzle.difficulty;
  const author = puzzle.author;
  const license = puzzle.license;

  if (typeof type !== "string" || !["colour-binary", "guzzle"].includes(type)) {
    errors.push('Field "type" must be "colour-binary" or "guzzle".');
  }

  if (typeof id !== "string" || !new RegExp(`^${String(type)}-\\d{4}$`, "u").test(id)) {
    errors.push(`Field "id" must match format "${String(type)}-XXXX" (4 digits).`);
  }

  if (typeof difficulty !== "string" || !levels.includes(difficulty as Difficulty)) {
    errors.push(`Field "difficulty" must be one of: ${levels.join(", ")}.`);
  }

  if (typeof author !== "string" || author.trim() === "") {
    errors.push('Field "author" must not be empty.');
  }

  if (license !== "CC-BY-4.0") {
    errors.push('Field "license" must be "CC-BY-4.0".');
  }

  return errors;
}

function checkRowLengths(rows: readonly string[], expectedSize: number, label: string): string[] {
  const errors: string[] = [];
  for (let r = 0; r < expectedSize; r++) {
    if (rows[r]?.length !== expectedSize) {
      errors.push(`${label} row ${r + 1} length must be ${expectedSize}.`);
    }
  }
  return errors;
}

function checkSquareMatches(start: readonly string[], answer: readonly string[]): string[] {
  const errors: string[] = [];
  const startSquares = cbToSquares(start);
  const answerSquares = cbToSquares(answer);

  for (let i = 0; i < startSquares.length; i++) {
    const s = startSquares[i];
    const a = answerSquares[i];
    if (s !== "." && s !== a) {
      errors.push(`Start square at index ${i} (${s}) does not match answer square (${a}).`);
    }
  }

  if (!obeysRules(answerSquares)) {
    errors.push('Field "answer" does not obey all Colour Binary rules.');
  }

  const solutions = countSolutions(startSquares);
  if (solutions !== 1) {
    errors.push(`Start position must have exactly 1 solution, but found ${solutions}.`);
  }

  return errors;
}

// Validate a Colour Binary puzzle: schema, rule obedience, solvability, and uniqueness.
export function validateColourBinaryPuzzle(puzzle: ColourBinaryPuzzle): ValidationResult {
  const errors: string[] = validateCommonMetadata(puzzle as unknown as Record<string, unknown>);
  const expectedSize = cbSizes[puzzle.difficulty];
  if (!expectedSize) return { valid: false, errors };

  const { start, answer } = puzzle;
  if (!Array.isArray(start) || start.length !== expectedSize) {
    errors.push(
      `Field "start" must have ${expectedSize} rows for difficulty "${puzzle.difficulty}".`,
    );
  }
  if (!Array.isArray(answer) || answer.length !== expectedSize) {
    errors.push(
      `Field "answer" must have ${expectedSize} rows for difficulty "${puzzle.difficulty}".`,
    );
  }
  if (errors.length > 0) return { valid: false, errors };

  errors.push(
    ...checkRowLengths(start, expectedSize, "Start"),
    ...checkRowLengths(answer, expectedSize, "Answer"),
  );
  if (errors.length > 0) return { valid: false, errors };

  errors.push(...checkSquareMatches(start, answer));
  return { valid: errors.length === 0, errors };
}

// Validate a Guzzle puzzle: board dimensions, center intersection, and valid words.
export function validateGuzzlePuzzle(puzzle: GuzzlePuzzle): ValidationResult {
  const errors: string[] = validateCommonMetadata(puzzle as unknown as Record<string, unknown>);
  const expectedSize = guzzleSizes[puzzle.difficulty];

  if (!expectedSize) {
    return { valid: false, errors };
  }

  const { answer } = puzzle;
  if (!Array.isArray(answer) || answer.length !== expectedSize) {
    errors.push(
      `Field "answer" must have ${expectedSize} rows for difficulty "${puzzle.difficulty}".`,
    );
    return { valid: false, errors };
  }

  for (let r = 0; r < expectedSize; r++) {
    if (answer[r]?.length !== expectedSize) {
      errors.push(`Answer row ${r + 1} length must be ${expectedSize}.`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const squares = guzzleToSquares(answer);
  const middle = (expectedSize - 1) / 2;
  const centerIndex = middle * expectedSize + middle;
  const centerLetter = squares[centerIndex];

  if (!centerLetter || !/^[A-Z]$/u.test(centerLetter)) {
    errors.push("Center square must contain an uppercase letter A-Z.");
  }

  for (let i = 0; i < squares.length; i++) {
    const sq = squares[i] ?? "";
    const isCenter = i === centerIndex;
    const onWord = isCenter || lineOf(i, expectedSize) !== undefined;

    if (onWord && !/^[A-Z]$/u.test(sq)) {
      errors.push(`Square at index ${i} is on a word and must be uppercase A-Z.`);
    }
    if (!onWord && sq !== ".") {
      errors.push(`Square at index ${i} is not on a word and must be ".".`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// Universal validator for any unknown puzzle object.
export function validatePuzzle(raw: unknown): ValidationResult {
  if (typeof raw !== "object" || raw === null) {
    return { valid: false, errors: ["Puzzle must be a JSON object."] };
  }

  const p = raw as Record<string, unknown>;
  if (p.type === "colour-binary") {
    return validateColourBinaryPuzzle(p as unknown as ColourBinaryPuzzle);
  }
  if (p.type === "guzzle") {
    return validateGuzzlePuzzle(p as unknown as GuzzlePuzzle);
  }

  return { valid: false, errors: ['Unknown puzzle type. Expected "colour-binary" or "guzzle".'] };
}
