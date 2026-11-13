/* oxlint-disable import/max-dependencies, eslint/max-lines-per-function */
import { useLoaderData } from "react-router";
import { text } from "../../text/en";
import { formatDateString, utcDate } from "../daily";
import type { homeLoader } from "../puzzles";
import { PracticeQueue } from "../../shared/PracticeQueue";
import { EditorialHeroCanvas } from "../../shared/EditorialHeroCanvas";
import { HomeActionsRow, PuzzleCard, QuickPlayBanner } from "./HomePuzzleCard";
import { TodayProgress, type Segment } from "./TodayProgress";
import { HowItWorks } from "./HowItWorks";
import { Faq } from "./Faq";
import { useAppStore } from "../../shared/state/store";
import { useNow } from "../../shared/useNow";
import { getPuzzleProgressStatus } from "../../shared/puzzle-progress";
import styles from "./HomePage.module.css";

// ASD-STE100 Simplified Technical English comments.
// This page shows the daily puzzle list for each puzzle type.
export function HomePage() {
  const cards = useLoaderData<typeof homeLoader>();
  const todayUtc = formatDateString(utcDate());
  const solvedList = useAppStore((state) => state.solved);
  const now = useNow(60_000);

  const segments: Segment[] = cards.flatMap(({ type, levels }) =>
    levels.map(({ id, difficulty }) => ({
      id,
      typeName: text[type].name,
      level: text.levels[difficulty],
      isSolved: solvedList.includes(id) || getPuzzleProgressStatus(id) === "solved",
    })),
  );

  return (
    <>
      <title>{text.siteName}</title>
      <div className="sk-hero">
        <EditorialHeroCanvas />
        <div className={styles.badge} aria-hidden="true">
          <span className={styles.badgeDot} />
          <span>{text.home.editionWithDate(todayUtc)}</span>
        </div>
        <h1 data-testid="home-page-title">{text.home.title}</h1>
        <p className="sk-intro">{text.home.intro}</p>
        <QuickPlayBanner cards={cards} />
        <TodayProgress segments={segments} now={now} />
      </div>

      <section
        data-testid="puzzle-types-section"
        aria-labelledby="puzzle-types-heading"
        className="mt-4"
      >
        <h2 id="puzzle-types-heading" className="visually-hidden">
          {text.home.puzzleTypesHeading}
        </h2>
        <ul className="sk-puzzle-grid mt-3">
          {cards.map((card) => (
            <PuzzleCard key={card.type} {...card} />
          ))}
        </ul>
        <HomeActionsRow />
      </section>
      <PracticeQueue />
      <HowItWorks />
      <Faq />
    </>
  );
}
