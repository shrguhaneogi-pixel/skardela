import { useEffect, useRef, useState } from "react";
import {
  advanceTier,
  createColourBinaryHint,
  explainColourBinaryLogic,
  type GraduatedHint as GraduatedHintType,
  type HintTier,
  type LogicExplanation,
} from "../../../shared/graduated-hints";
import { getLogger } from "../../../shared/logger";
import {
  calculateCompletionStats,
  loadPuzzleProgress,
  markPuzzleProgressSolved,
  savePuzzleProgress,
  type CompletionStats,
} from "../../../shared/puzzle-progress";
import { BoardView, type BoardViewProps } from "./BoardView";
import { nextSquare, obeysRules, toSquares, type ColourBinaryPuzzle, type Square } from "./puzzle";

// ASD-STE100 Simplified Technical English comments.
// This component manages state and lifecycle for the Colour Binary puzzle board.

type LogMeta = {
  puzzleId: string;
  puzzleType: ColourBinaryPuzzle["type"];
  difficulty: ColourBinaryPuzzle["difficulty"];
};

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
  const squares = saved?.colourBinaryState?.squares;
  return squares && squares.length === start.length ? (squares as Square[]) : start;
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
  startTimeRef: { current: number },
  setStats: (stats: CompletionStats) => void,
  setShowReview: (show: boolean) => void,
) {
  useEffect(() => {
    if (!isSolved) return;
    const start = startTimeRef.current > 0 ? startTimeRef.current : Date.now();
    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - start) / 1000));
    const stats = calculateCompletionStats({
      puzzleId: puzzle.id,
      puzzleType: puzzle.type,
      difficulty: puzzle.difficulty,
      timeSpentSeconds,
      hintCount: hintCountRef.current,
      mistakes: 0,
    });
    setStats(stats);
    setShowReview(true);
    markPuzzleProgressSolved(puzzle.id, puzzle.type, puzzle.difficulty, {
      timeSpentSeconds,
      hintCount: hintCountRef.current,
      mistakes: 0,
    });
  }, [isSolved, puzzle, hintCountRef, startTimeRef, setStats, setShowReview]);
}

function useBoardLogic(
  squares: Square[],
  size: number,
  meta: LogMeta,
  log: ReturnType<typeof getLogger>,
  hintCountRef: { current: number },
) {
  const [hint, setHint] = useState<GraduatedHintType | undefined | null>(null);
  const [logicExplanation, setLogicExplanation] = useState<LogicExplanation | null>(null);

  function requestHint() {
    if (hint) {
      setHint({ ...hint, tier: advanceTier(hint.tier) });
      return;
    }
    hintCountRef.current += 1;
    const nextHint = createColourBinaryHint(squares, size, "nudge");
    log.info("Hint requested", { ...meta, foundHint: nextHint !== undefined });
    setHint(nextHint);
  }

  function showLogic() {
    const explanation = explainColourBinaryLogic(squares, size);
    log.info("Logic explanation requested", { ...meta, found: explanation !== undefined });
    setLogicExplanation(explanation ?? null);
  }

  return {
    hint,
    setHint,
    logicExplanation,
    setLogicExplanation,
    requestHint,
    showLogic,
  };
}

function useGameActions(
  squares: Square[],
  setSquares: (s: Square[]) => void,
  start: Square[],
  puzzle: ColourBinaryPuzzle,
  hintCountRef: { current: number },
  startTimeRef: { current: number },
  setShowReview: (s: boolean) => void,
  setStats: (s: CompletionStats | null) => void,
  logic: ReturnType<typeof useBoardLogic>,
  log: ReturnType<typeof getLogger>,
  meta: LogMeta,
) {
  function onTapSquare(square: Square, index: number, specificNext?: Square) {
    const next = specificNext ?? nextSquare[square];
    log.debug("Square changed", { ...meta, index, from: square, to: next });
    const nextSquares = squares.with(index, next);
    setSquares(nextSquares);
    logic.setHint(null);
    logic.setLogicExplanation(null);
    saveColourBinaryStep(puzzle, nextSquares, hintCountRef.current);
  }

  function handleRestart() {
    setSquares(start);
    hintCountRef.current = 0;
    startTimeRef.current = Date.now();
    setShowReview(false);
    setStats(null);
    logic.setHint(null);
    logic.setLogicExplanation(null);
    saveColourBinaryStep(puzzle, start, 0);
  }

  return {
    onTapSquare,
    onHintRequest: logic.requestHint,
    onShowLogic: logic.showLogic,
    onCloseLogic: () => logic.setLogicExplanation(null),
    onTierChange: (tier: HintTier) =>
      logic.hint ? logic.setHint({ ...logic.hint, tier }) : undefined,
    onDismissHint: () => logic.setHint(null),
    onRestart: handleRestart,
    onOpenReview: () => setShowReview(true),
    onCloseReview: () => setShowReview(false),
  };
}

function useColourBinaryGame(puzzle: ColourBinaryPuzzle): BoardViewProps {
  const start = toSquares(puzzle.start);
  const [squares, setSquares] = useState<Square[]>(() => loadInitialSquares(puzzle.id, start));
  const [showReview, setShowReview] = useState(false);
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const hintCountRef = useRef(0);
  const startTimeRef = useRef(0);
  const isSolved = obeysRules(squares);
  const size = puzzle.start.length;
  const log = getLogger("game.colour-binary");
  const meta: LogMeta = {
    puzzleId: puzzle.id,
    puzzleType: puzzle.type,
    difficulty: puzzle.difficulty,
  };

  useEffect(() => {
    if (startTimeRef.current === 0) startTimeRef.current = Date.now();
  }, []);

  useLifecycleLog(log, meta, size, isSolved);
  useSolvedSync(puzzle, isSolved, hintCountRef, startTimeRef, setStats, setShowReview);
  const logic = useBoardLogic(squares, size, meta, log, hintCountRef);
  const actions = useGameActions(
    squares,
    setSquares,
    start,
    puzzle,
    hintCountRef,
    startTimeRef,
    setShowReview,
    setStats,
    logic,
    log,
    meta,
  );

  return {
    size,
    squares,
    start,
    hint: logic.hint,
    logicExplanation: logic.logicExplanation,
    isSolved,
    completionStats: stats,
    showReview,
    actions,
  };
}

// The board keeps the start layout and the current player state in one place.
export function Board({ puzzle }: { puzzle: ColourBinaryPuzzle }) {
  const game = useColourBinaryGame(puzzle);
  return <BoardView {...game} />;
}
