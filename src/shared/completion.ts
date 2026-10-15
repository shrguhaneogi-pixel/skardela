// ASD-STE100 Simplified Technical English comments.
// This module calculates performance statistics and formats duration for solved puzzles.

export type CompletionStats = {
  puzzleId: string;
  puzzleType: string;
  difficulty?: string;
  timeSpentSeconds: number;
  hintCount: number;
  mistakes: number;
  isCleanSolve: boolean;
};

// Format elapsed seconds into a readable minutes and seconds string.
export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  if (minutes === 0) {
    return `${seconds}s`;
  }
  const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${minutes}m ${paddedSeconds}s`;
}

// Calculate summary metrics for a solved puzzle.
export function calculateCompletionStats(params: {
  puzzleId: string;
  puzzleType: string;
  difficulty?: string;
  timeSpentSeconds: number;
  hintCount: number;
  mistakes: number;
}): CompletionStats {
  const isCleanSolve = params.hintCount === 0 && params.mistakes === 0;
  return {
    ...params,
    isCleanSolve,
  };
}
