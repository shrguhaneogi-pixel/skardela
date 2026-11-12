// Validation Report Component for Puzzle Studio.
// Follows ASD-STE100 Simplified Technical English.

import type { ValidationResult } from "../../shared/puzzle-validator";
import { text } from "../../text/en";

export function ValidationReport({ result }: { readonly result: ValidationResult | null }) {
  if (!result) return null;

  if (result.valid) {
    return (
      <output aria-live="polite" className="sk-validation-box sk-validation-success">
        <strong>{text.studio.validSuccess}</strong>
      </output>
    );
  }

  return (
    <div className="sk-validation-box sk-validation-error" role="alert">
      <strong>{text.studio.invalidHeader}</strong>
      <ul className="sk-validation-list">
        {result.errors.map((err) => (
          <li key={err}>{err}</li>
        ))}
      </ul>
    </div>
  );
}
