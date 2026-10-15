import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ReactiveCursor } from "./ReactiveCursor";

// ASD-STE100 Simplified Technical English comments.
// This test suite verifies the reactive cursor lifecycle, accessibility, and media query behavior.

type MediaListener = (event: MediaQueryListEvent) => void;

function createMatchMediaMock(matchesQuery: (query: string) => boolean) {
  const listeners = new Map<string, Set<MediaListener>>();

  return {
    mock: vi.fn<(query: string) => MediaQueryList>().mockImplementation((query) => {
      if (!listeners.has(query)) {
        listeners.set(query, new Set());
      }
      const mediaList: MediaQueryList = {
        matches: matchesQuery(query),
        media: query,
        onchange: null,
        addListener: vi.fn<() => void>(),
        removeListener: vi.fn<() => void>(),
        addEventListener: vi
          .fn<MediaQueryList["addEventListener"]>()
          .mockImplementation((_type, listener) => {
            if (typeof listener === "function") {
              listeners.get(query)?.add(listener as MediaListener);
            }
          }),
        removeEventListener: vi
          .fn<MediaQueryList["removeEventListener"]>()
          .mockImplementation((_type, listener) => {
            if (typeof listener === "function") {
              listeners.get(query)?.delete(listener as MediaListener);
            }
          }),
        dispatchEvent: vi.fn<() => boolean>(),
      };
      return mediaList;
    }),
  };
}

describe("ReactiveCursor mounting and suppression", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete document.documentElement.dataset.customCursor;
  });

  it("renders when fine pointer is available and reduced motion is false", () => {
    const { mock } = createMatchMediaMock((query) => query.includes("pointer: fine"));
    window.matchMedia = mock;

    render(<ReactiveCursor />);
    const cursor = screen.getByTestId("reactive-cursor");
    expect(cursor).toBeInTheDocument();
    expect(cursor).toHaveAttribute("aria-hidden", "true");
    expect(document.documentElement.dataset.customCursor).toBe("active");
  });

  it("does not render when pointer is coarse (touch device)", () => {
    const { mock } = createMatchMediaMock(() => false);
    window.matchMedia = mock;

    render(<ReactiveCursor />);
    expect(screen.queryByTestId("reactive-cursor")).toBeNull();
    expect(document.documentElement.dataset.customCursor).toBeUndefined();
  });

  it("does not render when user prefers reduced motion", () => {
    const { mock } = createMatchMediaMock((query) => query.includes("prefers-reduced-motion"));
    window.matchMedia = mock;

    render(<ReactiveCursor />);
    expect(screen.queryByTestId("reactive-cursor")).toBeNull();
    expect(document.documentElement.dataset.customCursor).toBeUndefined();
  });
});

describe("ReactiveCursor lifecycle and listener cleanup", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete document.documentElement.dataset.customCursor;
  });

  it("cleans up event listeners cleanly on unmount", () => {
    const { mock } = createMatchMediaMock((query) => query.includes("pointer: fine"));
    window.matchMedia = mock;

    const removeWindowListenerSpy = vi.spyOn(window, "removeEventListener");
    const removeDocListenerSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = render(<ReactiveCursor />);
    unmount();

    expect(removeWindowListenerSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
    expect(removeWindowListenerSpy).toHaveBeenCalledWith("mouseover", expect.any(Function));
    expect(removeDocListenerSpy).toHaveBeenCalledWith("mouseleave", expect.any(Function));
    expect(removeDocListenerSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    expect(removeWindowListenerSpy).toHaveBeenCalledWith("blur", expect.any(Function));
    expect(document.documentElement.dataset.customCursor).toBeUndefined();
  });
});

describe("ReactiveCursor native input suppression", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete document.documentElement.dataset.customCursor;
  });

  it("keeps cursor hidden when moving over native input elements", () => {
    const { mock } = createMatchMediaMock((query) => query.includes("pointer: fine"));
    window.matchMedia = mock;

    const input = document.createElement("input");
    document.body.append(input);

    render(<ReactiveCursor />);
    const cursor = screen.getByTestId("reactive-cursor");

    fireEvent.mouseMove(input, { clientX: 50, clientY: 50 });
    expect(cursor.className).toContain("cursorHidden");

    input.remove();
  });
});

describe("ReactiveCursor element hover responses", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete document.documentElement.dataset.customCursor;
  });

  it("un-hides cursor when moving over standard page elements", () => {
    const { mock } = createMatchMediaMock((query) => query.includes("pointer: fine"));
    window.matchMedia = mock;

    const div = document.createElement("div");
    document.body.append(div);

    render(<ReactiveCursor />);
    const cursor = screen.getByTestId("reactive-cursor");

    fireEvent.mouseMove(div, { clientX: 80, clientY: 80 });
    expect(cursor.className).not.toContain("cursorHidden");

    div.remove();
  });

  it("expands reticle over interactive elements", () => {
    const { mock } = createMatchMediaMock((query) => query.includes("pointer: fine"));
    window.matchMedia = mock;

    const button = document.createElement("button");
    document.body.append(button);

    render(<ReactiveCursor />);
    const cursor = screen.getByTestId("reactive-cursor");
    const reticle = cursor.querySelector("div:last-child");

    fireEvent.mouseOver(button);
    expect(reticle?.className).toContain("reticleTargeted");

    button.remove();
  });
});
