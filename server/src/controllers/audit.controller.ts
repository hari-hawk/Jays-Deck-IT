import { Response } from 'express';
import { auditService } from '../services/audit.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    const pagination = parsePagination(req.query as Record<string, unknown>);
    const filters = {
      entityType: req.query.entityType,
      entityId: req.query.entityId,
      userId: req.query.userId,
      action: req.query.action,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
    };
    const { logs, total } = await auditService.list(pagination, filters);
    sendSuccess(res, logs, 200, paginationMeta(pagination.page, pagination.limit, total));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch audit logs';
    sendError(res, 500, 'AUDIT_FETCH_ERROR', message);
  }
}

export async function exportCsv(req: AuthRequest, res: Response): Promise<void> {
  try {
    const filters = {
      entityType: req.query.entityType,
      userId: req.query.userId,
      action: req.query.action,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
    };
    const csv = await auditService.exportCsv(filters);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-logs-export.csv');
    res.send(csv);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to export audit logs';
    sendError(res, 500, 'AUDIT_EXPORT_ERROR', message);
  }
}
