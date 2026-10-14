import shared from "../../../shared/Board.module.css";
import {
  CompletionReview,
  GraduatedHint,
  LogicExplanationModal,
} from "../../../shared/GraduatedHint";
import type {
  GraduatedHint as GraduatedHintType,
  HintTier,
  LogicExplanation,
} from "../../../shared/graduated-hints";
import { generateGuzzlePostcard } from "../../../shared/postcard";
import type { CompletionStats } from "../../../shared/puzzle-progress";
import { text } from "../../../text/en";
import { Controls } from "./Controls";
import { Grid } from "./Grid";
import { statusText, type Game } from "./useGame";

// ASD-STE100 Simplified Technical English comments.
// This component renders the Guzzle puzzle board, grid, hints, and completion review.

const words = text.guzzle;

type ActionProps = {
  hasMode: boolean;
  isSolved: boolean;
  onHintRequest: () => void;
  onShowLogic: () => void;
  onOpenReview?: () => void;
};

function BoardActions(props: ActionProps) {
  if (!props.hasMode) return null;
  return (
    <div className={shared.actionsRow}>
      <button
        type="button"
        className={`${shared.button} ${shared.boxed}`}
        disabled={props.isSolved}
        onClick={props.onHintRequest}
      >
        {words.hintButton}
      </button>
      <button
        type="button"
        className={`${shared.button} ${shared.boxed}`}
        disabled={props.isSolved}
        onClick={props.onShowLogic}
      >
        {text.logicExplanation.button}
      </button>
      {props.isSolved && props.onOpenReview && (
        <button
          type="button"
          className={`${shared.button} ${shared.boxed}`}
          onClick={props.onOpenReview}
        >
          {text.completion.openSummary}
        </button>
      )}
    </div>
  );
}

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
  hint: GraduatedHintType | null;
  logicExplanation: LogicExplanation | null;
  completionStats: CompletionStats | null;
  showReview: boolean;
  actions: GuzzleBoardActionsProps;
};

type ReviewModalProps = {
  show: boolean;
  stats: CompletionStats | null;
  postcardText?: string;
  onRestart: () => void;
  onClose: () => void;
};

function SolvedReviewModal(props: ReviewModalProps) {
  if (!props.show || !props.stats) return null;
  return (
    <CompletionReview
      stats={props.stats}
      postcardText={props.postcardText}
      onRestart={props.onRestart}
      onClose={props.onClose}
    />
  );
}

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

export function GuzzleBoardView(props: GuzzleBoardViewProps) {
  const { answer, size, game, hint, logicExplanation, actions, completionStats } = props;
  const postcardText = getGuzzlePostcard(props);

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
          onTierChange={actions.onTierChange}
          onDismiss={actions.onDismissHint}
        />
      )}
      <BoardActions
        hasMode={game.mode !== null}
        isSolved={game.isSolved}
        onHintRequest={actions.onHintRequest}
        onShowLogic={actions.onShowLogic}
        onOpenReview={actions.onOpenReview}
      />
      {logicExplanation && (
        <LogicExplanationModal explanation={logicExplanation} onClose={actions.onCloseLogic} />
      )}
      <SolvedReviewModal
        show={props.showReview}
        stats={completionStats}
        postcardText={postcardText}
        onRestart={actions.onRestart}
        onClose={actions.onCloseReview}
      />
      <Controls answer={answer} game={game} />
    </div>
  );
}
