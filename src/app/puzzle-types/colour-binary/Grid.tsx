import shared from "../../../shared/Board.module.css";
import type { GraduatedHint } from "../../../shared/graduated-hints";
import { gridStyle } from "../../../shared/grid";
import type { LogicExplanation } from "../../../shared/logic-explainer";
import { text } from "../../../text/en";
import styles from "./Board.module.css";
import type { Square } from "./puzzle";

// ASD-STE100 Simplified Technical English comments.
// This file renders the square buttons and the grid for the Colour Binary board.

const words = text["colour-binary"];

type SquareProps = {
  square: Square;
  index: number;
  size: number;
  isFixed: boolean;
  isHint: boolean;
  isHighlighted: boolean;
  isConflict: boolean;
  isLogicTarget: boolean;
  isLogicPremise: boolean;
  isSolved: boolean;
  onTap: (specificColour?: Square) => void;
};

function getArrowTargetIndex(key: string, index: number, size: number): number | null {
  if (key === "ArrowRight" && index % size < size - 1) return index + 1;
  if (key === "ArrowLeft" && index % size > 0) return index - 1;
  if (key === "ArrowDown" && index + size < size * size) return index + size;
  if (key === "ArrowUp" && index - size >= 0) return index - size;
  return null;
}

function getColourBinaryLabel(
  index: number,
  size: number,
  square: Square,
  isFixed: boolean,
  isConflict: boolean,
  isHint: boolean,
  isLogicTarget: boolean,
  isLogicPremise: boolean,
): string {
  let label = words.square({
    row: Math.floor(index / size) + 1,
    column: (index % size) + 1,
    colour: words.colours[square],
    isFixed,
  });
  if (isConflict) label += " (Conflict)";
  if (isHint) label += " (Hint target)";
  if (isLogicTarget) label += " (Logic target)";
  if (isLogicPremise) label += " (Logic premise)";
  return label;
}

function handleSquareKeyDown(
  e: React.KeyboardEvent<HTMLButtonElement>,
  index: number,
  size: number,
  isFixed: boolean,
  isSolved: boolean,
  onTap: (colour?: Square) => void,
) {
  const target = getArrowTargetIndex(e.key, index, size);
  if (target !== null) {
    e.preventDefault();
    const parent = e.currentTarget.parentElement;
    const targetBtn = parent?.children[target] as HTMLButtonElement | undefined;
    targetBtn?.focus();
    return;
  }
  if (isFixed || isSolved) return;
  if (e.key === "r" || e.key === "R") {
    e.preventDefault();
    onTap("R");
  } else if (e.key === "b" || e.key === "B") {
    e.preventDefault();
    onTap("B");
  } else if (e.key === "Backspace" || e.key === "Delete") {
    e.preventDefault();
    onTap(".");
  }
}

// Each square is a button so the user can tap a cell and cycle its colour.
function SquareButton(props: SquareProps) {
  const {
    square,
    index,
    size,
    isFixed,
    isHint,
    isHighlighted,
    isConflict,
    isLogicTarget,
    isLogicPremise,
    isSolved,
    onTap,
  } = props;
  const label = getColourBinaryLabel(
    index,
    size,
    square,
    isFixed,
    isConflict,
    isHint,
    isLogicTarget,
    isLogicPremise,
  );

  return (
    <button
      type="button"
      className={`${shared.square} ${styles.square}`}
      data-colour={square}
      data-fixed={isFixed}
      data-hint={isHint}
      data-highlight={isHighlighted}
      data-conflict={isConflict}
      data-logic-target={isLogicTarget}
      data-logic-premise={isLogicPremise}
      aria-label={label}
      aria-disabled={isFixed || isSolved}
      onClick={() => {
        if (!isFixed && !isSolved) onTap();
      }}
      onKeyDown={(e) => handleSquareKeyDown(e, index, size, isFixed, isSolved, onTap)}
    >
      <span aria-hidden="true">{words.symbols[square]}</span>
    </button>
  );
}

type GridProps = {
  size: number;
  squares: Square[];
  start: Square[];
  hint: GraduatedHint | undefined | null;
  logicExplanation?: LogicExplanation | null;
  isSolved: boolean;
  onTapSquare: (square: Square, index: number, specificNext?: Square) => void;
};

// The grid shows all square buttons in rows and columns.
export function BoardGrid({
  size,
  squares,
  start,
  hint,
  logicExplanation,
  isSolved,
  onTapSquare,
}: GridProps) {
  return (
    <fieldset className={shared.board}>
      <legend className="visually-hidden">{words.boardLabel}</legend>
      <div className={shared.grid} style={gridStyle(size)}>
        {squares.map((square, index) => (
          <SquareButton
            // oxlint-disable-next-line react/no-array-index-key -- the index is the identity of a square. The squares never move.
            key={index}
            square={square}
            index={index}
            size={size}
            isFixed={start[index] !== "."}
            isHint={hint?.index === index}
            isHighlighted={Boolean(hint?.highlightIndices.includes(index) && hint.index !== index)}
            isConflict={Boolean(hint?.isConflict && hint.highlightIndices.includes(index))}
            isLogicTarget={logicExplanation?.targetIndex === index}
            isLogicPremise={Boolean(logicExplanation?.premises.some((p) => p.index === index))}
            isSolved={isSolved}
            onTap={(colour) => onTapSquare(square, index, colour)}
          />
        ))}
      </div>
    </fieldset>
  );
}
