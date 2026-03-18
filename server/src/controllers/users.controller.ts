import { Response } from 'express';
import { usersService } from '../services/users.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    const pagination = parsePagination(req.query as Record<string, unknown>);
    const filters = {
      role: req.query.role,
      department: req.query.department,
      location: req.query.location,
      status: req.query.status,
      search: req.query.search,
    };
    const { users, total } = await usersService.list(pagination, filters);
    sendSuccess(res, users, 200, paginationMeta(pagination.page, pagination.limit, total));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch users';
    sendError(res, 500, 'USERS_FETCH_ERROR', message);
  }
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await usersService.getById(req.params.id);
    sendSuccess(res, user);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'User not found';
    sendError(res, 404, 'USER_NOT_FOUND', message);
  }
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await usersService.create(req.body);
    sendSuccess(res, user, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create user';
    sendError(res, 400, 'USER_CREATE_ERROR', message);
  }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await usersService.update(req.params.id, req.body);
    sendSuccess(res, user);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update user';
    sendError(res, 400, 'USER_UPDATE_ERROR', message);
  }
}

export async function softDelete(req: AuthRequest, res: Response): Promise<void> {
  try {
    await usersService.softDelete(req.params.id);
    sendSuccess(res, { message: 'User deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete user';
    sendError(res, 400, 'USER_DELETE_ERROR', message);
  }
}

export async function getUserAssets(req: AuthRequest, res: Response): Promise<void> {
  try {
    const assets = await usersService.getUserAssets(req.params.id);
    sendSuccess(res, assets);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch user assets';
    sendError(res, 404, 'USER_ASSETS_ERROR', message);
  }
}

export async function getUserTickets(req: AuthRequest, res: Response): Promise<void> {
  try {
    const pagination = parsePagination(req.query as Record<string, unknown>);
    const { tickets, total } = await usersService.getUserTickets(req.params.id, pagination);
    sendSuccess(res, tickets, 200, paginationMeta(pagination.page, pagination.limit, total));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch user tickets';
    sendError(res, 404, 'USER_TICKETS_ERROR', message);
  }
}
