import { useEffect, useRef, useState } from "react";
import shared from "../../../shared/Board.module.css";
import {
  advanceTier,
  createGuzzleHint,
  type GraduatedHint as GraduatedHintType,
} from "../../../shared/graduated-hints";
import { GraduatedHint } from "../../../shared/GraduatedHint";
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

function useGuzzleHint(answer: readonly string[], game: Game, size: number) {
  const [hint, setHint] = useState<GraduatedHintType | null>(null);

  function handleHintRequest() {
    if (hint) {
      setHint({ ...hint, tier: advanceTier(hint.tier) });
      return;
    }
    const nextHint = createGuzzleHint(answer, game.guesses, size, game.selected, "nudge");
    setHint(nextHint ?? null);
  }

  return { hint, setHint, handleHintRequest };
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
  const { hint, setHint, handleHintRequest } = useGuzzleHint(answer, game, size);
  useLifecycleLog(log, meta, size, game.isSolved, game.mistakes);

  return (
    <div className={shared.game}>
      <fieldset className={shared.board}>
        <legend className="visually-hidden">{words.boardLabel}</legend>
        <Grid answer={answer} size={size} game={game} hint={hint} />
      </fieldset>

      <output className={shared.mistakes}>{words.mistakes(game.mistakes)}</output>

      <output className={shared.status} data-solved={game.isSolved}>
        {statusText(game.mode, game.lastMove, game.isSolved, game.mistakes, size)}
      </output>

      {hint && (
        <GraduatedHint
          hint={hint}
          onTierChange={(tier) => setHint({ ...hint, tier })}
          onDismiss={() => setHint(null)}
        />
      )}

      {game.mode !== null && (
        <button
          type="button"
          className={`${shared.button} ${shared.boxed}`}
          disabled={game.isSolved}
          onClick={handleHintRequest}
        >
          {words.hintButton}
        </button>
      )}

      <Controls answer={answer} game={game} />
    </div>
  );
}
