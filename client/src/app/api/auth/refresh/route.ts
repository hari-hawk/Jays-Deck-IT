import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
  try {
    const refreshTokenCookie = req.cookies.get('refreshToken')?.value;
    if (!refreshTokenCookie) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_TOKEN', message: 'No refresh token provided' } },
        { status: 401 }
      );
    }

    const payload = verifyRefreshToken(refreshTokenCookie);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.deletedAt || user.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: { code: 'REFRESH_FAILED', message: 'Invalid refresh token' } },
        { status: 401 }
      );
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      data: { accessToken: newAccessToken },
    });

    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Token refresh failed';
    return NextResponse.json(
      { success: false, error: { code: 'REFRESH_FAILED', message } },
      { status: 401 }
    );
  }
}
