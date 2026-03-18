import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  if (!clientId) {
    return NextResponse.redirect(`${appUrl}/login?sso_error=${encodeURIComponent('Google SSO is not configured. Please contact your administrator.')}`);
  }

  const redirectUri = `${appUrl}/api/auth/google/callback`;
  const scope = encodeURIComponent('openid email profile');
  const state = crypto.randomUUID();
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;

  return NextResponse.redirect(url);
}
