import { prisma } from '../config/prisma.js';

export class DashboardService {
  async getStats() {
    const [totalAssets, assignedAssets, availableAssets, maintenanceAssets,
           openTickets, resolvedTickets, totalTickets,
           pendingApprovals, totalEmployees, activeEmployees] = await Promise.all([
      prisma.asset.count({ where: { deletedAt: null } }),
      prisma.asset.count({ where: { status: 'ASSIGNED', deletedAt: null } }),
      prisma.asset.count({ where: { status: 'AVAILABLE', deletedAt: null } }),
      prisma.asset.count({ where: { status: 'IN_MAINTENANCE', deletedAt: null } }),
      prisma.ticket.count({ where: { status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] }, deletedAt: null } }),
      prisma.ticket.count({ where: { status: 'RESOLVED', deletedAt: null } }),
      prisma.ticket.count({ where: { deletedAt: null } }),
      prisma.accessRequest.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
    ]);

    const slaCompliance = totalTickets > 0
      ? Math.round(((resolvedTickets) / Math.max(totalTickets, 1)) * 100)
      : 100;

    return {
      totalAssets,
      assignedAssets,
      availableAssets,
      maintenanceAssets,
      openTickets,
      pendingApprovals,
      slaCompliance,
      totalEmployees,
      activeEmployees,
    };
  }

  async getTicketTrends() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const tickets = await prisma.ticket.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, deletedAt: null },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    });

    const trendMap = new Map<string, { date: string; opened: number; resolved: number }>();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const key = date.toISOString().split('T')[0];
      trendMap.set(key, { date: key, opened: 0, resolved: 0 });
    }

    for (const ticket of tickets) {
      const key = ticket.createdAt.toISOString().split('T')[0];
      const entry = trendMap.get(key);
      if (entry) {
        entry.opened++;
        if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
          entry.resolved++;
        }
      }
    }

    return Array.from(trendMap.values());
  }

  async getAssetOverview() {
    const byCategory = await prisma.asset.groupBy({
      by: ['category'],
      where: { deletedAt: null },
      _count: { id: true },
    });

    const byStatus = await prisma.asset.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { id: true },
    });

    return {
      byCategory: byCategory.map((c) => ({ name: c.category, value: c._count.id })),
      byStatus: byStatus.map((s) => ({ name: s.status, value: s._count.id })),
    };
  }

  async getRecentActivity(limit = 10) {
    const logs = await prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      user: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
      timestamp: log.createdAt,
    }));
  }

  async getTicketsByStatus() {
    const byStatus = await prisma.ticket.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { id: true },
    });
    return byStatus.map((s) => ({ name: s.status, value: s._count.id }));
  }
}

export const dashboardService = new DashboardService();
