import shared from "../../../shared/Board.module.css";
import { BoardActions } from "../../../shared/BoardActions";
import {
  CompletionReview,
  GraduatedHint,
  LogicExplanationModal,
} from "../../../shared/GraduatedHint";
import {
  getHintTierText,
  type GraduatedHint as GraduatedHintType,
  type HintTier,
  type LogicExplanation,
} from "../../../shared/graduated-hints";
import { generateColourBinaryPostcard } from "../../../shared/postcard";
import type { CompletionStats } from "../../../shared/puzzle-progress";
import { text } from "../../../text/en";
import { BoardGrid } from "./Grid";
import { ParityTelemetry } from "./ParityTelemetry";
import type { Square } from "./puzzle";

// ASD-STE100 Simplified Technical English comments.
// This component renders the complete view of the Colour Binary board and dialogs.

const words = text["colour-binary"];

function statusText(isSolved: boolean, hint: GraduatedHintType | undefined | null): string {
  if (isSolved) return words.status.solved;
  if (!hint) return hint === null ? words.status.start : words.noHint;
  return getHintTierText(hint, hint.tier);
}

export type BoardActionsProps = {
  onTapSquare: (square: Square, index: number, specificNext?: Square) => void;
  onHintRequest: () => void;
  onShowLogic: () => void;
  onCloseLogic: () => void;
  onTierChange: (tier: HintTier) => void;
  onDismissHint: () => void;
  onRestart: () => void;
  onOpenReview: () => void;
  onCloseReview: () => void;
};

export type BoardViewProps = {
  size: number;
  squares: Square[];
  start: Square[];
  hint: GraduatedHintType | undefined | null;
  logicExplanation: LogicExplanation | null;
  isSolved: boolean;
  completionStats: CompletionStats | null;
  showReview: boolean;
  actions: BoardActionsProps;
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

function getColourBinaryPostcard(props: BoardViewProps): string | undefined {
  if (!props.completionStats) return undefined;
  return generateColourBinaryPostcard({
    puzzleId: props.completionStats.puzzleId,
    difficulty: props.completionStats.difficulty,
    timeSpentSeconds: props.completionStats.timeSpentSeconds,
    hintCount: props.completionStats.hintCount,
    squares: props.squares,
    size: props.size,
  });
}

function BoardModals({ props, postcardText }: { props: BoardViewProps; postcardText?: string }) {
  const { actions, completionStats } = props;
  return (
    <>
      {props.logicExplanation && (
        <LogicExplanationModal
          explanation={props.logicExplanation}
          onClose={actions.onCloseLogic}
        />
      )}
      <SolvedReviewModal
        show={props.showReview}
        stats={completionStats}
        postcardText={postcardText}
        onRestart={actions.onRestart}
        onClose={actions.onCloseReview}
      />
    </>
  );
}

export function BoardView(props: BoardViewProps) {
  const { actions } = props;
  const postcardText = getColourBinaryPostcard(props);

  return (
    <div className={shared.game}>
      <ParityTelemetry size={props.size} squares={props.squares} />
      <BoardGrid
        size={props.size}
        squares={props.squares}
        start={props.start}
        hint={props.hint}
        logicExplanation={props.logicExplanation}
        isSolved={props.isSolved}
        onTapSquare={actions.onTapSquare}
      />
      <output aria-live="polite" className={shared.status} data-solved={props.isSolved}>
        {statusText(props.isSolved, props.hint)}
      </output>
      {props.hint && (
        <GraduatedHint
          hint={props.hint}
          onTierChange={actions.onTierChange}
          onDismiss={actions.onDismissHint}
        />
      )}
      <BoardActions
        hintLabel={words.hintButton}
        isSolved={props.isSolved}
        onHintRequest={actions.onHintRequest}
        onShowLogic={actions.onShowLogic}
        onRestart={actions.onRestart}
        onOpenReview={actions.onOpenReview}
      />
      <BoardModals props={props} postcardText={postcardText} />
    </div>
  );
}
