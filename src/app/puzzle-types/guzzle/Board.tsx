import { useEffect, useRef, useState } from "react";
import shared from "../../../shared/Board.module.css";
import {
  advanceTier,
  createGuzzleHint,
  explainGuzzleLogic,
  type GraduatedHint as GraduatedHintType,
  type HintTier,
  type LogicExplanation,
} from "../../../shared/graduated-hints";
import { GraduatedHint, LogicExplanationModal } from "../../../shared/GraduatedHint";
import { getLogger } from "../../../shared/logger";
import { text } from "../../../text/en";
import { Controls } from "./Controls";
import { Grid } from "./Grid";
import { toSquares, type GuzzlePuzzle } from "./puzzle";
import { statusText, useGame, type Game } from "./useGame";

const words = text.guzzle;
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

type ActionProps = {
  hasMode: boolean;
  isSolved: boolean;
  onRequestHint: () => void;
  onShowLogic: () => void;
};

function BoardActions({ hasMode, isSolved, onRequestHint, onShowLogic }: ActionProps) {
  if (!hasMode) return null;
  return (
    <div className={shared.actionsRow}>
      <button
        type="button"
        className={`${shared.button} ${shared.boxed}`}
        disabled={isSolved}
        onClick={onRequestHint}
      >
        {words.hintButton}
      </button>
      <button
        type="button"
        className={`${shared.button} ${shared.boxed}`}
        disabled={isSolved}
        onClick={onShowLogic}
      >
        {text.logicExplanation.button}
      </button>
    </div>
  );
}

type ViewProps = {
  answer: readonly string[];
  size: number;
  game: Game;
  hint: GraduatedHintType | null;
  logicExplanation: LogicExplanation | null;
  onHintRequest: () => void;
  onShowLogic: () => void;
  onTierChange: (tier: HintTier) => void;
  onDismissHint: () => void;
  onCloseLogic: () => void;
};

function GuzzleBoardView(props: ViewProps) {
  const { answer, size, game, hint, logicExplanation } = props;
  return (
    <div className={shared.game}>
      <fieldset className={shared.board}>
        <legend className="visually-hidden">{words.boardLabel}</legend>
        <Grid
          answer={answer}
          size={size}
          game={game}
          hint={hint}
          logicExplanation={logicExplanation}
        />
      </fieldset>
      <output className={shared.mistakes}>{words.mistakes(game.mistakes)}</output>
      <output className={shared.status} data-solved={game.isSolved}>
        {statusText(game.mode, game.lastMove, game.isSolved, game.mistakes, size)}
      </output>
      {hint && (
        <GraduatedHint
          hint={hint}
          onTierChange={props.onTierChange}
          onDismiss={props.onDismissHint}
        />
      )}
      <BoardActions
        hasMode={game.mode !== null}
        isSolved={game.isSolved}
        onRequestHint={props.onHintRequest}
        onShowLogic={props.onShowLogic}
      />
      {logicExplanation && (
        <LogicExplanationModal explanation={logicExplanation} onClose={props.onCloseLogic} />
      )}
      <Controls answer={answer} game={game} />
    </div>
  );
}

// ASD-STE100 Simplified Technical English comments.
// The board shows the grid, mistake count, status text, graduated hints, and controls.
export function Board({ puzzle }: { puzzle: GuzzlePuzzle }) {
  const answer = toSquares(puzzle.answer);
  const size = puzzle.answer.length;
  const log = getLogger("game.guzzle");
  const meta: Meta = {
    puzzleId: puzzle.id,
    puzzleType: puzzle.type,
    difficulty: puzzle.difficulty,
  };
  const game = useGame(answer, size, createHooks(log, meta), puzzle.id);
  const {
    hint,
    setHint,
    logicExplanation,
    setLogicExplanation,
    handleHintRequest,
    handleShowLogic,
  } = useGuzzleBoardLogic(answer, game, size);
  useLifecycleLog(log, meta, size, game.isSolved, game.mistakes);

  return (
    <GuzzleBoardView
      answer={answer}
      size={size}
      game={game}
      hint={hint}
      logicExplanation={logicExplanation}
      onHintRequest={handleHintRequest}
      onShowLogic={handleShowLogic}
      onTierChange={(tier) => (hint ? setHint({ ...hint, tier }) : undefined)}
      onDismissHint={() => setHint(null)}
      onCloseLogic={() => setLogicExplanation(null)}
    />
  );
}
