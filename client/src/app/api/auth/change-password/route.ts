import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-helpers';

export async function PUT(req: NextRequest) {
  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Current password and new password (min 8 chars) are required' } },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: authUser.userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: { code: 'PASSWORD_CHANGE_FAILED', message: 'Current password is incorrect' } },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: authUser.userId }, data: { passwordHash } });

    return NextResponse.json({ success: true, data: { message: 'Password changed successfully' } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Password change failed';
    return NextResponse.json(
      { success: false, error: { code: 'PASSWORD_CHANGE_FAILED', message } },
      { status: 400 }
    );
  }
}
