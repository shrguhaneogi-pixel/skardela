import type { Square } from "../app/puzzle-types/colour-binary/puzzle";
import { text } from "../text/en";

// ASD-STE100 Simplified Technical English comments.
// This module inspects current player inputs to detect rule mistakes and conflicts.

export type ConflictType = "exceeds-half" | "three-in-a-row" | "identical-lines";

export type BoardConflict = {
  type: ConflictType;
  line: "row" | "column";
  lineNumber: number;
  indices: readonly number[];
  message: string;
  remedy: string;
};

// Check if a row or column contains more than half of one colour.
function checkHalfViolation(
  squares: readonly Square[],
  size: number,
  line: "row" | "column",
  lineNumber: number,
): BoardConflict | null {
  const words = text["colour-binary"];
  const max = size / 2;
  const indicesR: number[] = [];
  const indicesB: number[] = [];

  for (let pos = 0; pos < size; pos += 1) {
    const r = line === "row" ? lineNumber - 1 : pos;
    const c = line === "row" ? pos : lineNumber - 1;
    const idx = r * size + c;
    if (squares[idx] === "R") indicesR.push(idx);
    if (squares[idx] === "B") indicesB.push(idx);
  }

  if (indicesR.length > max) {
    const label = `${line === "row" ? "Row" : "Column"} ${lineNumber}`;
    return {
      type: "exceeds-half",
      line,
      lineNumber,
      indices: indicesR,
      message: text.contextHelp.exceedsHalf(label, indicesR.length, max, words.colours.R),
      remedy: `Change one ${words.colours.R} square in ${label}.`,
    };
  }

  if (indicesB.length > max) {
    const label = `${line === "row" ? "Row" : "Column"} ${lineNumber}`;
    return {
      type: "exceeds-half",
      line,
      lineNumber,
      indices: indicesB,
      message: text.contextHelp.exceedsHalf(label, indicesB.length, max, words.colours.B),
      remedy: `Change one ${words.colours.B} square in ${label}.`,
    };
  }

  return null;
}

// Check if a line contains three identical colours in sequence.
function checkThreeViolation(
  squares: readonly Square[],
  size: number,
  line: "row" | "column",
  lineNumber: number,
): BoardConflict | null {
  const words = text["colour-binary"];

  for (let pos = 0; pos < size - 2; pos += 1) {
    const getIndex = (offset: number) => {
      const r = line === "row" ? lineNumber - 1 : pos + offset;
      const c = line === "row" ? pos + offset : lineNumber - 1;
      return r * size + c;
    };
    const i1 = getIndex(0);
    const i2 = getIndex(1);
    const i3 = getIndex(2);

    const s1 = squares[i1];
    if (s1 !== undefined && s1 !== "." && s1 === squares[i2] && s1 === squares[i3]) {
      const label = `${line === "row" ? "Row" : "Column"} ${lineNumber}`;
      return {
        type: "three-in-a-row",
        line,
        lineNumber,
        indices: [i1, i2, i3],
        message: text.contextHelp.threeInARow(label, words.colours[s1]),
        remedy: `Change one of these three ${words.colours[s1]} squares.`,
      };
    }
  }
  return null;
}

// Find any rule conflict currently present on a Colour Binary board.
export function findBoardConflicts(squares: readonly Square[], size: number): BoardConflict | null {
  for (let lineNum = 1; lineNum <= size; lineNum += 1) {
    const rowThree = checkThreeViolation(squares, size, "row", lineNum);
    if (rowThree) return rowThree;

    const colThree = checkThreeViolation(squares, size, "column", lineNum);
    if (colThree) return colThree;
  }

  for (let lineNum = 1; lineNum <= size; lineNum += 1) {
    const rowHalf = checkHalfViolation(squares, size, "row", lineNum);
    if (rowHalf) return rowHalf;

    const colHalf = checkHalfViolation(squares, size, "column", lineNum);
    if (colHalf) return colHalf;
  }
  return null;
}

// AdviceTracker avoids repeating identical advice to the player.
export class AdviceTracker {
  private readonly history = new Set<string>();

  shouldGiveAdvice(key: string): boolean {
    if (this.history.has(key)) return false;
    this.history.add(key);
    return true;
  }

  reset(): void {
    this.history.clear();
  }
}
