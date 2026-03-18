import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

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

    return NextResponse.json({
      success: true,
      data: {
        totalAssets, assignedAssets, availableAssets, maintenanceAssets,
        openTickets, pendingApprovals, slaCompliance,
        totalEmployees, activeEmployees,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch stats';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
