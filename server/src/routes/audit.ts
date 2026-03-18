import { Router, type Router as RouterType } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireMinRole } from '../middleware/rbac.js';
import * as auditController from '../controllers/audit.controller.js';

export const auditRouter: RouterType = Router();

auditRouter.use(authenticate);
auditRouter.use(requireMinRole('IT_ADMIN'));

// GET /api/audit — List audit logs, filterable
auditRouter.get('/', auditController.list);

// GET /api/audit/export — Export logs as CSV
auditRouter.get('/export', auditController.exportCsv);
