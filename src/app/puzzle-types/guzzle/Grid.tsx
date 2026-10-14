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

function findNextPlayable(
  currentIndex: number,
  deltaRow: number,
  deltaCol: number,
  size: number,
): number | null {
  let r = Math.floor(currentIndex / size) + deltaRow;
  let c = (currentIndex % size) + deltaCol;
  while (r >= 0 && r < size && c >= 0 && c < size) {
    const idx = r * size + c;
    if (isPlayable(idx, size)) return idx;
    r += deltaRow;
    c += deltaCol;
  }
  return null;
}

function getGuzzleArrowTarget(key: string, index: number, size: number): number | null {
  if (key === "ArrowRight") return findNextPlayable(index, 0, 1, size);
  if (key === "ArrowLeft") return findNextPlayable(index, 0, -1, size);
  if (key === "ArrowDown") return findNextPlayable(index, 1, 0, size);
  if (key === "ArrowUp") return findNextPlayable(index, -1, 0, size);
  return null;
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
  onNavigate?: (key: string) => boolean;
};

function handleGuzzleKeyDown(
  event: React.KeyboardEvent<HTMLButtonElement>,
  isLocked: boolean,
  onNavigate?: (key: string) => boolean,
  onLetter?: (letter: string) => void,
) {
  if (onNavigate?.(event.key)) {
    event.preventDefault();
    return;
  }
  if (!isLocked && event.key.length === 1 && /^[a-zA-Z]$/u.test(event.key)) {
    onLetter?.(event.key.toUpperCase());
  }
}

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
  onNavigate,
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
      onKeyDown={(event) => handleGuzzleKeyDown(event, isLocked, onNavigate, onLetter)}
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
  let label = words.square({
    row: Math.floor(index / size) + 1,
    column: (index % size) + 1,
    letter,
    mark: guess ? words.marks[guess.mark] : "",
    isFixed: isCenter,
  });
  if (hint?.index === index) label += " (Hint target)";
  if (logicExplanation?.targetIndex === index) label += " (Logic target)";
  if (logicExplanation?.premises.some((p) => p.index === index)) label += " (Logic premise)";

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
      onSelect={() => game.setSelected(index)}
      onLetter={game.putLetter}
      onNavigate={(key) => {
        const target = getGuzzleArrowTarget(key, index, size);
        if (target !== null) {
          game.setSelected(target);
          return true;
        }
        return false;
      }}
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
