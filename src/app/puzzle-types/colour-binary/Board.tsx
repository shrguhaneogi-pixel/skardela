import { useEffect, useRef, useState } from "react";
import shared from "../../../shared/Board.module.css";
import {
  advanceTier,
  createColourBinaryHint,
  getHintTierText,
  type GraduatedHint as GraduatedHintType,
  type HintTier,
} from "../../../shared/graduated-hints";
import { GraduatedHint } from "../../../shared/GraduatedHint";
import { getLogger } from "../../../shared/logger";
import {
  loadPuzzleProgress,
  markPuzzleProgressSolved,
  savePuzzleProgress,
} from "../../../shared/puzzle-progress";
import { text } from "../../../text/en";
import { BoardGrid } from "./Grid";
import { toSquares, type ColourBinaryPuzzle, type Square } from "./puzzle";
import { nextSquare, obeysRules } from "./rules-check";

const words = text["colour-binary"];

type LogMeta = {
  puzzleId: string;
  puzzleType: ColourBinaryPuzzle["type"];
  difficulty: ColourBinaryPuzzle["difficulty"];
};

// ASD-STE100 Simplified Technical English comments.
// The status text tells the user if the board is solved, ready to play, or shows a hint.
function statusText(isSolved: boolean, hint: GraduatedHintType | undefined | null): string {
  if (isSolved) return words.status.solved;
  if (hint === null) return words.status.start;
  if (hint === undefined) return words.noHint;
  return getHintTierText(hint, hint.tier);
}

type BoardViewProps = {
  size: number;
  squares: Square[];
  start: Square[];
  hint: GraduatedHintType | undefined | null;
  isSolved: boolean;
  onTapSquare: (square: Square, index: number) => void;
  onHintRequest: () => void;
  onTierChange: (tier: HintTier) => void;
  onDismissHint: () => void;
};

function BoardView({
  size,
  squares,
  start,
  hint,
  isSolved,
  onTapSquare,
  onHintRequest,
  onTierChange,
  onDismissHint,
}: BoardViewProps) {
  return (
    <div className={shared.game}>
      <BoardGrid
        size={size}
        squares={squares}
        start={start}
        hint={hint}
        isSolved={isSolved}
        onTapSquare={onTapSquare}
      />
      <output className={shared.status} data-solved={isSolved}>
        {statusText(isSolved, hint)}
      </output>
      {hint && <GraduatedHint hint={hint} onTierChange={onTierChange} onDismiss={onDismissHint} />}
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

function useHintState(
  squares: Square[],
  size: number,
  meta: LogMeta,
  log: ReturnType<typeof getLogger>,
  hintCountRef: { current: number },
) {
  const [hint, setHint] = useState<GraduatedHintType | undefined | null>(null);

  function requestHint() {
    if (hint) {
      setHint({ ...hint, tier: advanceTier(hint.tier) });
      return;
    }
    hintCountRef.current += 1;
    const nextHint = createColourBinaryHint(squares, size, "nudge");
    log.info("Hint requested", {
      ...meta,
      foundHint: nextHint !== undefined,
      hintIndex: nextHint?.index,
    });
    setHint(nextHint);
  }

  function changeTier(tier: HintTier) {
    if (!hint) return;
    setHint({ ...hint, tier });
  }

  return { hint, setHint, requestHint, changeTier };
}

// The board keeps the start layout and the current player state in one place.
export function Board({ puzzle }: { puzzle: ColourBinaryPuzzle }) {
  const start = toSquares(puzzle.start);
  const [squares, setSquares] = useState<Square[]>(() => loadInitialSquares(puzzle.id, start));
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
  const { hint, setHint, requestHint, changeTier } = useHintState(
    squares,
    size,
    meta,
    log,
    hintCountRef,
  );

  function onTapSquare(square: Square, index: number) {
    const next = nextSquare[square];
    log.debug("Square changed", { ...meta, index, from: square, to: next });
    const nextSquares = squares.with(index, next);
    setSquares(nextSquares);
    setHint(null);
    saveColourBinaryStep(puzzle, nextSquares, hintCountRef.current);
  }

  return (
    <BoardView
      size={size}
      squares={squares}
      start={start}
      hint={hint}
      isSolved={isSolved}
      onTapSquare={onTapSquare}
      onHintRequest={requestHint}
      onTierChange={changeTier}
      onDismissHint={() => setHint(null)}
    />
  );
}
