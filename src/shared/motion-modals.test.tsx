// ASD-STE100 Simplified Technical English comments.
// This test suite verifies modal enter/exit animations with AnimatePresence and archive navigation.

import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AnimatePresence } from "framer-motion";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it, vi } from "vitest";
import { ArchivePage } from "../app/pages/ArchivePage";
import { CompletionReview } from "./CompletionReview";
import { LogicExplanationModal } from "./LogicExplanation";
import { MotionProvider } from "./MotionProvider";

const mockExplanation = {
  targetIndex: 2,
  targetRow: 1,
  targetColumn: 3,
  targetValue: "Blue",
  ruleName: "Three-in-a-row",
  ruleSummary: "No three consecutive squares of the same color.",
  premises: [{ row: 1, column: 1, label: "Red", index: 0 }],
  deductionSteps: ["Square at (1, 3) must be Blue."],
};

const mockStats = {
  puzzleId: "test-01",
  puzzleType: "colour-binary",
  difficulty: "easy" as const,
  isCleanSolve: true,
  timeSpentSeconds: 42,
  hintCount: 0,
  mistakes: 0,
};

function ModalHarness() {
  const [openLogic, setOpenLogic] = useState(true);
  const [openReview, setOpenReview] = useState(false);

  return (
    <MotionProvider>
      <button type="button" onClick={() => setOpenReview(true)}>
        Open Review
      </button>
      <AnimatePresence>
        {openLogic && (
          <LogicExplanationModal
            key="test-logic-modal"
            explanation={mockExplanation}
            onClose={() => setOpenLogic(false)}
          />
        )}
        {openReview && (
          <CompletionReview
            key="test-review-modal"
            stats={mockStats}
            postcardText="test card"
            onClose={() => setOpenReview(false)}
          />
        )}
      </AnimatePresence>
    </MotionProvider>
  );
}

function installReducedMatchMediaMock() {
  const mockMatchMedia = vi.fn<(query: string) => MediaQueryList>((query: string) => ({
    matches: query === "(prefers-reduced-motion: reduce)",
    media: query,
    onchange: null,
    addListener: vi.fn<() => void>(),
    removeListener: vi.fn<() => void>(),
    addEventListener: vi.fn<() => void>(),
    removeEventListener: vi.fn<() => void>(),
    dispatchEvent: vi.fn<() => boolean>(() => true),
  }));

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: mockMatchMedia,
  });
}

describe("Modal AnimatePresence integration", () => {
  it("renders LogicExplanationModal and handles dismiss with AnimatePresence", async () => {
    render(<ModalHarness />);

    expect(screen.getByText("Three-in-a-row")).toBeInTheDocument();
    expect(screen.getByText("Row 1, Col 1: Red")).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: /Close/iu });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText("Three-in-a-row")).not.toBeInTheDocument();
    });
  });

  it("renders CompletionReview modal with Clean Solve badge and handles close", async () => {
    render(<ModalHarness />);

    fireEvent.click(screen.getByText("Open Review"));

    await waitFor(() => {
      expect(screen.getByText("Perfect solve!")).toBeInTheDocument();
    });

    const reviewBoardBtn = screen.getByRole("button", { name: "Review board" });
    fireEvent.click(reviewBoardBtn);

    await waitFor(() => {
      expect(screen.queryByText("Perfect solve!")).not.toBeInTheDocument();
    });
  });
});

describe("ArchivePage date navigation respecting motion preferences", () => {
  it("navigates from date picker with reduced motion enabled", async () => {
    installReducedMatchMediaMock();

    const mockArchiveData = {
      dateString: "2026-11-12",
      isToday: true,
      types: [],
    };

    const router = createMemoryRouter(
      [
        {
          path: "/archive",
          loader: () => mockArchiveData,
          element: <ArchivePage />,
        },
        {
          path: "/archive/:date",
          element: <div data-testid="date-destination">Date Loaded</div>,
        },
      ],
      { initialEntries: ["/archive"] },
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Pick date")).toBeInTheDocument();
    });

    const picker = screen.getByLabelText("Pick date");
    fireEvent.change(picker, { target: { value: "2026-11-10" } });

    await waitFor(() => {
      expect(screen.getByTestId("date-destination")).toBeInTheDocument();
    });
  });
});
