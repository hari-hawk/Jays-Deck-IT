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

    const [byCategory, byStatus] = await Promise.all([
      prisma.asset.groupBy({
        by: ['category'],
        where: { deletedAt: null },
        _count: { id: true },
      }),
      prisma.asset.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        byCategory: byCategory.map((c) => ({ name: c.category, value: c._count.id })),
        byStatus: byStatus.map((s) => ({ name: s.status, value: s._count.id })),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch asset overview';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
