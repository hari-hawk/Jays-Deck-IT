import { Router, type Router as RouterType } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { requireMinRole } from '../middleware/rbac.js';
import { auditLog } from '../middleware/audit.js';
import * as knowledgeController from '../controllers/knowledge.controller.js';

export const knowledgeRouter: RouterType = Router();

knowledgeRouter.use(authenticate);

// GET /api/knowledge — List articles, searchable
knowledgeRouter.get('/', knowledgeController.list);

// GET /api/knowledge/:id — Detail
knowledgeRouter.get('/:id', knowledgeController.getById);

// POST /api/knowledge — Create (IT_ADMIN+ only)
knowledgeRouter.post(
  '/',
  requireMinRole('IT_ADMIN'),
  auditLog('CREATE', 'KnowledgeArticle'),
  body('title').notEmpty().trim(),
  body('content').notEmpty(),
  knowledgeController.create
);

// PUT /api/knowledge/:id — Update
knowledgeRouter.put(
  '/:id',
  requireMinRole('IT_ADMIN'),
  auditLog('UPDATE', 'KnowledgeArticle'),
  knowledgeController.update
);

// DELETE /api/knowledge/:id — Soft delete
knowledgeRouter.delete(
  '/:id',
  requireMinRole('IT_ADMIN'),
  auditLog('DELETE', 'KnowledgeArticle'),
  knowledgeController.softDelete
);
