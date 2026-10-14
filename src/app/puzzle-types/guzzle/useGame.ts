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
export { statusText } from "./status";
export { toSquares, type GuzzlePuzzle } from "./puzzle";

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

function handleLetterPlacement(
  params: {
    answer: readonly string[];
    guesses: (Guess | undefined)[];
    selected: number;
    letter: string;
    mistakes: number;
    size: number;
    mode: Mode;
    puzzleId?: string;
  },
  setters: {
    setGuesses: (g: (Guess | undefined)[]) => void;
    setLastMove: (m: LastMove) => void;
    setSelected: (s: number | null) => void;
    setMistakes: (m: number) => void;
  },
  onPlaced?: Hooks["onLetterPlaced"],
) {
  const res = processLetterPlacement(
    params.answer,
    params.guesses,
    params.selected,
    params.letter,
    params.mistakes,
  );
  if (!res) return;
  onPlaced?.({
    index: params.selected,
    letter: params.letter,
    result: res.guess.mark,
    mistakes: res.nextMistakes,
  });
  setters.setGuesses(res.next);
  setters.setLastMove({ guess: res.guess, index: params.selected });
  if (res.guess.mark === "correct") {
    setters.setSelected(nextOpenSquare(res.next, params.selected, params.size));
  } else {
    setters.setMistakes(res.nextMistakes);
  }
  syncGuzzleProgress(params.puzzleId, params.answer, res.next, params.mode, res.nextMistakes);
}

function resetGuzzleState(
  answerLength: number,
  mode: Mode | null,
  size: number,
  puzzleId: string | undefined,
  answer: readonly string[],
  setters: {
    setGuesses: (g: (Guess | undefined)[]) => void;
    setMistakes: (m: number) => void;
    setLastMove: (m: LastMove) => void;
    setSelected: (s: number | null) => void;
  },
) {
  const empty = Array.from<Guess | undefined>({ length: answerLength });
  setters.setGuesses(empty);
  setters.setMistakes(0);
  setters.setLastMove(null);
  setters.setSelected(mode ? nextOpenSquare(empty, -1, size) : null);
  syncGuzzleProgress(puzzleId, answer, empty, mode, 0);
}

function useGuzzleState(puzzleId: string | undefined, answerLength: number, size: number) {
  const initial = loadGuzzleSavedState(puzzleId, answerLength);
  const [mode, setMode] = useState<Mode | null>(initial.mode);
  const [guesses, setGuesses] = useState<(Guess | undefined)[]>(initial.guesses);
  const [selected, setSelected] = useState<number | null>(() =>
    initial.mode ? nextOpenSquare(initial.guesses, -1, size) : null,
  );
  const [mistakes, setMistakes] = useState(initial.mistakes);
  const [lastMove, setLastMove] = useState<LastMove>(null);
  return {
    mode,
    setMode,
    guesses,
    setGuesses,
    selected,
    setSelected,
    mistakes,
    setMistakes,
    lastMove,
    setLastMove,
  };
}

function usePutLetterHandler(
  s: ReturnType<typeof useGuzzleState>,
  answer: readonly string[],
  size: number,
  isSolved: boolean,
  hooks: Hooks,
  puzzleId?: string,
) {
  return (letter: string) => {
    if (s.mode === null || s.selected === null || isSolved) return;
    const setters = {
      setGuesses: s.setGuesses,
      setLastMove: s.setLastMove,
      setSelected: s.setSelected,
      setMistakes: s.setMistakes,
    };
    handleLetterPlacement(
      {
        answer,
        guesses: s.guesses,
        selected: s.selected,
        letter,
        mistakes: s.mistakes,
        size,
        mode: s.mode,
        puzzleId,
      },
      setters,
      hooks.onLetterPlaced,
    );
  };
}

// This hook keeps the game state: the mode, the guesses, the selected square and the mistakes.
export function useGame(
  answer: readonly string[],
  size: number,
  hooks: Hooks = {},
  puzzleId?: string,
) {
  const s = useGuzzleState(puzzleId, answer.length, size);
  const isSolved = allGreen(answer, s.guesses);
  const putLetter = usePutLetterHandler(s, answer, size, isSolved, hooks, puzzleId);

  function chooseMode(newMode: Mode) {
    hooks.onModeChosen?.(newMode);
    s.setMode(newMode);
    s.setSelected(nextOpenSquare(s.guesses, -1, size));
    syncGuzzleProgress(puzzleId, answer, s.guesses, newMode, s.mistakes);
  }

  const restart = () =>
    resetGuzzleState(answer.length, s.mode, size, puzzleId, answer, {
      setGuesses: s.setGuesses,
      setMistakes: s.setMistakes,
      setLastMove: s.setLastMove,
      setSelected: s.setSelected,
    });

  return {
    mode: s.mode,
    guesses: s.guesses,
    selected: s.selected,
    mistakes: s.mistakes,
    lastMove: s.lastMove,
    isSolved,
    putLetter,
    chooseMode,
    setSelected: s.setSelected,
    restart,
  };
}
