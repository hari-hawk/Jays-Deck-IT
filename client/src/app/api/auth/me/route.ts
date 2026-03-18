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

    const profile = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        avatarUrl: true, role: true, department: true, designation: true,
        employeeId: true, phone: true, location: true, dateOfJoining: true, status: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'User not found';
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message } },
      { status: 404 }
    );
  }
}
