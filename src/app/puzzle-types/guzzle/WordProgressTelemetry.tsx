// ASD-STE100 Simplified Technical English comments.
// This component displays real-time line progression telemetry for Guzzle.

import { useMemo } from "react";
import { text } from "../../../text/en";
import { lineIndexes, lineNames, lineOf, type Line } from "./puzzle";
import type { Guesses } from "./rules-check";
import styles from "./WordProgressTelemetry.module.css";

type TelemetryProps = {
  size: number;
  guesses: Guesses;
  selected: number | null;
};

type LineProgress = {
  line: Line;
  correctCount: number;
  totalPlayable: number;
  isComplete: boolean;
};

const LINE_LABELS: Record<Line, string> = {
  across: "Across",
  down: "Down",
  diagonalDown: "Diag ↘",
  diagonalUp: "Diag ↗",
};

function checkLineProgress(line: Line, size: number, guesses: Guesses): LineProgress {
  const indexes = lineIndexes(line, size);
  const middle = (size - 1) / 2;
  const centerIndex = middle * size + middle;
  const playableIndexes = indexes.filter((idx) => idx !== centerIndex);
  let correctCount = 0;
  for (const idx of playableIndexes) {
    if (guesses[idx]?.mark === "correct") {
      correctCount++;
    }
  }
  return {
    line,
    correctCount,
    totalPlayable: playableIndexes.length,
    isComplete: correctCount === playableIndexes.length,
  };
}

function RayChip({ progress, isActive }: { progress: LineProgress; isActive: boolean }) {
  const chipClass = progress.isComplete
    ? styles.rayCompleted
    : isActive
      ? styles.rayActive
      : styles.rayChip;

  const countStr = `${progress.correctCount}/${progress.totalPlayable}`;
  return (
    <span className={`${styles.rayChip} ${chipClass}`}>
      <span>{LINE_LABELS[progress.line]}</span>
      <span>{progress.isComplete ? "✓" : countStr}</span>
    </span>
  );
}

export function WordProgressTelemetry({ size, guesses, selected }: TelemetryProps) {
  const activeLine = selected === null ? undefined : lineOf(selected, size);
  const progressList = useMemo(() => {
    return lineNames.map((line) => checkLineProgress(line, size, guesses));
  }, [size, guesses]);

  const completedWords = progressList.filter((p) => p.isComplete).length;
  const allComplete = completedWords === 4;
  const t = text.guzzle.telemetry;

  return (
    <aside className={styles.telemetryStrip} aria-label={t.title}>
      <div className={styles.raysGroup}>
        {progressList.map((p) => (
          <RayChip key={p.line} progress={p} isActive={p.line === activeLine} />
        ))}
      </div>
      {allComplete ? (
        <span className={styles.badgeSuccess}>✓ {t.allCompleted}</span>
      ) : (
        <span>{t.wordsCompleted(completedWords, 4)}</span>
      )}
    </aside>
  );
}
