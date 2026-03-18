import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';
import { PaginationParams } from '../utils/pagination.js';

export class AuditService {
  async list(pagination: PaginationParams, filters: Record<string, unknown>) {
    const where: Prisma.AuditLogWhereInput = {};

    if (filters.entityType) where.entityType = filters.entityType as string;
    if (filters.entityId) where.entityId = filters.entityId as string;
    if (filters.userId) where.userId = filters.userId as string;
    if (filters.action) where.action = filters.action as Prisma.EnumAuditActionFilter;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) (where.createdAt as Prisma.DateTimeFilter).gte = new Date(filters.dateFrom as string);
      if (filters.dateTo) (where.createdAt as Prisma.DateTimeFilter).lte = new Date(filters.dateTo as string);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { [pagination.sort]: pagination.order },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }

  async exportCsv(filters: Record<string, unknown>) {
    const where: Prisma.AuditLogWhereInput = {};

    if (filters.entityType) where.entityType = filters.entityType as string;
    if (filters.userId) where.userId = filters.userId as string;
    if (filters.action) where.action = filters.action as Prisma.EnumAuditActionFilter;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) (where.createdAt as Prisma.DateTimeFilter).gte = new Date(filters.dateFrom as string);
      if (filters.dateTo) (where.createdAt as Prisma.DateTimeFilter).lte = new Date(filters.dateTo as string);
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    const header = 'ID,Action,Entity Type,Entity ID,User,Email,IP Address,Timestamp\n';
    const rows = logs.map((log) => {
      const userName = log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System';
      const email = log.user?.email || '';
      return [
        log.id, log.action, log.entityType, log.entityId,
        userName, email, log.ipAddress || '',
        log.createdAt.toISOString(),
      ].map((v) => `"${v}"`).join(',');
    }).join('\n');

    return header + rows;
  }
}

export const auditService = new AuditService();
