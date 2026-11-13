/* oxlint-disable eslint/max-lines */
import type { KeyItem, Rule } from "../shared/RuleList";
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

// "miss", "misses". The misses are the score of Latics and Orbital.
const missWord = (count: number) => (count === 1 ? "miss" : "misses");
const missCount = (count: number) => `${count} ${missWord(count)}`;

// "a", "a and b", "a, b and c".
const listOf = (items: readonly string[]) =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

// The colour of a beam in words. A white beam is only "beam", so a board with one white laser reads as before.
const beamName = (colour: "white" | "red" | "blue") =>
  colour === "white" ? "beam" : `${colour} beam`;

const { red: laticsRed, blue: laticsBlue } = symbols.latics.colours;
const redMark = { symbol: laticsRed, colour: "red" } as const;
const blueMark = { symbol: laticsBlue, colour: "blue" } as const;

const {
  "+": numpuzAdd,
  "-": numpuzSubtract,
  "\u00D7": numpuzMultiply,
  "\u00F7": numpuzDivide,
} = symbols.numpuz.operators;

// "1 unit", "8 units".
const unitCount = (count: number) => `${count} ${count === 1 ? "unit" : "units"}`;

// "Big" from "big", for the start of a sentence.
const capital = (word: string) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`;

const { red: tiltRed, blue: tiltBlue, yellow: tiltYellow } = symbols.tilt.colours;

// "extra tilt", "extra tilts". The extra tilts are the score of Tilt.
const extraWord = (count: number) => (count === 1 ? "extra tilt" : "extra tilts");
const extraCount = (count: number) => `${count} ${extraWord(count)}`;

// "1 square", "3 squares".
const squareCount = (count: number) => `${count} ${count === 1 ? "square" : "squares"}`;

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
    exportDataBtn: "Export my data",
    importDataBtn: "Import data",
    importSuccess: (count: number) => `Imported ${count} ${count === 1 ? "solve" : "solves"}.`,
    importFailed: "Could not read the backup file.",
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
  arcade: {
    title: "Retro 3D Arcade",
    subtitle: "Hardware-accelerated CRT display with 3D kinematic puzzle execution",
    navLink: "Arcade",
  },
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
  latics: {
    name: "Latics",
    tag: "Optics puzzle",
    summary: "Turn the mirrors and send the laser beam to the monster.",
    rules: [
      `Hit each monster ${symbols.latics.monster} with a laser beam.`,
      "Select a mirror to turn it. Walls stop the beam.",
      "Medium and hard: plan the path, then fire the laser. Each miss counts.",
    ] satisfies Rule[],
    rulesKey: [
      { text: "water bends the beam", sample: { fill: "water", symbol: "" } },
      {
        text: "a prism splits white light",
        sample: { fill: "empty", symbol: symbols.latics.prism },
      },
      { text: "a filter lets only its colour through", sample: { fill: "red", symbol: laticsRed } },
    ] satisfies KeyItem[],
    moreRules: {
      label: "More rules: the tray, the lasers, water, prisms and filters",
      rules: [
        "The beam goes in a straight line: across, up and down, or diagonally.",
        "A mirror turns the beam. The angle in is the same as the angle out. A beam that goes along a mirror does not change.",
        "The beam also stops when it goes off the board or back into a laser.",
        "Each select turns a mirror 45° clockwise.",
        "Easy: the beam shows at all times.",
        "Medium and hard: a shot that does not hit all monsters is a miss. Make the fewest misses.",
        "Medium and hard: select an empty square to put a mirror from the tray there. A tray mirror goes back to the tray after four turns. You cannot put a tray mirror on water.",
        "Hard: select a laser to turn it 45° clockwise.",
        "Water: a diagonal beam that goes into water turns straight, square to the edge of the water. When it leaves the water, it turns back to its first direction. A straight beam does not change.",
        "Critical angle: a diagonal beam from a laser in water cannot get out. At the edge of the water, it reflects back in.",
        "Prism: red light turns 45° to the right, and blue light turns 45° to the left. Thus a white beam splits into a red beam and a blue beam.",
        {
          parts: [
            "Filter: a red filter ",
            redMark,
            " lets only red light through, and a blue filter ",
            blueMark,
            " lets only blue light through. A white beam goes through and gets the colour of the filter.",
          ],
        },
        {
          parts: [
            "A red monster ",
            redMark,
            " needs a red beam, and a blue monster ",
            blueMark,
            ` needs a blue beam. The monster ${symbols.latics.monster} with no colour needs a beam of any colour.`,
          ],
        },
        '"Path of the beam" under the board tells the path of the beam in words.',
      ] satisfies Rule[],
    },
    score: missCount,
    scoreWord: missWord,
    boardLabel: "Latics board",
    symbols: symbols.latics,
    directions: {
      E: "right",
      NE: "up and right",
      N: "up",
      NW: "up and left",
      W: "left",
      SW: "down and left",
      S: "down",
      SE: "down and right",
    },
    colours: { white: "white", red: "red", blue: "blue" },
    pieces: {
      ".": "empty",
      "#": "wall",
      L: "laser",
      M: "monster",
      R: "red monster",
      B: "blue monster",
      "^": "prism",
      r: "red filter",
      b: "blue filter",
      "-": "horizontal mirror",
      "/": "mirror from bottom left to top right",
      "|": "vertical mirror",
      "\\": "mirror from top left to bottom right",
    },
    laserName: (colour: "white" | "red" | "blue") =>
      colour === "white" ? "laser" : `${colour} laser`,
    square: (square: {
      row: number;
      column: number;
      piece: string;
      laser: string;
      isFromTray: boolean;
      isHit: boolean;
      isInWater: boolean;
    }) =>
      [
        `Row ${square.row}, column ${square.column}`,
        square.isFromTray ? `${square.piece} from the tray` : square.piece,
        square.laser === "" ? "" : `points ${square.laser}`,
        square.isInWater ? "in water" : "",
        square.isHit ? "hit" : "",
      ]
        .filter((part) => part !== "")
        .join(", "),
    controlsLabel: "Laser controls",
    tray: (count: number) => `Mirrors in the tray: ${count}`,
    fire: "Fire the laser",
    misses: missCount,
    pathLabel: "Path of the beam",
    path: {
      start: (colour: "white" | "red" | "blue", from: string, at: string) =>
        `The ${beamName(colour)} starts at the ${from} at ${at}.`,
      move: (direction: string, squares: number, colour: "white" | "red" | "blue" = "white") =>
        `The ${beamName(colour)} goes ${direction} ${squares} ${squares === 1 ? "square" : "squares"}.`,
      turns: {
        mirror: (at: string, direction: string) => `The mirror at ${at} turns it ${direction}.`,
        prism: (at: string, direction: string) => `The prism at ${at} turns it ${direction}.`,
        waterIn: (at: string, direction: string) => `The water at ${at} turns it ${direction}.`,
        waterOut: (at: string, direction: string) =>
          `It leaves the water after ${at} and turns ${direction}.`,
        edge: (at: string, direction: string) =>
          `The edge of the water at ${at} reflects it ${direction}.`,
      },
    },
    ends: {
      monster: () => "The beam hits the monster.",
      otherMonster: (at: string) =>
        `The monster at ${at} needs a beam of a different colour. It stops the beam.`,
      wall: (at: string) => `A wall at ${at} stops the beam.`,
      laser: () => "The beam comes back to the laser.",
      edge: (at: string) => `The beam goes off the board after ${at}.`,
      loop: () => "The beam goes around in a loop.",
      join: () => "From here, the beam goes along the path of a different beam.",
      filter: (at: string) => `The filter at ${at} has a different colour. It stops the beam.`,
      split: (at: string) => `The prism at ${at} splits the beam into a red beam and a blue beam.`,
      colour: (at: string) => `The filter at ${at} lets only light of its colour through.`,
    },
    at: (row: number, column: number) => `row ${row}, column ${column}`,
    status: {
      plan: (can: { tray: boolean; aim: boolean }) =>
        `Plan the path: ${listOf([
          "turn the mirrors",
          ...(can.tray ? ["put mirrors from the tray on empty squares"] : []),
          ...(can.aim ? ["turn the lasers"] : []),
        ])}. Then fire the laser.`,
      hits: (hit: number, total: number) =>
        `The beams hit ${hit} of ${total} ${total === 1 ? "monster" : "monsters"}.`,
      solved: "You solved the puzzle. The beam hits the monster.",
      solvedAll: "You solved the puzzle. The beams hit all monsters.",
      solvedWithMisses: (count: number) => `You solved the puzzle with ${missCount(count)}.`,
    },
  },
  numpuz: {
    name: "Numpuz",
    tag: "Arithmetic puzzle",
    summary: `Fill each blank with ${numpuzAdd} ${numpuzSubtract} ${numpuzMultiply} or ${numpuzDivide} to reach the target number.`,
    rules: [
      `Fill each blank between the numbers with ${numpuzAdd} ${numpuzSubtract} ${numpuzMultiply} or ${numpuzDivide}.`,
      "The equation must be equal to the target number.",
      `${numpuzMultiply} and ${numpuzDivide} are worked out before ${numpuzAdd} and ${numpuzSubtract}.`,
    ] satisfies Rule[],
    rulesKey: [] satisfies KeyItem[],
    moreRules: {
      label: "More rules: blanks and checking",
      rules: [
        "Each blank takes one operator.",
        "Select a blank. Then choose an operator to put in it.",
        "Fill every blank. Then select Check.",
        "A check with a wrong answer is one mistake. Change an operator before you check again.",
        `With a keyboard: type +, -, * or / on a blank. * gives ${numpuzMultiply} and / gives ${numpuzDivide}.`,
      ] satisfies Rule[],
    },
    score: mistakeCount,
    scoreWord: (count: number) => (count === 1 ? "mistake" : "mistakes"),
    boardLabel: "Numpuz board",
    target: (target: number) => `Target: ${target}`,
    symbols: symbols.numpuz,
    operatorNames: { "+": "plus", "-": "minus", "\u00D7": "times", "\u00F7": "divided by" },
    blank: (blank: { position: number; operator: string }) =>
      `Blank ${blank.position}, ${blank.operator === "" ? "empty" : blank.operator}`,
    keysLabel: "Operators",
    key: (name: string) => `Put ${name} in the selected blank`,
    checkButton: "Check",
    status: {
      start: "Select a blank. Then type an operator or select an operator.",
      incomplete: "Fill every blank before you check.",
      wrong: (count: number) =>
        `Not yet. The equation is not equal to the target. Change an operator and check again. Mistakes: ${count}.`,
      solved: (count: number) =>
        `You solved the puzzle with ${mistakeCount(count)}. The equation is equal to the target.`,
    },
  },
  orbital: {
    name: "Orbital",
    tag: "Gravity simulation",
    summary: "Launch the probe past the planets and into the ring.",
    rules: [
      "Set the angle and the power, then launch the probe.",
      "The planets pull the probe. A bigger planet pulls more.",
      "Get the probe into the ring. Make the fewest misses.",
    ] satisfies Rule[],
    rulesKey: [] satisfies KeyItem[],
    moreRules: {
      label: "More rules: the flight, the misses and the controls",
      rules: [
        "0° points right, 90° points up, 180° points left and 270° points down.",
        "The flight stops when the probe reaches the ring, hits a planet, goes off the board or flies for 4 s.",
        "Each launch starts from the launch point. A launch that does not reach the ring is a miss.",
        "The same angle and power always give the same path. The board keeps the paths of your earlier launches.",
        "A launch straight at the ring never gets there. Use the pull of the planets.",
        "Keyboard: the arrow keys change the angle and the power. Then press Enter or Space on Launch.",
        "Mouse and touch: drag back from the probe to aim, as with a slingshot. Let go to launch.",
        "Your score is the misses. 0 is a perfect solve.",
      ] satisfies Rule[],
    },
    score: missCount,
    scoreWord: missWord,
    boardLabel: "Orbital board",
    itemsLabel: "Items on the board",
    items: {
      probe: (at: string) => `Probe at ${at}.`,
      ring: (at: string) => `Ring at ${at}.`,
      planet: (size: string, at: string) => `${capital(size)} planet at ${at}.`,
    },
    at: (x: number, y: number) => `x ${x}, y ${y}`,
    sizes: { small: "small", medium: "medium", big: "big" },
    misses: (count: number) => `Misses: ${count}.`,
    controlsLabel: "Aim and launch",
    angle: "Angle",
    power: "Power",
    degrees: (angle: number) => `${angle}°`,
    launch: "Launch",
    status: {
      start: "Set the angle and the power, then select Launch. Or drag back from the probe.",
      aim: (angle: number, power: number) => `Angle ${angle}°, power ${power}.`,
      ends: {
        ring: "The probe reached the ring.",
        planet: (size: string, at: string) => `The probe hit the ${size} planet at ${at}.`,
        edge: "The probe went off the board.",
        time: (seconds: number) => `The probe flew for ${seconds} s and stopped.`,
      },
      closest: (units: number) => `Closest to the ring: ${unitCount(units)}.`,
      solved: (count: number) => `You solved the puzzle with ${missCount(count)}.`,
    },
  },
  tilt: {
    name: "Tilt",
    tag: "Kinetic puzzle",
    summary: "Tilt the board to roll each ball into the hole of its colour.",
    rules: [
      "Tilt the board up, down, left or right. All balls roll until something stops them.",
      "A coloured ball that rolls over the hole of its colour falls in and stays there.",
      "Get all coloured balls into their holes with the fewest tilts.",
    ] satisfies Rule[],
    rulesKey: [
      { text: "red ball and hole", sample: { fill: "red", symbol: tiltRed } },
      { text: "blue ball and hole", sample: { fill: "blue", symbol: tiltBlue } },
      { text: "yellow ball and hole", sample: { fill: "yellow", symbol: tiltYellow } },
      { text: "ball in its hole", sample: { fill: "empty", symbol: symbols.tilt.full } },
    ] satisfies KeyItem[],
    moreRules: {
      label: "More rules: walls, holes, the grey ball and the controls",
      rules: [
        "A ball stops at a wall, at the edge of the board, at another ball or at a full hole.",
        "A ball in its hole does not move again. A full hole stops the other balls, as a wall does.",
        "A ball rolls over an empty hole of a different colour. It can also stop on it. Then it stops the other balls.",
        "When two balls are in one line, the front ball moves first. The ball behind it stops next to it.",
        "Hard: the grey ball has no hole. It only stops the other balls. You need it to solve the puzzle.",
        "A tilt that moves no ball does not count.",
        "Your score is the extra tilts: your tilts minus the fewest tilts. 0 is a perfect solve.",
        "Keyboard: the arrow keys tilt the board. Mouse and touch: use the arrow buttons, or swipe on the board.",
        "There is no undo. Restart puts the balls back at the start.",
      ] satisfies Rule[],
    },
    score: extraCount,
    scoreWord: extraWord,
    symbols: symbols.tilt,
    colours: { red: "red", blue: "blue", yellow: "yellow", grey: "grey" },
    directions: { up: "up", down: "down", left: "left", right: "right" },
    boardLabel: (size: number) => `Tilt board, ${size} by ${size}`,
    boardHelp: "Use the arrow keys to tilt the board.",
    keyHint: {
      idle: "Click the board to use the arrow keys.",
      active: "The arrow keys tilt the board.",
    },
    square: (row: number, column: number, content: string) =>
      `Row ${row}, column ${column}, ${content}`,
    squares: {
      empty: "empty",
      wall: "wall",
      ball: (colour: string) => `${colour} ball`,
      hole: (colour: string) => `${colour} hole`,
      inHole: (colour: string) => `${colour} ball in its hole`,
      onHole: (ball: string, hole: string) => `${ball} ball on the ${hole} hole`,
    },
    counts: (tilts: number, fewest: number | null) =>
      `Tilts: ${tilts}. Fewest: ${fewest === null ? "unknown" : fewest}.`,
    controlsLabel: "Tilt the board",
    tiltButton: (direction: string) => `Tilt ${direction}`,
    status: {
      start: "Tilt the board with the arrow keys, the arrow buttons or a swipe.",
      tilt: (direction: string) => `Tilt ${direction}.`,
      rolls: (colour: string, squares: number) =>
        `The ${colour} ball rolls ${squareCount(squares)}.`,
      fallsIn: (colour: string) => `The ${colour} ball falls into its hole.`,
      tilts: (count: number) => `Tilts: ${count}.`,
      noMove: (direction: string) => `No ball can move ${direction}.`,
      solved: (extra: number) =>
        extra === 0
          ? "You solved the puzzle with 0 extra tilts. This is a perfect solve."
          : `You solved the puzzle with ${extraCount(extra)}.`,
    },
  },
};
