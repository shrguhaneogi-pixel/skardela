import { ViewTransition } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as m from "framer-motion/m";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RandomPuzzleButton } from "../app/RandomPuzzleButton";
import { MotionProvider } from "./MotionProvider";
import {
  getViewTransitionNavigateOptions,
  prefersReducedMotion,
  subscribeReducedMotion,
} from "./motion-prefs";
import { shouldPreventLenis, useSmoothScroll } from "./useSmoothScroll";

// ASD-STE100 Simplified Technical English comments.
// This test suite verifies motion preferences, LazyMotion, Lenis smooth scroll, and view transitions.

const lenisCtorSpy = vi.fn<(options?: unknown) => void>();
const lenisRafSpy = vi.fn<(time: number) => void>();
const lenisDestroySpy = vi.fn<() => void>();

vi.mock("lenis", () => {
  class MockLenis {
    constructor(options?: unknown) {
      lenisCtorSpy(options);
    }

    raf(time: number) {
      lenisRafSpy(time);
    }

    destroy() {
      lenisDestroySpy();
    }
  }
  return { default: MockLenis };
});

type MediaChangeListener = (event: MediaQueryListEvent) => void;

function installMatchMediaMock(initialReduced: boolean) {
  let matches = initialReduced;
  const listeners = new Set<MediaChangeListener>();

  const mockMatchMedia = vi.fn<(query: string) => MediaQueryList>((query: string) => ({
    matches: query === "(prefers-reduced-motion: reduce)" ? matches : false,
    media: query,
    onchange: null,
    addListener: vi.fn<() => void>(),
    removeListener: vi.fn<() => void>(),
    addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
      if (typeof listener === "function") {
        listeners.add(listener as MediaChangeListener);
      }
    },
    removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
      if (typeof listener === "function") {
        listeners.delete(listener as MediaChangeListener);
      }
    },
    dispatchEvent: vi.fn<() => boolean>(() => true),
  }));

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: mockMatchMedia,
  });

  return {
    setReduced(nextReduced: boolean) {
      matches = nextReduced;
      const event = { matches: nextReduced } as MediaQueryListEvent;
      for (const listener of listeners) {
        listener(event);
      }
    },
  };
}

function SmoothScrollHarness() {
  useSmoothScroll();
  return <div data-testid="scroll-host">Scroll host</div>;
}

function setupResizeObserverMock() {
  Object.defineProperty(globalThis, "ResizeObserver", {
    writable: true,
    configurable: true,
    value: vi.fn<() => unknown>().mockImplementation(() => ({
      observe: vi.fn<() => void>(),
      unobserve: vi.fn<() => void>(),
      disconnect: vi.fn<() => void>(),
    })),
  });
}

describe("motion preferences and view-transition options", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports reduced motion preference and adjusts view transition navigate options", () => {
    const controller = installMatchMediaMock(false);
    expect(prefersReducedMotion()).toBe(false);
    expect(getViewTransitionNavigateOptions()).toEqual({ viewTransition: true });

    controller.setReduced(true);
    expect(prefersReducedMotion()).toBe(true);
    expect(getViewTransitionNavigateOptions()).toEqual({ viewTransition: false });
  });

  it("subscribes to reduced motion updates and cleans up listener", () => {
    const controller = installMatchMediaMock(false);
    const onChange = vi.fn<(reduced: boolean) => void>();
    const unsubscribe = subscribeReducedMotion(onChange);

    controller.setReduced(true);
    expect(onChange).toHaveBeenCalledWith(true);

    unsubscribe();
    controller.setReduced(false);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe("MotionProvider and React 19 ViewTransition", () => {
  it("renders m component tree within MotionProvider and ViewTransition", async () => {
    render(
      <MotionProvider>
        <ViewTransition>
          <m.div
            data-testid="motion-box"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            Motion box
          </m.div>
        </ViewTransition>
      </MotionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("motion-box")).toBeInTheDocument();
    });
  });

  it("navigates with viewTransition options from RandomPuzzleButton", async () => {
    installMatchMediaMock(true);
    const router = createMemoryRouter(
      [
        { path: "/", element: <RandomPuzzleButton label="Random puzzle" /> },
        { path: "/puzzles/:puzzleId", element: <div data-testid="dest-puzzle">Loaded</div> },
      ],
      { initialEntries: ["/"] },
    );

    render(<RouterProvider router={router} />);
    fireEvent.click(screen.getByRole("button", { name: "Random puzzle" }));

    await waitFor(() => {
      expect(screen.getByTestId("dest-puzzle")).toBeInTheDocument();
    });
  });
});

describe("useSmoothScroll Lenis initialization", () => {
  beforeEach(() => {
    lenisCtorSpy.mockClear();
    lenisRafSpy.mockClear();
    lenisDestroySpy.mockClear();
    setupResizeObserverMock();
  });

  it("skips loading Lenis when prefers-reduced-motion is true", async () => {
    installMatchMediaMock(true);
    render(<SmoothScrollHarness />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(lenisCtorSpy).not.toHaveBeenCalled();
  });

  it("prevents creating a Lenis instance if unmounted before dynamic import resolves", async () => {
    installMatchMediaMock(false);
    const { unmount } = render(<SmoothScrollHarness />);
    unmount();

    await act(async () => {
      await Promise.resolve();
    });

    expect(lenisCtorSpy).not.toHaveBeenCalled();
  });
});

describe("useSmoothScroll Lenis reactive lifecycle", () => {
  beforeEach(() => {
    lenisCtorSpy.mockClear();
    lenisRafSpy.mockClear();
    lenisDestroySpy.mockClear();
    setupResizeObserverMock();
  });

  it("lazily initializes Lenis when motion is allowed and toggles on media query update", async () => {
    const controller = installMatchMediaMock(false);
    const rafMock = vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 42);
    const cancelMock = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const { unmount } = render(<SmoothScrollHarness />);

    await waitFor(() => {
      expect(lenisCtorSpy).toHaveBeenCalledTimes(1);
    });
    expect(rafMock).toHaveBeenCalled();

    act(() => {
      controller.setReduced(true);
    });
    expect(lenisDestroySpy).toHaveBeenCalledTimes(1);
    expect(cancelMock).toHaveBeenCalledWith(42);

    act(() => {
      controller.setReduced(false);
    });
    await waitFor(() => {
      expect(lenisCtorSpy).toHaveBeenCalledTimes(2);
    });

    unmount();
    expect(lenisDestroySpy).toHaveBeenCalledTimes(2);
  });
});

describe("shouldPreventLenis element detection", () => {
  it("prevents smooth scroll on data-lenis-prevent and interactive containers", () => {
    const root = document.createElement("div");
    root.dataset.lenisPrevent = "";
    const child = document.createElement("span");
    root.append(child);
    expect(shouldPreventLenis(root)).toBe(true);
    expect(shouldPreventLenis(child)).toBe(true);

    const dialog = document.createElement("dialog");
    const inner = document.createElement("p");
    dialog.append(inner);
    expect(shouldPreventLenis(dialog)).toBe(true);
    expect(shouldPreventLenis(inner)).toBe(true);

    const textarea = document.createElement("textarea");
    expect(shouldPreventLenis(textarea)).toBe(true);

    const roleDialog = document.createElement("div");
    roleDialog.setAttribute("role", "dialog");
    expect(shouldPreventLenis(roleDialog)).toBe(true);
  });

  it("permits standard smooth scroll on unannotated elements and safely handles non-elements", () => {
    const div = document.createElement("div");
    expect(shouldPreventLenis(div)).toBe(false);

    const textNode = document.createTextNode("plain text");
    div.append(textNode);
    expect(shouldPreventLenis(textNode)).toBe(false);

    expect(shouldPreventLenis(null)).toBe(false);
    expect(shouldPreventLenis()).toBe(false);
    expect(shouldPreventLenis({})).toBe(false);
  });
});
