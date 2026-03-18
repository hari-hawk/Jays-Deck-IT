const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || 'JAYS DECK <noreply@techjays.com>';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail(params: SendEmailParams) {
  if (!RESEND_API_KEY) {
    console.log('[EMAIL] Skipped (no RESEND_API_KEY):', params.subject, '\u2192', params.to);
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[EMAIL] Failed to send:', res.status, body);
    }
  } catch (err) {
    console.error('[EMAIL] Error sending email:', err);
  }
}

// ─── Email Templates ─────────────────────────────────

function wrapTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:24px;font-weight:800;color:#ffffff;">JAYS <span style="color:#6366f1;">DECK</span></span>
    </div>
    <div style="background:#1a1a24;border:1px solid #2a2a3a;border-radius:12px;padding:24px;">
      ${content}
    </div>
    <p style="text-align:center;font-size:11px;color:#666;margin-top:20px;">
      TechJays -- The AI Reimagination Company
    </p>
  </div>
</body>
</html>`;
}

export const emailTemplates = {
  ticketCreated: (params: { title: string; ticketNumber: string; reporterName: string }) =>
    wrapTemplate(`
      <h2 style="color:#fff;margin:0 0 8px;">New Ticket Created</h2>
      <p style="color:#a0a0b0;margin:0 0 16px;">A new ticket has been raised.</p>
      <div style="background:#12121a;border-radius:8px;padding:16px;margin-bottom:16px;">
        <p style="color:#6366f1;font-family:monospace;font-size:12px;margin:0 0 4px;">${params.ticketNumber}</p>
        <p style="color:#fff;font-size:16px;font-weight:600;margin:0 0 4px;">${params.title}</p>
        <p style="color:#888;font-size:13px;margin:0;">Reported by ${params.reporterName}</p>
      </div>
    `),

  ticketComment: (params: { name: string; ticketNumber: string; comment: string }) =>
    wrapTemplate(`
      <h2 style="color:#fff;margin:0 0 8px;">New Comment on Ticket</h2>
      <p style="color:#a0a0b0;margin:0 0 16px;">${params.name} commented on ticket <strong style="color:#6366f1;">${params.ticketNumber}</strong></p>
      <div style="background:#12121a;border-radius:8px;padding:16px;margin-bottom:16px;">
        <p style="color:#ddd;font-size:14px;margin:0;">${params.comment}</p>
      </div>
    `),

  ticketResolved: (params: { ticketNumber: string; title: string }) =>
    wrapTemplate(`
      <h2 style="color:#fff;margin:0 0 8px;">Ticket Resolved</h2>
      <p style="color:#a0a0b0;margin:0 0 16px;">Your ticket has been resolved.</p>
      <div style="background:#12121a;border-radius:8px;padding:16px;margin-bottom:16px;">
        <p style="color:#6366f1;font-family:monospace;font-size:12px;margin:0 0 4px;">${params.ticketNumber}</p>
        <p style="color:#fff;font-size:16px;font-weight:600;margin:0;">${params.title}</p>
      </div>
      <p style="color:#22c55e;font-size:14px;">If this issue persists, you can reopen the ticket from your dashboard.</p>
    `),

  assetAssigned: (params: { assetName: string; assetTag: string; assignedBy: string }) =>
    wrapTemplate(`
      <h2 style="color:#fff;margin:0 0 8px;">Asset Assigned to You</h2>
      <p style="color:#a0a0b0;margin:0 0 16px;">A new asset has been assigned to your account.</p>
      <div style="background:#12121a;border-radius:8px;padding:16px;margin-bottom:16px;">
        <p style="color:#6366f1;font-family:monospace;font-size:12px;margin:0 0 4px;">${params.assetTag}</p>
        <p style="color:#fff;font-size:16px;font-weight:600;margin:0 0 4px;">${params.assetName}</p>
        <p style="color:#888;font-size:13px;margin:0;">Assigned by ${params.assignedBy}</p>
      </div>
    `),
};
