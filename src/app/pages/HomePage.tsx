import { Link, useLoaderData } from "react-router";
import { text } from "../../text/en";
import { symbols } from "../../text/symbols";
import { formatDateString, utcDate } from "../daily";
import { RandomPuzzleButton } from "../RandomPuzzleButton";
import type { homeLoader } from "../puzzles";
import { PracticeQueue } from "../../shared/PracticeQueue";
import { EditorialHeroCanvas } from "../../shared/EditorialHeroCanvas";
import { PuzzleCard, QuickPlayBanner } from "./HomePuzzleCard";
import styles from "./HomePage.module.css";

// This page shows the daily puzzle list for each puzzle type.
export function HomePage() {
  const cards = useLoaderData<typeof homeLoader>();
  const todayUtc = formatDateString(utcDate());

  return (
    <>
      <title>{text.siteName}</title>
      <div className={styles.hero}>
        <EditorialHeroCanvas />
        <div className={styles.badge} aria-hidden="true">
          <span className={styles.badgeDot} />
          <span>{text.home.editionWithDate(todayUtc)}</span>
        </div>
        <h1 data-testid="home-page-title">{text.home.title}</h1>
        <p className={styles.intro}>{text.home.intro}</p>
        <QuickPlayBanner cards={cards} />
      </div>

      <section
        data-testid="puzzle-types-section"
        aria-labelledby="puzzle-types-heading"
        className={styles.section}
      >
        <h2 id="puzzle-types-heading" className="visually-hidden">
          {text.home.puzzleTypesHeading}
        </h2>
        <ul className={styles.list}>
          {cards.map((card) => (
            <PuzzleCard key={card.type} {...card} />
          ))}
        </ul>
        <div className={styles.archiveLinkRow}>
          <div className={styles.levels}>
            <Link to="/archive" className={styles.archiveLink}>
              {text.home.archiveLink} {symbols.common.arrowRight}
            </Link>
            <RandomPuzzleButton className={styles.archiveLink} label={text.home.randomPuzzle} />
          </div>
        </div>
      </section>
      <PracticeQueue />
    </>
  );
}
