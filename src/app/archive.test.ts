import { describe, expect, it } from "vitest";
import {
  getArchiveDateRange,
  getRecentArchiveDates,
  isDateInFuture,
  loadArchiveDay,
} from "./archive";
import { formatDateString, type LocalDate } from "./daily";

// ASD-STE100 Simplified Technical English comments.
// Test suite for the historical puzzle archive module.

describe("archive date ranges and bounds", () => {
  const refDate: LocalDate = { year: 2026, month: 10, day: 15 };

  it("returns correct min and max date strings", () => {
    const range = getArchiveDateRange(refDate);
    expect(range.minDate).toBe("2024-01-01");
    expect(range.maxDate).toBe("2026-10-15");
  });

  it("detects future dates correctly", () => {
    const futureDate: LocalDate = { year: 2026, month: 10, day: 16 };
    const pastDate: LocalDate = { year: 2026, month: 10, day: 14 };
    expect(isDateInFuture(futureDate, refDate)).toBe(true);
    expect(isDateInFuture(pastDate, refDate)).toBe(false);
    expect(isDateInFuture(refDate, refDate)).toBe(false);
  });
});

describe("recent archive dates generator", () => {
  const refDate: LocalDate = { year: 2026, month: 10, day: 15 };

  it("generates descending dates from reference date", () => {
    const dates = getRecentArchiveDates(3, refDate);
    expect(dates).toHaveLength(3);
    expect(formatDateString(dates[0]!)).toBe("2026-10-15");
    expect(formatDateString(dates[1]!)).toBe("2026-10-14");
    expect(formatDateString(dates[2]!)).toBe("2026-10-13");
  });
});

describe("loadArchiveDay puzzle loader", () => {
  const refDate: LocalDate = { year: 2026, month: 10, day: 15 };

  it("loads puzzles for reference date and marks as today", async () => {
    const data = await loadArchiveDay("2026-10-15", refDate);
    expect(data.isToday).toBe(true);
    expect(data.dateString).toBe("2026-10-15");
    expect(data.types.length).toBeGreaterThan(0);
    const cb = data.types.find((t) => t.type === "colour-binary");
    expect(cb?.levels.length).toBe(3);
  });

  it("loads puzzles for historical date and marks as past", async () => {
    const data = await loadArchiveDay("2026-05-01", refDate);
    expect(data.isToday).toBe(false);
    expect(data.dateString).toBe("2026-05-01");
    expect(data.types.length).toBeGreaterThan(0);
  });

  it("falls back to reference date when date string is invalid", async () => {
    const data = await loadArchiveDay("invalid-date", refDate);
    expect(data.isToday).toBe(true);
    expect(data.dateString).toBe("2026-10-15");
  });

  it("clamps future date to reference date", async () => {
    const data = await loadArchiveDay("2028-12-31", refDate);
    expect(data.isToday).toBe(true);
    expect(data.dateString).toBe("2026-10-15");
  });
});
