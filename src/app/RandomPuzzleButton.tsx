import { useState } from "react";
import { useNavigate } from "react-router";
import shared from "../shared/Board.module.css";
import { pickRandomPuzzleId } from "./puzzles";

// ASD-STE100 Simplified Technical English comments.
// This button opens a random puzzle from the registered puzzle pools.

type RandomPuzzleButtonProps = {
  excludeId?: string;
  className?: string;
  label: string;
};

export function RandomPuzzleButton({ excludeId, className, label }: RandomPuzzleButtonProps) {
  const navigate = useNavigate();
  const [picking, setPicking] = useState(false);

  async function handleClick() {
    if (picking) return;
    setPicking(true);
    try {
      const nextId = await pickRandomPuzzleId({ excludeId });
      if (nextId) void navigate(`/puzzles/${nextId}`);
    } finally {
      setPicking(false);
    }
  }

  return (
    <button
      type="button"
      className={className ?? `${shared.button} ${shared.boxed}`}
      disabled={picking}
      onClick={() => void handleClick()}
    >
      {label}
    </button>
  );
}
