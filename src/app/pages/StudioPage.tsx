// Skardela Puzzle Studio: Author, test, and export custom puzzles.
// Follows ASD-STE100 Simplified Technical English.

import { useState } from "react";
import { validatePuzzle, type ValidationResult } from "../../shared/puzzle-validator";
import { text } from "../../text/en";
import { symbols } from "../../text/symbols";
import styles from "./StudioPage.module.css";
import { ColourBinaryStudio } from "./ColourBinaryStudio";
import { ValidationReport } from "./ValidationReport";

type TabMode = "colour-binary" | "json";
const MAX_JSON_BYTES = 32768;

function StudioHeader() {
  return (
    <section className={styles.hero}>
      <h1>
        <span aria-hidden="true">{symbols.studio.studio} </span>
        {text.studio.title}
      </h1>
      <p className={styles.intro}>{text.studio.intro}</p>
      <div className={styles.disclaimer} role="note">
        {text.studio.disclaimer}
      </div>
    </section>
  );
}

function RawJsonStudio({ onExport }: { readonly onExport: (json: string) => void }) {
  const [jsonText, setJsonText] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const handleValidate = () => {
    if (new TextEncoder().encode(jsonText).length > MAX_JSON_BYTES) {
      setValidation({ valid: false, errors: [text.studio.jsonTooLarge] });
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      const res = validatePuzzle(parsed);
      setValidation(res);
    } catch {
      setValidation({ valid: false, errors: [text.studio.jsonInvalid] });
    }
  };

  return (
    <div className={styles.panel}>
      <textarea
        className={styles.textarea}
        placeholder={text.studio.jsonPlaceholder}
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        aria-label="Custom puzzle JSON"
      />
      <div className={styles.actions}>
        <button type="button" className={styles.btnPrimary} onClick={handleValidate}>
          {symbols.studio.validate} {text.studio.validateBtn}
        </button>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={() => onExport(jsonText)}
          disabled={!jsonText.trim()}
        >
          {symbols.studio.export} {text.studio.exportBtn}
        </button>
      </div>
      <ValidationReport result={validation} />
    </div>
  );
}

export function StudioPage() {
  const [activeTab, setActiveTab] = useState<TabMode>("colour-binary");
  const [copied, setCopied] = useState(false);

  const handleExport = (json: string) => {
    void navigator.clipboard?.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div>
      <StudioHeader />
      <div className={styles.tabs} role="tablist" aria-label="Studio Modes">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "colour-binary"}
          className={`${styles.tabBtn} ${activeTab === "colour-binary" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("colour-binary")}
        >
          {text.studio.tabColourBinary}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "json"}
          className={`${styles.tabBtn} ${activeTab === "json" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("json")}
        >
          {text.studio.tabJson}
        </button>
      </div>

      {copied && <output className={styles.copiedBadge}>{text.studio.copied}</output>}

      {activeTab === "colour-binary" && <ColourBinaryStudio onExport={handleExport} />}
      {activeTab === "json" && <RawJsonStudio onExport={handleExport} />}
    </div>
  );
}
