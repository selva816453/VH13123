import { LogLevel, LogPackage, LogEntry } from '../types';
import { LogService } from '../services/api';

// Queue to hold logs for batch transmission to avoid network congestion
const logBuffer: LogEntry[] = [];
let flushTimer: any = null;

/**
 * Reusable Log function as specified in requirements.
 * Parameter is named 'packageName' because 'package' is a reserved keyword in strict TypeScript.
 */
export function Log(
  stack: 'backend' | 'frontend',
  level: LogLevel,
  packageName: LogPackage,
  message: string
): void {
  const timestamp = new Date().toISOString();
  const logEntry: LogEntry = {
    timestamp,
    stack,
    level,
    packageName,
    message
  };

  // 1. Format and write to browser dev console with premium theme styles
  const styles = {
    debug: 'color: #0284c7; font-weight: 500;',
    info: 'color: #059669; font-weight: 500;',
    warn: 'color: #d97706; font-weight: 600;',
    error: 'color: #dc2626; font-weight: bold;',
    fatal: 'color: #ffffff; background-color: #dc2626; padding: 2px 4px; font-weight: bold; border-radius: 4px;'
  };

  const timeStr = timestamp.substring(11, 19);
  const logMessage = `[${timeStr}] [${stack.toUpperCase()}] [${level.toUpperCase()}] [${packageName}] - ${message}`;

  if (level === 'error' || level === 'fatal') {
    console.error(`%c${logMessage}`, styles[level]);
  } else if (level === 'warn') {
    console.warn(`%c${logMessage}`, styles[level]);
  } else {
    console.log(`%c${logMessage}`, styles[level]);
  }

  // 2. Add log entry to queue buffer
  logBuffer.push(logEntry);

  // 3. Trigger debounced sync to server
  triggerDebouncedSync();
}

/**
 * Debounce log transmissions by 800ms to package multiple UI events into single request
 */
function triggerDebouncedSync() {
  if (flushTimer) {
    clearTimeout(flushTimer);
  }

  flushTimer = setTimeout(async () => {
    if (logBuffer.length === 0) return;

    const logsToTransmit = [...logBuffer];
    logBuffer.length = 0; // Reset queue
    flushTimer = null;

    try {
      await LogService.transmitLogs(logsToTransmit);
      
      // Dispatch a custom event to notify layout console drawer that logs have been sent
      // This allows the console drawer to reload live logging values automatically!
      window.dispatchEvent(new CustomEvent('logs-flushed'));
    } catch (error) {
      console.warn('[Logger Client] Unable to synchronize log buffer with central server');
    }
  }, 800);
}
