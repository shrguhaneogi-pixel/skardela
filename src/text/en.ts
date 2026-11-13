/* oxlint-disable import/max-dependencies, eslint/max-lines */
import type { Rule } from "../shared/RuleList";
import { symbols } from "./symbols";
import { studioText } from "./studio";
import { duelText } from "./duel";
import { expeditionsText } from "./expeditions";
import { learnText } from "./learn";
import { exchangeText } from "./exchange";
import { practiceQueueText } from "./practice";
import { contextHelpText, hintsText, logicExplanationText } from "./logicExplanation";
import { latics } from "./latics";
import { numpuz } from "./numpuz";
import { orbital } from "./orbital";
import { tilt } from "./tilt";

// "1 mistake", "2 mistakes". More than one text uses it.
const mistakeCount = (count: number) => `${count} ${count === 1 ? "mistake" : "mistakes"}`;

const longDate = (date: Date, timeZone?: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone,
  }).format(date);

const puzzleCount = (count: number) => `${count} ${count === 1 ? "puzzle" : "puzzles"}`;

export const text = {
  siteName: "Skardela",
  skipLink: "Skip to main content",
  nav: {
    label: "Main",
  },
  streak: { word: "-day streak" },
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
    randomPuzzle: "Random puzzle",
    solved: "Solved",
    resume: "Resume",
    diagramLabel: (puzzleTypeName: string) => `Interactive diagram for ${puzzleTypeName}`,
    canvasAria: "Interactive editorial visual canvas",
    date: (now: Date) => longDate(now),
    hero: {
      title: "A new set of puzzles every day",
      intro:
        "Skardela has new kinds of logic and word puzzles. Each puzzle type has an easy, a medium and a hard puzzle each day. Play in your browser. You do not need an account or a download.",
      play: "Play today's puzzles",
      howItWorks: "How it works",
      solvedSome: (solved: number, total: number) =>
        `${solved} down. ${puzzleCount(total - solved)} left today.`,
      solvedAll: "All of today's puzzles are solved. See you tomorrow.",
      pickUp: "Pick up where you left off.",
      continueLabel: "Continue",
      puzzleName: (typeName: string, level: string) => `${typeName} · ${level}`,
      progressLabel: "Today's puzzles",
      segment: (typeName: string, level: string, isSolved: boolean) =>
        `${typeName} ${level}: ${isSolved ? "solved" : "not solved"}`,
      progress: (solved: number, total: number) => `${solved} of ${total} solved`,
      newPuzzlesIn: "new puzzles in",
      timeShort: ({ hours, minutes }: { hours: number; minutes: number }) =>
        [hours > 0 ? `${hours} h` : "", minutes > 0 || hours === 0 ? `${minutes} min` : ""]
          .filter((part) => part !== "")
          .join(" "),
      timeLong: ({ hours, minutes }: { hours: number; minutes: number }) =>
        [
          hours > 0 ? `${hours} ${hours === 1 ? "hour" : "hours"}` : "",
          minutes > 0 || hours === 0 ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}` : "",
        ]
          .filter((part) => part !== "")
          .join(" "),
    },
    today: {
      heading: "Today's puzzles",
      intro:
        "The puzzles change at midnight, your local time. All players get the same puzzles on the same date.",
      levelsLabel: (puzzleTypeName: string) => `Today's ${puzzleTypeName}`,
      notSolved: "not solved",
      solvedMark: symbols.progress.solved,
      solvedNoTime: "solved",
      levelLink: (level: string, result?: { time?: string; score?: string }) =>
        result === undefined
          ? `${level}, not solved`
          : [
              `${level}, solved`,
              result.time === undefined ? "" : ` in ${result.time}`,
              result.score === undefined ? "" : ` with ${result.score}`,
            ].join(""),
      play: (level: string) => `Play ${level}`,
      allSolved: (total: string | undefined) =>
        total === undefined ? "All solved today" : `All solved · ${total} total`,
      share: "Share",
      shareLabel: (puzzleTypeName: string) => `Share your ${puzzleTypeName} results of today`,
    },
    steps: {
      heading: "How it works",
      items: [
        {
          title: "Select a puzzle",
          body: "Each puzzle type has an easy, a medium and a hard puzzle for today. Start with easy to learn the rules.",
        },
        {
          title: "Play in your browser",
          body: "The rules are next to the board. Restart at any time, or get a random puzzle of the same level.",
        },
        {
          title: "Come back tomorrow",
          body: "New puzzles come each day at midnight, your local time.",
        },
      ],
    },
    faq: {
      heading: "Questions",
      items: [
        { question: "Is Skardela free?", answer: "Yes. All puzzles are free to play." },
        {
          question: "Do I need an account?",
          answer: "No. Skardela has no accounts. Open a puzzle and play.",
        },
        {
          question: "Does Skardela keep my progress?",
          answer:
            'Partly. Skardela saves the puzzles that you solve, your times and your streak. "Random puzzle" gives you puzzles that you did not solve. A puzzle that you did not finish starts again when you reload the page. Skardela also saves your theme and your OK for the analytics notice. All of this stays in your browser.',
        },
        {
          question: "Can I move my progress to a different browser?",
          answer:
            'Yes. Select "Export my data" under "Your stats" to save a backup file. In the other browser, select "Import" and select the file. The solves of the file are added to the solves of that browser.',
        },
        {
          question: "Something does not work. What can I do?",
          answer:
            'Reload the page first. If the problem stays, select "Clear my data" under "Your stats" on the home page. This deletes all your Skardela data from this browser: your stats, your solved puzzles, your theme and your OK for the analytics notice. Then the page loads again, as for a new player.',
        },
        {
          question: "What data does Skardela collect?",
          answer:
            "Skardela uses analytics to count visits and to see which puzzles people play. The analytics tool does not use cookies, and it does not follow you to other websites.",
        },
        {
          question: "Can I help to make Skardela?",
          answer:
            "Yes. Skardela is open source. You can add puzzles, fix problems or add a new puzzle type.",
          link: { label: "Skardela on GitHub", href: "https://github.com/utk09-NCL/skardela" },
        },
      ],
    },
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
    nowPlaying: "Now playing",
    timerLabel: "Time",
    close: "Close the puzzle and go to today's puzzles",
    result: {
      title: "Solved",
      puzzle: (typeName: string, level: string, number: string) =>
        `${typeName}, ${level}, #${number}`,
      numbersLabel: "Your result",
      time: "time",
      faster: "faster than average",
      slower: "slower than average",
      same: "same as average",
      first: "First",
      firstLabel: (level: string) => `${level} solve`,
      shareHeading: "Share text",
      copy: "Copy result",
      share: "Share result",
      next: (level: string) => `Next: ${level} ${symbols.puzzlePage.next}`,
      nextLabel: (typeName: string, level: string) => `Next puzzle: ${typeName} ${level}`,
    },
    rulesHeading: "Rules",
    keyLabel: "Key",
    restartButton: "Restart",
    restart: "Restart",
    restartQuestion: "Restart the puzzle?",
    restartYes: { text: "Yes", label: "Yes, restart the puzzle" },
    restartNo: { text: "No", label: "No, keep playing" },
    randomButton: "Random puzzle",
    random: "Random puzzle",
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
  cubeAgent: {
    title: "Kinematic 3D Cube Agent UI",
    subtitle: "Spatial drag vector kinematics with real-time LLM state synchronization",
    statusSolved: `${symbols.cube.solved} Solved`,
    statusActive: `${symbols.cube.active} Active Puzzle`,
    moves: "Moves",
    entropy: "Entropy",
    lastMove: "Last Move",
    llmContextPayload: "LLM Context Payload",
    moveLedger: "Singmaster Move Ledger",
    noMoves: "No moves recorded yet",
    spatialControls: "Spatial Controls",
    instructions:
      "Click and drag directly on any cubie face. The projection engine calculates the orthogonal rotation axis relative to camera angle. Slices snap to the nearest 90° with spring physics.",
    cameraInstructions:
      "Click and drag empty background space to orbit the camera view around all faces.",
    copyContext: "Copy Agent Context",
    copied: "Copied Context",
    copyHelp: "Click snippet to copy into agent prompt context.",
    scramble: `${symbols.cube.scramble} Scramble`,
    reset: `${symbols.cube.reset} Reset Cube`,
    moveAnnounce: (lastMove: string, moveCount: number) =>
      `Moved slice ${lastMove}. Current move count: ${moveCount}.`,
  },
  latics,
  numpuz,
  orbital,
  tilt,
};
