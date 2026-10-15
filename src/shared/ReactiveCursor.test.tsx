import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ReactiveCursor } from "./ReactiveCursor";

// ASD-STE100 Simplified Technical English comments.
// This test suite verifies the reactive cursor lifecycle, accessibility, and media query behavior.

function createMatchMediaMock(matchesQuery: (query: string) => boolean) {
  return vi.fn<(query: string) => MediaQueryList>().mockImplementation((query) => ({
    matches: matchesQuery(query),
    media: query,
    onchange: null,
    addListener: vi.fn<() => void>(),
    removeListener: vi.fn<() => void>(),
    addEventListener: vi.fn<() => void>(),
    removeEventListener: vi.fn<() => void>(),
    dispatchEvent: vi.fn<() => boolean>(),
  }));
}

describe("ReactiveCursor component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders when fine pointer is available and reduced motion is false", () => {
    window.matchMedia = createMatchMediaMock((query) => query.includes("pointer: fine"));

    render(<ReactiveCursor />);
    const cursor = screen.getByTestId("reactive-cursor");
    expect(cursor).toBeInTheDocument();
    expect(cursor).toHaveAttribute("aria-hidden", "true");
  });

  it("does not render when pointer is coarse (touch device)", () => {
    window.matchMedia = createMatchMediaMock(() => false);

    render(<ReactiveCursor />);
    expect(screen.queryByTestId("reactive-cursor")).toBeNull();
  });

  it("does not render when user prefers reduced motion", () => {
    window.matchMedia = createMatchMediaMock((query) => query.includes("prefers-reduced-motion"));

    render(<ReactiveCursor />);
    expect(screen.queryByTestId("reactive-cursor")).toBeNull();
  });

  it("cleans up event listeners cleanly on unmount", () => {
    window.matchMedia = createMatchMediaMock((query) => query.includes("pointer: fine"));

    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<ReactiveCursor />);
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith("mouseover", expect.any(Function));
  });
});
