import { useEffect, useRef } from "react";
import {
  calculateCompletionStats,
  markPuzzleProgressSolved,
  savePuzzleProgress,
  type CompletionStats,
  type PuzzleProgressRecord,
} from "../../../shared/puzzle-progress";
import { obeysRules, type ColourBinaryPuzzle, type Square } from "./puzzle";

// ASD-STE100 Simplified Technical English comments.
// This file manages progress storage and completion timing for Colour Binary puzzles.

export function loadInitialSquares(saved: PuzzleProgressRecord | null, start: Square[]): Square[] {
  const squares = saved?.colourBinaryState?.squares;
  return squares && squares.length === start.length ? (squares as Square[]) : start;
}

export function computeElapsedSeconds(startTime: number): number {
  if (startTime <= 0) return 0;
  return Math.max(0, Math.round((Date.now() - startTime) / 1000));
}

export function saveColourBinaryStep(
  puzzle: ColourBinaryPuzzle,
  squares: Square[],
  hintCount: number,
  timeSpentSeconds: number,
) {
  savePuzzleProgress({
    puzzleId: puzzle.id,
    puzzleType: puzzle.type,
    difficulty: puzzle.difficulty,
    savedAt: Date.now(),
    isSolved: obeysRules(squares),
    timeSpentSeconds,
    hintCount,
    mistakes: 0,
    colourBinaryState: { squares },
  });
}

function buildSavedColourBinaryStats(
  puzzle: ColourBinaryPuzzle,
  saved: PuzzleProgressRecord,
): CompletionStats {
  return calculateCompletionStats({
    puzzleId: puzzle.id,
    puzzleType: puzzle.type,
    difficulty: puzzle.difficulty,
    timeSpentSeconds: saved.timeSpentSeconds,
    hintCount: saved.hintCount,
    mistakes: saved.mistakes,
  });
}

function recordNewColourBinarySolve(
  puzzle: ColourBinaryPuzzle,
  startTime: number,
  hintCount: number,
): CompletionStats {
  const start = startTime > 0 ? startTime : Date.now();
  const timeSpentSeconds = Math.max(1, Math.round((Date.now() - start) / 1000));
  markPuzzleProgressSolved(puzzle.id, puzzle.type, puzzle.difficulty, {
    timeSpentSeconds,
    hintCount,
    mistakes: 0,
  });
  return calculateCompletionStats({
    puzzleId: puzzle.id,
    puzzleType: puzzle.type,
    difficulty: puzzle.difficulty,
    timeSpentSeconds,
    hintCount,
    mistakes: 0,
  });
}

export function useInitialStartTime(initialElapsedSeconds: number) {
  const startTimeRef = useRef(0);
  useEffect(() => {
    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now() - initialElapsedSeconds * 1000;
    }
  }, [initialElapsedSeconds]);
  return startTimeRef;
}

export type SolvedSyncParams = {
  puzzle: ColourBinaryPuzzle;
  isSolved: boolean;
  recordedSolvedRef: { current: boolean };
  savedRecordRef: { current: PuzzleProgressRecord | null };
  hintCountRef: { current: number };
  startTimeRef: { current: number };
  setStats: (stats: CompletionStats) => void;
  setShowReview: (show: boolean) => void;
};

export function useSolvedSync(params: SolvedSyncParams) {
  const {
    puzzle,
    isSolved,
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
      setStats(buildSavedColourBinaryStats(puzzle, savedRecordRef.current));
      setShowReview(true);
      return;
    }
    if (recordedSolvedRef.current) return;
    recordedSolvedRef.current = true;
    setStats(recordNewColourBinarySolve(puzzle, startTimeRef.current, hintCountRef.current));
    setShowReview(true);
  }, [
    isSolved,
    puzzle,
    recordedSolvedRef,
    savedRecordRef,
    hintCountRef,
    startTimeRef,
    setStats,
    setShowReview,
  ]);
}
