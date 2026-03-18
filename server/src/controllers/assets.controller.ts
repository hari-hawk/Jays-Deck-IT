import { Response } from 'express';
import { assetsService } from '../services/assets.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    const pagination = parsePagination(req.query as Record<string, unknown>);
    const filters = {
      category: req.query.category,
      status: req.query.status,
      condition: req.query.condition,
      assigneeId: req.query.assigneeId,
      search: req.query.search,
    };
    const { assets, total } = await assetsService.list(pagination, filters);
    sendSuccess(res, assets, 200, paginationMeta(pagination.page, pagination.limit, total));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch assets';
    sendError(res, 500, 'ASSETS_FETCH_ERROR', message);
  }
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const asset = await assetsService.getById(req.params.id);
    sendSuccess(res, asset);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Asset not found';
    sendError(res, 404, 'ASSET_NOT_FOUND', message);
  }
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    const asset = await assetsService.create(req.body);
    sendSuccess(res, asset, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create asset';
    sendError(res, 400, 'ASSET_CREATE_ERROR', message);
  }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const asset = await assetsService.update(req.params.id, req.body);
    sendSuccess(res, asset);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update asset';
    sendError(res, 400, 'ASSET_UPDATE_ERROR', message);
  }
}

export async function softDelete(req: AuthRequest, res: Response): Promise<void> {
  try {
    await assetsService.softDelete(req.params.id);
    sendSuccess(res, { message: 'Asset deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete asset';
    sendError(res, 400, 'ASSET_DELETE_ERROR', message);
  }
}

export async function assign(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) { sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated'); return; }
    const { userId, notes } = req.body;
    if (!userId) { sendError(res, 400, 'MISSING_USER_ID', 'userId is required'); return; }
    const asset = await assetsService.assign(req.params.id, userId, req.user.userId, notes);
    sendSuccess(res, asset);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to assign asset';
    sendError(res, 400, 'ASSET_ASSIGN_ERROR', message);
  }
}

export async function unassign(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { conditionAtReturn, notes } = req.body;
    const asset = await assetsService.unassign(req.params.id, conditionAtReturn, notes);
    sendSuccess(res, asset);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to unassign asset';
    sendError(res, 400, 'ASSET_UNASSIGN_ERROR', message);
  }
}

export async function maintenance(req: AuthRequest, res: Response): Promise<void> {
  try {
    const asset = await assetsService.markMaintenance(req.params.id, req.body.notes);
    sendSuccess(res, asset);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to mark asset for maintenance';
    sendError(res, 400, 'ASSET_MAINTENANCE_ERROR', message);
  }
}

export async function retire(req: AuthRequest, res: Response): Promise<void> {
  try {
    const asset = await assetsService.retire(req.params.id, req.body.notes);
    sendSuccess(res, asset);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retire asset';
    sendError(res, 400, 'ASSET_RETIRE_ERROR', message);
  }
}

export async function getHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const history = await assetsService.getHistory(req.params.id);
    sendSuccess(res, history);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch asset history';
    sendError(res, 404, 'ASSET_HISTORY_ERROR', message);
  }
}

export async function exportCsv(req: AuthRequest, res: Response): Promise<void> {
  try {
    const filters = {
      category: req.query.category,
      status: req.query.status,
    };
    const csv = await assetsService.exportCsv(filters);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=assets-export.csv');
    res.send(csv);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to export assets';
    sendError(res, 500, 'ASSET_EXPORT_ERROR', message);
  }
}
