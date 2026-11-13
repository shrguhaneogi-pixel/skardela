import { usePlaySession } from "../../shared/state/playSession";
import { formatDuration } from "../../shared/state/progress";
import { useNow } from "../../shared/useNow";
import { text } from "../../text/en";

// ASD-STE100 Simplified Technical English comments.
// This component shows the active playing timer for the current puzzle.
export function PlayTimer({ puzzleId }: { puzzleId: string }) {
  const { puzzleId: current, startedAt, solvedAt } = usePlaySession();
  const isRunning = current === puzzleId && startedAt !== null && solvedAt === null;
  const now = useNow(1000, isRunning);
  const seconds =
    current === puzzleId && startedAt !== null ? ((solvedAt ?? now) - startedAt) / 1000 : 0;

  return (
    <span
      role="timer"
      aria-label={`${text.puzzlePage.timerLabel}: ${formatDuration(seconds)}`}
      className="inline-flex items-center gap-1 font-mono text-xs px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-semibold"
    >
      <span aria-hidden="true">⏱</span>
      <span>{formatDuration(seconds)}</span>
    </span>
  );
}
