import { Request, Response, NextFunction } from 'express';
import { Log } from '../services/log.service';
import { config } from '../config';

/**
 * Middleware checks Authorization: Bearer <token> against backend configuration
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    Log(
      'backend',
      'warn',
      'auth',
      `Unauthorized request: Missing token on ${req.method} ${req.originalUrl}`
    );
    res.status(401).json({
      success: false,
      error: 'Access denied: Authorization token required'
    });
    return;
  }

  if (token !== config.accessToken) {
    Log(
      'backend',
      'warn',
      'auth',
      `Forbidden request: Invalid token on ${req.method} ${req.originalUrl}`
    );
    res.status(403).json({
      success: false,
      error: 'Access denied: Invalid authorization token'
    });
    return;
  }

  next();
}
