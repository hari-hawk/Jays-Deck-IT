import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyAuth, requireMinRole } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }
    if (!requireMinRole(authUser.role, 'IT_ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const where: Prisma.AuditLogWhereInput = {};

    const entityType = searchParams.get('entityType');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;
    if (action) where.action = action as Prisma.EnumAuditActionFilter;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Prisma.DateTimeFilter).gte = new Date(dateFrom);
      if (dateTo) (where.createdAt as Prisma.DateTimeFilter).lte = new Date(dateTo);
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

    const csv = header + rows;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="audit-export.csv"',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to export audit logs';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
