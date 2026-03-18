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

    const activities = await prisma.loginActivity.findMany({
      where: { userId: user.userId },
      orderBy: { loginAt: 'desc' },
      take: 20,
      select: {
        id: true,
        loginAt: true,
        ipAddress: true,
        device: true,
        method: true,
        location: true,
      },
    });

    return NextResponse.json({ success: true, data: activities });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch login activity';
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_FAILED', message } },
      { status: 500 }
    );
  }
}
