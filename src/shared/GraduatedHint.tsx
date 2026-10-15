import { text } from "../text/en";
import styles from "./GraduatedHint.module.css";
import {
  advanceTier,
  getHintTierText,
  type GraduatedHint as HintData,
  type HintTier,
} from "./graduated-hints";

// ASD-STE100 Simplified Technical English comments.
// This component shows graduated hints with tier progression controls.

export { LogicExplanationModal } from "./LogicExplanation";
export { CompletionReview, type CompletionReviewProps } from "./CompletionReview";

const TIERS: readonly HintTier[] = ["nudge", "explanation", "solution"];

function TierList({ activeTier }: { activeTier: HintTier }) {
  return (
    <ul className={styles.tiers} aria-label={text.hints.title}>
      {TIERS.map((tier) => {
        const isActive = tier === activeTier;
        const className = isActive ? styles.tierPillActive : styles.tierPill;
        return (
          <li key={tier} className={className} aria-current={isActive ? "step" : undefined}>
            {text.hints.tierLabels[tier]}
          </li>
        );
      })}
    </ul>
  );
}

type ActionProps = {
  tier: HintTier;
  onAdvance: () => void;
  onDismiss: () => void;
};

function HintActions({ tier, onAdvance, onDismiss }: ActionProps) {
  const advanceLabel =
    tier === "nudge" ? text.hints.advanceToExplanation : text.hints.advanceToSolution;

  return (
    <div className={styles.actions}>
      {tier !== "solution" && (
        <button type="button" className={styles.primaryButton} onClick={onAdvance}>
          {advanceLabel} →
        </button>
      )}
      <button type="button" className={styles.actionButton} onClick={onDismiss}>
        {text.hints.dismiss}
      </button>
    </div>
  );
}

type Props = {
  hint: HintData;
  onTierChange: (tier: HintTier) => void;
  onDismiss: () => void;
};

export function GraduatedHint({ hint, onTierChange, onDismiss }: Props) {
  const message = getHintTierText(hint, hint.tier);

  function handleAdvance() {
    onTierChange(advanceTier(hint.tier));
  }

  return (
    <section className={styles.container} aria-live="polite" aria-label={text.hints.title}>
      <div className={styles.header}>
        <h3 className={styles.title}>{text.hints.title}</h3>
        <TierList activeTier={hint.tier} />
      </div>
      <p className={styles.message}>{message}</p>
      <HintActions tier={hint.tier} onAdvance={handleAdvance} onDismiss={onDismiss} />
    </section>
  );
}
