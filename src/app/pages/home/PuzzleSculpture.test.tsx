import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import type { TodayCard } from "../../puzzles";
import type { PuzzleType } from "../../puzzle-types/registry";
import { text } from "../../../text/en";
import { cubeFaces } from "./cube-faces";
import { normalizeTargetAngle } from "./cube-math";
import { PuzzleSculpture } from "./PuzzleSculpture";

const mockCards: readonly TodayCard[] = [
  {
    type: "latics",
    levels: [
      { id: "latics-easy", difficulty: "easy" },
      { id: "latics-medium", difficulty: "medium" },
      { id: "latics-hard", difficulty: "hard" },
    ],
  },
  {
    type: "colour-binary",
    levels: [
      { id: "cb-easy", difficulty: "easy" },
      { id: "cb-medium", difficulty: "medium" },
    ],
  },
  {
    type: "orbital",
    levels: [
      { id: "orb-easy", difficulty: "easy" },
      { id: "orb-hard", difficulty: "hard" },
    ],
  },
];

describe("PuzzleSculpture rendering", () => {
  it("renders the sculpture region with accessible name and 6 puzzle faces", () => {
    render(
      <MemoryRouter>
        <PuzzleSculpture />
      </MemoryRouter>,
    );

    const region = screen.getByRole("region", {
      name: text.home.hero.sculpture.label,
    });
    expect(region).toBeInTheDocument();

    expect(screen.getByTestId("active-sculpture-name")).toHaveTextContent(text.latics.name);

    const playLink = screen.getByTestId("sculpture-play-link");
    expect(playLink).toHaveAttribute("href", "#today");
    expect(playLink).toHaveTextContent(text.latics.name);

    for (const face of cubeFaces) {
      expect(screen.getByTestId(`sculpture-face-${face.type}`)).toBeInTheDocument();
    }
  });

  it("links directly to the first unsolved puzzle level when cards are provided", () => {
    render(
      <MemoryRouter>
        <PuzzleSculpture cards={mockCards} solved={["latics-easy"]} />
      </MemoryRouter>,
    );

    const playLink = screen.getByTestId("sculpture-play-link");
    expect(playLink).toHaveAttribute("href", "/puzzles/latics-medium");
    expect(playLink).toHaveTextContent(text.latics.name);
  });

  it("links to first level when all levels of active type are solved", () => {
    render(
      <MemoryRouter>
        <PuzzleSculpture
          cards={mockCards}
          solved={["latics-easy", "latics-medium", "latics-hard"]}
        />
      </MemoryRouter>,
    );

    const playLink = screen.getByTestId("sculpture-play-link");
    expect(playLink).toHaveAttribute("href", "/puzzles/latics-easy");
  });
});

describe("PuzzleSculpture pill click interactions", () => {
  it("changes active puzzle face and snaps 3D perspective when clicking a face pill", () => {
    const onSelect = vi.fn<(type: PuzzleType) => void>();
    render(
      <MemoryRouter>
        <PuzzleSculpture cards={mockCards} onSelectPuzzle={onSelect} />
      </MemoryRouter>,
    );

    const pill = screen.getByRole("button", {
      name: text.home.hero.sculpture.selectFace(text["colour-binary"].name),
    });
    fireEvent.click(pill);

    expect(screen.getByTestId("active-sculpture-name")).toHaveTextContent(
      text["colour-binary"].name,
    );
    expect(pill).toHaveAttribute("aria-pressed", "true");
    expect(onSelect).toHaveBeenCalledWith("colour-binary");

    const playLink = screen.getByTestId("sculpture-play-link");
    expect(playLink).toHaveAttribute("href", "/puzzles/cb-easy");

    const cube = screen.getByTestId("sculpture-cube");
    expect(cube.style.transform).toContain("rotateX(-14deg)");
    expect(cube.style.transform).toContain("rotateY(-112deg)");
  });
});

describe("PuzzleSculpture pill keyboard navigation", () => {
  it("handles keyboard navigation across pills with arrow keys and shifts focus", () => {
    const onSelect = vi.fn<(type: PuzzleType) => void>();
    render(
      <MemoryRouter>
        <PuzzleSculpture onSelectPuzzle={onSelect} />
      </MemoryRouter>,
    );

    const pill = screen.getByRole("button", {
      name: text.home.hero.sculpture.selectFace(text.latics.name),
    });
    fireEvent.keyDown(pill, { key: "ArrowRight" });

    expect(onSelect).toHaveBeenCalledWith("colour-binary");
    const nextPill = screen.getByRole("button", {
      name: text.home.hero.sculpture.selectFace(text["colour-binary"].name),
    });
    expect(nextPill).toHaveFocus();
  });

  it("navigates to first and last pills with Home and End keys", () => {
    const onSelect = vi.fn<(type: PuzzleType) => void>();
    render(
      <MemoryRouter>
        <PuzzleSculpture onSelectPuzzle={onSelect} />
      </MemoryRouter>,
    );

    const firstPill = screen.getByRole("button", {
      name: text.home.hero.sculpture.selectFace(text.latics.name),
    });
    fireEvent.keyDown(firstPill, { key: "End" });
    expect(onSelect).toHaveBeenCalledWith("numpuz");

    const lastPill = screen.getByRole("button", {
      name: text.home.hero.sculpture.selectFace(text.numpuz.name),
    });
    fireEvent.keyDown(lastPill, { key: "Home" });
    expect(onSelect).toHaveBeenCalledWith("latics");
  });
});

describe("PuzzleSculpture pointer drag", () => {
  it("handles pointer drag interaction on viewport and snaps to nearest face", () => {
    render(
      <MemoryRouter>
        <PuzzleSculpture />
      </MemoryRouter>,
    );

    const viewport = screen.getByTestId("sculpture-viewport");
    const cube = screen.getByTestId("sculpture-cube");

    fireEvent.pointerDown(viewport, {
      button: 0,
      clientX: 200,
      clientY: 200,
      pointerId: 1,
    });
    expect(cube).toHaveAttribute("data-dragging", "true");

    // Drag to the right (pulling left face 'tilt' into view)
    fireEvent.pointerMove(viewport, {
      clientX: 400,
      clientY: 200,
      pointerId: 1,
    });
    expect(cube.style.transform).toBeDefined();

    fireEvent.pointerUp(viewport, {
      clientX: 400,
      clientY: 200,
      pointerId: 1,
    });
    expect(cube).not.toHaveAttribute("data-dragging");

    // Snapped to tilt
    expect(screen.getByTestId("active-sculpture-name")).toHaveTextContent(text.tilt.name);
    expect(cube.style.transform).toContain("rotateX(-14deg)");
    expect(cube.style.transform).toContain("rotateY(68deg)");
  });
});

describe("PuzzleSculpture pointer capture loss", () => {
  it("safely cleans up and snaps when pointer capture is lost", () => {
    render(
      <MemoryRouter>
        <PuzzleSculpture />
      </MemoryRouter>,
    );

    const viewport = screen.getByTestId("sculpture-viewport");
    const cube = screen.getByTestId("sculpture-cube");

    fireEvent.pointerDown(viewport, {
      button: 0,
      clientX: 200,
      clientY: 200,
      pointerId: 2,
    });
    expect(cube).toHaveAttribute("data-dragging", "true");

    fireEvent.lostPointerCapture(viewport, {
      pointerId: 2,
    });
    expect(cube).not.toHaveAttribute("data-dragging");
  });
});

describe("PuzzleSculpture tap interactions", () => {
  it("selects face when tapped directly without dragging", () => {
    const onSelect = vi.fn<(type: PuzzleType) => void>();
    render(
      <MemoryRouter>
        <PuzzleSculpture onSelectPuzzle={onSelect} />
      </MemoryRouter>,
    );

    const faceTilt = screen.getByTestId("sculpture-face-tilt");

    fireEvent.pointerDown(faceTilt, {
      button: 0,
      clientX: 100,
      clientY: 100,
      pointerId: 1,
    });

    // Release at same position (tap, not drag)
    fireEvent.pointerUp(faceTilt, {
      clientX: 100,
      clientY: 100,
      pointerId: 1,
    });

    expect(onSelect).toHaveBeenCalledWith("tilt");
    expect(screen.getByTestId("active-sculpture-name")).toHaveTextContent(text.tilt.name);
  });
});

describe("cube-math shortest path calculation", () => {
  it("computes shortest angular path without wrapping 360 degrees", () => {
    expect(normalizeTargetAngle(350, -22)).toBe(338);
    expect(normalizeTargetAngle(0, -112)).toBe(-112);
    expect(normalizeTargetAngle(720, -22)).toBe(698);
    expect(normalizeTargetAngle(-360, 68)).toBe(-292);
  });
});
