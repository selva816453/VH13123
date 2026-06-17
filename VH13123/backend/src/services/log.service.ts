import fs from 'fs';
import path from 'path';
import { LogStack, LogLevel, LogPackage, LogEntry } from '../types';
import { config } from '../config';

// Ensure the logs directory exists
const logDir = path.dirname(config.logFilePath);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Reusable Log function as specified in requirements.
 * Parameter is named 'packageName' because 'package' is a reserved keyword in strict TypeScript.
 */
export function Log(
  stack: LogStack,
  level: LogLevel,
  packageName: LogPackage,
  message: string
): void {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    stack,
    level,
    packageName,
    message,
  };

  const logString = JSON.stringify(logEntry);

  // 1. Write structured JSON log to log file (Centralized persistence)
  try {
    fs.appendFileSync(config.logFilePath, logString + '\n', 'utf-8');
  } catch (error) {
    process.stderr.write(`[Log Error] Failed to write log to file: ${error}\n`);
  }

  // 2. Format and output log to stdout without using standard console.log
  const colors = {
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m',  // Green
    warn: '\x1b[33m',  // Yellow
    error: '\x1b[31m', // Red
    fatal: '\x1b[35m', // Magenta
    reset: '\x1b[0m'
  };

  const color = colors[level] || colors.reset;
  const time = logEntry.timestamp.substring(11, 19); // HH:MM:SS
  const formattedStack = stack.toUpperCase().padEnd(8);
  const formattedLevel = level.toUpperCase().padEnd(5);
  const formattedPkg = packageName.padEnd(12);

  process.stdout.write(
    `[${time}] [${formattedStack}] ${color}${formattedLevel}${colors.reset} [${formattedPkg}] - ${message}\n`
  );
}

/**
 * Utility to fetch lines from the log file (for visual log views in frontend)
 */
export function getRecentLogs(limit: number = 100): LogEntry[] {
  try {
    if (!fs.existsSync(config.logFilePath)) return [];
    const content = fs.readFileSync(config.logFilePath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    const recent = lines.slice(-limit);
    return recent.map((line) => JSON.parse(line));
  } catch (error) {
    return [];
  }
}
