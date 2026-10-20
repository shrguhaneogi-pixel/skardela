// ASD-STE100 Simplified Technical English comments.
// Localized text strings for logic explanations, hints, and context help.

export const hintsText = {
  title: "Logic hint",
  tierLabels: {
    nudge: "1. Nudge",
    explanation: "2. Explain",
    solution: "3. Step",
  },
  advanceToExplanation: "Explain more",
  advanceToSolution: "Show next step",
  dismiss: "Hide hint",
  noHintAvailable: "No hints available",
};

export const logicExplanationText = {
  button: "Show me the logic",
  title: "Logic explanation",
  close: "Close explanation",
  premisesHeading: "Given clues",
  stepsHeading: "Deduction steps",
  conclusionHeading: "Conclusion",
  colourBinary: {
    halfRule: "Equal colour balance",
    threeRule: "No three in a row",
    halfSummary: (line: string, count: number, colour: string) =>
      `${line} requires exactly ${count} ${colour} squares.`,
    threeSummary: (line: string, colour: string) =>
      `Three adjacent ${colour} squares are not allowed in ${line}.`,
  },
  guzzle: {
    intersectionRule: "Word intersection",
    intersectionSummary: (row: number, column: number) =>
      `Square at row ${row}, column ${column} belongs to intersecting words.`,
  },
};

export const contextHelpText = {
  conflictBadge: "Conflict detected",
  exceedsHalf: (line: string, count: number, max: number, colour: string) =>
    `${line} has ${count} ${colour} squares. Maximum allowed is ${max}.`,
  threeInARow: (line: string, colour: string) =>
    `${line} contains three consecutive ${colour} squares.`,
  identicalLines: (lineType: string, num1: number, num2: number) =>
    `${lineType} ${num1} and ${lineType} ${num2} are identical. Lines must be unique.`,
  guzzleAbsentRepeated: (letter: string, line: string) =>
    `Letter ${letter} was already marked absent in ${line}.`,
  guzzlePresentSuggestion: (letter: string, line: string) =>
    `Letter ${letter} is present in ${line}. Try an open square in this line.`,
};
