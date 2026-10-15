import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { LearnPage } from "./LearnPage";
import { text } from "../../text/en";
import { clearLessonProgress } from "../../shared/learning-pathways";

describe("LearnPage", () => {
  beforeEach(() => {
    clearLessonProgress();
  });

  it("renders learn header and non-cognitive disclaimer", () => {
    render(
      <MemoryRouter>
        <LearnPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: new RegExp(text.learn.title, "u") }),
    ).toBeInTheDocument();
    expect(screen.getByText(text.learn.disclaimer)).toBeInTheDocument();
  });

  it("renders pathways and worked examples", () => {
    render(
      <MemoryRouter>
        <LearnPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Equal Colour Balance")).toBeInTheDocument();
    const exampleLabels = screen.getAllByText(text.learn.workedExampleHeading);
    expect(exampleLabels.length).toBeGreaterThan(0);
  });

  it("marks a lesson completed on button click", () => {
    render(
      <MemoryRouter>
        <LearnPage />
      </MemoryRouter>,
    );
    const markButtons = screen.getAllByRole("button", { name: text.learn.markCompletedBtn });
    expect(markButtons.length).toBeGreaterThan(0);

    const firstBtn = markButtons[0];
    expect(firstBtn).toBeDefined();
    fireEvent.click(firstBtn as HTMLElement);

    const completedBadges = screen.getAllByText(new RegExp(text.learn.completedBadge, "u"));
    expect(completedBadges.length).toBeGreaterThan(0);
  });
});
