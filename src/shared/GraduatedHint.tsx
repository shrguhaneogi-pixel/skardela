import { AnimatePresence } from "framer-motion";
import * as m from "framer-motion/m";
import { ArrowRight, Lightbulb, X } from "lucide-react";
import { text } from "../text/en";
import styles from "./GraduatedHint.module.css";
import {
  advanceTier,
  getHintTierText,
  type GraduatedHint as HintData,
  type HintTier,
} from "./graduated-hints";
import { HINT_ANIMATE, HINT_EXIT, HINT_INITIAL, HINT_TRANSITION } from "./motion-presets";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

// ASD-STE100 Simplified Technical English comments.
// This component shows graduated hints with tier progression controls.

export { AnimatePresence } from "framer-motion";
export { LogicExplanationModal } from "./LogicExplanation";
export { CompletionReview, type CompletionReviewProps } from "./CompletionReview";
export type { HintData as GraduatedHintData, HintTier };
export type { LogicExplanation } from "./graduated-hints";

const TIERS: readonly HintTier[] = ["nudge", "explanation", "solution"];

function TierList({ activeTier }: { activeTier: HintTier }) {
  return (
    <ul className={styles.tiers} aria-label={text.hints.title}>
      {TIERS.map((tier) => {
        const isActive = tier === activeTier;
        return (
          <li key={tier} aria-current={isActive ? "step" : undefined}>
            <Badge variant={isActive ? "accent" : "muted"}>{text.hints.tierLabels[tier]}</Badge>
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
        <Button variant="accentTint" size="sm" onClick={onAdvance}>
          {advanceLabel}
          <ArrowRight size={14} aria-hidden="true" />
        </Button>
      )}
      <Button variant="secondary" size="sm" onClick={onDismiss}>
        <X size={14} aria-hidden="true" />
        {text.hints.dismiss}
      </Button>
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
    <m.section
      className={styles.container}
      aria-live="polite"
      aria-label={text.hints.title}
      initial={HINT_INITIAL}
      animate={HINT_ANIMATE}
      exit={HINT_EXIT}
      transition={HINT_TRANSITION}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Lightbulb size={15} aria-hidden="true" />
          {text.hints.title}
        </h3>
        <TierList activeTier={hint.tier} />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <m.p
          key={hint.tier}
          className={styles.message}
          initial={HINT_INITIAL}
          animate={HINT_ANIMATE}
          exit={HINT_EXIT}
          transition={HINT_TRANSITION}
        >
          {message}
        </m.p>
      </AnimatePresence>
      <HintActions tier={hint.tier} onAdvance={handleAdvance} onDismiss={onDismiss} />
    </m.section>
  );
}
