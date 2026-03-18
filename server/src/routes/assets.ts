import { Router, type Router as RouterType } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { requireMinRole } from '../middleware/rbac.js';
import { auditLog } from '../middleware/audit.js';
import * as assetsController from '../controllers/assets.controller.js';

export const assetsRouter: RouterType = Router();

assetsRouter.use(authenticate);

// GET /api/assets/export — Export to CSV (must be before :id routes)
assetsRouter.get('/export', requireMinRole('IT_ADMIN'), assetsController.exportCsv);

// GET /api/assets — List paginated, filterable
assetsRouter.get('/', assetsController.list);

// GET /api/assets/:id — Detail with assignment history
assetsRouter.get('/:id', assetsController.getById);

// POST /api/assets — Create (IT_ADMIN+ only)
assetsRouter.post(
  '/',
  requireMinRole('IT_ADMIN'),
  auditLog('CREATE', 'Asset'),
  body('assetTag').notEmpty().trim(),
  body('name').notEmpty().trim(),
  body('category').notEmpty(),
  assetsController.create
);

// PUT /api/assets/:id — Update
assetsRouter.put(
  '/:id',
  requireMinRole('IT_ADMIN'),
  auditLog('UPDATE', 'Asset'),
  assetsController.update
);

// DELETE /api/assets/:id — Soft delete
assetsRouter.delete(
  '/:id',
  requireMinRole('IT_ADMIN'),
  auditLog('DELETE', 'Asset'),
  assetsController.softDelete
);

// POST /api/assets/:id/assign — Assign to employee
assetsRouter.post(
  '/:id/assign',
  requireMinRole('IT_ADMIN'),
  auditLog('ASSIGN', 'Asset'),
  body('userId').notEmpty(),
  assetsController.assign
);

// POST /api/assets/:id/unassign — Return/unassign
assetsRouter.post(
  '/:id/unassign',
  requireMinRole('IT_ADMIN'),
  auditLog('UNASSIGN', 'Asset'),
  assetsController.unassign
);

// POST /api/assets/:id/maintenance — Mark as in maintenance
assetsRouter.post(
  '/:id/maintenance',
  requireMinRole('IT_ADMIN'),
  auditLog('UPDATE', 'Asset'),
  assetsController.maintenance
);

// POST /api/assets/:id/retire — Retire asset
assetsRouter.post(
  '/:id/retire',
  requireMinRole('IT_ADMIN'),
  auditLog('UPDATE', 'Asset'),
  assetsController.retire
);

// GET /api/assets/:id/history — Full assignment history
assetsRouter.get('/:id/history', assetsController.getHistory);
