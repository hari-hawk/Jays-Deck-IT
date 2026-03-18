import { Router, type Router as RouterType } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { requireMinRole, requireRole } from '../middleware/rbac.js';
import { auditLog } from '../middleware/audit.js';
import * as usersController from '../controllers/users.controller.js';

export const usersRouter: RouterType = Router();

usersRouter.use(authenticate);

// GET /api/users — List paginated, filterable
usersRouter.get('/', usersController.list);

// GET /api/users/:id — Detail with assigned assets
usersRouter.get('/:id', usersController.getById);

// POST /api/users — Create (IT_ADMIN+ only)
usersRouter.post(
  '/',
  requireMinRole('IT_ADMIN'),
  auditLog('CREATE', 'User'),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('employeeId').notEmpty().trim(),
  usersController.create
);

// PUT /api/users/:id — Update
usersRouter.put(
  '/:id',
  requireMinRole('IT_ADMIN'),
  auditLog('UPDATE', 'User'),
  usersController.update
);

// DELETE /api/users/:id — Soft delete (SUPER_ADMIN only)
usersRouter.delete(
  '/:id',
  requireRole('SUPER_ADMIN'),
  auditLog('DELETE', 'User'),
  usersController.softDelete
);

// GET /api/users/:id/assets — List assets assigned to user
usersRouter.get('/:id/assets', usersController.getUserAssets);

// GET /api/users/:id/tickets — List tickets for user
usersRouter.get('/:id/tickets', usersController.getUserTickets);
