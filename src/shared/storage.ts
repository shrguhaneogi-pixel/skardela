// Resilient client-side storage adapter with schema versioning and safe fallbacks.
// This adapter handles browser quota limits, disabled cookies, and malformed JSON safely.

export type StorageEnvelope<T> = {
  version: number;
  timestamp: number;
  data: T;
};

export type StorageMigration<T> = {
  fromVersion: number;
  toVersion: number;
  migrate: (oldData: unknown) => T;
};

export type StorageOptions<T> = {
  key: string;
  version: number;
  defaultValue: T;
  validate?: (data: unknown) => data is T;
  migrations?: StorageMigration<T>[];
};

// Memory fallback when localStorage throws (for example, in private mode or quota exceeded).
const memoryStore = new Map<string, string>();

function isStorageAvailable(): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return false;
    }
    const testKey = "__skardela_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const storageAvailable = isStorageAvailable();

function readRaw(key: string): string | null {
  if (storageAvailable) {
    try {
      const val = window.localStorage.getItem(key);
      if (val !== null) return val;
      return memoryStore.get(key) ?? null;
    } catch {
      return memoryStore.get(key) ?? null;
    }
  }
  return memoryStore.get(key) ?? null;
}

function writeRaw(key: string, value: string): boolean {
  if (storageAvailable) {
    try {
      window.localStorage.setItem(key, value);
      memoryStore.delete(key);
      return true;
    } catch {
      // Quota exceeded or storage blocked. Keep in memory store.
      memoryStore.set(key, value);
      return false;
    }
  }
  memoryStore.set(key, value);
  return true;
}

function removeRaw(key: string): void {
  memoryStore.delete(key);
  if (storageAvailable) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore removal errors.
    }
  }
}

function applyMigrations<T>(
  version: number,
  data: unknown,
  targetVersion: number,
  migrations?: StorageMigration<T>[],
): { version: number; data: unknown } | null {
  let currentVersion = version;
  let currentData = data;

  if (currentVersion >= targetVersion || !migrations) {
    return { version: currentVersion, data: currentData };
  }

  for (const m of migrations) {
    if (m.fromVersion === currentVersion) {
      try {
        currentData = m.migrate(currentData);
        currentVersion = m.toVersion;
      } catch {
        return null;
      }
    }
  }

  return { version: currentVersion, data: currentData };
}

// Read and validate a stored value. Return defaultValue if data is missing or invalid.
export function getStoredItem<T>(options: StorageOptions<T>): T {
  const raw = readRaw(options.key);
  if (!raw) {
    return options.defaultValue;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StorageEnvelope<unknown>>;
    if (typeof parsed !== "object" || parsed === null) {
      return options.defaultValue;
    }

    const { version, data } = parsed;
    if (typeof version !== "number") {
      return options.defaultValue;
    }

    const migrated = applyMigrations(version, data, options.version, options.migrations);
    if (!migrated || migrated.version !== options.version) {
      return options.defaultValue;
    }

    if (options.validate && !options.validate(migrated.data)) {
      return options.defaultValue;
    }

    return migrated.data as T;
  } catch {
    return options.defaultValue;
  }
}

// Write a value wrapped in a versioned envelope.
export function setStoredItem<T>(options: StorageOptions<T>, value: T): boolean {
  const envelope: StorageEnvelope<T> = {
    version: options.version,
    timestamp: Date.now(),
    data: value,
  };

  try {
    const serialized = JSON.stringify(envelope);
    return writeRaw(options.key, serialized);
  } catch {
    return false;
  }
}

// Remove an item from storage and memory store.
export function removeStoredItem(key: string): void {
  removeRaw(key);
}

// Clear all Skardela keys matching a prefix.
export function clearStoredNamespace(prefix = "skardela:"): void {
  const keysToRemove: string[] = [];
  if (storageAvailable) {
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          keysToRemove.push(k);
        }
      }
      for (const k of keysToRemove) {
        window.localStorage.removeItem(k);
      }
    } catch {
      // Ignore errors during clearing.
    }
  }

  for (const k of memoryStore.keys()) {
    if (k.startsWith(prefix)) {
      memoryStore.delete(k);
    }
  }
}

// List all keys matching a prefix from storage and memory store.
export function listStoredKeys(prefix = "skardela:"): string[] {
  const keys = new Set<string>();
  if (storageAvailable) {
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          keys.add(k);
        }
      }
    } catch {
      // Ignore errors when listing.
    }
  }
  for (const k of memoryStore.keys()) {
    if (k.startsWith(prefix)) {
      keys.add(k);
    }
  }
  return Array.from(keys);
}
