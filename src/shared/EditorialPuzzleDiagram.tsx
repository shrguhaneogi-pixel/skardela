// ASD-STE100 Simplified Technical English comments.
// This component renders an editorial vector diagram that responds to puzzle progress.

import { useMemo } from "react";
import type { Difficulty } from "./difficulty";
import { loadPuzzleProgress } from "./puzzle-progress";
import { text } from "../text/en";
import styles from "./EditorialPuzzleDiagram.module.css";

type LevelRef = {
  id: string;
  difficulty: Difficulty;
};

type DiagramProps = {
  type: "colour-binary" | "guzzle";
  levels: LevelRef[];
};

type BoardState = {
  isSolved: boolean;
  isInProgress: boolean;
  colourCells?: string[];
  guzzleMarks?: ("correct" | "present" | "absent" | undefined)[];
};

const GUZZLE_OFFSETS = [
  { cx: 28, cy: 12, id: "arm-top-1" },
  { cx: 28, cy: 20, id: "arm-top-2" },
  { cx: 44, cy: 28, id: "arm-right-1" },
  { cx: 36, cy: 28, id: "arm-right-2" },
  { cx: 28, cy: 44, id: "arm-bottom-1" },
  { cx: 28, cy: 36, id: "arm-bottom-2" },
  { cx: 12, cy: 28, id: "arm-left-1" },
  { cx: 20, cy: 28, id: "arm-left-2" },
] as const;

const DEFAULT_BINARY = [
  "R",
  "B",
  ".",
  "R",
  "B",
  "R",
  "B",
  ".",
  ".",
  "B",
  "R",
  "B",
  "B",
  ".",
  "R",
  "R",
] as const;

function readPuzzleState(levels: LevelRef[]): BoardState {
  let isSolved = false;
  let inProgressRecord: ReturnType<typeof loadPuzzleProgress> = null;

  for (const level of levels) {
    const record = loadPuzzleProgress(level.id);
    if (!record) continue;
    if (record.isSolved) {
      isSolved = true;
    }
    if (record.colourBinaryState?.squares || record.guzzleState?.guesses) {
      inProgressRecord = record;
    }
  }

  if (isSolved) {
    return { isSolved: true, isInProgress: false };
  }
  if (inProgressRecord?.colourBinaryState?.squares) {
    return {
      isSolved: false,
      isInProgress: true,
      colourCells: inProgressRecord.colourBinaryState.squares,
    };
  }
  if (inProgressRecord?.guzzleState?.guesses) {
    return {
      isSolved: false,
      isInProgress: true,
      guzzleMarks: inProgressRecord.guzzleState.guesses.map((g) => g?.mark),
    };
  }
  return { isSolved: false, isInProgress: false };
}

function DiagramFrame({ isSolved }: { isSolved: boolean }) {
  return (
    <>
      <rect
        x="2"
        y="2"
        width="52"
        height="52"
        fill="none"
        stroke="var(--border)"
        strokeWidth="0.8"
        rx="4"
      />
      <path d="M 4 8 L 4 4 L 8 4" className={styles.cornerMark} fill="none" />
      <path d="M 48 4 L 52 4 L 52 8" className={styles.cornerMark} fill="none" />
      <path d="M 4 48 L 4 52 L 8 52" className={styles.cornerMark} fill="none" />
      <path d="M 48 52 L 52 52 L 52 48" className={styles.cornerMark} fill="none" />
      {isSolved && <rect x="3" y="3" width="50" height="50" rx="3" className={styles.solvedGlow} />}
    </>
  );
}

function ColourBinaryDots({ cells }: { cells: readonly string[] }) {
  const size = 4;
  const cellSize = 10;
  const pad = 8;

  return cells.slice(0, 16).map((val, idx) => {
    const col = idx % size;
    const row = Math.floor(idx / size);
    const cx = pad + col * cellSize + cellSize / 2;
    const cy = pad + row * cellSize + cellSize / 2;
    const r = val === "." ? 1.5 : 3;
    const fillClass =
      val === "R" ? styles.cellDotRed : val === "B" ? styles.cellDotBlue : styles.cellDotEmpty;
    return <circle key={`cell-${col}-${row}`} cx={cx} cy={cy} r={r} className={fillClass} />;
  });
}

function ColourBinarySvg({ state }: { state: BoardState }) {
  const cells =
    state.colourCells && state.colourCells.length >= 16 ? state.colourCells : DEFAULT_BINARY;
  const label = text.home.diagramLabel(text["colour-binary"].name);

  return (
    <svg className={styles.svgRoot} viewBox="0 0 56 56" aria-label={label}>
      <title>{label}</title>
      <DiagramFrame isSolved={state.isSolved} />
      <line x1="28" y1="8" x2="28" y2="48" className={styles.axisLine} />
      <line x1="8" y1="28" x2="48" y2="28" className={styles.axisLine} />
      <ColourBinaryDots cells={cells} />
    </svg>
  );
}

function GuzzleArms({ marks }: { marks?: ("correct" | "present" | "absent" | undefined)[] }) {
  return GUZZLE_OFFSETS.map((pos, idx) => {
    const mark = marks?.[idx];
    const markClass =
      mark === "correct"
        ? styles.cellCorrect
        : mark === "present"
          ? styles.cellPresent
          : mark === "absent"
            ? styles.cellAbsent
            : styles.cellDotEmpty;
    return <circle key={pos.id} cx={pos.cx} cy={pos.cy} r="3" className={markClass} />;
  });
}

function GuzzleSvg({ state }: { state: BoardState }) {
  const label = text.home.diagramLabel(text.guzzle.name);
  return (
    <svg className={styles.svgRoot} viewBox="0 0 56 56" aria-label={label}>
      <title>{label}</title>
      <DiagramFrame isSolved={state.isSolved} />
      <line x1="28" y1="8" x2="28" y2="48" className={styles.gridLine} />
      <line x1="8" y1="28" x2="48" y2="28" className={styles.gridLine} />
      <GuzzleArms marks={state.guzzleMarks} />
      <rect x="23" y="23" width="10" height="10" rx="2" className={styles.centerCell} />
      <text x="28" y="28" className={styles.centerText}>
        {text.guzzle.sampleCenter}
      </text>
    </svg>
  );
}

export function EditorialPuzzleDiagram({ type, levels }: DiagramProps) {
  const state = useMemo(() => readPuzzleState(levels), [levels]);
  const tag = type === "colour-binary" ? "CB" : "GZ";

  return (
    <div className={styles.diagramContainer} data-type={type} data-solved={state.isSolved}>
      {type === "colour-binary" ? <ColourBinarySvg state={state} /> : <GuzzleSvg state={state} />}
      <span className={styles.telemetryTag} aria-hidden="true">
        {tag}
      </span>
    </div>
  );
}
