import { useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, m } from "framer-motion";
import { text } from "../text/en";
import { symbols } from "../text/symbols";
import {
  getPracticeRecommendations,
  isPracticeQueueEnabled,
  setPracticeQueueEnabled,
  type PracticeRecommendation,
} from "./practice-queue";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { buttonVariants } from "./ui/button-variants";
import styles from "./PracticeQueue.module.css";

// ASD-STE100 Simplified Technical English comments.
// This component renders a single practice recommendation card.

const ITEM_ENTER_INITIAL = { opacity: 0, y: 8 } as const;
const ITEM_ENTER_ANIMATE = { opacity: 1, y: 0 } as const;
const ITEM_ENTER_EXIT = { opacity: 0, y: -6 } as const;
const ITEM_TRANSITION = { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const } as const;

function RecommendationCard({ rec }: { rec: PracticeRecommendation }) {
  const badgeText = rec.isArchive ? text.practiceQueue.archiveBadge : text.practiceQueue.todayBadge;

  return (
    <m.li
      className={`sk-surface-card sk-surface-card-interactive ${styles.card}`}
      initial={ITEM_ENTER_INITIAL}
      animate={ITEM_ENTER_ANIMATE}
      transition={ITEM_TRANSITION}
    >
      <div className={styles.cardTop}>
        <Badge>{badgeText}</Badge>
        <h3 className={styles.cardTitle}>{rec.title}</h3>
        <p className={styles.cardReason}>{rec.reason}</p>
      </div>
      <Link
        className={buttonVariants({ variant: "accentTint", size: "sm" })}
        to={rec.href}
        viewTransition
      >
        {text.practiceQueue.playButton} {symbols.common.arrowRight}
      </Link>
    </m.li>
  );
}

function PracticeContent({
  enabled,
  recommendations,
}: {
  enabled: boolean;
  recommendations: PracticeRecommendation[];
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {enabled ? (
        <m.ul
          key="practice-list"
          className={styles.cardList}
          initial={ITEM_ENTER_INITIAL}
          animate={ITEM_ENTER_ANIMATE}
          exit={ITEM_ENTER_EXIT}
          transition={ITEM_TRANSITION}
        >
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </m.ul>
      ) : (
        <m.div
          key="practice-disabled"
          className={styles.disabledBanner}
          initial={ITEM_ENTER_INITIAL}
          animate={ITEM_ENTER_ANIMATE}
          exit={ITEM_ENTER_EXIT}
          transition={ITEM_TRANSITION}
        >
          {text.practiceQueue.disabledMessage}
        </m.div>
      )}
    </AnimatePresence>
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
    <section
      className={`sk-surface-card ${styles.section}`}
      aria-labelledby="practice-queue-heading"
    >
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2 id="practice-queue-heading">
            <span aria-hidden="true">{symbols.practiceQueue.queue}</span>
            {text.practiceQueue.title}
          </h2>
          <p>{text.practiceQueue.intro}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full"
          onClick={handleToggle}
          aria-pressed={enabled}
        >
          {enabled ? text.practiceQueue.disableBtn : text.practiceQueue.enableBtn}
        </Button>
      </div>
      <PracticeContent enabled={enabled} recommendations={recommendations} />
      <p className={styles.disclaimer}>{text.practiceQueue.disclaimer}</p>
    </section>
  );
}
