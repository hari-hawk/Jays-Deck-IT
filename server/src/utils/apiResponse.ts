import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: PaginationMeta) {
  const response: { success: true; data: T; meta?: PaginationMeta } = { success: true, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
}

export function sendError(res: Response, statusCode: number, code: string, message: string, details?: unknown) {
  const response = { success: false, error: { code, message, details } };
  return res.status(statusCode).json(response);
}
