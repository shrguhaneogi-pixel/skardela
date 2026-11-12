import { useState } from "react";
import type { Difficulty } from "../../../shared/difficulty";
import { text } from "../../../text/en";
import { checkLetter, isSolved as allGreen, nextOpenSquare, type Guess } from "./rules-check";
import { loadPuzzleProgress, savePuzzleProgress } from "../../../shared/puzzle-progress";

// "bank" shows the letters of the answer. "noBank" shows all letters from A to Z.
export type Mode = keyof typeof text.guzzle.modes;

// The last move gives the status text. "null" means that the player did not move yet.
export type LastMove = { guess: Guess; index: number } | null;

export type Game = ReturnType<typeof useGame>;
export { statusText } from "./status";
export { toSquares, type GuzzlePuzzle } from "./puzzle";

type GuzzleTelemetrySnapshot = {
  timeSpentSeconds: number;
  hintCount: number;
};

type Hooks = {
  difficulty?: Difficulty;
  getTelemetry?: () => GuzzleTelemetrySnapshot;
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

type SyncProgressParams = {
  puzzleId: string | undefined;
  difficulty: Difficulty;
  answer: readonly string[];
  nextGuesses: (Guess | undefined)[];
  nextMode: Mode | null;
  nextMistakes: number;
  getTelemetry?: () => GuzzleTelemetrySnapshot;
};

function syncGuzzleProgress(p: SyncProgressParams) {
  if (!p.puzzleId) return;
  const existing = loadPuzzleProgress(p.puzzleId);
  const telemetry = p.getTelemetry?.();
  const solved = allGreen(p.answer, p.nextGuesses);
  savePuzzleProgress({
    puzzleId: p.puzzleId,
    puzzleType: "guzzle",
    difficulty: p.difficulty,
    savedAt: Date.now(),
    isSolved: solved,
    completedAt: solved ? Date.now() : undefined,
    timeSpentSeconds: telemetry?.timeSpentSeconds ?? existing?.timeSpentSeconds ?? 0,
    hintCount: telemetry?.hintCount ?? existing?.hintCount ?? 0,
    mistakes: p.nextMistakes,
    guzzleState: { guesses: p.nextGuesses, mode: p.nextMode ?? undefined },
  });
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

type LetterPlacementParams = {
  answer: readonly string[];
  guesses: (Guess | undefined)[];
  selected: number;
  letter: string;
  mistakes: number;
  size: number;
  mode: Mode;
  difficulty: Difficulty;
  puzzleId?: string;
  getTelemetry?: () => GuzzleTelemetrySnapshot;
};

type LetterPlacementSetters = {
  setGuesses: (g: (Guess | undefined)[]) => void;
  setLastMove: (m: LastMove) => void;
  setSelected: (s: number | null) => void;
  setMistakes: (m: number) => void;
};

function handleLetterPlacement(
  params: LetterPlacementParams,
  setters: LetterPlacementSetters,
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
  syncGuzzleProgress({
    puzzleId: params.puzzleId,
    difficulty: params.difficulty,
    answer: params.answer,
    nextGuesses: res.next,
    nextMode: params.mode,
    nextMistakes: res.nextMistakes,
    getTelemetry: params.getTelemetry,
  });
}

function resetGuzzleState(
  answerLength: number,
  mode: Mode | null,
  size: number,
  puzzleId: string | undefined,
  difficulty: Difficulty,
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
  if (puzzleId) {
    savePuzzleProgress({
      puzzleId,
      puzzleType: "guzzle",
      difficulty,
      savedAt: Date.now(),
      isSolved: false,
      timeSpentSeconds: 0,
      hintCount: 0,
      mistakes: 0,
      guzzleState: { guesses: empty, mode: mode ?? undefined },
    });
  }
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
        difficulty: hooks.difficulty ?? "easy",
        puzzleId,
        getTelemetry: hooks.getTelemetry,
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
  const difficulty = hooks.difficulty ?? "easy";

  function chooseMode(newMode: Mode) {
    hooks.onModeChosen?.(newMode);
    s.setMode(newMode);
    s.setSelected(nextOpenSquare(s.guesses, -1, size));
    syncGuzzleProgress({
      puzzleId,
      difficulty,
      answer,
      nextGuesses: s.guesses,
      nextMode: newMode,
      nextMistakes: s.mistakes,
      getTelemetry: hooks.getTelemetry,
    });
  }

  const restart = () =>
    resetGuzzleState(answer.length, s.mode, size, puzzleId, difficulty, {
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
