import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-helpers';

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

    const user = await prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const assets = await prisma.asset.findMany({
      where: { currentAssigneeId: id, deletedAt: null },
      select: {
        id: true, assetTag: true, name: true, category: true, brand: true,
        model: true, serialNumber: true, status: true, condition: true,
      },
    });

    return NextResponse.json({ success: true, data: assets });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch user assets';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
