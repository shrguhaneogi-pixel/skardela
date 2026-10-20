// Asynchronous Puzzle Duels page.
// Follows ASD-STE100 Simplified Technical English.

import { useState } from "react";
import { Link } from "react-router";
import {
  decodeDuelResult,
  compareDuelResults,
  type DuelResult,
  type DuelComparison,
} from "../../shared/duel";
import { text } from "../../text/en";
import { symbols } from "../../text/symbols";
import styles from "./DuelPage.module.css";

const defaultMockPlayerResult: DuelResult = {
  puzzleId: "colour-binary-0001",
  timeSeconds: 95,
  hints: 0,
  mistakes: 1,
  cleanSolve: false,
  date: "2026-10-15",
};

function DuelHeader() {
  return (
    <section className={styles.hero}>
      <h1>
        <span aria-hidden="true">{symbols.duel.duel} </span>
        {text.duel.title}
      </h1>
      <p className={styles.intro}>{text.duel.intro}</p>
      <div className={styles.disclaimer} role="note">
        {text.duel.disclaimer}
      </div>
    </section>
  );
}

interface FormProps {
  readonly onCompare: (opponent: DuelResult) => void;
  readonly error: string | null;
}

function DuelInputForm({ onCompare, error }: FormProps) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const opponent = decodeDuelResult(code.trim());
    if (opponent) {
      onCompare(opponent);
    }
  };

  return (
    <form className={styles.formSection} onSubmit={handleSubmit}>
      <label htmlFor="duel-code" className={styles.label}>
        {text.duel.pasteCodeLabel}
      </label>
      <div className={styles.inputGroup}>
        <input
          id="duel-code"
          className={styles.input}
          placeholder={text.duel.pastePlaceholder}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type="submit" className={styles.btnPrimary} disabled={!code.trim()}>
          {text.duel.compareBtn}
        </button>
      </div>
      {error && <output className={styles.errorText}>{error}</output>}
    </form>
  );
}

function ResultCard({
  title,
  result,
  isWinner,
}: {
  readonly title: string;
  readonly result: DuelResult;
  readonly isWinner: boolean;
}) {
  return (
    <div className={styles.resultCard}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>{title}</span>
        {isWinner && <span aria-label="Winner">{symbols.duel.trophy}</span>}
      </div>
      <div className={styles.statRow}>
        <span>{text.duel.metricTime}</span>
        <span>{result.timeSeconds}s</span>
      </div>
      <div className={styles.statRow}>
        <span>{text.duel.metricHints}</span>
        <span>{result.hints}</span>
      </div>
      <div className={styles.statRow}>
        <span>{text.duel.metricMistakes}</span>
        <span>{result.mistakes}</span>
      </div>
      <div className={styles.playAction}>
        <Link to={`/puzzles/${result.puzzleId}`} className={styles.btnSecondary}>
          {text.duel.playPuzzleBtn}
        </Link>
      </div>
    </div>
  );
}

function OutcomeBanner({ outcome }: { readonly outcome: "player" | "opponent" | "tie" }) {
  const title =
    outcome === "player"
      ? text.duel.winnerYou
      : outcome === "opponent"
        ? text.duel.winnerOpponent
        : text.duel.winnerTie;

  const icon = outcome === "tie" ? symbols.duel.tie : symbols.duel.trophy;

  return (
    <output className={styles.outcomeBanner}>
      <span className={styles.bannerTitle}>{title}</span>
      <span aria-hidden="true">{icon}</span>
    </output>
  );
}

function DuelBalanceBar({ player, opponent }: { player: DuelResult; opponent: DuelResult }) {
  const total = player.timeSeconds + opponent.timeSeconds;
  const playerPercent = total > 0 ? Math.round((opponent.timeSeconds / total) * 100) : 50;
  return (
    <div className={styles.balanceBarContainer} aria-hidden="true">
      <div className={styles.balanceFillPlayer} style={{ width: `${playerPercent}%` }} />
      <div className={styles.balanceFillOpponent} style={{ width: `${100 - playerPercent}%` }} />
    </div>
  );
}

export function DuelPage() {
  const [player] = useState<DuelResult>(defaultMockPlayerResult);
  const [opponent, setOpponent] = useState<DuelResult | null>(null);
  const [comparison, setComparison] = useState<DuelComparison | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = (opp: DuelResult) => {
    setOpponent(opp);
    setComparison(compareDuelResults(player, opp));
    setError(null);
  };

  return (
    <div>
      <DuelHeader />
      <DuelInputForm onCompare={handleCompare} error={error} />

      {comparison && opponent && (
        <section className={styles.comparisonSection} aria-label={text.duel.outcomeHeading}>
          <OutcomeBanner outcome={comparison.overallWinner} />
          <DuelBalanceBar player={player} opponent={opponent} />
          <div className={styles.duelGrid}>
            <ResultCard
              title={text.duel.yourResultHeading}
              result={player}
              isWinner={comparison.overallWinner === "player"}
            />
            <ResultCard
              title={text.duel.opponentResultHeading}
              result={opponent}
              isWinner={comparison.overallWinner === "opponent"}
            />
          </div>
        </section>
      )}

      <div className={styles.serverNote} role="note">
        {text.duel.futureServerNote}
      </div>
    </div>
  );
}
