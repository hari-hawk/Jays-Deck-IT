import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';
import { sendError } from '../utils/apiResponse.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err.name === 'ValidationError') {
    sendError(res, 422, 'VALIDATION_ERROR', err.message);
    return;
  }

  sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
}
