import { describe, expect, it } from "vitest";
import {
  computeChallengeChecksum,
  createDailyChallengeId,
  dayNumber,
  formatDateString,
  parseDateString,
  puzzlesForDay,
  utcDate,
  verifyChallengeIdentity,
} from "./daily";

describe("daily date calculations and parsing", () => {
  it("formats and parses date strings symmetrically", () => {
    const date = { year: 2026, month: 10, day: 15 };
    const formatted = formatDateString(date);
    expect(formatted).toBe("2026-10-15");
    expect(parseDateString(formatted)).toEqual(date);
  });

  it("returns null for malformed date strings", () => {
    expect(parseDateString("invalid")).toBeNull();
    expect(parseDateString("2026-13-01")).toBeNull();
    expect(parseDateString("2026-00-10")).toBeNull();
    expect(parseDateString("2026-05-35")).toBeNull();
  });

  it("computes day numbers deterministically", () => {
    expect(dayNumber({ year: 2024, month: 1, day: 1 })).toBe(0);
    expect(dayNumber({ year: 2024, month: 1, day: 2 })).toBe(1);
    // 2024 is a leap year.
    expect(dayNumber({ year: 2025, month: 1, day: 1 })).toBe(366);
  });

  it("derives UTC date reliably", () => {
    const fixedUtc = new Date(Date.UTC(2026, 9, 15, 23, 59, 59));
    expect(utcDate(fixedUtc)).toEqual({ year: 2026, month: 10, day: 15 });
  });
});

describe("challenge identity and checksum verification", () => {
  it("rotates puzzle pools without crashes even with negative days", () => {
    const pool = [
      { id: "cb-0001", difficulty: "easy" as const },
      { id: "cb-0002", difficulty: "easy" as const },
    ];
    const day0 = puzzlesForDay(pool, 0);
    const day1 = puzzlesForDay(pool, 1);
    const dayNegative = puzzlesForDay(pool, -1);

    expect(day0[0]?.id).toBe("cb-0001");
    expect(day1[0]?.id).toBe("cb-0002");
    expect(dayNegative[0]?.id).toBe("cb-0002");
  });

  it("generates deterministic canonical challenge ID and verifies checksum", () => {
    const date = { year: 2026, month: 10, day: 15 };
    const { canonicalId, verificationCode } = createDailyChallengeId(
      date,
      "colour-binary",
      "easy",
      "colour-binary-0001",
    );

    expect(canonicalId).toBe("SKD:2026-10-15:colour-binary:easy:colour-binary-0001");
    expect(verificationCode).toBe(computeChallengeChecksum(canonicalId));
    expect(verifyChallengeIdentity(canonicalId, verificationCode)).toBe(true);
    expect(verifyChallengeIdentity(canonicalId, "wrongcode")).toBe(false);
  });

  it("never includes answers or secrets in the canonical challenge ID", () => {
    const date = { year: 2026, month: 10, day: 15 };
    const { canonicalId } = createDailyChallengeId(
      date,
      "colour-binary",
      "hard",
      "colour-binary-0005",
    );
    expect(canonicalId).not.toContain("answer");
    expect(canonicalId).not.toContain("solution");
  });
});
