import { useEffect, useRef } from "react";
import {
  calculateCompletionStats,
  markPuzzleProgressSolved,
  savePuzzleProgress,
  type CompletionStats,
  type PuzzleProgressRecord,
} from "../../../shared/puzzle-progress";
import type { Guess } from "./rules-check";
import type { GuzzlePuzzle, Mode } from "./useGame";

// ASD-STE100 Simplified Technical English comments.
// This file manages completion timing and telemetry sync for Guzzle puzzles.

export function computeGuzzleElapsedSeconds(startTime: number): number {
  if (startTime <= 0) return 0;
  return Math.max(0, Math.round((Date.now() - startTime) / 1000));
}

export function saveGuzzleHintProgress(params: {
  puzzle: GuzzlePuzzle;
  guesses: (Guess | undefined)[];
  mode: Mode | null;
  mistakes: number;
  hintCount: number;
  timeSpentSeconds: number;
}) {
  savePuzzleProgress({
    puzzleId: params.puzzle.id,
    puzzleType: "guzzle",
    difficulty: params.puzzle.difficulty,
    savedAt: Date.now(),
    isSolved: false,
    timeSpentSeconds: params.timeSpentSeconds,
    hintCount: params.hintCount,
    mistakes: params.mistakes,
    guzzleState: { guesses: params.guesses, mode: params.mode ?? undefined },
  });
}

function buildSavedGuzzleStats(puzzle: GuzzlePuzzle, saved: PuzzleProgressRecord): CompletionStats {
  return calculateCompletionStats({
    puzzleId: puzzle.id,
    puzzleType: puzzle.type,
    difficulty: puzzle.difficulty,
    timeSpentSeconds: saved.timeSpentSeconds,
    hintCount: saved.hintCount,
    mistakes: saved.mistakes,
  });
}

function recordNewGuzzleSolve(
  puzzle: GuzzlePuzzle,
  mistakes: number,
  startTime: number,
  hintCount: number,
): CompletionStats {
  const start = startTime > 0 ? startTime : Date.now();
  const timeSpentSeconds = Math.max(1, Math.round((Date.now() - start) / 1000));
  markPuzzleProgressSolved(puzzle.id, puzzle.type, puzzle.difficulty, {
    timeSpentSeconds,
    hintCount,
    mistakes,
  });
  return calculateCompletionStats({
    puzzleId: puzzle.id,
    puzzleType: puzzle.type,
    difficulty: puzzle.difficulty,
    timeSpentSeconds,
    hintCount,
    mistakes,
  });
}

export function useGuzzleStartTime(initialElapsedSeconds: number) {
  const startTimeRef = useRef(0);
  useEffect(() => {
    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now() - initialElapsedSeconds * 1000;
    }
  }, [initialElapsedSeconds]);
  return startTimeRef;
}

export type GuzzleSolvedParams = {
  puzzle: GuzzlePuzzle;
  isSolved: boolean;
  mistakes: number;
  recordedSolvedRef: { current: boolean };
  savedRecordRef: { current: PuzzleProgressRecord | null };
  hintCountRef: { current: number };
  startTimeRef: { current: number };
  setStats: (stats: CompletionStats) => void;
  setShowReview: (show: boolean) => void;
};

export function useGuzzleSolvedSync(params: GuzzleSolvedParams) {
  const {
    puzzle,
    isSolved,
    mistakes,
    recordedSolvedRef,
    savedRecordRef,
    hintCountRef,
    startTimeRef,
    setStats,
    setShowReview,
  } = params;
  useEffect(() => {
    if (!isSolved) return;
    // Reuse stored solve metrics when opening an already-solved puzzle.
    if (recordedSolvedRef.current && savedRecordRef.current?.isSolved) {
      setStats(buildSavedGuzzleStats(puzzle, savedRecordRef.current));
      setShowReview(true);
      return;
    }
    if (recordedSolvedRef.current) return;
    recordedSolvedRef.current = true;
    setStats(recordNewGuzzleSolve(puzzle, mistakes, startTimeRef.current, hintCountRef.current));
    setShowReview(true);
  }, [
    isSolved,
    mistakes,
    puzzle,
    recordedSolvedRef,
    savedRecordRef,
    hintCountRef,
    startTimeRef,
    setStats,
    setShowReview,
  ]);
}
