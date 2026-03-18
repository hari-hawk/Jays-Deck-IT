import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, requireMinRole } from '@/lib/auth-helpers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const asset = await prisma.asset.findFirst({
      where: { id, deletedAt: null },
      include: {
        currentAssignee: { select: { id: true, firstName: true, lastName: true, email: true, department: true } },
        assignments: {
          take: 10,
          orderBy: { assignedAt: 'desc' },
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
            assignedBy: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!asset) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Asset not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: asset });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch asset';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const data = await req.json();

    const asset = await prisma.asset.findFirst({ where: { id, deletedAt: null } });
    if (!asset) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Asset not found' } },
        { status: 404 }
      );
    }

    const updateData = { ...data } as Record<string, unknown>;
    if (updateData.purchaseDate) updateData.purchaseDate = new Date(updateData.purchaseDate as string);
    if (updateData.warrantyExpiry) updateData.warrantyExpiry = new Date(updateData.warrantyExpiry as string);
    // Prevent direct status/assignee manipulation through update
    delete updateData.currentAssigneeId;

    const updated = await prisma.asset.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update asset';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const asset = await prisma.asset.findFirst({ where: { id, deletedAt: null } });
    if (!asset) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Asset not found' } },
        { status: 404 }
      );
    }

    await prisma.asset.update({ where: { id }, data: { deletedAt: new Date() } });

    return NextResponse.json({ success: true, data: { message: 'Asset deleted successfully' } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete asset';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
