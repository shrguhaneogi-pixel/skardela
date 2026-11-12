import { Award, BookOpen, Lightbulb, RotateCcw } from "lucide-react";
import { text } from "../text/en";
import shared from "./Board.module.css";
import { Button } from "./ui/Button";

// ASD-STE100 Simplified Technical English comments.
// Render the shared action bar for puzzle boards.

type BoardActionsProps = {
  hintLabel: string;
  isSolved: boolean;
  onHintRequest: () => void;
  onShowLogic: () => void;
  onRestart: () => void;
  onOpenReview?: () => void;
};

export function BoardActions(props: BoardActionsProps) {
  return (
    <div className={shared.actionsRow}>
      <Button variant="secondary" size="sm" disabled={props.isSolved} onClick={props.onHintRequest}>
        <Lightbulb size={15} aria-hidden="true" />
        {props.hintLabel}
      </Button>
      <Button variant="secondary" size="sm" disabled={props.isSolved} onClick={props.onShowLogic}>
        <BookOpen size={15} aria-hidden="true" />
        {text.logicExplanation.button}
      </Button>
      <Button variant="secondary" size="sm" onClick={props.onRestart}>
        <RotateCcw size={15} aria-hidden="true" />
        {text.puzzlePage.restartButton}
      </Button>
      {props.isSolved && props.onOpenReview && (
        <Button variant="accentTint" size="sm" onClick={props.onOpenReview}>
          <Award size={15} aria-hidden="true" />
          {text.completion.openSummary}
        </Button>
      )}
    </div>
  );
}
