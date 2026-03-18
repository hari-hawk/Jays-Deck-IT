import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  if (!clientId) {
    return NextResponse.redirect(`${appUrl}/login?sso_error=${encodeURIComponent('Microsoft SSO is not configured. Please contact your administrator.')}`);
  }

  const redirectUri = `${appUrl}/api/auth/microsoft/callback`;
  const scope = encodeURIComponent('openid email profile User.Read');
  const state = crypto.randomUUID();
  const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&response_mode=query&state=${state}`;

  return NextResponse.redirect(url);
}
