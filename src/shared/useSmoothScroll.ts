// ASD-STE100 Simplified Technical English comments.
// This hook lazily initializes Lenis smooth scrolling only when reduced motion is off.

import { useEffect } from "react";
import { prefersReducedMotion, subscribeReducedMotion } from "./motion-prefs";

type LenisInstance = {
  raf: (time: number) => void;
  destroy: () => void;
};

type ScrollState = {
  instance: LenisInstance | null;
  rafId: number | null;
  isLoading: boolean;
  isDisposed: boolean;
};

function canUseSmoothScroll(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof requestAnimationFrame !== "function") return false;
  if (typeof ResizeObserver !== "function") return false;
  return !prefersReducedMotion();
}

export function shouldPreventLenis(node?: unknown): boolean {
  if (!node || typeof node !== "object") return false;
  const target =
    node instanceof Element ? node : (node as { parentElement?: unknown }).parentElement;
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest("[data-lenis-prevent], dialog, [role='dialog'], [role='listbox'], textarea"),
  );
}

function stopLenis(state: ScrollState) {
  if (state.rafId !== null) {
    cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }
  if (state.instance) {
    state.instance.destroy();
    state.instance = null;
  }
}

async function startLenis(state: ScrollState) {
  if (!canUseSmoothScroll() || state.instance || state.isLoading || state.isDisposed) return;
  state.isLoading = true;
  try {
    const { default: Lenis } = await import("lenis");
    if (state.isDisposed || !canUseSmoothScroll() || state.instance) return;

    const instance = new Lenis({
      smoothWheel: true,
      lerp: 0.1,
      stopInertiaOnNavigate: true,
      prevent: shouldPreventLenis,
    });
    state.instance = instance;

    const onFrame = (time: number) => {
      if (state.isDisposed || state.instance !== instance) return;
      instance.raf(time);
      state.rafId = requestAnimationFrame(onFrame);
    };

    state.rafId = requestAnimationFrame(onFrame);
  } catch {
    // Keep native browser scrolling when Lenis cannot initialize.
  } finally {
    state.isLoading = false;
  }
}

export function useSmoothScroll(): void {
  useEffect(() => {
    const state: ScrollState = {
      instance: null,
      rafId: null,
      isLoading: false,
      isDisposed: false,
    };

    void startLenis(state);

    const unsubscribe = subscribeReducedMotion((reduced) => {
      if (reduced) {
        stopLenis(state);
      } else {
        void startLenis(state);
      }
    });

    return () => {
      state.isDisposed = true;
      unsubscribe();
      stopLenis(state);
    };
  }, []);
}
