// All symbols of the app are in this file. Change a symbol here to change it everywhere.
// A symbol on a square has the text colour of the square, so it shows clearly on each square colour.
// A symbol shows a colour as a shape too, so colour is not the only signal for the player.
export const symbols = {
  "colour-binary": {
    // A circle and a square have different shapes.
    R: "●",
    B: "■",
    ".": "",
  },
  guzzle: {
    correct: "✓",
    present: "↔",
    absent: "✗",
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
} as const;
