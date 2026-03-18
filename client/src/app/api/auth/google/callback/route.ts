import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth-helpers';
import { parseUserAgent } from '@/lib/user-agent';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${appUrl}/login?sso_error=${encodeURIComponent('No authorization code received from Google')}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/login?sso_error=${encodeURIComponent('Google SSO is not configured')}`);
  }

  try {
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Google token exchange failed:', tokenData);
      return NextResponse.redirect(`${appUrl}/login?sso_error=${encodeURIComponent('Failed to authenticate with Google')}`);
    }

    // Get user profile from Google
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileRes.json();

    if (!profileRes.ok || !profile.email) {
      return NextResponse.redirect(`${appUrl}/login?sso_error=${encodeURIComponent('Failed to get Google profile')}`);
    }

    // Find existing user by email or Google provider ID
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: profile.email },
          { authProvider: 'GOOGLE', authProviderId: profile.id },
        ],
        deletedAt: null,
      },
    });

    if (!user) {
      // Auto-create user with EMPLOYEE role
      const employeeCount = await prisma.user.count();
      const empId = `TJ-EMP-${String(employeeCount + 1).padStart(4, '0')}`;
      const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);

      user = await prisma.user.create({
        data: {
          email: profile.email,
          firstName: profile.given_name || profile.name?.split(' ')[0] || 'User',
          lastName: profile.family_name || profile.name?.split(' ').slice(1).join(' ') || '',
          passwordHash: randomPassword,
          employeeId: empId,
          role: 'EMPLOYEE',
          status: 'ACTIVE',
          authProvider: 'GOOGLE',
          authProviderId: profile.id,
          avatarUrl: profile.picture || null,
          isOnboarded: false,
        },
      });
    } else if (user.authProvider === 'EMAIL') {
      // Link Google to existing email user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          authProvider: 'GOOGLE',
          authProviderId: profile.id,
          avatarUrl: user.avatarUrl || profile.picture || null,
        },
      });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.redirect(`${appUrl}/login?sso_error=${encodeURIComponent('Your account is inactive. Please contact IT admin.')}`);
    }

    // Generate JWT tokens
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Record login activity
    const ua = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown';
    const device = parseUserAgent(ua);

    prisma.loginActivity.create({
      data: {
        userId: user.id,
        ipAddress: ip,
        userAgent: ua,
        device,
        method: 'GOOGLE',
      },
    }).catch(() => { /* non-blocking */ });

    // Redirect to login page with token (client stores it)
    const response = NextResponse.redirect(`${appUrl}/login?sso_token=${accessToken}`);

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google SSO callback error:', error);
    return NextResponse.redirect(`${appUrl}/login?sso_error=${encodeURIComponent('Authentication failed. Please try again.')}`);
  }
}
