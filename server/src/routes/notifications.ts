import { Router, type Router as RouterType } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as notificationsController from '../controllers/notifications.controller.js';

export const notificationsRouter: RouterType = Router();

notificationsRouter.use(authenticate);

// GET /api/notifications — List for current user
notificationsRouter.get('/', notificationsController.list);

// PUT /api/notifications/read-all — Mark all as read (must be before :id route)
notificationsRouter.put('/read-all', notificationsController.markAllAsRead);

// PUT /api/notifications/:id/read — Mark as read
notificationsRouter.put('/:id/read', notificationsController.markAsRead);
