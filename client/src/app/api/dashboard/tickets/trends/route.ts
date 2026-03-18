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

    return NextResponse.json({ success: true, data: Array.from(trendMap.values()) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch ticket trends';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
