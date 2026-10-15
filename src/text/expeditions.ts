// Expeditions UI localized text strings.
// Follows ASD-STE100 Simplified Technical English.

export const expeditionsText = {
  title: "Puzzle Expeditions",
  intro: "Curated multi-puzzle journeys. Master logical deductions through themed chapters.",
  disclaimer:
    "Expedition progress is saved locally on your device. Puzzles are deterministic and verified.",
  navLink: "Expeditions",
  chapterProgress: (completed: number, total: number, pct: number) =>
    `${completed} of ${total} stages completed (${pct}%)`,
  stageLocked: "Locked (complete prerequisite)",
  stageAvailable: "Available",
  stageCompleted: "Completed",
  playStageBtn: "Start Stage",
  reviewStageBtn: "Review Stage",
};
