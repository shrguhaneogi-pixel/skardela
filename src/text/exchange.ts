// Exchange UI localized text strings.
// Follows ASD-STE100 Simplified Technical English.

export const exchangeText = {
  title: "Open Puzzle Exchange",
  intro: "Import and browse custom puzzle packs. Everything runs locally on your device.",
  disclaimer:
    "Local-Only Content Exchange • No public cloud catalog is connected. To share packs with others, send the downloaded .skardela.json file directly.",
  navLink: "Exchange",
  importHeading: "Import Puzzle Pack",
  importPlaceholder: "Paste .skardela.json pack content here...",
  importBtn: "Import & Validate Pack",
  importedHeading: "Your Imported Packs",
  noPacksMessage: "No custom puzzle packs imported yet.",
  packPuzzlesCount: (count: number) => `${count} ${count === 1 ? "puzzle" : "puzzles"}`,
  exportSampleBtn: "Download Sample Pack",
  samplePackSuccess: "Sample pack loaded successfully!",
  importSuccess: "Pack imported and validated successfully!",
  serverRequirementsHeading: "Catalog Architecture Requirements",
  serverRequirementsNote:
    "A public, multi-user community catalog requires cloud object storage, ingestion sandboxing, and abuse moderation infrastructure not present in this client-side application.",
};
