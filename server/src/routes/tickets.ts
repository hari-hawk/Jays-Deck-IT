import { Router, type Router as RouterType } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { requireMinRole } from '../middleware/rbac.js';
import { auditLog } from '../middleware/audit.js';
import * as ticketsController from '../controllers/tickets.controller.js';

export const ticketsRouter: RouterType = Router();

ticketsRouter.use(authenticate);

// GET /api/tickets — List paginated, filterable
ticketsRouter.get('/', ticketsController.list);

// GET /api/tickets/:id — Detail with comments
ticketsRouter.get('/:id', ticketsController.getById);

// POST /api/tickets — Create (any authenticated user)
ticketsRouter.post(
  '/',
  auditLog('CREATE', 'Ticket'),
  body('title').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('category').notEmpty(),
  ticketsController.create
);

// PUT /api/tickets/:id — Update
ticketsRouter.put(
  '/:id',
  auditLog('UPDATE', 'Ticket'),
  ticketsController.update
);

// POST /api/tickets/:id/comments — Add comment
ticketsRouter.post(
  '/:id/comments',
  body('content').notEmpty().trim(),
  ticketsController.addComment
);

// PUT /api/tickets/:id/resolve — Resolve
ticketsRouter.put(
  '/:id/resolve',
  requireMinRole('IT_ADMIN'),
  auditLog('UPDATE', 'Ticket'),
  ticketsController.resolve
);

// PUT /api/tickets/:id/close — Close
ticketsRouter.put(
  '/:id/close',
  requireMinRole('IT_ADMIN'),
  auditLog('UPDATE', 'Ticket'),
  ticketsController.close
);

// PUT /api/tickets/:id/escalate — Escalate
ticketsRouter.put(
  '/:id/escalate',
  auditLog('UPDATE', 'Ticket'),
  ticketsController.escalate
);
