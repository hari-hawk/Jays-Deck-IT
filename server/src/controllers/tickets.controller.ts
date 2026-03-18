import { Response } from 'express';
import { ticketsService } from '../services/tickets.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    const pagination = parsePagination(req.query as Record<string, unknown>);
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      category: req.query.category,
      assigneeId: req.query.assigneeId,
      reporterId: req.query.reporterId,
      search: req.query.search,
    };
    const { tickets, total } = await ticketsService.list(pagination, filters);
    sendSuccess(res, tickets, 200, paginationMeta(pagination.page, pagination.limit, total));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch tickets';
    sendError(res, 500, 'TICKETS_FETCH_ERROR', message);
  }
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const ticket = await ticketsService.getById(req.params.id);
    sendSuccess(res, ticket);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ticket not found';
    sendError(res, 404, 'TICKET_NOT_FOUND', message);
  }
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) { sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated'); return; }
    const ticket = await ticketsService.create({
      ...req.body,
      reporterId: req.user.userId,
    });
    sendSuccess(res, ticket, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create ticket';
    sendError(res, 400, 'TICKET_CREATE_ERROR', message);
  }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const ticket = await ticketsService.update(req.params.id, req.body);
    sendSuccess(res, ticket);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update ticket';
    sendError(res, 400, 'TICKET_UPDATE_ERROR', message);
  }
}

export async function addComment(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) { sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated'); return; }
    const { content, isInternal } = req.body;
    if (!content) { sendError(res, 400, 'MISSING_CONTENT', 'Comment content is required'); return; }
    const comment = await ticketsService.addComment(
      req.params.id,
      req.user.userId,
      content,
      isInternal || false
    );
    sendSuccess(res, comment, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add comment';
    sendError(res, 400, 'COMMENT_CREATE_ERROR', message);
  }
}

export async function resolve(req: AuthRequest, res: Response): Promise<void> {
  try {
    const ticket = await ticketsService.resolve(req.params.id);
    sendSuccess(res, ticket);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to resolve ticket';
    sendError(res, 400, 'TICKET_RESOLVE_ERROR', message);
  }
}

export async function close(req: AuthRequest, res: Response): Promise<void> {
  try {
    const ticket = await ticketsService.close(req.params.id);
    sendSuccess(res, ticket);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to close ticket';
    sendError(res, 400, 'TICKET_CLOSE_ERROR', message);
  }
}

export async function escalate(req: AuthRequest, res: Response): Promise<void> {
  try {
    const ticket = await ticketsService.escalate(req.params.id);
    sendSuccess(res, ticket);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to escalate ticket';
    sendError(res, 400, 'TICKET_ESCALATE_ERROR', message);
  }
}
