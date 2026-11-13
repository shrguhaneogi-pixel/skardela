import { useState } from "react";
import { useNavigate } from "react-router";
import { Shuffle } from "lucide-react";
import { getViewTransitionNavigateOptions } from "../shared/motion-prefs";
import { Button } from "../shared/ui/Button";
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
      if (nextId) void navigate(`/puzzles/${nextId}`, getViewTransitionNavigateOptions());
    } catch {
      // Ignore navigation error.
    }
    setPicking(false);
  }

  return (
    <Button
      variant="secondary"
      size={className ? undefined : "sm"}
      className={className}
      disabled={picking}
      onClick={() => void handleClick()}
    >
      <Shuffle size={15} aria-hidden="true" />
      {label}
    </Button>
  );
}
