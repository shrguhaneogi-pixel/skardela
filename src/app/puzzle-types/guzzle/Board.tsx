import { useEffect, useRef, useState } from "react";
import {
  advanceTier,
  createGuzzleHint,
  explainGuzzleLogic,
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
import { GuzzleBoardView, type GuzzleBoardViewProps } from "./BoardView";
import {
  computeGuzzleElapsedSeconds,
  saveGuzzleHintProgress,
  useGuzzleSolvedSync,
  useGuzzleStartTime,
} from "./progress";
import { toSquares, useGame, type Game, type GuzzlePuzzle } from "./useGame";

type Meta = {
  puzzleId: string;
  puzzleType: GuzzlePuzzle["type"];
  difficulty: GuzzlePuzzle["difficulty"];
};
type Hooks = NonNullable<Parameters<typeof useGame>[2]>;
type ModeArg = Parameters<NonNullable<Hooks["onModeChosen"]>>[0];
type LetterEntry = Parameters<NonNullable<Hooks["onLetterPlaced"]>>[0];

function createHooks(
  log: ReturnType<typeof getLogger>,
  meta: Meta,
  getTelemetry: Hooks["getTelemetry"],
): Hooks {
  return {
    difficulty: meta.difficulty,
    getTelemetry,
    onModeChosen: (mode: ModeArg) => {
      log.info("Mode selected", { ...meta, mode });
    },
    onLetterPlaced: (entry: LetterEntry) => {
      log.debug("Letter entered", { ...meta, ...entry });
    },
  };
}

function useLifecycleLog(
  log: ReturnType<typeof getLogger>,
  meta: Meta,
  size: number,
  isSolved: boolean,
  mistakes: number,
) {
  const solvedLogged = useRef(false);
  useEffect(() => {
    log.info("Puzzle started", { ...meta, size });
  }, [log, meta, size]);

  useEffect(() => {
    if (!isSolved || solvedLogged.current) return;
    solvedLogged.current = true;
    log.info("Puzzle solved", { ...meta, mistakes });
  }, [isSolved, log, meta, mistakes]);
}

function useGuzzleBoardLogic(answer: readonly string[], game: Game, size: number) {
  const [hint, setHint] = useState<GraduatedHintType | null>(null);
  const [logicExplanation, setLogicExplanation] = useState<LogicExplanation | null>(null);

  function handleHintRequest(): boolean {
    if (hint) {
      setHint({ ...hint, tier: advanceTier(hint.tier) });
      return false;
    }
    const nextHint = createGuzzleHint(answer, game.guesses, size, game.selected, "nudge");
    setHint(nextHint ?? null);
    return nextHint !== undefined;
  }

  function handleShowLogic() {
    const explanation = explainGuzzleLogic(answer, game.guesses, size, game.selected);
    setLogicExplanation(explanation ?? null);
  }

  return {
    hint,
    setHint,
    logicExplanation,
    setLogicExplanation,
    handleHintRequest,
    handleShowLogic,
  };
}

type GuzzleActionsParams = {
  puzzle: GuzzlePuzzle;
  game: Game;
  recordedSolvedRef: { current: boolean };
  savedRecordRef: { current: PuzzleProgressRecord | null };
  hintCountRef: { current: number };
  startTimeRef: { current: number };
  setShowReview: (s: boolean) => void;
  setStats: (s: CompletionStats | null) => void;
  logic: ReturnType<typeof useGuzzleBoardLogic>;
};

function useGuzzleActions(p: GuzzleActionsParams) {
  function handleRestart() {
    p.recordedSolvedRef.current = false;
    p.savedRecordRef.current = null;
    p.hintCountRef.current = 0;
    p.startTimeRef.current = Date.now();
    p.game.restart();
    p.setShowReview(false);
    p.setStats(null);
    p.logic.setHint(null);
    p.logic.setLogicExplanation(null);
  }

  return {
    onHintRequest: () => {
      if (p.logic.handleHintRequest()) {
        p.hintCountRef.current += 1;
        saveGuzzleHintProgress({
          puzzle: p.puzzle,
          guesses: p.game.guesses,
          mode: p.game.mode,
          mistakes: p.game.mistakes,
          hintCount: p.hintCountRef.current,
          timeSpentSeconds: computeGuzzleElapsedSeconds(p.startTimeRef.current),
        });
      }
    },
    onShowLogic: p.logic.handleShowLogic,
    onTierChange: (tier: HintTier) =>
      p.logic.hint ? p.logic.setHint({ ...p.logic.hint, tier }) : undefined,
    onDismissHint: () => p.logic.setHint(null),
    onCloseLogic: () => p.logic.setLogicExplanation(null),
    onRestart: handleRestart,
    onOpenReview: () => p.setShowReview(true),
    onCloseReview: () => p.setShowReview(false),
  };
}

function useGuzzleTelemetryRefs(puzzleId: string) {
  const [initialSaved] = useState(() => loadPuzzleProgress(puzzleId));
  const savedRecordRef = useRef<PuzzleProgressRecord | null>(initialSaved);
  const hintCountRef = useRef(initialSaved?.hintCount ?? 0);
  const startTimeRef = useGuzzleStartTime(initialSaved?.timeSpentSeconds ?? 0);
  const getTelemetry = () => ({
    timeSpentSeconds: computeGuzzleElapsedSeconds(startTimeRef.current),
    hintCount: hintCountRef.current,
  });
  return { initialSaved, savedRecordRef, hintCountRef, startTimeRef, getTelemetry };
}

function useGuzzleGame(puzzle: GuzzlePuzzle): GuzzleBoardViewProps {
  const answer = toSquares(puzzle.answer);
  const size = puzzle.answer.length;
  const log = getLogger("game.guzzle");
  const meta: Meta = {
    puzzleId: puzzle.id,
    puzzleType: puzzle.type,
    difficulty: puzzle.difficulty,
  };
  const refs = useGuzzleTelemetryRefs(puzzle.id);
  const game = useGame(answer, size, createHooks(log, meta, refs.getTelemetry), puzzle.id);
  const recordedSolvedRef = useRef(Boolean(refs.initialSaved?.isSolved && game.isSolved));
  const [showReview, setShowReview] = useState(false);
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const logic = useGuzzleBoardLogic(answer, game, size);
  const sharedParams = { ...refs, recordedSolvedRef, setShowReview, setStats, puzzle };

  useGuzzleSolvedSync({ ...sharedParams, isSolved: game.isSolved, mistakes: game.mistakes });
  useLifecycleLog(log, meta, size, game.isSolved, game.mistakes);
  const actions = useGuzzleActions({ ...sharedParams, game, logic });

  return {
    answer,
    size,
    game,
    hint: logic.hint,
    logicExplanation: logic.logicExplanation,
    completionStats: stats,
    showReview,
    actions,
  };
}

// ASD-STE100 Simplified Technical English comments.
// The board manages state, lifecycle, and renders GuzzleBoardView.
export function Board({ puzzle }: { puzzle: GuzzlePuzzle }) {
  const game = useGuzzleGame(puzzle);
  return <GuzzleBoardView {...game} />;
}
