import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { text } from "../text/en";
import { CompletionReview } from "./CompletionReview";
import { LogicExplanationModal } from "./LogicExplanation";

// ASD-STE100 Simplified Technical English comments.
// This test suite verifies Escape dismissal, backdrop click, and focus handling in modal dialogs.

const MOCK_STATS = {
  puzzleId: "colour-binary-0001",
  puzzleType: "colour-binary" as const,
  difficulty: "easy" as const,
  timeSpentSeconds: 42,
  hintCount: 0,
  mistakes: 0,
  isCleanSolve: true,
  completedAt: 1700000000000,
};

const MOCK_EXPLANATION = {
  ruleName: "Equal colour balance",
  ruleSummary: "Row 1 requires exactly 2 red squares.",
  targetIndex: 1,
  targetRow: 1,
  targetColumn: 2,
  targetValue: "blue",
  premises: [{ index: 0, row: 1, column: 1, label: "red" }],
  deductionSteps: ["Count red squares in Row 1.", "Place blue in Row 1, column 2."],
};

function CompletionHarness() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        Open summary
      </button>
      {open && <CompletionReview stats={MOCK_STATS} onClose={() => setOpen(false)} />}
    </div>
  );
}

function LogicHarness() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        Show logic
      </button>
      {open && (
        <LogicExplanationModal explanation={MOCK_EXPLANATION} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

describe("CompletionReview modal accessibility", () => {
  it("dismisses on Escape key and restores focus to trigger", async () => {
    const user = userEvent.setup();
    render(<CompletionHarness />);
    const trigger = screen.getByRole("button", { name: "Open summary" });
    await user.click(trigger);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog.contains(document.activeElement)).toBe(true);

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("dismisses when clicking backdrop overlay outside dialog panel", () => {
    const onClose = vi.fn<() => void>();
    render(<CompletionReview stats={MOCK_STATS} onClose={onClose} />);

    const overlay = screen.getByRole("dialog");
    const heading = screen.getByText(text.completion.title);
    fireEvent.click(heading);
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("CompletionReview focus trapping", () => {
  it("traps Tab and Shift+Tab across multiple buttons and pulls external focus back in", async () => {
    const user = userEvent.setup();
    const onRestart = vi.fn<() => void>();
    const onClose = vi.fn<() => void>();
    render(
      <div>
        <button type="button">Outside button</button>
        <CompletionReview
          stats={MOCK_STATS}
          postcardText="Skardela postcard"
          onRestart={onRestart}
          onClose={onClose}
        />
      </div>,
    );

    const shareBtn = screen.getByRole("button", { name: text.completion.sharePostcard });
    const playAgainBtn = screen.getByRole("button", { name: text.completion.playAgain });
    const reviewBtn = screen.getByRole("button", { name: text.completion.reviewBoard });
    const outsideBtn = screen.getByRole("button", { name: "Outside button" });

    await user.tab();
    expect(shareBtn).toHaveFocus();
    await user.tab();
    expect(playAgainBtn).toHaveFocus();
    await user.tab();
    expect(reviewBtn).toHaveFocus();

    // Wrap forward from last button back to first button
    await user.tab();
    expect(shareBtn).toHaveFocus();

    // Wrap backward from first button to last button
    await user.tab({ shift: true });
    expect(reviewBtn).toHaveFocus();

    // Pull external focus back inside the modal on Tab
    outsideBtn.focus();
    expect(outsideBtn).toHaveFocus();
    await user.tab();
    expect(shareBtn).toHaveFocus();
  });
});

describe("LogicExplanationModal accessibility", () => {
  it("dismisses on Escape key, traps focus, and restores focus to trigger", async () => {
    const user = userEvent.setup();
    render(<LogicHarness />);
    const trigger = screen.getByRole("button", { name: "Show logic" });
    await user.click(trigger);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog.contains(document.activeElement)).toBe(true);

    await user.tab();
    const closeBtn = screen.getByRole("button", { name: text.logicExplanation.close });
    expect(closeBtn).toHaveFocus();

    await user.tab();
    expect(closeBtn).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
