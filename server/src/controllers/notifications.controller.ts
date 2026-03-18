import { Response } from 'express';
import { notificationsService } from '../services/notifications.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) { sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated'); return; }
    const pagination = parsePagination(req.query as Record<string, unknown>);
    const { notifications, total } = await notificationsService.listForUser(req.user.userId, pagination);
    sendSuccess(res, notifications, 200, paginationMeta(pagination.page, pagination.limit, total));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch notifications';
    sendError(res, 500, 'NOTIFICATIONS_FETCH_ERROR', message);
  }
}

export async function markAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) { sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated'); return; }
    const notification = await notificationsService.markAsRead(req.params.id, req.user.userId);
    sendSuccess(res, notification);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Notification not found';
    sendError(res, 404, 'NOTIFICATION_NOT_FOUND', message);
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) { sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated'); return; }
    const result = await notificationsService.markAllAsRead(req.user.userId);
    sendSuccess(res, result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to mark notifications as read';
    sendError(res, 500, 'NOTIFICATIONS_READ_ERROR', message);
  }
}
