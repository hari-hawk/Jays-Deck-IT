import { Response } from 'express';
import { knowledgeService } from '../services/knowledge.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    const pagination = parsePagination(req.query as Record<string, unknown>);
    const filters = {
      category: req.query.category,
      isPublished: req.query.isPublished,
      search: req.query.search,
      tag: req.query.tag,
    };
    const { articles, total } = await knowledgeService.list(pagination, filters);
    sendSuccess(res, articles, 200, paginationMeta(pagination.page, pagination.limit, total));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch articles';
    sendError(res, 500, 'KNOWLEDGE_FETCH_ERROR', message);
  }
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const article = await knowledgeService.getById(req.params.id);
    sendSuccess(res, article);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Article not found';
    sendError(res, 404, 'ARTICLE_NOT_FOUND', message);
  }
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) { sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated'); return; }
    const article = await knowledgeService.create({
      ...req.body,
      authorId: req.user.userId,
    });
    sendSuccess(res, article, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create article';
    sendError(res, 400, 'ARTICLE_CREATE_ERROR', message);
  }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const article = await knowledgeService.update(req.params.id, req.body);
    sendSuccess(res, article);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update article';
    sendError(res, 400, 'ARTICLE_UPDATE_ERROR', message);
  }
}

export async function softDelete(req: AuthRequest, res: Response): Promise<void> {
  try {
    await knowledgeService.softDelete(req.params.id);
    sendSuccess(res, { message: 'Article deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete article';
    sendError(res, 400, 'ARTICLE_DELETE_ERROR', message);
  }
}
