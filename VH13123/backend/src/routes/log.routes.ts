import { Router, Request, Response } from 'express';
import { Log, getRecentLogs } from '../services/log.service';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

Log('backend', 'info', 'route', 'Initializing Log collection routes');

/**
 * POST /api/logs
 * Accept client logs and write them to the central log repository
 */
router.post('/', (req: Request, res: Response) => {
  const { stack, level, packageName, message, logs } = req.body;

  try {
    if (logs && Array.isArray(logs)) {
      // Handle bulk transmission
      for (const log of logs) {
        Log(
          log.stack || 'frontend',
          log.level || 'info',
          log.packageName || 'utils',
          log.message || ''
        );
      }
    } else if (stack && level && packageName && message) {
      // Handle single entry transmission
      Log(stack, level, packageName, message);
    } else {
      Log(
        'backend',
        'warn',
        'route',
        `Bad request payload sent to log endpoint: ${JSON.stringify(req.body)}`
      );
      res.status(400).json({ success: false, error: 'Invalid logging format' });
      return;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    Log('backend', 'error', 'route', `Failed to register client logs: ${error}`);
    res.status(500).json({ success: false, error: 'Failed to ingest log stream' });
  }
});

/**
 * GET /api/logs
 * Retrieve recent system logs for console visualizer
 */
router.get('/', authenticateToken, (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 100;
  const recentLogs = getRecentLogs(limit);
  res.status(200).json({ success: true, data: recentLogs });
});

export default router;
