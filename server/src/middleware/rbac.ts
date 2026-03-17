import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { sendError } from '../utils/apiResponse.js';

type Role = 'SUPER_ADMIN' | 'IT_ADMIN' | 'MANAGER' | 'EMPLOYEE';

const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 4,
  IT_ADMIN: 3,
  MANAGER: 2,
  EMPLOYEE: 1,
};

export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
      return;
    }
    const userRole = req.user.role as Role;
    if (!allowedRoles.includes(userRole)) {
      sendError(res, 403, 'FORBIDDEN', 'Insufficient permissions');
      return;
    }
    next();
  };
}

export function requireMinRole(minRole: Role) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
      return;
    }
    const userLevel = ROLE_HIERARCHY[req.user.role as Role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole];
    if (userLevel < requiredLevel) {
      sendError(res, 403, 'FORBIDDEN', 'Insufficient permissions');
      return;
    }
    next();
  };
}
