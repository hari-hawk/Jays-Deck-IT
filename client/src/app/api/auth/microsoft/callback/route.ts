import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth-helpers';
import { parseUserAgent } from '@/lib/user-agent';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  if (!code) {
    const error = req.nextUrl.searchParams.get('error_description') || 'No authorization code received from Microsoft';
    return NextResponse.redirect(`${appUrl}/login?sso_error=${encodeURIComponent(error)}`);
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/login?sso_error=${encodeURIComponent('Microsoft SSO is not configured')}`);
  }

  try {
    const redirectUri = `${appUrl}/api/auth/microsoft/callback`;

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        scope: 'openid email profile User.Read',
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Microsoft token exchange failed:', tokenData);
      return NextResponse.redirect(`${appUrl}/login?sso_error=${encodeURIComponent('Failed to authenticate with Microsoft')}`);
    }

    // Get user profile from Microsoft Graph
    const profileRes = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileRes.json();

    if (!profileRes.ok || !profile.mail && !profile.userPrincipalName) {
      return NextResponse.redirect(`${appUrl}/login?sso_error=${encodeURIComponent('Failed to get Microsoft profile')}`);
    }

    const email = profile.mail || profile.userPrincipalName;
    const microsoftId = profile.id;

    // Find existing user by email or Microsoft provider ID
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { authProvider: 'MICROSOFT', authProviderId: microsoftId },
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
          email,
          firstName: profile.givenName || profile.displayName?.split(' ')[0] || 'User',
          lastName: profile.surname || profile.displayName?.split(' ').slice(1).join(' ') || '',
          passwordHash: randomPassword,
          employeeId: empId,
          role: 'EMPLOYEE',
          status: 'ACTIVE',
          authProvider: 'MICROSOFT',
          authProviderId: microsoftId,
          isOnboarded: false,
        },
      });
    } else if (user.authProvider === 'EMAIL') {
      // Link Microsoft to existing email user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          authProvider: 'MICROSOFT',
          authProviderId: microsoftId,
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
        method: 'MICROSOFT',
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
    console.error('Microsoft SSO callback error:', error);
    return NextResponse.redirect(`${appUrl}/login?sso_error=${encodeURIComponent('Authentication failed. Please try again.')}`);
  }
}
