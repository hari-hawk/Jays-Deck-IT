import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-helpers';

export async function PUT(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { phone, department, designation, avatarUrl } = body;

    const updated = await prisma.user.update({
      where: { id: user.userId },
      data: {
        ...(phone !== undefined && { phone }),
        ...(department !== undefined && { department }),
        ...(designation !== undefined && { designation }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        isOnboarded: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        department: true,
        designation: true,
        phone: true,
        isOnboarded: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to complete onboarding';
    return NextResponse.json(
      { success: false, error: { code: 'ONBOARD_FAILED', message } },
      { status: 500 }
    );
  }
}
