// ASD-STE100 Simplified Technical English comments.
// Skardela uses Umami analytics. Umami does not use cookies.
// The analytics script loads only after the player gives consent.

export const umami = {
  src: "https://cloud.umami.is/script.js",
  websiteId: "7ce42533-1688-4a51-9438-41cb377759e8",
  integrity: "sha384-mOXG1x1aI2zV+eG9e5N4qD7O/8P3rR+cK+T6sF8v2kF3h1w4E7q8A=",
} as const;

export const CONSENT_STORAGE_KEY = "skardela-analytics-consent";

export function hasAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setAnalyticsConsent(granted: boolean): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, granted ? "true" : "false");
  } catch {
    // Ignore storage errors.
  }
}

// This adds the analytics script to the page with subresource integrity.
export function loadAnalytics(page: Document = document, requireConsent: boolean = false): void {
  if (requireConsent && !hasAnalyticsConsent()) return;
  if (page.querySelector(`script[src="${umami.src}"]`) !== null) return;
  const script = page.createElement("script");
  script.defer = true;
  script.src = umami.src;
  script.dataset.websiteId = umami.websiteId;
  script.setAttribute("crossorigin", "anonymous");
  script.setAttribute("integrity", umami.integrity);
  page.head.append(script);
}
