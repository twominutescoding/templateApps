/**
 * Production-safe logging utility.
 *
 * In development: Logs full error details to console
 * In production: Logs only error message, not stack traces or sensitive data
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Log an error message.
 * In production, only logs the message without exposing error details.
 */
export function logError(message: string, error?: unknown): void {
  if (isDevelopment) {
    console.error(message, error);
  } else {
    // In production, only log the message, not the full error object
    console.error(message);
  }
}

/**
 * Log a warning message.
 */
export function logWarn(message: string, data?: unknown): void {
  if (isDevelopment) {
    console.warn(message, data);
  } else {
    console.warn(message);
  }
}

/**
 * Log debug information (only in development).
 */
export function logDebug(message: string, data?: unknown): void {
  if (isDevelopment) {
    console.log(message, data);
  }
  // In production, debug logs are completely suppressed
}

export default {
  error: logError,
  warn: logWarn,
  debug: logDebug,
};
