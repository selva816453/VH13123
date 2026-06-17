import { Request, Response, NextFunction } from 'express';
import { Log } from '../services/log.service';

/**
 * Middleware to intercept and log all incoming API requests and outgoing responses
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;

  // Log incoming request details
  Log(
    'backend',
    'info',
    'middleware',
    `Incoming: ${method} ${originalUrl} from IP ${ip}`
  );

  // Once response completes, calculate duration and log
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;

    let level: 'info' | 'warn' | 'error' = 'info';
    if (statusCode >= 500) {
      level = 'error';
    } else if (statusCode >= 400) {
      level = 'warn';
    }

    Log(
      'backend',
      level,
      'middleware',
      `Outgoing: ${method} ${originalUrl} Status=${statusCode} Duration=${duration}ms`
    );
  });

  next();
}
