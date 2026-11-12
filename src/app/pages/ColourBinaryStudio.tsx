// Colour Binary Editor for Skardela Puzzle Studio.
// Follows ASD-STE100 Simplified Technical English.

import { useState } from "react";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { text } from "../../text/en";
import { symbols } from "../../text/symbols";
import {
  createEmptyGrid,
  exportCbStudio,
  gridSizeForDifficulty,
  nextSquareCycle,
  validateCbStudio,
  type CbSquare,
  type Difficulty,
  type ValidationResult,
} from "./colour-binary-studio-logic";
import styles from "./StudioPage.module.css";
import { ValidationReport } from "./ValidationReport";

interface CbMetaProps {
  readonly difficulty: Difficulty;
  readonly id: string;
  readonly author: string;
  readonly onDifficultyChange: (d: Difficulty) => void;
  readonly onIdChange: (id: string) => void;
  readonly onAuthorChange: (a: string) => void;
}

function CbMetaControls({
  difficulty,
  id,
  author,
  onDifficultyChange,
  onIdChange,
  onAuthorChange,
}: CbMetaProps) {
  return (
    <div className={styles.metaControls}>
      <div className={styles.controlGroup}>
        <label className={styles.label} htmlFor="cb-diff">
          {text.studio.difficultyLabel}
        </label>
        <select
          id="cb-diff"
          className={styles.select}
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
        >
          <option value="easy">{text.levels.easy} (4x4)</option>
          <option value="medium">{text.levels.medium} (6x6)</option>
          <option value="hard">{text.levels.hard} (8x8)</option>
        </select>
      </div>
      <div className={styles.controlGroup}>
        <label className={styles.label} htmlFor="cb-id">
          {text.studio.idLabel}
        </label>
        <Input
          id="cb-id"
          className="w-auto min-h-9 py-1.5"
          value={id}
          onChange={(e) => onIdChange(e.target.value)}
        />
      </div>
      <div className={styles.controlGroup}>
        <label className={styles.label} htmlFor="cb-author">
          {text.studio.authorLabel}
        </label>
        <Input
          id="cb-author"
          className="w-auto min-h-9 py-1.5"
          value={author}
          onChange={(e) => onAuthorChange(e.target.value)}
        />
      </div>
    </div>
  );
}

interface CbGridProps {
  readonly size: number;
  readonly squares: readonly CbSquare[];
  readonly onToggle: (i: number) => void;
}

function CbEditorGrid({ size, squares, onToggle }: CbGridProps) {
  return (
    <div
      className={styles.gridContainer}
      style={{ gridTemplateColumns: `repeat(${size}, 2.75rem)` }}
      role="grid"
      aria-label="Colour Binary Editor"
    >
      {squares.map((sq, i) => {
        const r = Math.floor(i / size);
        const c = i % size;
        const cls =
          sq === "R"
            ? `${styles.cell} ${styles.cellR}`
            : sq === "B"
              ? `${styles.cell} ${styles.cellB}`
              : styles.cell;
        return (
          <button
            key={`${r}-${c}`}
            type="button"
            className={cls}
            onClick={() => onToggle(i)}
            aria-label={text.studio.cellAria(r + 1, c + 1, sq)}
          >
            {symbols["colour-binary"][sq]}
          </button>
        );
      })}
    </div>
  );
}

interface CbActionsProps {
  readonly onValidate: () => void;
  readonly onExport: () => void;
  readonly onClear: () => void;
}

function CbActions({ onValidate, onExport, onClear }: CbActionsProps) {
  return (
    <div className={styles.actions}>
      <Button size="lg" onClick={onValidate}>
        {symbols.studio.validate} {text.studio.validateBtn}
      </Button>
      <Button variant="secondary" size="lg" onClick={onExport}>
        {symbols.studio.export} {text.studio.exportBtn}
      </Button>
      <Button variant="secondary" size="lg" onClick={onClear}>
        {text.studio.clearBtn}
      </Button>
    </div>
  );
}

function useColourBinaryStudio(onExport: (json: string) => void) {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [author, setAuthor] = useState("Creator");
  const [id, setId] = useState("colour-binary-9001");
  const size = gridSizeForDifficulty(difficulty);
  const [squares, setSquares] = useState<CbSquare[]>(() => createEmptyGrid(difficulty));
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const handleDifficultyChange = (newDiff: Difficulty) => {
    setDifficulty(newDiff);
    setSquares(createEmptyGrid(newDiff));
    setValidation(null);
  };

  const toggleCell = (index: number) => {
    setSquares((prev) => {
      const next = [...prev];
      const cur = next[index] ?? ".";
      next[index] = nextSquareCycle(cur);
      return next;
    });
  };

  return {
    difficulty,
    author,
    id,
    size,
    squares,
    validation,
    handleDifficultyChange,
    setId,
    setAuthor,
    toggleCell,
    handleValidate: () => setValidation(validateCbStudio(squares, difficulty, id, author)),
    handleExportClick: () => onExport(exportCbStudio(squares, difficulty, id, author)),
    handleClear: () => {
      setSquares(createEmptyGrid(difficulty));
      setValidation(null);
    },
  };
}

export function ColourBinaryStudio({ onExport }: { readonly onExport: (json: string) => void }) {
  const state = useColourBinaryStudio(onExport);

  return (
    <div className={styles.panel}>
      <CbMetaControls
        difficulty={state.difficulty}
        id={state.id}
        author={state.author}
        onDifficultyChange={state.handleDifficultyChange}
        onIdChange={state.setId}
        onAuthorChange={state.setAuthor}
      />
      <CbEditorGrid size={state.size} squares={state.squares} onToggle={state.toggleCell} />
      <CbActions
        onValidate={state.handleValidate}
        onExport={state.handleExportClick}
        onClear={state.handleClear}
      />
      <ValidationReport result={state.validation} />
    </div>
  );
}
