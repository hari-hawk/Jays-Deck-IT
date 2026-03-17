import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { prisma } from '../config/prisma.js';
import { AuditAction } from '@prisma/client';
import { logger } from '../config/logger.js';

export function auditLog(action: AuditAction, entityType: string) {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    // Store original end to log after response
    const originalEnd = _res.end;
    const res = _res;

    res.end = function (...args: Parameters<typeof originalEnd>): ReturnType<typeof originalEnd> {
      // Only log successful mutations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const rawId = req.params.id;
        const entityId = Array.isArray(rawId) ? rawId[0] : (rawId || 'unknown');
        prisma.auditLog
          .create({
            data: {
              userId: req.user?.userId || null,
              action,
              entityType,
              entityId,
              changes: req.body ? JSON.parse(JSON.stringify(req.body)) : undefined,
              ipAddress: String(Array.isArray(req.ip) ? req.ip[0] : (req.ip || req.socket?.remoteAddress || '')),
              userAgent: req.headers['user-agent'] || null,
            },
          })
          .catch((err: unknown) => logger.error('Audit log failed', { error: err }));
      }
      return originalEnd.apply(res, args);
    } as typeof originalEnd;

    next();
  };
}
