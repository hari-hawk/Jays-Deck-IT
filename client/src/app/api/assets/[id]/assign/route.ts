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
    const { userId, notes } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'userId is required' } },
        { status: 400 }
      );
    }

    const asset = await prisma.asset.findFirst({ where: { id, deletedAt: null } });
    if (!asset) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Asset not found' } },
        { status: 404 }
      );
    }
    if (asset.status === 'ASSIGNED') {
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: 'Asset is already assigned' } },
        { status: 409 }
      );
    }
    if (asset.status === 'RETIRED' || asset.status === 'DISPOSED') {
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: 'Cannot assign a retired or disposed asset' } },
        { status: 409 }
      );
    }

    const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const [updatedAsset] = await prisma.$transaction([
      prisma.asset.update({
        where: { id },
        data: { status: 'ASSIGNED', currentAssigneeId: userId },
      }),
      prisma.assetAssignment.create({
        data: {
          assetId: id,
          userId,
          assignedById: authUser.userId,
          notes,
          conditionAtAssign: asset.condition,
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: updatedAsset });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to assign asset';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
