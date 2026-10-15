// Asynchronous Puzzle Duels: Client-side challenge comparison.
// Follows ASD-STE100 Simplified Technical English.

export interface DuelResult {
  readonly puzzleId: string;
  readonly timeSeconds: number;
  readonly hints: number;
  readonly mistakes: number;
  readonly cleanSolve: boolean;
  readonly date: string;
}

export interface MetricComparison {
  readonly playerValue: number;
  readonly opponentValue: number;
  readonly winner: "player" | "opponent" | "tie";
}

export interface DuelComparison {
  readonly puzzleId: string;
  readonly timeComparison: MetricComparison;
  readonly hintsComparison: MetricComparison;
  readonly mistakesComparison: MetricComparison;
  readonly overallWinner: "player" | "opponent" | "tie";
}

/**
 * Encodes a duel result into a URL-safe compact string.
 */
export function encodeDuelResult(result: DuelResult): string {
  const cleanFlag = result.cleanSolve ? "1" : "0";
  const raw = [
    result.puzzleId,
    result.timeSeconds.toString(),
    result.hints.toString(),
    result.mistakes.toString(),
    cleanFlag,
    result.date,
  ].join("|");

  return btoa(raw).replaceAll("+", "-").replaceAll("/", "_").replaceAll(/=+$/gu, "");
}

/**
 * Decodes a compact duel string. Returns null if invalid or corrupted.
 */
export function decodeDuelResult(code: string): DuelResult | null {
  try {
    let base64 = code.replaceAll("-", "+").replaceAll("_", "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const raw = atob(base64);
    const parts = raw.split("|");
    if (parts.length !== 6) return null;

    const [puzzleId, timeStr, hintsStr, mistakesStr, cleanStr, date] = parts;
    const timeSeconds = Math.trunc(Number(timeStr ?? ""));
    const hints = Math.trunc(Number(hintsStr ?? ""));
    const mistakes = Math.trunc(Number(mistakesStr ?? ""));
    const cleanSolve = cleanStr === "1";

    if (
      !puzzleId ||
      Number.isNaN(timeSeconds) ||
      Number.isNaN(hints) ||
      Number.isNaN(mistakes) ||
      !date ||
      timeSeconds < 0 ||
      hints < 0 ||
      mistakes < 0
    ) {
      return null;
    }

    return { puzzleId, timeSeconds, hints, mistakes, cleanSolve, date };
  } catch {
    return null;
  }
}

function compareMetricLowerIsBetter(player: number, opponent: number): MetricComparison {
  if (player < opponent) return { playerValue: player, opponentValue: opponent, winner: "player" };
  if (opponent < player)
    return { playerValue: player, opponentValue: opponent, winner: "opponent" };
  return { playerValue: player, opponentValue: opponent, winner: "tie" };
}

/**
 * Compares two duel results and determines outcome across metrics.
 */
export function compareDuelResults(player: DuelResult, opponent: DuelResult): DuelComparison {
  const timeComparison = compareMetricLowerIsBetter(player.timeSeconds, opponent.timeSeconds);
  const hintsComparison = compareMetricLowerIsBetter(player.hints, opponent.hints);
  const mistakesComparison = compareMetricLowerIsBetter(player.mistakes, opponent.mistakes);

  let playerPoints = 0;
  let opponentPoints = 0;

  for (const comp of [timeComparison, hintsComparison, mistakesComparison]) {
    if (comp.winner === "player") playerPoints += 1;
    if (comp.winner === "opponent") opponentPoints += 1;
  }

  let overallWinner: "player" | "opponent" | "tie" = "tie";
  if (playerPoints > opponentPoints) overallWinner = "player";
  if (opponentPoints > playerPoints) overallWinner = "opponent";

  return {
    puzzleId: player.puzzleId,
    timeComparison,
    hintsComparison,
    mistakesComparison,
    overallWinner,
  };
}
