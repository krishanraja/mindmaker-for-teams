/**
 * Structured Logger
 * 
 * Provides consistent logging format across the application with:
 * - Log levels (debug, info, warn, error, critical)
 * - Session/trace ID tracking
 * - Structured context objects
 * - Timestamp formatting
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  sessionId?: string;
  traceId?: string;
}

// Generate a unique session ID for this browser session
const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Store for trace IDs per operation
let currentTraceId: string | null = null;

/**
 * Generate a new trace ID for an operation chain
 */
export function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Set the current trace ID for subsequent log calls
 */
export function setTraceId(traceId: string): void {
  currentTraceId = traceId;
}

/**
 * Clear the current trace ID
 */
export function clearTraceId(): void {
  currentTraceId = null;
}

/**
 * Get the current session ID
 */
export function getSessionId(): string {
  return SESSION_ID;
}

/**
 * Format a log entry as a structured object
 */
function formatLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): LogEntry {
  return {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    sessionId: SESSION_ID,
    traceId: currentTraceId || undefined,
  };
}

/**
 * Output log to console with appropriate method
 */
function outputLog(entry: LogEntry): void {
  const prefix = `[${entry.level.toUpperCase()}]`;
  const traceInfo = entry.traceId ? ` [${entry.traceId}]` : '';
  const formattedMessage = `${prefix}${traceInfo} ${entry.message}`;

  switch (entry.level) {
    case 'debug':
      console.debug(formattedMessage, entry.context || '');
      break;
    case 'info':
      console.info(formattedMessage, entry.context || '');
      break;
    case 'warn':
      console.warn(formattedMessage, entry.context || '');
      break;
    case 'error':
    case 'critical':
      console.error(formattedMessage, entry.context || '');
      break;
  }
}

/**
 * Main logger object with methods for each log level
 */
export const logger = {
  debug(message: string, context?: Record<string, unknown>): void {
    const entry = formatLogEntry('debug', message, context);
    outputLog(entry);
  },

  info(message: string, context?: Record<string, unknown>): void {
    const entry = formatLogEntry('info', message, context);
    outputLog(entry);
  },

  warn(message: string, context?: Record<string, unknown>): void {
    const entry = formatLogEntry('warn', message, context);
    outputLog(entry);
  },

  error(message: string, context?: Record<string, unknown>): void {
    const entry = formatLogEntry('error', message, context);
    outputLog(entry);
  },

  critical(message: string, context?: Record<string, unknown>): void {
    const entry = formatLogEntry('critical', message, context);
    outputLog(entry);
  },

  /**
   * Start a traced operation - generates trace ID and logs start
   */
  startOperation(operationName: string, context?: Record<string, unknown>): string {
    const traceId = generateTraceId();
    setTraceId(traceId);
    this.info(`Starting: ${operationName}`, { ...context, operation: operationName });
    return traceId;
  },

  /**
   * End a traced operation - logs completion and clears trace ID
   */
  endOperation(operationName: string, success: boolean, context?: Record<string, unknown>): void {
    const level = success ? 'info' : 'error';
    const status = success ? 'Completed' : 'Failed';
    this[level](`${status}: ${operationName}`, { ...context, operation: operationName, success });
    clearTraceId();
  },

  /**
   * Log an API call with request/response details
   */
  apiCall(
    method: string,
    endpoint: string,
    status: 'request' | 'success' | 'error',
    context?: Record<string, unknown>
  ): void {
    const level = status === 'error' ? 'error' : 'info';
    this[level](`API ${status}: ${method} ${endpoint}`, context);
  },
};

/**
 * Create a scoped logger with a prefix
 */
export function createScopedLogger(scope: string) {
  return {
    debug: (message: string, context?: Record<string, unknown>) =>
      logger.debug(`[${scope}] ${message}`, context),
    info: (message: string, context?: Record<string, unknown>) =>
      logger.info(`[${scope}] ${message}`, context),
    warn: (message: string, context?: Record<string, unknown>) =>
      logger.warn(`[${scope}] ${message}`, context),
    error: (message: string, context?: Record<string, unknown>) =>
      logger.error(`[${scope}] ${message}`, context),
    critical: (message: string, context?: Record<string, unknown>) =>
      logger.critical(`[${scope}] ${message}`, context),
  };
}
