import { useEffect, useRef, useState } from "react";
import { gridStyle } from "../../../shared/grid";
import { getLogger } from "../../../shared/logger";
import styles from "./Board.module.css";
import shared from "../../../shared/Board.module.css";
import { findHint, type Hint } from "./hint";
import { toSquares, type ColourBinaryPuzzle, type Square } from "./puzzle";
import { nextSquare, obeysRules } from "./rules-check";
import {
  loadPuzzleProgress,
  markPuzzleProgressSolved,
  savePuzzleProgress,
} from "../../../shared/puzzle-progress";
import { text } from "../../../text/en";

const words = text["colour-binary"];

// The status text tells the user if the board is solved, ready to play, or waiting for a hint.
function statusText(isSolved: boolean, hint: Hint | undefined | null, size: number): string {
  if (isSolved) return words.status.solved;
  if (hint === null) return words.status.start;
  if (hint === undefined) return words.noHint;
  const otherColour = hint.colour === "R" ? "B" : "R";
  return words.hint({
    ...hint,
    row: Math.floor(hint.index / size) + 1,
    column: (hint.index % size) + 1,
    colour: words.colours[hint.colour],
    otherColour: words.colours[otherColour],
  });
}

type SquareProps = {
  square: Square;
  index: number;
  size: number;
  isFixed: boolean;
  isHint: boolean;
  isSolved: boolean;
  onTap: () => void;
};

type LogMeta = {
  puzzleId: string;
  puzzleType: ColourBinaryPuzzle["type"];
  difficulty: ColourBinaryPuzzle["difficulty"];
};

// Each square is a button so the user can tap a cell and cycle its colour.
function SquareButton({ square, index, size, isFixed, isHint, isSolved, onTap }: SquareProps) {
  const label = words.square({
    row: Math.floor(index / size) + 1,
    column: (index % size) + 1,
    colour: words.colours[square],
    isFixed,
  });
  return (
    <button
      type="button"
      className={`${shared.square} ${styles.square}`}
      data-colour={square}
      data-fixed={isFixed}
      data-hint={isHint}
      aria-label={label}
      aria-disabled={isFixed || isSolved}
      onClick={() => {
        if (!isFixed && !isSolved) onTap();
      }}
    >
      <span aria-hidden="true">{words.symbols[square]}</span>
    </button>
  );
}

type BoardViewProps = {
  size: number;
  squares: Square[];
  start: Square[];
  hint: Hint | undefined | null;
  isSolved: boolean;
  onTapSquare: (square: Square, index: number) => void;
  onHintRequest: () => void;
};

function BoardView({
  size,
  squares,
  start,
  hint,
  isSolved,
  onTapSquare,
  onHintRequest,
}: BoardViewProps) {
  return (
    <div className={shared.game}>
      <fieldset className={shared.board}>
        <legend className="visually-hidden">{words.boardLabel}</legend>
        <div className={shared.grid} style={gridStyle(size)}>
          {squares.map((square, index) => (
            <SquareButton
              // oxlint-disable-next-line react/no-array-index-key -- the index is the identity of a square. The squares never move.
              key={index}
              square={square}
              index={index}
              size={size}
              isFixed={start[index] !== "."}
              isHint={hint?.index === index}
              isSolved={isSolved}
              onTap={() => onTapSquare(square, index)}
            />
          ))}
        </div>
      </fieldset>

      <output className={shared.status} data-solved={isSolved}>
        {statusText(isSolved, hint, size)}
      </output>

      <button
        type="button"
        className={`${shared.button} ${shared.boxed}`}
        disabled={isSolved}
        onClick={onHintRequest}
      >
        {words.hintButton}
      </button>
    </div>
  );
}

function useLifecycleLog(
  log: ReturnType<typeof getLogger>,
  meta: LogMeta,
  size: number,
  isSolved: boolean,
) {
  const solvedLogged = useRef(false);
  useEffect(() => {
    log.info("Puzzle started", { ...meta, size });
  }, [log, meta, size]);

  useEffect(() => {
    if (!isSolved || solvedLogged.current) return;
    solvedLogged.current = true;
    log.info("Puzzle solved", { ...meta, size });
  }, [isSolved, log, meta, size]);
}

function loadInitialSquares(puzzleId: string, start: Square[]): Square[] {
  const saved = loadPuzzleProgress(puzzleId);
  if (
    saved?.colourBinaryState?.squares &&
    saved.colourBinaryState.squares.length === start.length
  ) {
    return saved.colourBinaryState.squares as Square[];
  }
  return start;
}

function saveColourBinaryStep(puzzle: ColourBinaryPuzzle, squares: Square[], hintCount: number) {
  savePuzzleProgress({
    puzzleId: puzzle.id,
    puzzleType: puzzle.type,
    difficulty: puzzle.difficulty,
    savedAt: Date.now(),
    isSolved: obeysRules(squares),
    timeSpentSeconds: 0,
    hintCount,
    mistakes: 0,
    colourBinaryState: { squares },
  });
}

function useSolvedSync(
  puzzle: ColourBinaryPuzzle,
  isSolved: boolean,
  hintCountRef: { current: number },
) {
  useEffect(() => {
    if (!isSolved) return;
    markPuzzleProgressSolved(puzzle.id, puzzle.type, puzzle.difficulty, {
      timeSpentSeconds: 0,
      hintCount: hintCountRef.current,
      mistakes: 0,
    });
  }, [isSolved, puzzle.difficulty, puzzle.id, puzzle.type, hintCountRef]);
}

// The board keeps the start layout and the current player state in one place.
// The puzzle is solved when the board matches the rule set.
export function Board({ puzzle }: { puzzle: ColourBinaryPuzzle }) {
  const start = toSquares(puzzle.start);
  const [squares, setSquares] = useState<Square[]>(() => loadInitialSquares(puzzle.id, start));
  const [hint, setHint] = useState<Hint | undefined | null>(null);
  const hintCountRef = useRef(0);
  const isSolved = obeysRules(squares);
  const size = puzzle.start.length;
  const log = getLogger("game.colour-binary");
  const meta: LogMeta = {
    puzzleId: puzzle.id,
    puzzleType: puzzle.type,
    difficulty: puzzle.difficulty,
  };
  useLifecycleLog(log, meta, size, isSolved);
  useSolvedSync(puzzle, isSolved, hintCountRef);

  function onTapSquare(square: Square, index: number) {
    const next = nextSquare[square];
    log.debug("Square changed", { ...meta, index, from: square, to: next });
    const nextSquares = squares.with(index, next);
    setSquares(nextSquares);
    setHint(null);
    saveColourBinaryStep(puzzle, nextSquares, hintCountRef.current);
  }

  function onHintRequest() {
    hintCountRef.current += 1;
    const nextHint = findHint(squares);
    log.info("Hint requested", {
      ...meta,
      foundHint: nextHint !== undefined,
      hintIndex: nextHint?.index,
      hintColour: nextHint?.colour,
    });
    setHint(nextHint);
  }

  return (
    <BoardView
      size={size}
      squares={squares}
      start={start}
      hint={hint}
      isSolved={isSolved}
      onTapSquare={onTapSquare}
      onHintRequest={onHintRequest}
    />
  );
}
