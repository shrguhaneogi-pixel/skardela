import { findHint } from "../app/puzzle-types/colour-binary/hint";
import type { Square } from "../app/puzzle-types/colour-binary/puzzle";
import { text } from "../text/en";

// ASD-STE100 Simplified Technical English comments.
// This module creates structured logic explanations for deduction steps.

export type LogicPremise = {
  index: number;
  row: number;
  column: number;
  label: string;
};

export type LogicExplanation = {
  targetIndex: number;
  targetRow: number;
  targetColumn: number;
  targetValue: string;
  ruleName: string;
  ruleSummary: string;
  premises: readonly LogicPremise[];
  deductionSteps: readonly string[];
};

type GuzzleGuess = { letter: string; mark: "correct" | "present" | "absent" };

// Collect premise cells in a row or column that share a specified colour.
function collectColourPremises(
  squares: readonly Square[],
  size: number,
  line: "row" | "column",
  lineNumber: number,
  colour: Square,
): readonly LogicPremise[] {
  const premises: LogicPremise[] = [];
  const words = text["colour-binary"];

  for (let pos = 0; pos < size; pos += 1) {
    const r = line === "row" ? lineNumber - 1 : pos;
    const c = line === "row" ? pos : lineNumber - 1;
    const idx = r * size + c;
    if (squares[idx] === colour) {
      premises.push({
        index: idx,
        row: r + 1,
        column: c + 1,
        label: words.colours[colour],
      });
    }
  }
  return premises;
}

// Build deduction steps for a half-balance rule.
function buildHalfSteps(
  lineLabel: string,
  targetRow: number,
  targetColumn: number,
  targetColour: string,
  otherColour: string,
  capacity: number,
): readonly string[] {
  return [
    `${lineLabel} requires exactly ${capacity} ${otherColour} squares.`,
    `All ${capacity} ${otherColour} squares are already in this line.`,
    `No more ${otherColour} squares can be placed in ${lineLabel}.`,
    `Square at row ${targetRow}, column ${targetColumn} must be ${targetColour}.`,
  ];
}

// Build deduction steps for a three-in-a-row rule.
function buildThreeSteps(
  lineLabel: string,
  targetRow: number,
  targetColumn: number,
  targetColour: string,
  otherColour: string,
): readonly string[] {
  return [
    `Three adjacent ${otherColour} squares violate puzzle rules.`,
    `Adjacent squares in ${lineLabel} already have ${otherColour}.`,
    `Placing ${otherColour} here makes three identical squares in sequence.`,
    `Square at row ${targetRow}, column ${targetColumn} must be ${targetColour}.`,
  ];
}

// Resolve rule name and summary for Colour Binary logic explanation.
function getColourBinaryRule(
  lineLabel: string,
  reason: "half" | "three",
  otherColourName: string,
  size: number,
) {
  const isHalf = reason === "half";
  return {
    ruleName: isHalf
      ? text.logicExplanation.colourBinary.halfRule
      : text.logicExplanation.colourBinary.threeRule,
    ruleSummary: isHalf
      ? text.logicExplanation.colourBinary.halfSummary(lineLabel, size / 2, otherColourName)
      : text.logicExplanation.colourBinary.threeSummary(lineLabel, otherColourName),
  };
}

// Generate structured logic explanation for Colour Binary puzzles.
export function explainColourBinaryLogic(
  squares: readonly Square[],
  size: number,
): LogicExplanation | undefined {
  const base = findHint(squares);
  if (!base) return undefined;

  const words = text["colour-binary"];
  const otherColour = base.colour === "R" ? "B" : "R";
  const row = Math.floor(base.index / size) + 1;
  const column = (base.index % size) + 1;
  const lineLabel = `${base.line === "row" ? "Row" : "Column"} ${base.number}`;
  const isHalf = base.reason === "half";
  const { ruleName, ruleSummary } = getColourBinaryRule(
    lineLabel,
    base.reason,
    words.colours[otherColour],
    size,
  );

  const premises = collectColourPremises(squares, size, base.line, base.number, otherColour);
  const steps = isHalf
    ? buildHalfSteps(
        lineLabel,
        row,
        column,
        words.colours[base.colour],
        words.colours[otherColour],
        size / 2,
      )
    : buildThreeSteps(
        lineLabel,
        row,
        column,
        words.colours[base.colour],
        words.colours[otherColour],
      );

  return {
    targetIndex: base.index,
    targetRow: row,
    targetColumn: column,
    targetValue: words.colours[base.colour],
    ruleName,
    ruleSummary,
    premises,
    deductionSteps: steps,
  };
}

// Generate structured logic explanation for Guzzle puzzles.
export function explainGuzzleLogic(
  answer: readonly string[],
  guesses: readonly (GuzzleGuess | undefined)[] | Readonly<Record<number, GuzzleGuess | undefined>>,
  size: number,
  selected: number | null,
): LogicExplanation | undefined {
  const center = Math.floor((size * size) / 2);
  let targetIndex = -1;

  if (selected !== null && selected !== center && guesses[selected]?.mark !== "correct") {
    targetIndex = selected;
  } else {
    for (let i = 0; i < size * size; i += 1) {
      if (i === center) continue;
      if (guesses[i]?.mark !== "correct") {
        targetIndex = i;
        break;
      }
    }
  }

  if (targetIndex === -1) return undefined;

  const row = Math.floor(targetIndex / size) + 1;
  const column = (targetIndex % size) + 1;
  const targetLetter = answer[Math.floor(targetIndex / size)]?.[targetIndex % size] ?? "";

  return {
    targetIndex,
    targetRow: row,
    targetColumn: column,
    targetValue: targetLetter,
    ruleName: text.logicExplanation.guzzle.intersectionRule,
    ruleSummary: text.logicExplanation.guzzle.intersectionSummary(row, column),
    premises: [{ index: center, row: 2, column: 2, label: answer[1]?.[1] ?? "" }],
    deductionSteps: [
      `Square at row ${row}, column ${column} belongs to intersecting words.`,
      `The center letter anchors all four words.`,
      `Target letter '${targetLetter}' satisfies crossing constraints.`,
    ],
  };
}
