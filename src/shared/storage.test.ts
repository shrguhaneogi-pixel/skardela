import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearStoredNamespace,
  getStoredItem,
  removeStoredItem,
  setStoredItem,
  type StorageOptions,
} from "./storage";

const testOptions: StorageOptions<{ count: number }> = {
  key: "skardela:test:counter",
  version: 1,
  defaultValue: { count: 0 },
  validate: (data: unknown): data is { count: number } =>
    typeof data === "object" &&
    data !== null &&
    typeof (data as { count: unknown }).count === "number",
};

describe("storage basic reading and writing", () => {
  beforeEach(() => {
    localStorage.clear();
    clearStoredNamespace();
  });

  it("returns default value when no item is stored", () => {
    expect(getStoredItem(testOptions)).toEqual({ count: 0 });
  });

  it("stores and retrieves a versioned envelope correctly", () => {
    expect(setStoredItem(testOptions, { count: 42 })).toBe(true);
    expect(getStoredItem(testOptions)).toEqual({ count: 42 });
  });

  it("handles malformed JSON safely without throwing", () => {
    localStorage.setItem("skardela:test:counter", "{invalid json");
    expect(getStoredItem(testOptions)).toEqual({ count: 0 });
  });

  it("rejects items failing runtime validation", () => {
    const bad = JSON.stringify({ version: 1, timestamp: Date.now(), data: { count: "wrong" } });
    localStorage.setItem("skardela:test:counter", bad);
    expect(getStoredItem(testOptions)).toEqual({ count: 0 });
  });
});

describe("storage lifecycle, migrations and fallback", () => {
  beforeEach(() => {
    localStorage.clear();
    clearStoredNamespace();
  });

  it("migrates older version data smoothly", () => {
    const migratingOptions: StorageOptions<{ count: number; note: string }> = {
      key: "skardela:test:migrating",
      version: 2,
      defaultValue: { count: 0, note: "default" },
      migrations: [
        {
          fromVersion: 1,
          toVersion: 2,
          migrate: (old) => ({ count: (old as { count: number }).count, note: "migrated" }),
        },
      ],
    };
    const v1 = JSON.stringify({ version: 1, timestamp: Date.now(), data: { count: 15 } });
    localStorage.setItem("skardela:test:migrating", v1);
    expect(getStoredItem(migratingOptions)).toEqual({ count: 15, note: "migrated" });
  });

  it("removes items and clears namespaces safely", () => {
    setStoredItem(testOptions, { count: 99 });
    removeStoredItem(testOptions.key);
    expect(getStoredItem(testOptions)).toEqual({ count: 0 });

    setStoredItem({ ...testOptions, key: "skardela:p1" }, { count: 1 });
    clearStoredNamespace("skardela:");
    expect(getStoredItem({ ...testOptions, key: "skardela:p1" })).toEqual({ count: 0 });
  });

  it("handles quota exceeded by falling back safely", () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    expect(setStoredItem(testOptions, { count: 50 })).toBe(false);
    expect(getStoredItem(testOptions)).toEqual({ count: 50 });
    setItemSpy.mockRestore();
  });
});
