import { afterEach, describe, expect, it } from "vitest";
import { loadAnalytics, setAnalyticsConsent, umami } from "./analytics";

function analyticsScripts() {
  return document.head.querySelectorAll(`script[src="${umami.src}"]`);
}

afterEach(() => {
  for (const script of analyticsScripts()) script.remove();
  try {
    localStorage.clear();
  } catch {
    // Ignore in non-storage environments.
  }
});

describe("loadAnalytics", () => {
  it("adds the Umami script with the website ID and integrity one time", () => {
    loadAnalytics();
    loadAnalytics();
    const scripts = analyticsScripts();
    expect(scripts).toHaveLength(1);
    expect(scripts[0]).toHaveAttribute("data-website-id", umami.websiteId);
    expect(scripts[0]).toHaveProperty("defer", true);
    expect(scripts[0]).toHaveAttribute("integrity", umami.integrity);
    expect(scripts[0]).toHaveAttribute("crossorigin", "anonymous");
  });

  it("respects explicit consent requirement", () => {
    setAnalyticsConsent(false);
    loadAnalytics(document, true);
    expect(analyticsScripts()).toHaveLength(0);

    setAnalyticsConsent(true);
    loadAnalytics(document, true);
    expect(analyticsScripts()).toHaveLength(1);
  });
});
