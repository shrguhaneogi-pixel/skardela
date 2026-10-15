// ASD-STE100 Simplified Technical English comments.
// This module registers the service worker and detects offline PWA status.

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    return registration;
  } catch {
    // Service worker registration can fail in private windows or non-secure origins.
    return null;
  }
}

export function isStandalonePwa(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(display-mode: standalone)").matches;
}
