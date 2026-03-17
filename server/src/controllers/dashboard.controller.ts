import { Response } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export async function getStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const stats = await dashboardService.getStats();
    sendSuccess(res, stats);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch stats';
    sendError(res, 500, 'STATS_ERROR', message);
  }
}

export async function getTicketTrends(req: AuthRequest, res: Response): Promise<void> {
  try {
    const trends = await dashboardService.getTicketTrends();
    sendSuccess(res, trends);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch trends';
    sendError(res, 500, 'TRENDS_ERROR', message);
  }
}

export async function getAssetOverview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const overview = await dashboardService.getAssetOverview();
    sendSuccess(res, overview);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch overview';
    sendError(res, 500, 'OVERVIEW_ERROR', message);
  }
}

export async function getRecentActivity(req: AuthRequest, res: Response): Promise<void> {
  try {
    const activity = await dashboardService.getRecentActivity();
    sendSuccess(res, activity);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch activity';
    sendError(res, 500, 'ACTIVITY_ERROR', message);
  }
}

export async function getTicketsByStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = await dashboardService.getTicketsByStatus();
    sendSuccess(res, data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch ticket status';
    sendError(res, 500, 'STATUS_ERROR', message);
  }
}
