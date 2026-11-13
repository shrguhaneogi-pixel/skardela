import type { LoaderFunctionArgs } from "react-router";
import { loadImportedPacks } from "../shared/puzzle-pack";
import { loadArchiveDay } from "./archive";
import { dayNumber, formatDateString, puzzlesForDay, utcDate } from "./daily";
import {
  isPuzzleType,
  puzzleTypes,
  type PuzzleMap,
  type PuzzleType,
} from "./puzzle-types/registry";
import { useAppStore } from "../shared/state/store";
import { randomPuzzleId } from "./randomPuzzle";
import type { Difficulty } from "../shared/difficulty";

// One puzzle with the name of its type. The type tells the page which board to show.
export type LoadedPuzzle = {
  [Type in PuzzleType]: { type: Type; puzzle: PuzzleMap[Type] };
}[PuzzleType] & {
  others?: readonly string[];
  today?: readonly { id: string; difficulty: Difficulty }[];
};

// Find a puzzle inside imported custom packs. If packId is given, search only that pack.
function findPackPuzzle(id: string, type: PuzzleType, packId?: string | null): LoadedPuzzle | null {
  const packs = loadImportedPacks();
  const targetPacks = packId ? packs.filter((pack) => pack.id === packId) : packs;
  for (const pack of targetPacks) {
    const match = pack.puzzles.find((item) => item.id === id && item.type === type);
    if (match) {
      return { type, puzzle: match as unknown as PuzzleMap[PuzzleType] } as LoadedPuzzle;
    }
  }
  return null;
}

// A puzzle ID has the form: type-number, with a number of 4 digits, such as colour-binary-0001.
// The loader checks the format, loads the correct puzzle file or imported pack, and returns one item if it exists.
export async function loadPuzzle(id: string, packId?: string | null): Promise<LoadedPuzzle | null> {
  const type = /^([a-z]+(?:-[a-z]+)*)-\d{4}$/u.exec(id)?.[1];
  if (type === undefined || !isPuzzleType(type)) return null;

  if (packId) {
    return findPackPuzzle(id, type, packId);
  }

  const puzzles: readonly PuzzleMap[PuzzleType][] = await puzzleTypes[type].loadPuzzles();
  const puzzle = puzzles.find((item) => item.id === id);
  if (puzzle) {
    const others = puzzles
      .filter((item) => item.difficulty === puzzle.difficulty && item.id !== puzzle.id)
      .map((item) => item.id);
    const today = puzzlesForDay(puzzles, dayNumber(utcDate()));
    return { type, puzzle, others, today } as LoadedPuzzle;
  }

  return findPackPuzzle(id, type);
}

export function puzzleLoader({
  params,
  request,
}: LoaderFunctionArgs): Promise<LoadedPuzzle | null> {
  const packId = new URL(request.url, "http://localhost").searchParams.get("pack");
  return loadPuzzle(params.puzzleId ?? "", packId);
}

// Select one random puzzle ID from the registered puzzle pools.
// Prefers unplayed/unsolved puzzles first.
export async function pickRandomPuzzleId(options?: {
  excludeId?: string;
  type?: PuzzleType;
  random?: () => number;
}): Promise<string | null> {
  const types = options?.type ? [options.type] : (Object.keys(puzzleTypes) as PuzzleType[]);
  const pools = await Promise.all(types.map((type) => puzzleTypes[type].loadPuzzles()));
  const ids = pools.flatMap((list) => list.map((item) => item.id));
  if (ids.length === 0) return null;

  const solved = useAppStore.getState().solved;
  const filtered =
    options?.excludeId && ids.length > 1 ? ids.filter((id) => id !== options.excludeId) : ids;
  const candidates = filtered.length > 0 ? filtered : ids;

  const chosen = randomPuzzleId(candidates, solved, options?.random);
  return chosen ?? candidates[0] ?? null;
}

// The home page shows one recommended puzzle for each type and difficulty for the current UTC day.
export function homeLoader() {
  const day = dayNumber(utcDate());
  return Promise.all(
    (Object.keys(puzzleTypes) as PuzzleType[]).map(async (type) => ({
      type,
      levels: puzzlesForDay(await puzzleTypes[type].loadPuzzles(), day),
    })),
  );
}

// Loads historical daily puzzles for archive routes.
export function archiveLoader({ params }: LoaderFunctionArgs) {
  return loadArchiveDay(params.date);
}

// Check if a date string is today UTC.
export function isTodayUtc(dateString: string | null): boolean {
  if (!dateString) return true;
  return dateString === formatDateString(utcDate());
}
