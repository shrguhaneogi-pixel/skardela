import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateColourBinaryPostcard, generateGuzzlePostcard, sharePostcard } from "./postcard";

describe("postcard generator engine", () => {
  it("creates a spoiler-free postcard for Colour Binary", () => {
    const postcard = generateColourBinaryPostcard({
      puzzleId: "cb-001",
      difficulty: "easy",
      timeSpentSeconds: 45,
      hintCount: 0,
      squares: ["R", "B", "B", "R"],
      size: 2,
    });

    expect(postcard).toContain("Skardela — Colour Binary #cb-001 (easy)");
    expect(postcard).toContain("45s | ✨ Perfect solve!");
    expect(postcard).toContain("🟥🟦\n🟦🟥");
    expect(postcard).toContain("https://skardela.app");
  });

  it("creates a postcard for Guzzle showing mistakes and letter marks", () => {
    const postcard = generateGuzzlePostcard({
      puzzleId: "gz-002",
      mode: "With bank",
      timeSpentSeconds: 90,
      hintCount: 1,
      mistakes: 2,
      guesses: [
        { letter: "A", mark: "correct" },
        { letter: "B", mark: "present" },
        { letter: "C", mark: "absent" },
        undefined,
      ],
      size: 2,
    });

    expect(postcard).toContain("Skardela — Guzzle #gz-002 (With bank)");
    expect(postcard).toContain("1m 30s | 💡 1 hints | ❌ 2 mistakes");
    expect(postcard).toContain("🟩🟨\n⬛⬜");
  });
});

describe("postcard navigator share", () => {
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it("uses navigator.share when available", async () => {
    const shareMock = vi.fn<() => Promise<void>>().mockResolvedValue();
    Object.defineProperty(globalThis, "navigator", {
      value: { share: shareMock },
      configurable: true,
      writable: true,
    });

    const result = await sharePostcard({ title: "My Solve", text: "Postcard text" });
    expect(result).toBe("shared");
    expect(shareMock).toHaveBeenCalledWith({ title: "My Solve", text: "Postcard text" });
  });
});

describe("postcard clipboard fallback", () => {
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it("falls back to clipboard.writeText when share fails", async () => {
    const writeTextMock = vi.fn<() => Promise<void>>().mockResolvedValue();
    Object.defineProperty(globalThis, "navigator", {
      value: {
        share: vi.fn<() => Promise<void>>().mockRejectedValue(new Error("Share aborted")),
        clipboard: { writeText: writeTextMock },
      },
      configurable: true,
      writable: true,
    });

    const result = await sharePostcard({ title: "My Solve", text: "Postcard text" });
    expect(result).toBe("copied");
    expect(writeTextMock).toHaveBeenCalledWith("Postcard text");
  });

  it("returns failed when neither API is available", async () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {},
      configurable: true,
      writable: true,
    });

    const result = await sharePostcard({ title: "My Solve", text: "Postcard text" });
    expect(result).toBe("failed");
  });
});
