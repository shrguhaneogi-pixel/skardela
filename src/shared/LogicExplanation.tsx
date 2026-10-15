import { text } from "../text/en";
import styles from "./LogicExplanation.module.css";
import type { LogicExplanation as ExplanationData, LogicPremise } from "./logic-explainer";

// ASD-STE100 Simplified Technical English comments.
// This modal component shows structured logic deduction steps and premises.

function PremisesView({ premises }: { premises: readonly LogicPremise[] }) {
  if (premises.length === 0) return null;
  return (
    <div className={styles.section}>
      <h4>{text.logicExplanation.premisesHeading}</h4>
      <ul className={styles.premisesList}>
        {premises.map((p) => (
          <li key={p.index} className={styles.premisePill}>
            Row {p.row}, Col {p.column}: {p.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepsView({ steps }: { steps: readonly string[] }) {
  return (
    <div className={styles.section}>
      <h4>{text.logicExplanation.stepsHeading}</h4>
      <ol className={styles.steps}>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}

type Props = {
  explanation: ExplanationData;
  onClose: () => void;
};

export function LogicExplanationModal({ explanation, onClose }: Props) {
  return (
    <dialog open className={styles.overlay} aria-label={text.logicExplanation.title}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2>{text.logicExplanation.title}</h2>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            {text.logicExplanation.close}
          </button>
        </div>
        <div className={styles.ruleBox}>
          <h3>{explanation.ruleName}</h3>
          <p>{explanation.ruleSummary}</p>
        </div>
        <PremisesView premises={explanation.premises} />
        <StepsView steps={explanation.deductionSteps} />
      </div>
    </dialog>
  );
}
