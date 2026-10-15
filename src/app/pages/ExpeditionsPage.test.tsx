import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ExpeditionsPage } from "./ExpeditionsPage";
import { text } from "../../text/en";
import { DEFAULT_EXPEDITIONS } from "../../shared/expeditions";

describe("ExpeditionsPage", () => {
  it("renders expeditions header and local disclaimer", () => {
    render(
      <MemoryRouter>
        <ExpeditionsPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: new RegExp(text.expeditions.title, "u") }),
    ).toBeInTheDocument();
    expect(screen.getByText(text.expeditions.disclaimer)).toBeInTheDocument();
  });

  it("renders all chapters from the manifest", () => {
    render(
      <MemoryRouter>
        <ExpeditionsPage />
      </MemoryRouter>,
    );
    for (const chapter of DEFAULT_EXPEDITIONS.chapters) {
      expect(
        screen.getByRole("heading", { name: new RegExp(chapter.title, "u") }),
      ).toBeInTheDocument();
      expect(screen.getByText(chapter.description)).toBeInTheDocument();
    }
  });

  it("renders available and locked stages", () => {
    render(
      <MemoryRouter>
        <ExpeditionsPage />
      </MemoryRouter>,
    );
    const availableBadges = screen.getAllByText(text.expeditions.stageAvailable);
    expect(availableBadges.length).toBeGreaterThan(0);

    const lockedBadges = screen.getAllByText(/Locked/u);
    expect(lockedBadges.length).toBeGreaterThan(0);
  });
});
