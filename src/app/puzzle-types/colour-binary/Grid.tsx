import shared from "../../../shared/Board.module.css";
import type { GraduatedHint } from "../../../shared/graduated-hints";
import { gridStyle } from "../../../shared/grid";
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
  isSolved: boolean;
  onTap: () => void;
};

// Each square is a button so the user can tap a cell and cycle its colour.
function SquareButton({
  square,
  index,
  size,
  isFixed,
  isHint,
  isHighlighted,
  isSolved,
  onTap,
}: SquareProps) {
  const label = words.square({
    row: Math.floor(index / size) + 1,
    column: (index % size) + 1,
    colour: words.colours[square],
    isFixed,
  });
  return (
    <button
      type="button"
      className={`${shared.square} ${styles.square}`}
      data-colour={square}
      data-fixed={isFixed}
      data-hint={isHint}
      data-highlight={isHighlighted}
      aria-label={label}
      aria-disabled={isFixed || isSolved}
      onClick={() => {
        if (!isFixed && !isSolved) onTap();
      }}
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
  isSolved: boolean;
  onTapSquare: (square: Square, index: number) => void;
};

// The grid shows all square buttons in rows and columns.
export function BoardGrid({ size, squares, start, hint, isSolved, onTapSquare }: GridProps) {
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
            isSolved={isSolved}
            onTap={() => onTapSquare(square, index)}
          />
        ))}
      </div>
    </fieldset>
  );
}
