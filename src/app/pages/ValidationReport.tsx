// Validation Report Component for Puzzle Studio.
// Follows ASD-STE100 Simplified Technical English.

import type { ValidationResult } from "../../shared/puzzle-validator";
import { text } from "../../text/en";
import styles from "./StudioPage.module.css";

export function ValidationReport({ result }: { readonly result: ValidationResult | null }) {
  if (!result) return null;

  if (result.valid) {
    return (
      <output className={`${styles.validationBox} ${styles.successBox}`}>
        <strong>{text.studio.validSuccess}</strong>
      </output>
    );
  }

  return (
    <div className={`${styles.validationBox} ${styles.errorBox}`} role="alert">
      <strong>{text.studio.invalidHeader}</strong>
      <ul className={styles.errorList}>
        {result.errors.map((err) => (
          <li key={err}>{err}</li>
        ))}
      </ul>
    </div>
  );
}
