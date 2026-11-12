import { Link, type useLoaderData } from "react-router";
import { EditorialPuzzleDiagram } from "../../shared/EditorialPuzzleDiagram";
import { getPuzzleProgressStatus } from "../../shared/puzzle-progress";
import { text } from "../../text/en";
import { symbols } from "../../text/symbols";
import type { homeLoader } from "../puzzles";
import styles from "./HomePage.module.css";

// ASD-STE100 Simplified Technical English comments.
// This component renders one daily puzzle card on the home page.

export type CardData = ReturnType<typeof useLoaderData<typeof homeLoader>>[number];

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

export function QuickPlayBanner({ cards }: { cards: CardData[] }) {
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

export function PuzzleCard({ type, levels }: CardData) {
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
