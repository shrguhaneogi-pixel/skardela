// Open Puzzle Exchange page: Import, validate, and browse custom puzzle packs.
// Follows ASD-STE100 Simplified Technical English.

import { useState } from "react";
import { Link } from "react-router";
import {
  loadImportedPacks,
  saveImportedPack,
  parsePuzzlePackJson,
  type PuzzlePack,
  type PackValidationResult,
} from "../../shared/puzzle-pack";
import { text } from "../../text/en";
import { symbols } from "../../text/symbols";
import styles from "./ExchangePage.module.css";

const samplePack: PuzzlePack = {
  format: "skardela-pack-v1",
  id: "sample-pack-01",
  title: "Curated Logic Starter Pack",
  author: "Skardela Community",
  version: "1.0.0",
  license: "CC-BY-4.0",
  description: "Curated sample pack demonstrating verified Colour Binary logic.",
  puzzles: [
    {
      id: "colour-binary-0001",
      type: "colour-binary",
      difficulty: "easy",
      author: "skardela",
      license: "CC-BY-4.0",
      start: ["R..R", "R.BR", "..RB", "..R."],
      answer: ["RBBR", "RBBR", "BRRB", "BRRB"],
    },
  ],
};

function ExchangeHeader() {
  return (
    <section className={styles.hero}>
      <h1>
        <span aria-hidden="true">{symbols.exchange.exchange} </span>
        {text.exchange.title}
      </h1>
      <p className={styles.intro}>{text.exchange.intro}</p>
      <div className={styles.disclaimer} role="note">
        {text.exchange.disclaimer}
      </div>
    </section>
  );
}

function ValidationFeedback({ result }: { readonly result: PackValidationResult | null }) {
  if (!result) {
    return null;
  }
  if (!result.valid) {
    return (
      <div className={`${styles.validationBox} ${styles.errorBox}`} role="alert">
        <ul className={styles.errorList}>
          {result.errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <output className={`${styles.validationBox} ${styles.successBox}`}>
      <strong>{result.errors[0] || "Pack imported and validated successfully!"}</strong>
    </output>
  );
}

function ImportActions({
  onImport,
  onLoadSample,
  disabled,
}: {
  readonly onImport: () => void;
  readonly onLoadSample: () => void;
  readonly disabled: boolean;
}) {
  return (
    <div className={styles.actions}>
      <button type="button" className={styles.btnPrimary} onClick={onImport} disabled={disabled}>
        {text.exchange.importBtn}
      </button>
      <button type="button" className={styles.btnSecondary} onClick={onLoadSample}>
        {text.exchange.exportSampleBtn}
      </button>
    </div>
  );
}

function PackImporter({
  onImportSuccess,
}: {
  readonly onImportSuccess: (pack: PuzzlePack) => void;
}) {
  const [jsonText, setJsonText] = useState("");
  const [result, setResult] = useState<PackValidationResult | null>(null);

  const handleImport = () => {
    const parsed = parsePuzzlePackJson(jsonText);
    setResult(parsed);
    if (parsed.valid && parsed.pack) {
      saveImportedPack(parsed.pack);
      onImportSuccess(parsed.pack);
      setJsonText("");
    }
  };

  const handleLoadSample = () => {
    saveImportedPack(samplePack);
    onImportSuccess(samplePack);
    setResult({ valid: true, errors: [text.exchange.samplePackSuccess] });
  };

  return (
    <section className={styles.section} aria-labelledby="import-title">
      <h2 id="import-title" className={styles.sectionTitle}>
        {symbols.exchange.import} {text.exchange.importHeading}
      </h2>
      <textarea
        className={styles.textarea}
        placeholder={text.exchange.importPlaceholder}
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        aria-label="Paste puzzle pack JSON"
      />
      <ImportActions
        onImport={handleImport}
        onLoadSample={handleLoadSample}
        disabled={!jsonText.trim()}
      />
      <ValidationFeedback result={result} />
    </section>
  );
}

function PackList({ packs }: { readonly packs: readonly PuzzlePack[] }) {
  return (
    <section className={styles.section} aria-labelledby="packs-title">
      <h2 id="packs-title" className={styles.sectionTitle}>
        {text.exchange.importedHeading}
      </h2>
      {packs.length === 0 ? (
        <p className={styles.emptyText}>{text.exchange.noPacksMessage}</p>
      ) : (
        <div className={styles.packsGrid}>
          {packs.map((pack) => (
            <div key={pack.id} className={styles.packCard}>
              <span className={styles.packTitle}>{pack.title}</span>
              <div className={styles.packMeta}>
                <span>by {pack.author}</span>
                <span>• v{pack.version}</span>
                <span>• {pack.license}</span>
                <span>• {text.exchange.packPuzzlesCount(pack.puzzles.length)}</span>
              </div>
              {pack.description && <p className={styles.emptyText}>{pack.description}</p>}
              <div className={styles.packPuzzles}>
                {pack.puzzles.map((p) => {
                  const pId = String(p.id ?? "");
                  return (
                    <Link key={pId} to={`/puzzles/${pId}`} className={styles.puzzleLink}>
                      #{pId}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function ExchangePage() {
  const [packs, setPacks] = useState<PuzzlePack[]>(() => loadImportedPacks());

  const handleImportSuccess = () => {
    setPacks(loadImportedPacks());
  };

  return (
    <div>
      <ExchangeHeader />
      <PackImporter onImportSuccess={handleImportSuccess} />
      <PackList packs={packs} />
      <div className={styles.serverNote} role="note">
        <strong>{text.exchange.serverRequirementsHeading}</strong>
        <p>{text.exchange.serverRequirementsNote}</p>
      </div>
    </div>
  );
}
