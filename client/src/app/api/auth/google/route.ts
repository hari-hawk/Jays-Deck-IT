import { NextResponse } from 'next/server';

// This route initiates Google OAuth flow
// To enable:
// 1. Create a project at https://console.cloud.google.com
// 2. Enable Google OAuth 2.0
// 3. Add callback URL: https://your-domain.com/api/auth/google/callback
// 4. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SSO_NOT_CONFIGURED',
          message: 'Google SSO is not yet configured. Please use email/password to login.',
        },
      },
      { status: 501 }
    );
  }

  // When configured, redirect to Google OAuth consent screen
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/auth/google/callback`;
  const scope = encodeURIComponent('openid email profile');
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

  return NextResponse.redirect(url);
}
