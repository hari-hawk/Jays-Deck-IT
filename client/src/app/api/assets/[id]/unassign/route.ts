import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, requireMinRole } from '@/lib/auth-helpers';
import { createNotification } from '@/lib/notifications';

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
    const { conditionAtReturn, notes } = body;

    const asset = await prisma.asset.findFirst({ where: { id, deletedAt: null } });
    if (!asset) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Asset not found' } },
        { status: 404 }
      );
    }
    if (asset.status !== 'ASSIGNED') {
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: 'Asset is not currently assigned' } },
        { status: 409 }
      );
    }

    // Use interactive transaction to avoid typing issues
    const updatedAsset = await prisma.$transaction(async (tx) => {
      const updated = await tx.asset.update({
        where: { id },
        data: {
          status: 'AVAILABLE',
          currentAssigneeId: null,
          condition: conditionAtReturn || asset.condition,
        },
      });

      // Close the active assignment
      const activeAssignment = await tx.assetAssignment.findFirst({
        where: { assetId: id, returnedAt: null },
        orderBy: { assignedAt: 'desc' },
      });

      if (activeAssignment) {
        await tx.assetAssignment.update({
          where: { id: activeAssignment.id },
          data: {
            returnedAt: new Date(),
            conditionAtReturn: conditionAtReturn || undefined,
          },
        });
      }

      return updated;
    });

    // Notify the previous assignee that the asset has been returned
    try {
      if (asset.currentAssigneeId) {
        await createNotification({
          userId: asset.currentAssigneeId,
          title: 'Asset returned',
          message: `Asset ${asset.name} (${asset.assetTag}) has been returned`,
          type: 'ASSET_ASSIGNED',
          link: `/assets/${id}`,
        });
      }
    } catch {
      // Notification failure should not break asset unassignment
    }

    return NextResponse.json({ success: true, data: updatedAsset });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to unassign asset';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
