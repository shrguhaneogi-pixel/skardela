import { createMemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { routes } from "./routes";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RouterProvider } from "react-router/dom";
import { saveImportedPack, type PuzzlePack } from "../shared/puzzle-pack";
import { text } from "../text/en";

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("routes", () => {
  it("shows the home page at /", async () => {
    renderAt("/");
    expect(
      await screen.findByRole("heading", { level: 1, name: text.home.title }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: text.nav.label })).toBeInTheDocument();
  });

  it("shows the colour-binary puzzle page", async () => {
    renderAt("/puzzles/colour-binary-0001");
    expect(
      await screen.findByRole("heading", { level: 1, name: text["colour-binary"].name }),
    ).toBeInTheDocument();
  });

  it("shows the guzzle puzzle page", async () => {
    renderAt("/puzzles/guzzle-0001");
    expect(
      await screen.findByRole("heading", { level: 1, name: text.guzzle.name }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: text.guzzle.modes.bank }, { timeout: 4000 }),
    ).toBeInTheDocument();
  });

  it.each(["/puzzles/guzzle-9999", "/puzzles/unknown-0001", "/puzzles/guzzle"])(
    "shows the not found page for the puzzle path %s",
    async (path) => {
      renderAt(path);
      expect(await screen.findByTestId("not-found-page-title")).toBeInTheDocument();
    },
  );

  it("shows the route error page for an unknown route", () => {
    renderAt("/broken");
    expect(screen.getByTestId("not-found-page-title")).toBeInTheDocument();
  });
});

describe("archive route integration", () => {
  it("shows the archive page at /archive", async () => {
    renderAt("/archive");
    expect(
      await screen.findByRole("heading", { level: 1, name: text.archive.title }),
    ).toBeInTheDocument();
  });

  it("shows the archive page for a specific date /archive/:date", async () => {
    renderAt("/archive/2026-05-01");
    expect(
      await screen.findByRole("heading", { level: 1, name: text.archive.title }),
    ).toBeInTheDocument();
  });
});

describe("atlas route integration", () => {
  it("shows the personal logic atlas at /atlas", async () => {
    renderAt("/atlas");
    expect(
      await screen.findByRole("heading", { level: 1, name: text.atlas.title }),
    ).toBeInTheDocument();
  });
});

describe("random puzzle and custom pack route integration", () => {
  it("opens a random puzzle from the home page", async () => {
    const router = renderAt("/");
    const randomBtn = await screen.findByRole("button", { name: text.home.randomPuzzle });
    fireEvent.click(randomBtn);

    await waitFor(() => {
      expect(router.state.location.pathname).toMatch(/^\/puzzles\/[a-z]+(?:-[a-z]+)*-\d{4}$/u);
    });
  });

  it("opens another random puzzle from an active puzzle page", async () => {
    const router = renderAt("/puzzles/colour-binary-0001");
    const randomBtn = await screen.findByRole("button", { name: text.puzzlePage.randomButton });
    fireEvent.click(randomBtn);

    await waitFor(() => {
      expect(router.state.location.pathname).toMatch(/^\/puzzles\/[a-z]+(?:-[a-z]+)*-\d{4}$/u);
      expect(router.state.location.pathname).not.toBe("/puzzles/colour-binary-0001");
    });
  });
});

describe("custom pack route integration", () => {
  it("loads an imported custom pack puzzle route", async () => {
    const customPack: PuzzlePack = {
      format: "skardela-pack-v1",
      id: "pack-route-01",
      title: "Route Test Pack",
      author: "Tester",
      version: "1.0.0",
      license: "CC-BY-4.0",
      puzzles: [
        {
          id: "colour-binary-9999",
          type: "colour-binary",
          difficulty: "easy",
          author: "Tester",
          license: "CC-BY-4.0",
          start: ["R..R", "R.BR", "..RB", "..R."],
          answer: ["RBBR", "RBBR", "BRRB", "BRRB"],
        },
      ],
    };
    saveImportedPack(customPack);

    renderAt("/puzzles/colour-binary-9999?pack=pack-route-01");
    expect(
      await screen.findByRole("heading", { level: 1, name: text["colour-binary"].name }),
    ).toBeInTheDocument();
    expect(screen.getByText("#9999")).toBeInTheDocument();
  });
});
