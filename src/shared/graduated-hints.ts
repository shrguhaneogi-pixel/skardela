import { findHint } from "../app/puzzle-types/colour-binary/hint";
import type { Square } from "../app/puzzle-types/colour-binary/puzzle";
import { text } from "../text/en";

// ASD-STE100 Simplified Technical English comments.
// This module provides graduated hints with three levels: nudge, explanation, and solution.

export {
  explainColourBinaryLogic,
  explainGuzzleLogic,
  type LogicExplanation,
} from "./logic-explainer";

export type HintTier = "nudge" | "explanation" | "solution";

export type GraduatedHint = {
  tier: HintTier;
  index: number;
  highlightIndices: readonly number[];
  nudge: string;
  explanation: string;
  solution: string;
  ruleType: string;
};

// Advance the active tier to the next level of detail.
export function advanceTier(current: HintTier): HintTier {
  if (current === "nudge") return "explanation";
  return "solution";
}

// Get the message text for a selected tier.
export function getHintTierText(hint: GraduatedHint, tier: HintTier): string {
  if (tier === "nudge") return hint.nudge;
  if (tier === "explanation") return hint.explanation;
  return hint.solution;
}

// Calculate indices of squares in the same row or column.
function calculateLineIndices(
  index: number,
  size: number,
  line: "row" | "column",
): readonly number[] {
  const row = Math.floor(index / size);
  const column = index % size;
  const indices: number[] = [];

  if (line === "row") {
    for (let c = 0; c < size; c += 1) {
      indices.push(row * size + c);
    }
  } else {
    for (let r = 0; r < size; r += 1) {
      indices.push(r * size + column);
    }
  }
  return indices;
}

// Build a graduated hint for the Colour Binary puzzle.
export function createColourBinaryHint(
  squares: readonly Square[],
  size: number,
  tier: HintTier = "nudge",
): GraduatedHint | undefined {
  const base = findHint(squares);
  if (!base) return undefined;

  const words = text["colour-binary"];
  const otherColour = base.colour === "R" ? "B" : "R";
  const row = Math.floor(base.index / size) + 1;
  const column = (base.index % size) + 1;
  const line = `${base.line === "row" ? "Row" : "Column"} ${base.number}`;
  const why =
    base.reason === "half"
      ? `${line} already has half of its squares ${words.colours[otherColour]}.`
      : `${words.colours[otherColour]} here makes three ${words.colours[otherColour]} squares next to each other in ${line}.`;

  const nudge = `Row ${row}, column ${column}: ${line} has a clue to check.`;
  const explanation = `Row ${row}, column ${column}: ${why}`;
  const solution = `Row ${row}, column ${column}: ${why} Thus this square is ${words.colours[base.colour]}.`;

  return {
    tier,
    index: base.index,
    highlightIndices: calculateLineIndices(base.index, size, base.line),
    nudge,
    explanation,
    solution,
    ruleType: base.reason,
  };
}

type GuzzleGuess = { letter: string; mark: "correct" | "present" | "absent" };

// Build a graduated hint for the Guzzle word puzzle.
export function createGuzzleHint(
  answer: readonly string[],
  guesses: readonly (GuzzleGuess | undefined)[] | Readonly<Record<number, GuzzleGuess | undefined>>,
  size: number,
  selected: number | null,
  tier: HintTier = "nudge",
): GraduatedHint | undefined {
  const center = Math.floor((size * size) / 2);
  let targetIndex = -1;

  if (selected !== null && selected !== center && guesses[selected]?.mark !== "correct") {
    targetIndex = selected;
  } else {
    for (let i = 0; i < size * size; i += 1) {
      if (i === center) continue;
      const isWordCell =
        Math.floor(i / size) === Math.floor(size / 2) ||
        i % size === Math.floor(size / 2) ||
        Math.floor(i / size) === i % size ||
        Math.floor(i / size) + (i % size) === size - 1;
      if (isWordCell && guesses[i]?.mark !== "correct") {
        targetIndex = i;
        break;
      }
    }
  }

  if (targetIndex === -1) return undefined;

  const row = Math.floor(targetIndex / size) + 1;
  const column = (targetIndex % size) + 1;
  const targetLetter = answer[Math.floor(targetIndex / size)]?.[targetIndex % size] ?? "";

  const nudge = `Row ${row}, column ${column}: Look at the intersecting words for this square.`;
  const explanation = `Row ${row}, column ${column}: Letters here must satisfy crossing words.`;
  const solution = `Row ${row}, column ${column}: Place letter ${targetLetter} here.`;

  return {
    tier,
    index: targetIndex,
    highlightIndices: [targetIndex],
    nudge,
    explanation,
    solution,
    ruleType: "letter-placement",
  };
}
