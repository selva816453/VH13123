import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { Log } from '../services/log.service';

const router = Router();

// Hook route registration logs
Log('backend', 'info', 'route', 'Registering notification routes');

// All notification actions require access token authorization
router.use(authenticateToken);

router.get('/', NotificationController.getNotifications);
router.get('/priority', NotificationController.getPriorityNotifications);
router.get('/stats', NotificationController.getStats);
router.post('/:id/read', NotificationController.markAsRead);
router.post('/:id/unread', NotificationController.markAsUnread);

export default router;
