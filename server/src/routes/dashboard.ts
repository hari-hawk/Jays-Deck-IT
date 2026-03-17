import { Router, type Router as RouterType } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as dashboardController from '../controllers/dashboard.controller.js';

export const dashboardRouter: RouterType = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get('/stats', dashboardController.getStats);
dashboardRouter.get('/tickets/trends', dashboardController.getTicketTrends);
dashboardRouter.get('/assets/overview', dashboardController.getAssetOverview);
dashboardRouter.get('/recent-activity', dashboardController.getRecentActivity);
dashboardRouter.get('/tickets/by-status', dashboardController.getTicketsByStatus);
