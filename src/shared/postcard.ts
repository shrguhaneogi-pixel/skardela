import { text } from "../text/en";
import { symbols } from "../text/symbols";
import { formatDuration } from "./completion";

// ASD-STE100 Simplified Technical English comments.
// This module creates spoiler-free emoji postcards for solved puzzles and shares them.

export type ColourBinaryPostcardParams = {
  puzzleId: string;
  difficulty?: string;
  timeSpentSeconds: number;
  hintCount: number;
  squares: readonly string[];
  size: number;
};

export type GuzzlePostcardParams = {
  puzzleId: string;
  mode?: string;
  timeSpentSeconds: number;
  hintCount: number;
  mistakes: number;
  guesses: readonly ({ letter: string; mark: "correct" | "present" | "absent" } | undefined)[];
  size: number;
};

function formatStatsLine(timeSpentSeconds: number, hintCount: number, mistakes: number): string {
  const duration = formatDuration(timeSpentSeconds);
  if (hintCount === 0 && mistakes === 0) {
    return text.postcard.cleanStats(duration);
  }
  return text.postcard.stats(duration, hintCount, mistakes);
}

// Generate an emoji grid for Colour Binary.
export function generateColourBinaryPostcard(params: ColourBinaryPostcardParams): string {
  const header = text.postcard.header(
    text["colour-binary"].name,
    params.puzzleId,
    params.difficulty,
  );
  const statsLine = formatStatsLine(params.timeSpentSeconds, params.hintCount, 0);
  const emojiMap = symbols.postcard.colourBinary;

  const rows: string[] = [];
  for (let r = 0; r < params.size; r += 1) {
    let rowStr = "";
    for (let c = 0; c < params.size; c += 1) {
      const sq = params.squares[r * params.size + c];
      if (sq === "R") rowStr += emojiMap.R;
      else if (sq === "B") rowStr += emojiMap.B;
      else rowStr += emojiMap.empty;
    }
    rows.push(rowStr);
  }

  return [header, statsLine, "", rows.join("\n"), "", text.postcard.url].join("\n");
}

// Generate an emoji grid for Guzzle.
export function generateGuzzlePostcard(params: GuzzlePostcardParams): string {
  const header = text.postcard.header(text.guzzle.name, params.puzzleId, params.mode);
  const statsLine = formatStatsLine(params.timeSpentSeconds, params.hintCount, params.mistakes);
  const emojiMap = symbols.postcard.guzzle;

  const rows: string[] = [];
  for (let r = 0; r < params.size; r += 1) {
    let rowStr = "";
    for (let c = 0; c < params.size; c += 1) {
      const guess = params.guesses[r * params.size + c];
      if (!guess) rowStr += emojiMap.empty;
      else if (guess.mark === "correct") rowStr += emojiMap.correct;
      else if (guess.mark === "present") rowStr += emojiMap.present;
      else rowStr += emojiMap.absent;
    }
    rows.push(rowStr);
  }

  return [header, statsLine, "", rows.join("\n"), "", text.postcard.url].join("\n");
}

export type ShareResult = "shared" | "copied" | "failed";

// Share or copy postcard using Web Share API or Clipboard API.
export async function sharePostcard(payload: {
  title: string;
  text: string;
}): Promise<ShareResult> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
      });
      return "shared";
    } catch {
      // Fall through to clipboard if share was aborted or failed
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(payload.text);
      return "copied";
    } catch {
      return "failed";
    }
  }

  return "failed";
}
