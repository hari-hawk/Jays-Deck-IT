import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, requireMinRole } from '@/lib/auth-helpers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { notes } = body;

    const asset = await prisma.asset.findFirst({ where: { id, deletedAt: null } });
    if (!asset) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Asset not found' } },
        { status: 404 }
      );
    }

    // Unassign first if currently assigned
    if (asset.status === 'ASSIGNED') {
      const activeAssignment = await prisma.assetAssignment.findFirst({
        where: { assetId: id, returnedAt: null },
        orderBy: { assignedAt: 'desc' },
      });
      if (activeAssignment) {
        await prisma.assetAssignment.update({
          where: { id: activeAssignment.id },
          data: { returnedAt: new Date() },
        });
      }
    }

    const updated = await prisma.asset.update({
      where: { id },
      data: { status: 'RETIRED', currentAssigneeId: null, notes: notes || asset.notes },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retire asset';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
