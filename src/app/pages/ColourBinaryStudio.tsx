// Colour Binary Editor for Skardela Puzzle Studio.
// Follows ASD-STE100 Simplified Technical English.

import { useState } from "react";
import { type Difficulty } from "../../shared/difficulty";
import { validateColourBinaryPuzzle, type ValidationResult } from "../../shared/puzzle-validator";
import {
  sizes as cbSizes,
  toRows as cbToRows,
  type ColourBinaryPuzzle,
  type Square as CbSquare,
} from "../puzzle-types/colour-binary/puzzle";
import { findAnswers } from "../puzzle-types/colour-binary/solver";
import { text } from "../../text/en";
import { symbols } from "../../text/symbols";
import styles from "./StudioPage.module.css";
import { ValidationReport } from "./ValidationReport";

function nextSquareCycle(current: CbSquare): CbSquare {
  if (current === ".") return "R";
  if (current === "R") return "B";
  return ".";
}

function buildCbExportObject(
  difficulty: Difficulty,
  id: string,
  author: string,
  squares: readonly CbSquare[],
  answerSquares: readonly CbSquare[],
): ColourBinaryPuzzle & { readonly schemaVersion: string } {
  return {
    schemaVersion: "skardela-custom-v1",
    type: "colour-binary",
    id,
    difficulty,
    author: author.trim() || "Local Creator",
    license: "CC-BY-4.0",
    start: cbToRows(squares),
    answer: cbToRows(answerSquares),
  };
}

function validateCbStudio(
  squares: readonly CbSquare[],
  difficulty: Difficulty,
  id: string,
  author: string,
): ValidationResult {
  const answers = findAnswers(squares, 2);
  if (answers.length !== 1 || !answers[0]) {
    return {
      valid: false,
      errors: [`Puzzle has ${answers.length} solutions. Expected exactly 1 unique solution.`],
    };
  }
  const payload = buildCbExportObject(difficulty, id, author, squares, answers[0]);
  return validateColourBinaryPuzzle(payload);
}

function exportCbStudio(
  squares: readonly CbSquare[],
  difficulty: Difficulty,
  id: string,
  author: string,
): string {
  const answers = findAnswers(squares, 1);
  const ans = answers[0] ?? squares;
  const payload = buildCbExportObject(difficulty, id, author, squares, ans);
  return JSON.stringify(payload, null, 2);
}

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
        <input
          id="cb-id"
          className={styles.input}
          value={id}
          onChange={(e) => onIdChange(e.target.value)}
        />
      </div>
      <div className={styles.controlGroup}>
        <label className={styles.label} htmlFor="cb-author">
          {text.studio.authorLabel}
        </label>
        <input
          id="cb-author"
          className={styles.input}
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
      <button type="button" className={styles.btnPrimary} onClick={onValidate}>
        {symbols.studio.validate} {text.studio.validateBtn}
      </button>
      <button type="button" className={styles.btnSecondary} onClick={onExport}>
        {symbols.studio.export} {text.studio.exportBtn}
      </button>
      <button type="button" className={styles.btnSecondary} onClick={onClear}>
        {text.studio.clearBtn}
      </button>
    </div>
  );
}

function useColourBinaryStudio(onExport: (json: string) => void) {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [author, setAuthor] = useState("Creator");
  const [id, setId] = useState("colour-binary-9001");
  const size = cbSizes[difficulty];
  const [squares, setSquares] = useState<CbSquare[]>(() =>
    Array.from({ length: size * size }, () => "."),
  );
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const handleDifficultyChange = (newDiff: Difficulty) => {
    setDifficulty(newDiff);
    const newSize = cbSizes[newDiff];
    setSquares(Array.from({ length: newSize * newSize }, () => "."));
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
      setSquares(Array.from({ length: size * size }, () => "."));
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
