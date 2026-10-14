import { useEffect, useRef } from "react";
import shared from "../../../shared/Board.module.css";
import { gridStyle } from "../../../shared/grid";
import { text } from "../../../text/en";
import styles from "./Board.module.css";
import { isPlayable, type Guess } from "./rules-check";
import type { Game } from "./useGame";

const words = text.guzzle;

// ASD-STE100 Simplified Technical English comments.
// Focus a square when selected by the player.
function useFocusWhenSelected(isSelected: boolean) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isSelected && ref.current && document.activeElement !== ref.current) {
      ref.current.focus();
    }
  }, [isSelected]);
  return ref;
}

type SquareProps = {
  label: string;
  letter: string;
  guess: Guess | undefined;
  isFixed?: boolean;
  isSelected?: boolean;
  isHint?: boolean;
  isHighlighted?: boolean;
  isLogicTarget?: boolean;
  isLogicPremise?: boolean;
  isLocked: boolean;
  onSelect?: () => void;
  onLetter?: (letter: string) => void;
};

// Each square on a word is a button. The player selects a square and then types a letter.
function SquareButton({
  label,
  letter,
  guess,
  isFixed = false,
  isSelected = false,
  isHint = false,
  isHighlighted = false,
  isLogicTarget = false,
  isLogicPremise = false,
  isLocked,
  onSelect,
  onLetter,
}: SquareProps) {
  const ref = useFocusWhenSelected(isSelected);

  return (
    <button
      ref={ref}
      type="button"
      className={`${shared.square} ${styles.square}`}
      data-mark={guess?.mark ?? "none"}
      data-fixed={isFixed}
      data-selected={isSelected}
      data-hint={isHint}
      data-highlight={isHighlighted}
      data-logic-target={isLogicTarget}
      data-logic-premise={isLogicPremise}
      aria-label={label}
      aria-pressed={isFixed ? undefined : isSelected}
      aria-disabled={isLocked}
      onClick={() => {
        if (!isLocked) onSelect?.();
      }}
      onKeyDown={(event) => {
        if (!isLocked && event.key.length === 1 && /^[a-zA-Z]$/u.test(event.key)) {
          onLetter?.(event.key.toUpperCase());
        }
      }}
    >
      <span aria-hidden="true">{letter}</span>
      {guess?.mark && !isFixed && (
        <span className={styles.symbol} aria-hidden="true">
          {words.symbols[guess.mark]}
        </span>
      )}
    </button>
  );
}

type LogicCues = {
  targetIndex: number;
  premises: readonly { index: number }[];
} | null;

type GameProps = {
  answer: readonly string[];
  size: number;
  game: Game;
  hint?: { index: number; highlightIndices: readonly number[] } | null;
  logicExplanation?: LogicCues;
};

// One square of the grid: the fixed center letter, a square on a word or a gap.
function GridSquare({
  answer,
  size,
  game,
  hint,
  logicExplanation,
  index,
}: GameProps & { index: number }) {
  const isCenter = index === (size * size - 1) / 2;
  if (!isCenter && !isPlayable(index, size)) {
    return <span className={styles.gap} aria-hidden="true" />;
  }
  const guess = isCenter ? undefined : game.guesses[index];
  const letter = isCenter ? (answer[index] ?? "") : (guess?.letter ?? "");
  const label = words.square({
    row: Math.floor(index / size) + 1,
    column: (index % size) + 1,
    letter,
    mark: guess ? words.marks[guess.mark] : "",
    isFixed: isCenter,
  });
  return (
    <SquareButton
      label={label}
      letter={letter}
      guess={guess}
      isFixed={isCenter}
      isSelected={game.selected === index}
      isHint={hint?.index === index}
      isHighlighted={Boolean(hint?.highlightIndices.includes(index) && hint.index !== index)}
      isLogicTarget={logicExplanation?.targetIndex === index}
      isLogicPremise={Boolean(logicExplanation?.premises.some((p) => p.index === index))}
      isLocked={isCenter || game.mode === null || game.isSolved || guess?.mark === "correct"}
      onSelect={() => {
        game.setSelected(index);
      }}
      onLetter={game.putLetter}
    />
  );
}

// The grid shows all squares in rows and columns.
export function Grid({ answer, size, game, hint, logicExplanation }: GameProps) {
  return (
    <div className={shared.grid} style={gridStyle(size)}>
      {answer.map((_, index) => (
        <GridSquare
          // oxlint-disable-next-line react/no-array-index-key -- the index is the identity of a square. The squares never move.
          key={index}
          answer={answer}
          size={size}
          game={game}
          hint={hint}
          logicExplanation={logicExplanation}
          index={index}
        />
      ))}
    </div>
  );
}
