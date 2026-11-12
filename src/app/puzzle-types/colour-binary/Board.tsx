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
  loadPuzzleProgress,
  type CompletionStats,
  type PuzzleProgressRecord,
} from "../../../shared/puzzle-progress";
import { BoardView, type BoardViewProps } from "./BoardView";
import {
  computeElapsedSeconds,
  loadInitialSquares,
  saveColourBinaryStep,
  useInitialStartTime,
  useSolvedSync,
} from "./progress";
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

type BoardLogicParams = {
  squares: Square[];
  size: number;
  meta: LogMeta;
  log: ReturnType<typeof getLogger>;
  onHintGranted: () => void;
};

function useBoardLogic({ squares, size, meta, log, onHintGranted }: BoardLogicParams) {
  const [hint, setHint] = useState<GraduatedHintType | undefined | null>(null);
  const [logicExplanation, setLogicExplanation] = useState<LogicExplanation | null>(null);

  function requestHint() {
    if (hint) {
      setHint({ ...hint, tier: advanceTier(hint.tier) });
      return;
    }
    const nextHint = createColourBinaryHint(squares, size, "nudge");
    log.info("Hint requested", { ...meta, foundHint: nextHint !== undefined });
    if (nextHint) {
      onHintGranted();
    }
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

type GameActionParams = {
  squares: Square[];
  setSquares: (s: Square[]) => void;
  start: Square[];
  puzzle: ColourBinaryPuzzle;
  recordedSolvedRef: { current: boolean };
  savedRecordRef: { current: PuzzleProgressRecord | null };
  hintCountRef: { current: number };
  startTimeRef: { current: number };
  setShowReview: (s: boolean) => void;
  setStats: (s: CompletionStats | null) => void;
  logic: ReturnType<typeof useBoardLogic>;
  log: ReturnType<typeof getLogger>;
  meta: LogMeta;
};

function useGameActions(p: GameActionParams) {
  function onTapSquare(square: Square, index: number, specificNext?: Square) {
    const next = specificNext ?? nextSquare[square];
    p.log.debug("Square changed", { ...p.meta, index, from: square, to: next });
    const nextSquares = p.squares.with(index, next);
    p.setSquares(nextSquares);
    p.logic.setHint(null);
    p.logic.setLogicExplanation(null);
    saveColourBinaryStep(
      p.puzzle,
      nextSquares,
      p.hintCountRef.current,
      computeElapsedSeconds(p.startTimeRef.current),
    );
  }

  function handleRestart() {
    p.recordedSolvedRef.current = false;
    p.savedRecordRef.current = null;
    p.setSquares(p.start);
    p.hintCountRef.current = 0;
    p.startTimeRef.current = Date.now();
    p.setShowReview(false);
    p.setStats(null);
    p.logic.setHint(null);
    p.logic.setLogicExplanation(null);
    saveColourBinaryStep(p.puzzle, p.start, 0, 0);
  }

  return {
    onTapSquare,
    onHintRequest: p.logic.requestHint,
    onShowLogic: p.logic.showLogic,
    onCloseLogic: () => p.logic.setLogicExplanation(null),
    onTierChange: (tier: HintTier) =>
      p.logic.hint ? p.logic.setHint({ ...p.logic.hint, tier }) : undefined,
    onDismissHint: () => p.logic.setHint(null),
    onRestart: handleRestart,
    onOpenReview: () => p.setShowReview(true),
    onCloseReview: () => p.setShowReview(false),
  };
}

function useBoardState(puzzle: ColourBinaryPuzzle, start: Square[]) {
  const [initialSaved] = useState(() => loadPuzzleProgress(puzzle.id));
  const [squares, setSquares] = useState<Square[]>(() => loadInitialSquares(initialSaved, start));
  const [showReview, setShowReview] = useState(false);
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const savedRecordRef = useRef<PuzzleProgressRecord | null>(initialSaved);
  const recordedSolvedRef = useRef(Boolean(initialSaved?.isSolved && obeysRules(squares)));
  const hintCountRef = useRef(initialSaved?.hintCount ?? 0);
  const startTimeRef = useInitialStartTime(initialSaved?.timeSpentSeconds ?? 0);
  const incrementHintCount = () => {
    hintCountRef.current += 1;
    return {
      hintCount: hintCountRef.current,
      timeSpentSeconds: computeElapsedSeconds(startTimeRef.current),
    };
  };
  return {
    squares,
    setSquares,
    showReview,
    setShowReview,
    stats,
    setStats,
    savedRecordRef,
    recordedSolvedRef,
    hintCountRef,
    startTimeRef,
    incrementHintCount,
  };
}

function useColourBinaryGame(puzzle: ColourBinaryPuzzle): BoardViewProps {
  const start = toSquares(puzzle.start);
  const state = useBoardState(puzzle, start);
  const isSolved = obeysRules(state.squares);
  const size = puzzle.start.length;
  const log = getLogger("game.colour-binary");
  const meta: LogMeta = {
    puzzleId: puzzle.id,
    puzzleType: puzzle.type,
    difficulty: puzzle.difficulty,
  };

  useLifecycleLog(log, meta, size, isSolved);
  useSolvedSync({ ...state, puzzle, isSolved });
  const logic = useBoardLogic({
    squares: state.squares,
    size,
    meta,
    log,
    onHintGranted: () => {
      const { hintCount, timeSpentSeconds } = state.incrementHintCount();
      saveColourBinaryStep(puzzle, state.squares, hintCount, timeSpentSeconds);
    },
  });
  const actions = useGameActions({ ...state, start, puzzle, logic, log, meta });

  return {
    size,
    squares: state.squares,
    start,
    hint: logic.hint,
    logicExplanation: logic.logicExplanation,
    isSolved,
    completionStats: state.stats,
    showReview: state.showReview,
    actions,
  };
}

// The board keeps the start layout and the current player state in one place.
export function Board({ puzzle }: { puzzle: ColourBinaryPuzzle }) {
  const game = useColourBinaryGame(puzzle);
  return <BoardView {...game} />;
}
