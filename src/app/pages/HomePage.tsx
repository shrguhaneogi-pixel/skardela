import { Link, useLoaderData } from "react-router";
import { text } from "../../text/en";
import { symbols } from "../../text/symbols";
import type { homeLoader } from "../puzzles";
import styles from "./HomePage.module.css";

type CardData = ReturnType<typeof useLoaderData<typeof homeLoader>>[number];

// This badge shows a small geometric preview of each puzzle type.
function PuzzleTypeBadge({ type }: { type: CardData["type"] }) {
  if (type === "colour-binary") {
    const binary = symbols["colour-binary"];
    return (
      <div className={styles.binaryMini}>
        <span className={styles.miniRed}>{binary.R}</span>
        <span className={styles.miniBlue}>{binary.B}</span>
        <span className={styles.miniBlue}>{binary.B}</span>
        <span className={styles.miniRed}>{binary.R}</span>
      </div>
    );
  }
  const guzzle = symbols.guzzle;
  return (
    <div className={styles.guzzleMini}>
      <span className={styles.miniCorrect}>{guzzle.correct}</span>
      <span className={styles.miniPresent}>{guzzle.present}</span>
      <span className={styles.miniCenter}>{text.guzzle.sampleCenter}</span>
      <span className={styles.miniAbsent}>{guzzle.absent}</span>
    </div>
  );
}

// This card shows the puzzle details and difficulty links.
function PuzzleCard({ type, levels }: CardData) {
  return (
    <li className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardBadge} aria-hidden="true" data-type={type}>
          <PuzzleTypeBadge type={type} />
        </div>
        <div>
          <h3 className={styles.cardTitle}>{text[type].name}</h3>
          <span className={styles.cardTag}>{text[type].tag}</span>
        </div>
      </div>
      <p className={styles.summary}>{text[type].summary}</p>
      <nav aria-label={text.home.levelsHeading(text[type].name)}>
        <ul className={styles.levels}>
          {levels.map(({ id, difficulty }) => (
            <li key={id}>
              <Link className={styles.play} to={`/puzzles/${id}`}>
                {text.levels[difficulty]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </li>
  );
}

// This page shows the daily puzzle list for each puzzle type.
export function HomePage() {
  const cards = useLoaderData<typeof homeLoader>();
  return (
    <>
      <title>{text.siteName}</title>
      <div className={styles.hero}>
        <div className={styles.badge} aria-hidden="true">
          <span className={styles.badgeDot} />
          <span>{text.home.edition}</span>
        </div>
        <h1 data-testid="home-page-title">{text.home.title}</h1>
        <p className={styles.intro}>{text.home.intro}</p>
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
      </section>
    </>
  );
}
