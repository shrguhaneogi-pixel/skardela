import type { Rule } from "../shared/RuleList";
import { symbols } from "./symbols";
import { studioText } from "./studio";
import { duelText } from "./duel";
import { expeditionsText } from "./expeditions";
import { learnText } from "./learn";
import { exchangeText } from "./exchange";
import { practiceQueueText } from "./practice";
import { contextHelpText, hintsText, logicExplanationText } from "./logicExplanation";

// "1 mistake", "2 mistakes". More than one text uses it.
const mistakeCount = (count: number) => `${count} ${count === 1 ? "mistake" : "mistakes"}`;

export const text = {
  siteName: "Skardela",
  skipLink: "Skip to main content",
  nav: {
    label: "Main",
  },
  // The name of each level. The home page and the puzzle page both use it.
  levels: { easy: "Easy", medium: "Medium", hard: "Hard" },
  theme: {
    label: "Theme",
    options: {
      system: `${symbols.theme.system} System`,
      light: `${symbols.theme.light} Light`,
      dark: `${symbols.theme.dark} Dark`,
    },
  },
  footer: {
    content: (year: number) => `© ${year} Skardela. This website uses analytics.`,
  },
  home: {
    title: "Today's puzzles",
    intro: "New puzzles each day. They are free. You do not need an account or a download.",
    edition: "Daily edition",
    editionWithDate: (date: string) => `Daily edition • ${date} UTC`,
    puzzleTypesHeading: "Puzzle types",
    levelsHeading: (puzzleTypeName: string) => `Today's ${puzzleTypeName}`,
    quickPlay: "Continue playing",
    quickStart: "Start daily challenge",
    archiveLink: "Browse archive",
    solved: "Solved",
    resume: "Resume",
    diagramLabel: (puzzleTypeName: string) => `Interactive diagram for ${puzzleTypeName}`,
    canvasAria: "Interactive editorial visual canvas",
  },
  archive: {
    title: "Puzzle Archive",
    intro: "Solve puzzles from previous daily editions.",
    datePickerLabel: "Pick date",
    recentHeading: "Recent editions",
    selectedDateHeading: (date: string) => `Puzzles for ${date}`,
    archiveBadge: (date: string) => `Archive • ${date}`,
    todayBadge: "Today's edition",
    jumpToToday: "Go to today",
    navLink: "Archive",
  },
  atlas: {
    title: "Personal Logic Atlas",
    intro:
      "A local summary of your puzzle practice and reasoning skills. All data stays on your device.",
    disclaimer:
      "This atlas records your completed deductions in Skardela. It does not measure general intelligence.",
    totalSolved: "Total Solved",
    cleanSolves: "Perfect Solves",
    currentStreak: "Daily Streak",
    streakDays: (days: number) => `${days} ${days === 1 ? "day" : "days"}`,
    totalTime: "Total Time",
    skillsHeading: "Reasoning Skills",
    breakdownHeading: "Puzzle Types",
    settingsHeading: "Privacy & Controls",
    enableLabel: "Enable Personal Logic Atlas",
    enableHelp: "When disabled, stats are not collected or displayed.",
    clearHistoryBtn: "Clear Atlas History",
    clearConfirm: "Are you sure you want to clear your local puzzle history?",
    historyCleared: "Atlas history cleared.",
    navLink: "Atlas",
    constellationAria: "Reasoning skills constellation chart",
    disabledMessage: "Personal Logic Atlas is disabled.",
  },
  puzzlePage: {
    title: (puzzleTypeName: string, id: string, siteName: string) =>
      `${puzzleTypeName} ${id} | ${siteName}`,
    detailsLabel: "Puzzle details",
    // The details under the title have no labels. The words "#" and "by" are enough.
    puzzleNumber: (number: string) => `#${number}`,
    author: (author: string) => `by ${author}`,
    rulesHeading: "Rules",
    loading: "The puzzle is loading...",
    loadingBoard: "The board is loading...",
    boardError: "An error stopped the board. Reload the page to try again.",
  },
  "colour-binary": {
    name: "Colour Binary",
    tag: "Logic puzzle",
    summary: "Make each square red or blue. Each line has half of each colour.",
    rules: [
      "Make each square red or blue.",
      "Each row and each column has the same number of red squares and blue squares.",
      "Three squares of the same colour must not be next to each other in a row or a column.",
    ],
    boardLabel: "Colour Binary board",
    colours: { R: "red", B: "blue", ".": "empty" },
    symbols: symbols["colour-binary"],
    square: (square: { row: number; column: number; colour: string; isFixed: boolean }) =>
      `Row ${square.row}, column ${square.column}, ${square.colour}${square.isFixed ? ", fixed" : ""}`,
    status: {
      start: "Tap a square to make it red. Tap again for blue, and again to make it empty.",
      solved: "You solved the puzzle. Each row and each column obeys the rules.",
    },
    telemetry: {
      title: "Line balance telemetry",
      rowLabel: "Rows",
      colLabel: "Cols",
      rowsBalanced: (balanced: number, total: number) => `Rows balanced: ${balanced} of ${total}`,
      colsBalanced: (balanced: number, total: number) =>
        `Columns balanced: ${balanced} of ${total}`,
      balanceStatus: (rows: number, cols: number, size: number) =>
        `Rows ${rows}/${size} • Cols ${cols}/${size}`,
      allBalanced: "All lines are balanced",
      lineBalanced: "Line is balanced",
      lineOver: "Line exceeds colour limit",
      linePending: "Line is incomplete",
    },
    hintButton: "Hint",
    hint: (hint: {
      row: number;
      column: number;
      colour: string;
      otherColour: string;
      reason: "half" | "three";
      line: "row" | "column";
      number: number;
    }) => {
      const line = `${hint.line === "row" ? "Row" : "Column"} ${hint.number}`;
      const why =
        hint.reason === "half"
          ? `${line} already has half of its squares ${hint.otherColour}.`
          : `${hint.otherColour} here makes three ${hint.otherColour} squares next to each other in ${line}.`;
      return `Row ${hint.row}, column ${hint.column}: ${why} Thus this square is ${hint.colour}.`;
    },
    noHint: "No hints available",
  },
  guzzle: {
    name: "Guzzle",
    tag: "Word puzzle",
    sampleCenter: "A",
    summary: "Find four words that cross at the center letter. Make the fewest mistakes.",
    rules: [
      "Four words cross at the center letter: across, down and two diagonals.",
      "All words have the same length. The diagonals read from left to right.",
      "Put a letter in a square.",
      {
        text: "Green: the letter is correct.",
        sample: { fill: "green", symbol: symbols.guzzle.correct },
      },
      {
        text: "Yellow: this word has the letter in a different square.",
        sample: { fill: "yellow", symbol: symbols.guzzle.present },
      },
      {
        text: "Red: this word does not have the letter.",
        sample: { fill: "red", symbol: symbols.guzzle.absent },
      },
      "Make all squares green with the fewest mistakes.",
    ] satisfies Rule[],
    boardLabel: "Guzzle board",
    hintButton: "Hint",
    modeLabel: "How do you want to play?",
    modes: { bank: "With bank", noBank: "Without bank" },
    bankLabel: "Letter bank",
    keysLabel: "Letters",
    key: (letter: string, count?: number) =>
      count === undefined
        ? `Put ${letter} in the selected square`
        : `Put ${letter} in the selected square. ${count} left`,
    marks: {
      correct: "green, correct",
      present: "yellow, in a different square",
      absent: "red, not in this word",
    },
    symbols: symbols.guzzle,
    lines: {
      across: "across word",
      down: "down word",
      diagonalDown: "diagonal from the top left",
      diagonalUp: "diagonal from the bottom left",
    },
    lineShort: {
      across: "Across",
      down: "Down",
      diagonalDown: "Diag ↘",
      diagonalUp: "Diag ↗",
    },
    telemetry: {
      title: "Word line progress",
      wordsCompleted: (done: number, total: number) => `Lines solved: ${done} of ${total}`,
      allCompleted: "All words solved",
    },
    square: (square: {
      row: number;
      column: number;
      letter: string;
      mark: string;
      isFixed: boolean;
    }) =>
      [
        `Row ${square.row}, column ${square.column}`,
        square.letter === "" ? "empty" : square.letter,
        square.mark,
        square.isFixed ? "fixed" : "",
      ]
        .filter((part) => part !== "")
        .join(", "),
    mistakes: mistakeCount,
    status: {
      choose: "Select a mode to start.",
      start: "Select a square. Then type a letter or select a letter.",
      correct: (letter: string) => `${letter} is correct.`,
      present: (letter: string, line: string) => `The ${line} has ${letter} in a different square.`,
      absent: (letter: string, line: string) => `The ${line} does not have ${letter}.`,
      solved: (mode: string, mistakes: number) =>
        `You solved the puzzle. ${mode}, ${mistakeCount(mistakes)}.`,
    },
  },
  hints: hintsText,
  logicExplanation: logicExplanationText,
  contextHelp: contextHelpText,
  completion: {
    title: "Puzzle solved!",
    subtitle: "Good work. Here is your summary:",
    timeSpent: "Time",
    hintsUsed: "Hints used",
    mistakes: "Mistakes",
    cleanSolve: "Perfect solve!",
    cleanSolveDesc: "Solved with no hints and no errors.",
    playAgain: "Play again",
    reviewBoard: "Review board",
    openSummary: "View solve summary",
    sharePostcard: "Share postcard",
    copied: "Copied to clipboard!",
    shareFailed: "Could not share or copy postcard.",
  },
  postcard: {
    header: (game: string, id: string, detail?: string) =>
      detail ? `Skardela — ${game} #${id} (${detail})` : `Skardela — ${game} #${id}`,
    stats: (time: string, hints: number, mistakes: number) =>
      `⏱️ ${time} | 💡 ${hints} hints | ❌ ${mistakes} mistakes`,
    cleanStats: (time: string) => `⏱️ ${time} | ✨ Perfect solve!`,
    url: "https://skardela.app",
  },
  practiceQueue: practiceQueueText,
  studio: studioText,
  duel: duelText,
  expeditions: expeditionsText,
  learn: learnText,
  exchange: exchangeText,
  notFound: {
    title: "Page Not Found",
    body: "The page you are looking for does not exist.",
    homeLink: "Go to the home page",
  },
  routeError: {
    title: "Something went wrong",
    body: "An error stopped this page. Reload the page to try again.",
    homeLink: "Go to the home page",
  },
};
