import { useState } from "react";
import { text } from "../../../text/en";
import { checkLetter, isSolved as allGreen, nextOpenSquare, type Guess } from "./rules-check";
import {
  loadPuzzleProgress,
  markPuzzleProgressSolved,
  savePuzzleProgress,
} from "../../../shared/puzzle-progress";

// "bank" shows the letters of the answer. "noBank" shows all letters from A to Z.
export type Mode = keyof typeof text.guzzle.modes;

// The last move gives the status text. "null" means that the player did not move yet.
export type LastMove = { guess: Guess; index: number } | null;

export type Game = ReturnType<typeof useGame>;

type Hooks = {
  onModeChosen?: (mode: Mode) => void;
  onLetterPlaced?: (entry: {
    index: number;
    letter: string;
    result: Guess["mark"];
    mistakes: number;
  }) => void;
};

function loadGuzzleSavedState(puzzleId: string | undefined, answerLength: number) {
  const saved = puzzleId ? loadPuzzleProgress(puzzleId) : null;
  const mode = saved?.guzzleState?.mode ?? null;
  const guesses =
    saved?.guzzleState?.guesses && saved.guzzleState.guesses.length === answerLength
      ? (saved.guzzleState.guesses.map((g) => g ?? undefined) as (Guess | undefined)[])
      : Array.from<Guess | undefined>({ length: answerLength });
  const mistakes = saved?.mistakes ?? 0;
  return { mode, guesses, mistakes };
}

function syncGuzzleProgress(
  puzzleId: string | undefined,
  answer: readonly string[],
  nextGuesses: (Guess | undefined)[],
  nextMode: Mode | null,
  nextMistakes: number,
) {
  if (!puzzleId) return;
  if (allGreen(answer, nextGuesses)) {
    markPuzzleProgressSolved(puzzleId, "guzzle", "easy", {
      timeSpentSeconds: 0,
      hintCount: 0,
      mistakes: nextMistakes,
    });
  } else {
    savePuzzleProgress({
      puzzleId,
      puzzleType: "guzzle",
      difficulty: "easy",
      savedAt: Date.now(),
      isSolved: false,
      timeSpentSeconds: 0,
      hintCount: 0,
      mistakes: nextMistakes,
      guzzleState: { guesses: nextGuesses, mode: nextMode ?? undefined },
    });
  }
}

function processLetterPlacement(
  answer: readonly string[],
  guesses: (Guess | undefined)[],
  selected: number,
  letter: string,
  mistakes: number,
) {
  const current = guesses[selected];
  if (current?.mark === "correct" || current?.letter === letter) return null;
  const guess: Guess = { letter, mark: checkLetter(answer, selected, letter) };
  const next = guesses.with(selected, guess);
  const nextMistakes = guess.mark === "correct" ? mistakes : mistakes + 1;
  return { guess, next, nextMistakes };
}

// This hook keeps the game state: the mode, the guesses, the selected square and the mistakes.
export function useGame(
  answer: readonly string[],
  size: number,
  hooks: Hooks = {},
  puzzleId?: string,
) {
  const initial = loadGuzzleSavedState(puzzleId, answer.length);
  const [mode, setMode] = useState<Mode | null>(initial.mode);
  const [guesses, setGuesses] = useState<(Guess | undefined)[]>(initial.guesses);
  const [selected, setSelected] = useState<number | null>(() =>
    initial.mode ? nextOpenSquare(initial.guesses, -1, size) : null,
  );
  const [mistakes, setMistakes] = useState(initial.mistakes);
  const [lastMove, setLastMove] = useState<LastMove>(null);
  const isSolved = allGreen(answer, guesses);

  function putLetter(letter: string) {
    if (mode === null || selected === null || isSolved) return;
    const res = processLetterPlacement(answer, guesses, selected, letter, mistakes);
    if (!res) return;
    const { guess, next, nextMistakes } = res;
    hooks.onLetterPlaced?.({ index: selected, letter, result: guess.mark, mistakes: nextMistakes });
    setGuesses(next);
    setLastMove({ guess, index: selected });
    if (guess.mark === "correct") setSelected(nextOpenSquare(next, selected, size));
    else setMistakes(nextMistakes);
    syncGuzzleProgress(puzzleId, answer, next, mode, nextMistakes);
  }

  function chooseMode(newMode: Mode) {
    hooks.onModeChosen?.(newMode);
    setMode(newMode);
    setSelected(nextOpenSquare(guesses, -1, size));
    syncGuzzleProgress(puzzleId, answer, guesses, newMode, mistakes);
  }

  return {
    mode,
    guesses,
    selected,
    mistakes,
    lastMove,
    isSolved,
    putLetter,
    chooseMode,
    setSelected,
  };
}
