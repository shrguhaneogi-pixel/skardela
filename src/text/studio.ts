// Studio UI localized text strings.
// Follows ASD-STE100 Simplified Technical English.

export const studioText = {
  title: "Puzzle Studio",
  intro: "Author, test, and export custom puzzles. Everything runs locally in your browser.",
  disclaimer: "Custom puzzles remain private on your device. No puzzles are sent to a server.",
  navLink: "Studio",
  tabColourBinary: "Colour Binary",
  tabGuzzle: "Guzzle",
  tabJson: "Raw JSON",
  authorLabel: "Author",
  idLabel: "Puzzle ID",
  difficultyLabel: "Difficulty",
  validateBtn: "Validate Puzzle",
  exportBtn: "Export JSON",
  copyBtn: "Copy to Clipboard",
  copied: "Copied to clipboard!",
  clearBtn: "Clear Board",
  validSuccess: "Puzzle is valid! It obeys all rules and has a unique solution.",
  invalidHeader: "Validation issues detected:",
  jsonPlaceholder: "Paste custom puzzle JSON here...",
  jsonTooLarge: "JSON payload exceeds maximum allowed size (32 KB).",
  jsonInvalid: "Invalid JSON format.",
  cellAria: (r: number, c: number, val: string) => `Row ${r}, Column ${c}, current: ${val}`,
};
