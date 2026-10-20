import { Link, useLoaderData } from "react-router";
import { text } from "../../text/en";
import { symbols } from "../../text/symbols";
import { formatDateString, utcDate } from "../daily";
import type { homeLoader } from "../puzzles";
import { getPuzzleProgressStatus } from "../../shared/puzzle-progress";
import { PracticeQueue } from "../../shared/PracticeQueue";
import { EditorialPuzzleDiagram } from "../../shared/EditorialPuzzleDiagram";
import { EditorialHeroCanvas } from "../../shared/EditorialHeroCanvas";
import styles from "./HomePage.module.css";

type CardData = ReturnType<typeof useLoaderData<typeof homeLoader>>[number];

function LevelItem({ id, difficulty }: { id: string; difficulty: keyof typeof text.levels }) {
  const status = getPuzzleProgressStatus(id);
  return (
    <li className={styles.levelItem}>
      <Link className={styles.play} to={`/puzzles/${id}`}>
        {text.levels[difficulty]}
      </Link>
      {status === "solved" && (
        <span className={styles.statusPillSolved}>
          {text.home.solved} {symbols.common.check}
        </span>
      )}
      {status === "in_progress" && (
        <span className={styles.statusPillResume}>
          {text.home.resume} {symbols.common.time}
        </span>
      )}
    </li>
  );
}

// This card shows the puzzle details and difficulty links.
function PuzzleCard({ type, levels }: CardData) {
  return (
    <li className={styles.card}>
      <div className={styles.cardHeader}>
        <EditorialPuzzleDiagram type={type} levels={levels} />
        <div>
          <h3 className={styles.cardTitle}>{text[type].name}</h3>
          <span className={styles.cardTag}>{text[type].tag}</span>
        </div>
      </div>
      <p className={styles.summary}>{text[type].summary}</p>
      <nav aria-label={text.home.levelsHeading(text[type].name)}>
        <ul className={styles.levels}>
          {levels.map(({ id, difficulty }) => (
            <LevelItem key={id} id={id} difficulty={difficulty} />
          ))}
        </ul>
      </nav>
    </li>
  );
}

function QuickPlayBanner({ cards }: { cards: CardData[] }) {
  const allLevels = cards.flatMap((c) =>
    c.levels.map((l) => ({ ...l, typeName: text[c.type].name })),
  );
  const inProgress = allLevels.find((l) => getPuzzleProgressStatus(l.id) === "in_progress");
  const target = inProgress ?? allLevels[0];
  if (!target) return null;

  const isResume = inProgress !== undefined;
  const actionLabel = isResume ? text.home.quickPlay : text.home.quickStart;

  return (
    <aside className={styles.quickPlayBanner} aria-label={actionLabel}>
      <div className={styles.quickPlayContent}>
        <h2>{actionLabel}</h2>
        <p>
          {target.typeName} • {text.levels[target.difficulty]}
        </p>
      </div>
      <Link className={styles.play} to={`/puzzles/${target.id}`}>
        {actionLabel} {symbols.common.arrowRight}
      </Link>
    </aside>
  );
}

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
          <Link to="/archive" className={styles.archiveLink}>
            {text.home.archiveLink} →
          </Link>
        </div>
      </section>
      <PracticeQueue />
    </>
  );
}
