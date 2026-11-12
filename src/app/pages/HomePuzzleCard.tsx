import { Link, type useLoaderData } from "react-router";
import * as m from "framer-motion/m";
import { EditorialPuzzleDiagram } from "../../shared/EditorialPuzzleDiagram";
import { getPuzzleProgressStatus } from "../../shared/puzzle-progress";
import { buttonVariants } from "../../shared/ui/button-variants";
import { text } from "../../text/en";
import { symbols } from "../../text/symbols";
import { RandomPuzzleButton } from "../RandomPuzzleButton";
import type { homeLoader } from "../puzzles";
import styles from "./HomePage.module.css";

// ASD-STE100 Simplified Technical English comments.
// This component renders one daily puzzle card on the home page.

const CARD_ENTER_INITIAL = { opacity: 0, y: 10 } as const;
const CARD_ENTER_ANIMATE = { opacity: 1, y: 0 } as const;
const CARD_ENTER_TRANSITION = { duration: 0.24, ease: [0.16, 1, 0.3, 1] as const } as const;

export type CardData = ReturnType<typeof useLoaderData<typeof homeLoader>>[number];

function LevelItem({ id, difficulty }: { id: string; difficulty: keyof typeof text.levels }) {
  const status = getPuzzleProgressStatus(id);
  return (
    <li className={styles.levelItem}>
      <Link
        className={buttonVariants({ variant: "accentTint", size: "lg" })}
        to={`/puzzles/${id}`}
        viewTransition
      >
        {text.levels[difficulty]}
      </Link>
      {status === "solved" && (
        <span className="sk-status-pill sk-status-pill-solved">
          {text.home.solved} {symbols.common.check}
        </span>
      )}
      {status === "in_progress" && (
        <span className="sk-status-pill sk-status-pill-resume">
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
    <m.aside
      className={styles.quickPlayBanner}
      aria-label={actionLabel}
      initial={CARD_ENTER_INITIAL}
      animate={CARD_ENTER_ANIMATE}
      transition={CARD_ENTER_TRANSITION}
    >
      <div className={styles.quickPlayContent}>
        <h2>{actionLabel}</h2>
        <p>
          {target.typeName} • {text.levels[target.difficulty]}
        </p>
      </div>
      <Link
        className={buttonVariants({ variant: "primary", size: "lg" })}
        to={`/puzzles/${target.id}`}
        viewTransition
      >
        {actionLabel} {symbols.common.arrowRight}
      </Link>
    </m.aside>
  );
}

export function PuzzleCard({ type, levels }: CardData) {
  return (
    <m.li
      className="sk-surface-card sk-surface-card-interactive sk-puzzle-card"
      initial={CARD_ENTER_INITIAL}
      animate={CARD_ENTER_ANIMATE}
      transition={CARD_ENTER_TRANSITION}
    >
      <div className="sk-puzzle-card-header">
        <EditorialPuzzleDiagram type={type} levels={levels} />
        <div>
          <h3 className="sk-puzzle-card-title">{text[type].name}</h3>
          <span className="sk-puzzle-card-tag">{text[type].tag}</span>
        </div>
      </div>
      <p className="sk-puzzle-card-summary">{text[type].summary}</p>
      <nav aria-label={text.home.levelsHeading(text[type].name)}>
        <ul className={styles.levels}>
          {levels.map(({ id, difficulty }) => (
            <LevelItem key={id} id={id} difficulty={difficulty} />
          ))}
        </ul>
      </nav>
    </m.li>
  );
}

export function HomeActionsRow() {
  return (
    <div className="mt-8 flex justify-center">
      <div className={styles.levels}>
        <Link
          to="/archive"
          className={buttonVariants({ variant: "secondary", size: "pill" })}
          viewTransition
        >
          {text.home.archiveLink} {symbols.common.arrowRight}
        </Link>
        <RandomPuzzleButton
          className={buttonVariants({ variant: "secondary", size: "pill" })}
          label={text.home.randomPuzzle}
        />
      </div>
    </div>
  );
}
