// Automated bundle budget verification.
// Follows ASD-STE100 Simplified Technical English.

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const DIST_ASSETS = path.resolve(process.cwd(), "dist/assets");

function ensureDistAssets(): string[] {
  if (!fs.existsSync(DIST_ASSETS)) {
    execSync("npm run build", { stdio: "ignore" });
  }
  return fs.readdirSync(DIST_ASSETS);
}

function isIndexJs(fileName: string): boolean {
  if (!fileName.startsWith("index-")) {
    return false;
  }
  return fileName.endsWith(".js");
}

function isCssFile(fileName: string): boolean {
  return fileName.endsWith(".css");
}

function isPuzzleChunk(fileName: string): boolean {
  if (!fileName.endsWith(".js")) {
    return false;
  }
  if (fileName.startsWith("colour-binary")) {
    return true;
  }
  if (fileName.startsWith("guzzle")) {
    return true;
  }
  return fileName.startsWith("Board");
}

function getMainJsSize(files: string[]): number {
  const mainJs = files.find((f) => isIndexJs(f));
  if (!mainJs) {
    return 0;
  }
  return fs.statSync(path.join(DIST_ASSETS, mainJs)).size;
}

function getTotalCssBytes(files: string[]): number {
  const cssFiles = files.filter((f) => isCssFile(f));
  let total = 0;
  for (const file of cssFiles) {
    total += fs.statSync(path.join(DIST_ASSETS, file)).size;
  }
  return total;
}

function getPuzzleChunkSizes(files: string[]): number[] {
  const puzzleFiles = files.filter((f) => isPuzzleChunk(f));
  const sizes: number[] = [];
  for (const file of puzzleFiles) {
    sizes.push(fs.statSync(path.join(DIST_ASSETS, file)).size);
  }
  return sizes;
}

describe("bundle size budgets", () => {
  it("enforces main javascript bundle under 550 kB", () => {
    const files = ensureDistAssets();
    const size = getMainJsSize(files);
    expect(size).toBeGreaterThan(0);

    const maxMainBytes = 550 * 1024;
    expect(size).toBeLessThan(maxMainBytes);
  });

  it("enforces total css budget under 80 kB", () => {
    const files = ensureDistAssets();
    const totalCss = getTotalCssBytes(files);
    expect(totalCss).toBeGreaterThan(0);

    const maxCssBytes = 80 * 1024;
    expect(totalCss).toBeLessThan(maxCssBytes);
  });

  it("enforces lazy puzzle chunks under 40 kB each", () => {
    const files = ensureDistAssets();
    const chunkSizes = getPuzzleChunkSizes(files);
    expect(chunkSizes.length).toBeGreaterThan(0);

    const maxChunkBytes = 40 * 1024;
    for (const size of chunkSizes) {
      expect(size).toBeLessThan(maxChunkBytes);
    }
  });
});
