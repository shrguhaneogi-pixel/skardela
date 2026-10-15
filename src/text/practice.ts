// Practice queue text slice.
// Follows ASD-STE100 Simplified Technical English.

export const practiceQueueText = {
  title: "Personal Practice Queue",
  intro: "Explainable practice challenges based on your local solves and unplayed archive puzzles.",
  disclaimer:
    "Recommendations use deterministic local rules only. No remote AI or data transmission is used.",
  enableLabel: "Enable practice recommendations",
  disabledMessage: "Personal Practice Queue is turned off.",
  enableBtn: "Turn on queue",
  disableBtn: "Turn off queue",
  emptyWarmupReason: (game: string) => `Start your journey with this gentle ${game} warmup.`,
  nextLevelReason: (game: string, level: string) =>
    `You solved ${game} (${level}). Try the next difficulty to practice deeper logic.`,
  archivePracticeReason: (game: string, date: string) =>
    `Unplayed ${game} puzzle from the ${date} archive.`,
  masteryReason: (game: string) => `Keep your skills sharp with this ${game} challenge.`,
  playButton: "Practice",
  todayBadge: "Today's challenge",
  archiveBadge: "Archive practice",
};
