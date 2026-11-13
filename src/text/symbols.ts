// All symbols of the app are in this file. Change a symbol here to change it everywhere.
// A symbol on a square has the text colour of the square, so it shows clearly on each square colour.
// A symbol shows a colour as a shape too, so colour is not the only signal for the player.
export const symbols = {
  common: {
    check: "✓",
    time: "⏱",
    arrowRight: "→",
  },
  "colour-binary": {
    // A circle and a square have different shapes.
    R: "●",
    B: "■",
    ".": "",
    balanced: "✓",
  },
  guzzle: {
    correct: "✓",
    present: "↔",
    absent: "✗",
    // An arrow on the first square of a word shows the direction to read the word.
    arrows: { across: "→", down: "↓", diagonalDown: "↘", diagonalUp: "↗" },
  },
  latics: {
    monster: "👾",
    // The monster shows this symbol too when the beam hits it.
    hit: "💥",
    // The symbol of a prism in the rules key. The board draws the prism as a triangle.
    prism: "▲",
    // A red filter, a red monster and a red laser show a circle. Blue ones show a square, as in Colour Binary.
    colours: { red: "●", blue: "■" },
  },
  numpuz: {
    // The four operators that a blank can take. Each key is the operator in the puzzle data.
    operators: { "+": "+", "-": "−", "×": "×", "÷": "÷" },
    // A blank that has no operator yet.
    empty: "?",
  },
  tilt: {
    // The icon of each ball colour. A ball and its hole show the same icon, so colour is not the only signal.
    // The grey ball has no icon.
    colours: { red: "▲", blue: "■", yellow: "★", grey: "" },
    // A hole with its ball shows a full circle with this mark.
    full: "✓",
    // The four arrow buttons that tilt the board.
    arrows: { up: "↑", down: "↓", left: "←", right: "→" },
    // The key hint above the board starts with this mark.
    keyboard: "⌨️",
  },
  progress: {
    solved: "✓",
  },
  share: {
    clean: "🟩",
    mistakes: "🟨",
    unsolved: "⬜",
  },
  puzzlePage: {
    close: "✕",
    next: "→",
  },
  theme: {
    system: "💻",
    light: "☀️",
    dark: "🌙",
  },
  completion: {
    clean: "✨",
    time: "⏱️",
    hint: "💡",
    mistake: "❌",
  },
  postcard: {
    colourBinary: {
      R: "🟥",
      B: "🟦",
      empty: "⬜",
    },
    guzzle: {
      correct: "🟩",
      present: "🟨",
      absent: "⬛",
      empty: "⬜",
    },
  },
  atlas: {
    solved: "🎯",
    clean: "✨",
    streak: "🔥",
    time: "⏱️",
    skill: "🧩",
  },
  practiceQueue: {
    queue: "🎯",
    recommend: "💡",
  },
  studio: {
    studio: "🛠️",
    validate: "🔍",
    export: "💾",
  },
  duel: {
    duel: "⚔️",
    trophy: "🏆",
    tie: "🤝",
  },
  expeditions: {
    compass: "🧭",
    map: "🗺️",
    locked: "🔒",
    completed: "✅",
  },
  learn: {
    pathway: "🎓",
    lesson: "📖",
    step: "🔹",
    done: "✅",
  },
  exchange: {
    exchange: "📦",
    import: "📥",
    export: "📤",
  },
  cube: {
    cube: "🧊",
    solved: "✅",
    active: "⚡",
    scramble: "🔀",
    reset: "🔄",
    orbit: "🌐",
  },
} as const;
