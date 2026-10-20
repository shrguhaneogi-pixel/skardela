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

type GuzzleNode = {
  id: string;
  cx: number;
  cy: number;
  markClass: string;
};

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

const GUZZLE_LINES = ["across", "down", "diagonalDown", "diagonalUp"] as const;

function getGuzzleLineIndexes(line: (typeof GUZZLE_LINES)[number], size: number): number[] {
  const steps = Array.from({ length: size }, (_, step) => step);
  const middle = (size - 1) / 2;
  switch (line) {
    case "across":
      return steps.map((col) => middle * size + col);
    case "down":
      return steps.map((row) => row * size + middle);
    case "diagonalDown":
      return steps.map((step) => step * size + step);
    case "diagonalUp":
      return steps.map((step) => (size - 1 - step) * size + step);
  }
}

function findActiveRecords(levels: LevelRef[]) {
  let isAllSolved = levels.length > 0;
  let hasAnySolved = false;
  let inProgressRecord: ReturnType<typeof loadPuzzleProgress> = null;
  let solvedRecord: ReturnType<typeof loadPuzzleProgress> = null;

  for (const level of levels) {
    const record = loadPuzzleProgress(level.id);
    if (!record) {
      isAllSolved = false;
      continue;
    }
    if (record.isSolved) {
      hasAnySolved = true;
      if (!solvedRecord) solvedRecord = record;
    } else {
      isAllSolved = false;
    }
    if (!record.isSolved && (record.colourBinaryState?.squares || record.guzzleState?.guesses)) {
      inProgressRecord = record;
    }
  }
  return { isAllSolved, hasAnySolved, inProgressRecord, solvedRecord };
}

function readPuzzleState(levels: LevelRef[]): BoardState {
  const { isAllSolved, hasAnySolved, inProgressRecord, solvedRecord } = findActiveRecords(levels);

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
  if (isAllSolved) {
    return {
      isSolved: true,
      isInProgress: false,
      colourCells: solvedRecord?.colourBinaryState?.squares,
      guzzleMarks: solvedRecord?.guzzleState?.guesses?.map((g) => g?.mark),
    };
  }
  if (hasAnySolved) {
    return {
      isSolved: false,
      isInProgress: false,
      colourCells: solvedRecord?.colourBinaryState?.squares,
      guzzleMarks: solvedRecord?.guzzleState?.guesses?.map((g) => g?.mark),
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
  const count = cells.length;
  const boardSize = Math.max(2, Math.round(Math.sqrt(count)));
  const pad = 6;
  const available = 44;
  const cellSize = available / boardSize;

  const dotRadius = boardSize <= 4 ? 3 : boardSize <= 6 ? 2.2 : 1.6;
  const emptyRadius = Math.max(0.7, dotRadius * 0.5);

  return cells.map((val, idx) => {
    const col = idx % boardSize;
    const row = Math.floor(idx / boardSize);
    const cx = pad + col * cellSize + cellSize / 2;
    const cy = pad + row * cellSize + cellSize / 2;
    const r = val === "." ? emptyRadius : dotRadius;
    const fillClass =
      val === "R" ? styles.cellDotRed : val === "B" ? styles.cellDotBlue : styles.cellDotEmpty;
    return <circle key={`dot-${val}-${col}-${row}`} cx={cx} cy={cy} r={r} className={fillClass} />;
  });
}

function ColourBinarySvg({ state }: { state: BoardState }) {
  const cells =
    state.colourCells && state.colourCells.length >= 4 ? state.colourCells : DEFAULT_BINARY;
  const label = text.home.diagramLabel(text["colour-binary"].name);

  return (
    <svg className={styles.svgRoot} viewBox="0 0 56 56" aria-label={label}>
      <title>{label}</title>
      <DiagramFrame isSolved={state.isSolved} />
      <line x1="28" y1="6" x2="28" y2="50" className={styles.axisLine} />
      <line x1="6" y1="28" x2="50" y2="28" className={styles.axisLine} />
      <ColourBinaryDots cells={cells} />
    </svg>
  );
}

function useGuzzleNodes(size: number, centerIndex: number, state: BoardState): GuzzleNode[] {
  return useMemo(() => {
    const list: GuzzleNode[] = [];
    const seen = new Set<number>();
    const pad = 8;
    const available = 40;

    for (const line of GUZZLE_LINES) {
      const indices = getGuzzleLineIndexes(line, size);
      for (const idx of indices) {
        if (idx === centerIndex || seen.has(idx)) continue;
        seen.add(idx);
        const col = idx % size;
        const row = Math.floor(idx / size);
        const cx = pad + ((col + 0.5) / size) * available;
        const cy = pad + ((row + 0.5) / size) * available;
        const mark = state.isSolved ? "correct" : state.guzzleMarks?.[idx];
        const markClass =
          (mark === "correct"
            ? styles.cellCorrect
            : mark === "present"
              ? styles.cellPresent
              : mark === "absent"
                ? styles.cellAbsent
                : styles.cellDotEmpty) ?? "";
        list.push({ id: `gz-node-${idx}`, cx, cy, markClass });
      }
    }
    return list;
  }, [size, centerIndex, state.isSolved, state.guzzleMarks]);
}

function GuzzleSvg({ state }: { state: BoardState }) {
  const label = text.home.diagramLabel(text.guzzle.name);
  const size = state.guzzleMarks ? Math.round(Math.sqrt(state.guzzleMarks.length)) || 5 : 5;
  const middle = (size - 1) / 2;
  const centerIndex = middle * size + middle;
  const nodes = useGuzzleNodes(size, centerIndex, state);

  return (
    <svg className={styles.svgRoot} viewBox="0 0 56 56" aria-label={label}>
      <title>{label}</title>
      <DiagramFrame isSolved={state.isSolved} />
      <line x1="8" y1="28" x2="48" y2="28" className={styles.gridLine} />
      <line x1="28" y1="8" x2="28" y2="48" className={styles.gridLine} />
      <line x1="10" y1="10" x2="46" y2="46" className={styles.gridLine} />
      <line x1="10" y1="46" x2="46" y2="10" className={styles.gridLine} />

      {nodes.map((node) => (
        <circle
          key={node.id}
          cx={node.cx}
          cy={node.cy}
          r={size > 5 ? 2 : 2.75}
          className={node.markClass}
        />
      ))}

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
