import { hoursAndMinutes, isoDuration, msUntilMidnight } from "../../shared/state/progress";
import { text } from "../../text/en";

// ASD-STE100 Simplified Technical English comments.
// One puzzle of today with its type name and its level name.
export type Segment = { id: string; typeName: string; level: string; isSolved: boolean };

const words = text.home.hero;

// This component shows daily progress segments and time until midnight reset.
export function TodayProgress({ segments, now }: { segments: readonly Segment[]; now: number }) {
  const solved = segments.filter((segment) => segment.isSolved).length;
  const time = hoursAndMinutes(msUntilMidnight(new Date(now)));

  return (
    <div className="w-full max-w-xl mx-auto my-4 p-4 rounded-xl bg-stone-100/80 dark:bg-stone-900/80 backdrop-blur border border-stone-200 dark:border-stone-800 text-center">
      <ol
        className="grid gap-1.5 p-0 m-0 list-none"
        aria-label={words.progressLabel}
        style={{ gridTemplateColumns: `repeat(${segments.length}, minmax(0, 1fr))` }}
      >
        {segments.map(({ id, typeName, level, isSolved }) => (
          <li
            key={id}
            className={`h-2.5 rounded-full transition-colors ${
              isSolved ? "bg-orange-500 shadow-sm" : "bg-stone-300 dark:bg-stone-700"
            }`}
            data-solved={isSolved}
          >
            <span className="visually-hidden">{words.segment(typeName, level, isSolved)}</span>
          </li>
        ))}
      </ol>
      <p className="mt-2.5 text-xs font-medium text-stone-600 dark:text-stone-400">
        {words.progress(solved, segments.length)} · {words.newPuzzlesIn}{" "}
        <time
          dateTime={isoDuration(time)}
          className="font-semibold text-stone-800 dark:text-stone-200"
        >
          <span aria-hidden="true">{words.timeShort(time)}</span>
          <span className="visually-hidden">{words.timeLong(time)}</span>
        </time>
      </p>
    </div>
  );
}
