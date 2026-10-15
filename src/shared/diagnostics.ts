// Privacy-preserving local diagnostic ring buffer and export tool.
// This utility stores recent events in memory only. It never sends data to any server.

export type DiagnosticEvent = {
  timestamp: string;
  category: string;
  message: string;
  details?: Record<string, unknown>;
};

export type DiagnosticReport = {
  appName: string;
  appVersion: string;
  userAgent: string;
  screen: { width: number; height: number };
  theme: string;
  recentEvents: readonly DiagnosticEvent[];
};

const MAX_EVENTS = 50;
const ringBuffer: DiagnosticEvent[] = [];

// Redact any fields that could hold answers, secrets, or private tokens.
const FORBIDDEN_KEYS = new Set([
  "answer",
  "solution",
  "key",
  "password",
  "secret",
  "token",
  "cookie",
  "auth",
  "credential",
]);

export function sanitizeDetails(
  details?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!details) return undefined;
  const cleaned: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(details)) {
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) {
      cleaned[key] = "[REDACTED]";
    } else if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      cleaned[key] = sanitizeDetails(val as Record<string, unknown>);
    } else {
      cleaned[key] = val;
    }
  }

  return cleaned;
}

// Record a new local diagnostic event. Old events drop off when capacity is reached.
export function recordDiagnostic(
  category: string,
  message: string,
  details?: Record<string, unknown>,
): void {
  try {
    const event: DiagnosticEvent = {
      timestamp: new Date().toISOString(),
      category,
      message,
      details: sanitizeDetails(details),
    };

    if (ringBuffer.length >= MAX_EVENTS) {
      ringBuffer.shift();
    }
    ringBuffer.push(event);
  } catch {
    // Diagnostics must never crash the application.
  }
}

// Clear all recorded in-memory events.
export function clearDiagnostics(): void {
  ringBuffer.length = 0;
}

// Get the current snapshot of diagnostic events.
export function getDiagnosticEvents(): readonly DiagnosticEvent[] {
  return [...ringBuffer];
}

// Build a clean report ready for user-initiated inspection or copy.
export function createDiagnosticReport(): DiagnosticReport {
  let theme = "system";
  try {
    theme = document.documentElement.dataset.theme ?? "system";
  } catch {
    // Use fallback theme if document is not available.
  }

  let userAgent = "unknown";
  let screenWidth = 0;
  let screenHeight = 0;

  try {
    if (typeof navigator !== "undefined") {
      userAgent = navigator.userAgent;
    }
    if (typeof window !== "undefined") {
      screenWidth = window.innerWidth;
      screenHeight = window.innerHeight;
    }
  } catch {
    // Keep defaults.
  }

  return {
    appName: "Skardela",
    appVersion: "0.0.0",
    userAgent,
    screen: { width: screenWidth, height: screenHeight },
    theme,
    recentEvents: getDiagnosticEvents(),
  };
}

// Copy diagnostic report to clipboard if supported by browser.
export async function copyDiagnosticsToClipboard(): Promise<boolean> {
  try {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return false;
    }
    const report = createDiagnosticReport();
    await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    return true;
  } catch {
    return false;
  }
}
