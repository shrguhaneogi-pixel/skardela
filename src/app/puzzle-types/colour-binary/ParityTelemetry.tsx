// ASD-STE100 Simplified Technical English comments.
// This component displays real-time row and column balance telemetry for Colour Binary.

import { useMemo } from "react";
import { text } from "../../../text/en";
import styles from "./ParityTelemetry.module.css";
import type { Square } from "./puzzle";

type TelemetryProps = {
  size: number;
  squares: Square[];
};

type LineStats = {
  id: string;
  isBalanced: boolean;
  isOver: boolean;
};

function calculateRowStats(row: number, size: number, squares: Square[]): LineStats {
  const target = size / 2;
  let countR = 0;
  let countB = 0;
  for (let c = 0; c < size; c++) {
    const val = squares[row * size + c];
    if (val === "R") countR++;
    if (val === "B") countB++;
  }
  return {
    id: `row-${row}`,
    isBalanced: countR === target && countB === target,
    isOver: countR > target || countB > target,
  };
}

function calculateColStats(col: number, size: number, squares: Square[]): LineStats {
  const target = size / 2;
  let countR = 0;
  let countB = 0;
  for (let r = 0; r < size; r++) {
    const val = squares[r * size + col];
    if (val === "R") countR++;
    if (val === "B") countB++;
  }
  return {
    id: `col-${col}`,
    isBalanced: countR === target && countB === target,
    isOver: countR > target || countB > target,
  };
}

function computeBoardParity(size: number, squares: Square[]) {
  const rowStats: LineStats[] = [];
  const colStats: LineStats[] = [];
  for (let i = 0; i < size; i++) {
    rowStats.push(calculateRowStats(i, size, squares));
    colStats.push(calculateColStats(i, size, squares));
  }
  const balancedRows = rowStats.filter((r) => r.isBalanced).length;
  const balancedCols = colStats.filter((c) => c.isBalanced).length;
  return { rowStats, colStats, balancedRows, balancedCols };
}

function MeterDots({ stats }: { stats: LineStats[] }) {
  return (
    <div className={styles.meterDots}>
      {stats.map((s) => {
        const dotClass = s.isBalanced ? styles.dotBalanced : s.isOver ? styles.dotOver : styles.dot;
        return <span key={s.id} className={`${styles.dot} ${dotClass}`} />;
      })}
    </div>
  );
}

export function ParityTelemetry({ size, squares }: TelemetryProps) {
  const { rowStats, colStats, balancedRows, balancedCols } = useMemo(
    () => computeBoardParity(size, squares),
    [size, squares],
  );

  const t = text["colour-binary"].telemetry;
  const allBalanced = balancedRows === size && balancedCols === size;

  return (
    <aside className={styles.telemetryStrip} aria-label={t.title}>
      <div className={styles.metricsGroup}>
        <div className={styles.metricItem}>
          <span>{`R:${balancedRows}/${size}`}</span>
          <MeterDots stats={rowStats} />
        </div>
        <div className={styles.metricItem}>
          <span>{`C:${balancedCols}/${size}`}</span>
          <MeterDots stats={colStats} />
        </div>
      </div>
      {allBalanced ? (
        <span className={styles.badgeSuccess}>✓ {t.allBalanced}</span>
      ) : (
        <span>{t.rowsBalanced(balancedRows, size)}</span>
      )}
    </aside>
  );
}
