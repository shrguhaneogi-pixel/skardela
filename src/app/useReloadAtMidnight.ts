import { useContext, useEffect } from "react";
import { UNSAFE_DataRouterContext as DataRouterContext } from "react-router";
import { dayKey } from "../shared/state/progress";

// ASD-STE100 Simplified Technical English comments.
// The time between two checks of the day in milliseconds.
const CHECK_TIME = 60_000;

// The puzzles change at local midnight. React Router runs a loader only on a navigation,
// thus a page that stays open all night keeps the puzzles of yesterday. This hook runs
// the loaders of the page again when the day changes.
export function useReloadAtMidnight(): void {
  const dataRouterContext = useContext(DataRouterContext);

  useEffect(() => {
    if (!dataRouterContext) return;
    let day = dayKey(new Date());
    const timer = setInterval(() => {
      const today = dayKey(new Date());
      if (today === day) return;
      day = today;
      void dataRouterContext.router.revalidate();
    }, CHECK_TIME);
    return () => {
      clearInterval(timer);
    };
  }, [dataRouterContext]);
}
