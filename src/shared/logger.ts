// ASD-STE100 Simplified Technical English comments.
// Lightweight browser-native logger conforming to Skardela observability interface.
// Replaces heavy runtime packages to maintain zero external telemetry overhead and strict bundle budget.

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export interface Log {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

const LEVEL_SEVERITY: Record<LogLevel, number> = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
};

const isTest = import.meta.env.MODE === "test";
let currentMinLevel: LogLevel = isTest ? "WARN" : import.meta.env.DEV ? "DEBUG" : "WARN";

export function configure(options: {
  endpoint?: string | null;
  serviceName?: string;
  storage?: string;
  identity?: string;
  bus?: { mode: string };
  minLevel?: LogLevel;
  console?: { level?: LogLevel };
  capture?: { errors?: boolean; rejections?: boolean };
}): void {
  if (options.minLevel) {
    currentMinLevel = options.minLevel;
  }
}

export async function flush(): Promise<void> {
  await Promise.resolve();
}

function writeLog(level: LogLevel, namespace: string, message: string, args: unknown[]) {
  if (LEVEL_SEVERITY[level] < LEVEL_SEVERITY[currentMinLevel]) {
    return;
  }
  const prefix = "%c[%s]%c[%s] %s";
  const nsStyle = "color: #71717a; font-weight: bold;";
  const levelStyle =
    level === "ERROR"
      ? "color: #ef4444; font-weight: bold;"
      : level === "WARN"
        ? "color: #f59e0b; font-weight: bold;"
        : "color: #3b82f6; font-weight: bold;";

  if (level === "ERROR") {
    // oxlint-disable-next-line no-console -- Browser logger implementation
    console.error(prefix, nsStyle, namespace, levelStyle, level, message, ...args);
  } else if (level === "WARN") {
    // oxlint-disable-next-line no-console -- Browser logger implementation
    console.warn(prefix, nsStyle, namespace, levelStyle, level, message, ...args);
  } else if (level === "INFO") {
    // oxlint-disable-next-line no-console -- Browser logger implementation
    console.info(prefix, nsStyle, namespace, levelStyle, level, message, ...args);
  } else {
    // oxlint-disable-next-line no-console -- Browser logger implementation
    console.debug(prefix, nsStyle, namespace, levelStyle, level, message, ...args);
  }
}

const loggerRegistry = new Map<string, Log>();

export function getLogger(namespace: string): Log {
  const existing = loggerRegistry.get(namespace);
  if (existing) return existing;

  const logger: Log = {
    debug(message: string, ...args: unknown[]) {
      writeLog("DEBUG", namespace, message, args);
    },
    info(message: string, ...args: unknown[]) {
      writeLog("INFO", namespace, message, args);
    },
    warn(message: string, ...args: unknown[]) {
      writeLog("WARN", namespace, message, args);
    },
    error(message: string, ...args: unknown[]) {
      writeLog("ERROR", namespace, message, args);
    },
  };

  loggerRegistry.set(namespace, logger);
  return logger;
}
