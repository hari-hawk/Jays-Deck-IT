import { NextResponse } from 'next/server';

// This route initiates Microsoft OAuth flow
// To enable:
// 1. Register an app at https://portal.azure.com > Azure Active Directory > App registrations
// 2. Add redirect URI: https://your-domain.com/api/auth/microsoft/callback
// 3. Set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET env vars

export async function GET() {
  const clientId = process.env.MICROSOFT_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SSO_NOT_CONFIGURED',
          message: 'Microsoft SSO is not yet configured. Please use email/password to login.',
        },
      },
      { status: 501 }
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/auth/microsoft/callback`;
  const scope = encodeURIComponent('openid email profile User.Read');
  const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&response_mode=query`;

  return NextResponse.redirect(url);
}
