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
import { calculateCompletionStats, type CompletionStats } from "../../../shared/puzzle-progress";
import { GuzzleBoardView, type GuzzleBoardViewProps } from "./BoardView";
import { toSquares, useGame, type Game, type GuzzlePuzzle } from "./useGame";

type Meta = {
  puzzleId: string;
  puzzleType: GuzzlePuzzle["type"];
  difficulty: GuzzlePuzzle["difficulty"];
};
type Hooks = NonNullable<Parameters<typeof useGame>[2]>;
type ModeArg = Parameters<NonNullable<Hooks["onModeChosen"]>>[0];
type LetterEntry = Parameters<NonNullable<Hooks["onLetterPlaced"]>>[0];

function createHooks(log: ReturnType<typeof getLogger>, meta: Meta): Hooks {
  return {
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

  function handleHintRequest() {
    if (hint) {
      setHint({ ...hint, tier: advanceTier(hint.tier) });
      return;
    }
    const nextHint = createGuzzleHint(answer, game.guesses, size, game.selected, "nudge");
    setHint(nextHint ?? null);
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

function useGuzzleSolvedSync(
  puzzle: GuzzlePuzzle,
  isSolved: boolean,
  mistakes: number,
  hintCountRef: { current: number },
  startTimeRef: { current: number },
  setStats: (stats: CompletionStats) => void,
  setShowReview: (show: boolean) => void,
) {
  useEffect(() => {
    if (!isSolved) return;
    const start = startTimeRef.current > 0 ? startTimeRef.current : Date.now();
    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - start) / 1000));
    const completionStats = calculateCompletionStats({
      puzzleId: puzzle.id,
      puzzleType: puzzle.type,
      difficulty: puzzle.difficulty,
      timeSpentSeconds,
      hintCount: hintCountRef.current,
      mistakes,
    });
    setStats(completionStats);
    setShowReview(true);
  }, [
    isSolved,
    mistakes,
    puzzle.difficulty,
    puzzle.id,
    puzzle.type,
    hintCountRef,
    startTimeRef,
    setStats,
    setShowReview,
  ]);
}

function useGuzzleActions(
  game: Game,
  hintCountRef: { current: number },
  startTimeRef: { current: number },
  setShowReview: (s: boolean) => void,
  setStats: (s: CompletionStats | null) => void,
  logic: ReturnType<typeof useGuzzleBoardLogic>,
) {
  function handleRestart() {
    game.restart();
    hintCountRef.current = 0;
    startTimeRef.current = Date.now();
    setShowReview(false);
    setStats(null);
    logic.setHint(null);
    logic.setLogicExplanation(null);
  }

  return {
    onHintRequest: () => {
      hintCountRef.current += 1;
      logic.handleHintRequest();
    },
    onShowLogic: logic.handleShowLogic,
    onTierChange: (tier: HintTier) =>
      logic.hint ? logic.setHint({ ...logic.hint, tier }) : undefined,
    onDismissHint: () => logic.setHint(null),
    onCloseLogic: () => logic.setLogicExplanation(null),
    onRestart: handleRestart,
    onOpenReview: () => setShowReview(true),
    onCloseReview: () => setShowReview(false),
  };
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
  const game = useGame(answer, size, createHooks(log, meta), puzzle.id);
  const logic = useGuzzleBoardLogic(answer, game, size);
  const hintCountRef = useRef(0);
  const startTimeRef = useRef(0);
  const [showReview, setShowReview] = useState(false);
  const [stats, setStats] = useState<CompletionStats | null>(null);

  useEffect(() => {
    if (startTimeRef.current === 0) startTimeRef.current = Date.now();
  }, []);

  useGuzzleSolvedSync(
    puzzle,
    game.isSolved,
    game.mistakes,
    hintCountRef,
    startTimeRef,
    setStats,
    setShowReview,
  );
  useLifecycleLog(log, meta, size, game.isSolved, game.mistakes);
  const actions = useGuzzleActions(
    game,
    hintCountRef,
    startTimeRef,
    setShowReview,
    setStats,
    logic,
  );

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
