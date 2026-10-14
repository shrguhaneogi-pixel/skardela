import { useState } from "react";
import { text } from "../text/en";
import { symbols } from "../text/symbols";
import { formatDuration, type CompletionStats } from "./completion";
import { sharePostcard } from "./postcard";
import styles from "./CompletionReview.module.css";

// ASD-STE100 Simplified Technical English comments.
// This component displays a celebration modal dialog when a puzzle is solved.

type HeaderProps = {
  isCleanSolve: boolean;
};

function CompletionHeader({ isCleanSolve }: HeaderProps) {
  return (
    <div className={styles.header}>
      <h2 id="completion-title">{text.completion.title}</h2>
      <p>{text.completion.subtitle}</p>
      {isCleanSolve && (
        <div className={styles.cleanBadge} aria-label={text.completion.cleanSolveDesc}>
          <span>{symbols.completion.clean}</span>
          <span>{text.completion.cleanSolve}</span>
        </div>
      )}
    </div>
  );
}

function CompletionStatsGrid({ stats }: { stats: CompletionStats }) {
  return (
    <div className={styles.statsGrid}>
      <div className={styles.statItem}>
        <span className={styles.statValue}>{formatDuration(stats.timeSpentSeconds)}</span>
        <span className={styles.statLabel}>{text.completion.timeSpent}</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statValue}>{stats.hintCount}</span>
        <span className={styles.statLabel}>{text.completion.hintsUsed}</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statValue}>{stats.mistakes}</span>
        <span className={styles.statLabel}>{text.completion.mistakes}</span>
      </div>
    </div>
  );
}

type ActionsProps = {
  hasPostcard: boolean;
  onRestart?: () => void;
  onShare: () => void;
  onClose: () => void;
};

function CompletionActions(props: ActionsProps) {
  return (
    <div className={styles.actions}>
      {props.hasPostcard && (
        <button type="button" className={styles.primaryButton} onClick={props.onShare}>
          {text.completion.sharePostcard}
        </button>
      )}
      {props.onRestart && (
        <button type="button" className={styles.secondaryButton} onClick={props.onRestart}>
          {text.completion.playAgain}
        </button>
      )}
      <button type="button" className={styles.secondaryButton} onClick={props.onClose}>
        {text.completion.reviewBoard}
      </button>
    </div>
  );
}

export type CompletionReviewProps = {
  stats: CompletionStats;
  postcardText?: string;
  onRestart?: () => void;
  onClose: () => void;
};

export function CompletionReview({
  stats,
  postcardText,
  onRestart,
  onClose,
}: CompletionReviewProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleShare() {
    if (!postcardText) return;
    const res = await sharePostcard({
      title: text.completion.title,
      text: postcardText,
    });
    if (res === "copied") setFeedback(text.completion.copied);
    else if (res === "failed") setFeedback(text.completion.shareFailed);
  }

  return (
    <dialog open className={styles.overlay} aria-labelledby="completion-title">
      <div className={styles.dialog}>
        <CompletionHeader isCleanSolve={stats.isCleanSolve} />
        <CompletionStatsGrid stats={stats} />
        {feedback && <p className={styles.shareFeedback}>{feedback}</p>}
        <CompletionActions
          hasPostcard={Boolean(postcardText)}
          onRestart={onRestart}
          onShare={handleShare}
          onClose={onClose}
        />
      </div>
    </dialog>
  );
}
