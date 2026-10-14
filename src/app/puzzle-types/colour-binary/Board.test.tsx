import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { text } from "../../../text/en";
import { Board } from "./Board";
import example from "./examples/colour-binary-0000.json";
import type { ColourBinaryPuzzle } from "./puzzle";

const words = text["colour-binary"];
const puzzle = example as ColourBinaryPuzzle;

beforeEach(() => {
  localStorage.clear();
});

// This helper finds a square by its row and column, so the test does not depend on the label end.
function square(row: number, column: number): HTMLElement {
  return screen.getByRole("button", { name: new RegExp(`^Row ${row}, column ${column},`, "u") });
}

// This helper taps each empty square until it has the colour of the answer.
// One tap makes a square red. Two taps make it blue.
async function fillAnswer(user: ReturnType<typeof userEvent.setup>) {
  for (const [row, line] of puzzle.answer.entries()) {
    for (const [column, colour] of [...line].entries()) {
      if (puzzle.start[row]?.[column] !== ".") continue;
      const taps = colour === "R" ? 1 : 2;
      for (let tap = 0; tap < taps; tap += 1) {
        // oxlint-disable-next-line no-await-in-loop -- the taps must happen one after the other.
        await user.click(square(row + 1, column + 1));
      }
    }
  }
}

describe("colour-binary board interaction", () => {
  it("changes an empty square to red, to blue, and back to empty", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await user.click(square(1, 1));
    expect(square(1, 1)).toHaveAccessibleName("Row 1, column 1, red");
    await user.click(square(1, 1));
    expect(square(1, 1)).toHaveAccessibleName("Row 1, column 1, blue");
    await user.click(square(1, 1));
    expect(square(1, 1)).toHaveAccessibleName("Row 1, column 1, empty");
  });

  it("does not change a fixed square", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await user.click(square(1, 3));
    expect(square(1, 3)).toHaveAccessibleName("Row 1, column 3, blue, fixed");
  });
});

describe("colour-binary board hints", () => {
  it("shows a hint", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await user.click(screen.getByRole("button", { name: words.hintButton }));
    expect(screen.getByRole("status")).toHaveTextContent(/^Row 1, column 2: Column 2/u);
    expect(square(1, 2)).toHaveAttribute("data-hint", "true");
  });

  it("escalates graduated hint from nudge to explanation to solution", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    const hintButton = screen.getByRole("button", { name: words.hintButton });
    await user.click(hintButton);
    expect(screen.getByRole("status")).toHaveTextContent("has a clue to check.");

    // Advance to explanation
    await user.click(screen.getByRole("button", { name: /explain more/iu }));
    expect(screen.getByRole("status")).toHaveTextContent("already has half");

    // Advance to solution
    await user.click(screen.getByRole("button", { name: /show next step/iu }));
    expect(screen.getByRole("status")).toHaveTextContent("Thus this square is blue.");
  });

  it("opens logic explanation modal with deduction steps and highlights cues", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await user.click(screen.getByRole("button", { name: text.logicExplanation.button }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveTextContent(text.logicExplanation.title);
    expect(square(1, 2)).toHaveAttribute("data-logic-target", "true");

    await user.click(screen.getByRole("button", { name: text.logicExplanation.close }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("colour-binary board completion", () => {
  it("shows that the puzzle is solved and opens completion review", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await fillAnswer(user);
    expect(screen.getByRole("status")).toHaveTextContent(words.status.solved);
    expect(screen.getByRole("button", { name: words.hintButton })).toBeDisabled();
    expect(screen.getByRole("dialog")).toHaveTextContent(text.completion.title);
    expect(screen.getByRole("dialog")).toHaveTextContent(text.completion.cleanSolve);

    // Dismiss completion review
    await user.click(screen.getByRole("button", { name: text.completion.reviewBoard }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Reopen completion review from action button
    await user.click(screen.getByRole("button", { name: text.completion.openSummary }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("colour-binary keyboard accessibility", () => {
  it("allows setting red, blue, and empty with keyboard keys", () => {
    render(<Board puzzle={puzzle} />);
    const sq = square(1, 1);
    fireEvent.keyDown(sq, { key: "r" });
    expect(square(1, 1)).toHaveAccessibleName("Row 1, column 1, red");
    fireEvent.keyDown(sq, { key: "b" });
    expect(square(1, 1)).toHaveAccessibleName("Row 1, column 1, blue");
    fireEvent.keyDown(sq, { key: "Backspace" });
    expect(square(1, 1)).toHaveAccessibleName("Row 1, column 1, empty");
  });

  it("navigates grid squares using arrow keys", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    const sq11 = square(1, 1);
    sq11.focus();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(square(1, 2));
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(square(2, 2));
  });
});
