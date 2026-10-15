// Open Puzzle Exchange: Pack schema validation, import, and export engine.
// Follows ASD-STE100 Simplified Technical English.

import { validatePuzzle } from "./puzzle-validator";
import { getStoredItem, setStoredItem, listStoredKeys } from "./storage";

export interface PuzzlePack {
  readonly format: "skardela-pack-v1";
  readonly id: string;
  readonly title: string;
  readonly author: string;
  readonly version: string;
  readonly license: string;
  readonly description?: string;
  readonly puzzles: readonly Record<string, unknown>[];
}

export interface PackValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

const MAX_PUZZLES_PER_PACK = 50;
// Maximum pack JSON size is 256 KB.
const MAX_PACK_JSON_BYTES = 262144;

function checkPackMetadata(p: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (p.format !== "skardela-pack-v1") {
    errors.push('Field "format" must be "skardela-pack-v1".');
  }
  if (typeof p.id !== "string" || !/^[a-z0-9-]+$/u.test(p.id)) {
    errors.push('Field "id" must be lowercase alphanumeric with hyphens.');
  }
  if (typeof p.title !== "string" || !p.title.trim()) {
    errors.push('Field "title" must not be empty.');
  }
  if (typeof p.author !== "string" || !p.author.trim()) {
    errors.push('Field "author" must not be empty.');
  }
  if (typeof p.version !== "string" || !p.version.trim()) {
    errors.push('Field "version" must not be empty.');
  }
  if (p.license !== "CC-BY-4.0") {
    errors.push('Field "license" must be "CC-BY-4.0".');
  }
  return errors;
}

function checkPackPuzzles(puzzles: unknown): string[] {
  const errors: string[] = [];
  if (!Array.isArray(puzzles) || puzzles.length === 0) {
    return ['Field "puzzles" must be a non-empty array.'];
  }
  if (puzzles.length > MAX_PUZZLES_PER_PACK) {
    return [`Pack exceeds maximum allowed puzzle count (${MAX_PUZZLES_PER_PACK}).`];
  }

  for (let i = 0; i < puzzles.length; i += 1) {
    const puzzle = puzzles[i];
    const res = validatePuzzle(puzzle);
    if (!res.valid) {
      errors.push(`Puzzle ${i + 1} is invalid: ${res.errors.join(", ")}`);
    }
  }
  return errors;
}

/**
 * Validates an imported puzzle pack structure and all contained puzzles.
 */
export function validatePuzzlePack(raw: unknown): PackValidationResult {
  if (typeof raw !== "object" || raw === null) {
    return { valid: false, errors: ["Pack must be a JSON object."] };
  }

  const p = raw as Record<string, unknown>;
  const errors: string[] = [...checkPackMetadata(p), ...checkPackPuzzles(p.puzzles)];

  return { valid: errors.length === 0, errors };
}

/**
 * Parses raw JSON text into a validated PuzzlePack.
 */
export function parsePuzzlePackJson(
  jsonText: string,
): PackValidationResult & { pack?: PuzzlePack } {
  if (new TextEncoder().encode(jsonText).length > MAX_PACK_JSON_BYTES) {
    return { valid: false, errors: ["Pack file exceeds 256 KB limit."] };
  }

  try {
    const raw: unknown = JSON.parse(jsonText);
    const validation = validatePuzzlePack(raw);
    if (!validation.valid) {
      return validation;
    }
    return { valid: true, errors: [], pack: raw as PuzzlePack };
  } catch {
    return { valid: false, errors: ["Invalid JSON syntax."] };
  }
}

const STORAGE_PREFIX = "skardela:packs:";
const PACK_STORAGE_VERSION = 1;

function makePackOptions(packId: string) {
  return {
    key: `${STORAGE_PREFIX}${packId}`,
    version: PACK_STORAGE_VERSION,
    defaultValue: null as PuzzlePack | null,
    validate: (data: unknown): data is PuzzlePack => validatePuzzlePack(data).valid,
  };
}

/**
 * Loads all imported puzzle packs from local storage.
 */
export function loadImportedPacks(): PuzzlePack[] {
  const keys = listStoredKeys(STORAGE_PREFIX);
  const packs: PuzzlePack[] = [];

  for (const key of keys) {
    const packId = key.slice(STORAGE_PREFIX.length);
    const item = getStoredItem(makePackOptions(packId));
    if (item) packs.push(item);
  }
  return packs;
}

/**
 * Saves a validated puzzle pack to local storage.
 */
export function saveImportedPack(pack: PuzzlePack): void {
  setStoredItem(makePackOptions(pack.id), pack);
}
