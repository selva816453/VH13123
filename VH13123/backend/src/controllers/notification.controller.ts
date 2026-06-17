import { Request, Response } from 'express';
import { NotificationRepository } from '../repository/notification.repo';
import { getTopNotifications } from '../services/priority.service';
import { Log } from '../services/log.service';

export const NotificationController = {
  /**
   * GET /api/notifications
   */
  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const notification_type = req.query.notification_type as string | undefined;
      const search = req.query.search as string | undefined;

      Log(
        'backend',
        'info',
        'controller',
        `Fetching notifications: page=${page}, limit=${limit}, type=${notification_type || 'All'}, search=${search || ''}`
      );

      const { notifications, total } = await NotificationRepository.findAll({
        page,
        limit,
        type: notification_type,
        search
      });

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: {
          notifications,
          pagination: {
            total,
            page,
            limit,
            totalPages
          }
        }
      });
    } catch (error) {
      Log('backend', 'error', 'controller', `Error fetching notifications: ${error}`);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  /**
   * POST /api/notifications/:id/read
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      Log('backend', 'info', 'controller', `Marking notification ${id} as read`);

      const updated = await NotificationRepository.updateReadStatus(id, true);

      if (!updated) {
        Log('backend', 'warn', 'controller', `Failed to mark read: notification ${id} not found`);
        res.status(404).json({ success: false, error: 'Notification not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: updated
      });
    } catch (error) {
      Log('backend', 'error', 'controller', `Error marking notification as read: ${error}`);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  /**
   * POST /api/notifications/:id/unread
   */
  async markAsUnread(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      Log('backend', 'info', 'controller', `Marking notification ${id} as unread`);

      const updated = await NotificationRepository.updateReadStatus(id, false);

      if (!updated) {
        Log('backend', 'warn', 'controller', `Failed to mark unread: notification ${id} not found`);
        res.status(404).json({ success: false, error: 'Notification not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Notification marked as unread',
        data: updated
      });
    } catch (error) {
      Log('backend', 'error', 'controller', `Error marking notification as unread: ${error}`);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  /**
   * GET /api/notifications/priority
   */
  async getPriorityNotifications(req: Request, res: Response): Promise<void> {
    try {
      Log('backend', 'info', 'controller', 'Request to compute and fetch top 10 priority notifications');

      const allNotifications = NotificationRepository.getAllRaw();
      const topNotifications = getTopNotifications(allNotifications, 10);

      res.status(200).json({
        success: true,
        data: topNotifications
      });
    } catch (error) {
      Log('backend', 'error', 'controller', `Error computing priority notifications: ${error}`);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  /**
   * GET /api/notifications/stats
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      Log('backend', 'info', 'controller', 'Requesting notifications aggregate stats');
      const stats = await NotificationRepository.getStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      Log('backend', 'error', 'controller', `Error fetching stats: ${error}`);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
};
