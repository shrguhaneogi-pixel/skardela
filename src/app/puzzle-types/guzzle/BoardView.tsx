import shared from "../../../shared/Board.module.css";
import { BoardActions } from "../../../shared/BoardActions";
import {
  AnimatePresence,
  CompletionReview,
  GraduatedHint,
  LogicExplanationModal,
  type GraduatedHintData,
  type HintTier,
  type LogicExplanation,
} from "../../../shared/GraduatedHint";
import { generateGuzzlePostcard } from "../../../shared/postcard";
import type { CompletionStats } from "../../../shared/puzzle-progress";
import { text } from "../../../text/en";
import { Controls } from "./Controls";
import { Grid } from "./Grid";
import { WordProgressTelemetry } from "./WordProgressTelemetry";
import { statusText, type Game } from "./useGame";

// ASD-STE100 Simplified Technical English comments.
// This component renders the Guzzle puzzle board, grid, hints, and completion review.

const words = text.guzzle;

export type GuzzleBoardActionsProps = {
  onHintRequest: () => void;
  onShowLogic: () => void;
  onTierChange: (tier: HintTier) => void;
  onDismissHint: () => void;
  onCloseLogic: () => void;
  onRestart: () => void;
  onOpenReview: () => void;
  onCloseReview: () => void;
};

export type GuzzleBoardViewProps = {
  answer: readonly string[];
  size: number;
  game: Game;
  hint: GraduatedHintData | null;
  logicExplanation: LogicExplanation | null;
  completionStats: CompletionStats | null;
  showReview: boolean;
  actions: GuzzleBoardActionsProps;
};

function getGuzzlePostcard(props: GuzzleBoardViewProps): string | undefined {
  if (!props.completionStats) return undefined;
  return generateGuzzlePostcard({
    puzzleId: props.completionStats.puzzleId,
    mode: props.game.mode ? text.guzzle.modes[props.game.mode] : undefined,
    timeSpentSeconds: props.completionStats.timeSpentSeconds,
    hintCount: props.completionStats.hintCount,
    mistakes: props.completionStats.mistakes,
    guesses: props.game.guesses,
    size: props.size,
  });
}

function BoardStatusOutput({ game, size }: { game: Game; size: number }) {
  return (
    <>
      <output aria-live="polite" className={shared.mistakes}>
        {words.mistakes(game.mistakes)}
      </output>
      <output aria-live="polite" className={shared.status} data-solved={game.isSolved}>
        {statusText(game.mode, game.lastMove, game.isSolved, game.mistakes, size)}
      </output>
    </>
  );
}

function GuzzleBoardModals({
  props,
  postcardText,
}: {
  props: GuzzleBoardViewProps;
  postcardText?: string;
}) {
  const { actions, completionStats, logicExplanation, showReview } = props;
  return (
    <AnimatePresence>
      {logicExplanation && (
        <LogicExplanationModal
          key="guzzle-logic-modal"
          explanation={logicExplanation}
          onClose={actions.onCloseLogic}
        />
      )}
      {showReview && completionStats && (
        <CompletionReview
          key="guzzle-completion-modal"
          stats={completionStats}
          postcardText={postcardText}
          onRestart={actions.onRestart}
          onClose={actions.onCloseReview}
        />
      )}
    </AnimatePresence>
  );
}

export function GuzzleBoardView(props: GuzzleBoardViewProps) {
  const { answer, size, game, hint, logicExplanation, actions } = props;
  const postcardText = getGuzzlePostcard(props);

  return (
    <div className={shared.game}>
      {game.mode !== null && (
        <WordProgressTelemetry size={size} guesses={game.guesses} selected={game.selected} />
      )}
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
      <BoardStatusOutput game={game} size={size} />
      <AnimatePresence>
        {hint && (
          <GraduatedHint
            key="graduated-hint"
            hint={hint}
            onTierChange={actions.onTierChange}
            onDismiss={actions.onDismissHint}
          />
        )}
      </AnimatePresence>
      {game.mode !== null && (
        <BoardActions
          hintLabel={words.hintButton}
          isSolved={game.isSolved}
          onHintRequest={actions.onHintRequest}
          onShowLogic={actions.onShowLogic}
          onRestart={actions.onRestart}
          onOpenReview={actions.onOpenReview}
        />
      )}
      <GuzzleBoardModals props={props} postcardText={postcardText} />
      <Controls answer={answer} game={game} />
    </div>
  );
}
