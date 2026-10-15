import { useState } from "react";
import { Link } from "react-router";
import { text } from "../text/en";
import { symbols } from "../text/symbols";
import {
  getPracticeRecommendations,
  isPracticeQueueEnabled,
  setPracticeQueueEnabled,
  type PracticeRecommendation,
} from "./practice-queue";
import styles from "./PracticeQueue.module.css";

// ASD-STE100 Simplified Technical English comments.
// This component renders a single practice recommendation card.
function RecommendationCard({ rec }: { rec: PracticeRecommendation }) {
  const badgeText = rec.isArchive ? text.practiceQueue.archiveBadge : text.practiceQueue.todayBadge;

  return (
    <li className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.cardBadge}>{badgeText}</span>
        <h3 className={styles.cardTitle}>{rec.title}</h3>
        <p className={styles.cardReason}>{rec.reason}</p>
      </div>
      <Link className={styles.playLink} to={rec.href}>
        {text.practiceQueue.playButton} →
      </Link>
    </li>
  );
}

// This component displays explainable, local practice recommendations.
export function PracticeQueue() {
  const [enabled, setEnabled] = useState(isPracticeQueueEnabled);
  const recommendations = enabled ? getPracticeRecommendations() : [];

  function handleToggle() {
    const nextState = !enabled;
    setPracticeQueueEnabled(nextState);
    setEnabled(nextState);
  }

  return (
    <section className={styles.section} aria-labelledby="practice-queue-heading">
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2 id="practice-queue-heading">
            <span aria-hidden="true">{symbols.practiceQueue.queue}</span>
            {text.practiceQueue.title}
          </h2>
          <p>{text.practiceQueue.intro}</p>
        </div>
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={handleToggle}
          aria-pressed={enabled}
        >
          {enabled ? text.practiceQueue.disableBtn : text.practiceQueue.enableBtn}
        </button>
      </div>

      {enabled ? (
        <ul className={styles.cardList}>
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </ul>
      ) : (
        <div className={styles.disabledBanner}>{text.practiceQueue.disabledMessage}</div>
      )}

      <p className={styles.disclaimer}>{text.practiceQueue.disclaimer}</p>
    </section>
  );
}
