// ASD-STE100 Simplified Technical English comments.
// This module checks user motion preferences for animations, smooth scrolling, and view transitions.

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Return true when the user prefers reduced motion.
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

// Subscribe to system reduced-motion media query updates and return a cleanup function.
export function subscribeReducedMotion(onChange: (reduced: boolean) => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  const handleChange = (event: MediaQueryListEvent) => {
    onChange(event.matches);
  };
  mediaQuery.addEventListener("change", handleChange);
  return () => {
    mediaQuery.removeEventListener("change", handleChange);
  };
}

// Return router navigate options with viewTransition enabled when motion is allowed.
export function getViewTransitionNavigateOptions(): { viewTransition: boolean } {
  return { viewTransition: !prefersReducedMotion() };
}
