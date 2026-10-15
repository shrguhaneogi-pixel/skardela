import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// ASD-STE100 Simplified Technical English comments.
// This suite verifies that manifest.webmanifest and sw.js exist and satisfy PWA requirements.

describe("PWA manifest and service worker validation", () => {
  const manifestPath = path.resolve(process.cwd(), "public/manifest.webmanifest");
  const swPath = path.resolve(process.cwd(), "public/sw.js");

  it("ensures manifest.webmanifest is valid JSON with required PWA fields", () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const content = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(content);

    expect(manifest.name).toBe("Skardela — Daily Logic Puzzles");
    expect(manifest.short_name).toBe("Skardela");
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons).toBeInstanceOf(Array);
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  it("ensures public/sw.js exists and contains cache lifecycle handlers", () => {
    expect(fs.existsSync(swPath)).toBe(true);
    const swContent = fs.readFileSync(swPath, "utf-8");

    expect(swContent).toContain('addEventListener("install"');
    expect(swContent).toContain('addEventListener("activate"');
    expect(swContent).toContain('addEventListener("fetch"');
    expect(swContent).toContain("caches.open");
  });
});
