import { useState } from "react";
import * as m from "framer-motion/m";
import { AlertCircle, Clock, Eye, Lightbulb, RotateCcw, Share2, Sparkles } from "lucide-react";
import { text } from "../text/en";
import { formatDuration, type CompletionStats } from "./completion";
import { sharePostcard } from "./postcard";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { useModalA11y } from "./useModalA11y";
import styles from "./CompletionReview.module.css";

// ASD-STE100 Simplified Technical English comments.
// This component displays a celebration modal dialog when a puzzle is solved.

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const OVERLAY_INITIAL = { opacity: 0 } as const;
const OVERLAY_ANIMATE = { opacity: 1 } as const;
const OVERLAY_EXIT = { opacity: 0 } as const;
const OVERLAY_TRANSITION = { duration: 0.16, ease: EASE_OUT_EXPO } as const;
const PANEL_ENTER_INITIAL = { opacity: 0, scale: 0.96, y: 8 } as const;
const PANEL_ENTER_ANIMATE = { opacity: 1, scale: 1, y: 0 } as const;
const PANEL_ENTER_EXIT = { opacity: 0, scale: 0.96, y: 6 } as const;
const PANEL_ENTER_TRANSITION = { duration: 0.2, ease: EASE_OUT_EXPO } as const;
const ROSETTE_INITIAL = { opacity: 0, scale: 0.65, rotate: -18 } as const;
const ROSETTE_ANIMATE = { opacity: 1, scale: 1, rotate: 0 } as const;
const ROSETTE_TRANSITION = { type: "spring", stiffness: 280, damping: 20 } as const;

type HeaderProps = {
  isCleanSolve: boolean;
};

function CompletionRosette() {
  return (
    <m.div
      className={styles.rosetteWrapper}
      aria-hidden="true"
      initial={ROSETTE_INITIAL}
      animate={ROSETTE_ANIMATE}
      transition={ROSETTE_TRANSITION}
    >
      <svg className={styles.rosetteSvg} viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="var(--accent-bg)"
          stroke="var(--accent)"
          strokeWidth="1.5"
        />
        <circle
          cx="32"
          cy="32"
          r="23"
          fill="none"
          stroke="var(--border)"
          strokeWidth="0.75"
          strokeDasharray="3 3"
        />
        <path
          d="M 32 10 L 36 24 L 50 24 L 39 33 L 43 47 L 32 38 L 21 47 L 25 33 L 14 24 L 28 24 Z"
          fill="var(--accent)"
          opacity="0.9"
        />
        <circle cx="32" cy="32" r="5" fill="var(--surface-elevated)" />
      </svg>
    </m.div>
  );
}

function CompletionHeader({ isCleanSolve }: HeaderProps) {
  return (
    <div className={styles.header}>
      <CompletionRosette />
      <h2 id="completion-title">{text.completion.title}</h2>
      <p>{text.completion.subtitle}</p>
      {isCleanSolve && (
        <Badge variant="accent" aria-label={text.completion.cleanSolveDesc}>
          <Sparkles size={13} aria-hidden="true" />
          <span>{text.completion.cleanSolve}</span>
        </Badge>
      )}
    </div>
  );
}

function CompletionStatsGrid({ stats }: { stats: CompletionStats }) {
  return (
    <div className={styles.statsGrid}>
      <div className={styles.statItem}>
        <Clock size={15} className={styles.statIcon} aria-hidden="true" />
        <span className={styles.statValue}>{formatDuration(stats.timeSpentSeconds)}</span>
        <span className={styles.statLabel}>{text.completion.timeSpent}</span>
      </div>
      <div className={styles.statItem}>
        <Lightbulb size={15} className={styles.statIcon} aria-hidden="true" />
        <span className={styles.statValue}>{stats.hintCount}</span>
        <span className={styles.statLabel}>{text.completion.hintsUsed}</span>
      </div>
      <div className={styles.statItem}>
        <AlertCircle size={15} className={styles.statIcon} aria-hidden="true" />
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
        <Button variant="primary" onClick={props.onShare}>
          <Share2 size={15} aria-hidden="true" />
          {text.completion.sharePostcard}
        </Button>
      )}
      {props.onRestart && (
        <Button variant="secondary" onClick={props.onRestart}>
          <RotateCcw size={15} aria-hidden="true" />
          {text.completion.playAgain}
        </Button>
      )}
      <Button variant="secondary" onClick={props.onClose}>
        <Eye size={15} aria-hidden="true" />
        {text.completion.reviewBoard}
      </Button>
    </div>
  );
}

function CompletionFeedback({ feedback }: { feedback: string | null }) {
  if (!feedback) return null;
  return (
    <output aria-live="polite" className={styles.shareFeedback}>
      {feedback}
    </output>
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
  const { overlayRef, panelRef } = useModalA11y(onClose);

  async function handleShare() {
    if (!postcardText) return;
    const res = await sharePostcard({ title: text.completion.title, text: postcardText });
    if (res === "copied") setFeedback(text.completion.copied);
    else if (res === "failed") setFeedback(text.completion.shareFailed);
  }

  return (
    <m.dialog
      open
      ref={overlayRef}
      className={styles.overlay}
      aria-labelledby="completion-title"
      aria-modal="true"
      initial={OVERLAY_INITIAL}
      animate={OVERLAY_ANIMATE}
      exit={OVERLAY_EXIT}
      transition={OVERLAY_TRANSITION}
    >
      <m.div
        ref={panelRef}
        tabIndex={-1}
        className={styles.dialog}
        initial={PANEL_ENTER_INITIAL}
        animate={PANEL_ENTER_ANIMATE}
        exit={PANEL_ENTER_EXIT}
        transition={PANEL_ENTER_TRANSITION}
      >
        <CompletionHeader isCleanSolve={stats.isCleanSolve} />
        <CompletionStatsGrid stats={stats} />
        <CompletionFeedback feedback={feedback} />
        <CompletionActions
          hasPostcard={Boolean(postcardText)}
          onRestart={onRestart}
          onShare={handleShare}
          onClose={onClose}
        />
      </m.div>
    </m.dialog>
  );
}
