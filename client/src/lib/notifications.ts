import { prisma } from './prisma';
import { sendEmail, emailTemplates } from './email';

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: 'TICKET_UPDATE' | 'ASSET_ASSIGNED' | 'ACCESS_GRANTED' | 'SLA_WARNING' | 'SYSTEM';
  link?: string;
}) {
  const notification = await prisma.notification.create({ data: params });

  // Also send email notification (non-blocking)
  sendEmailForNotification(params.userId, params).catch(() => {});

  return notification;
}

/**
 * Notify all users with a given role (e.g. IT_ADMIN).
 * Silently swallows errors so it never breaks the caller.
 */
export async function notifyByRole(
  role: string,
  payload: {
    title: string;
    message: string;
    type: 'TICKET_UPDATE' | 'ASSET_ASSIGNED' | 'ACCESS_GRANTED' | 'SLA_WARNING' | 'SYSTEM';
    link?: string;
  },
) {
  // Notify the specified role AND all SUPER_ADMINs
  const users = await prisma.user.findMany({
    where: {
      role: { in: [role as never, 'SUPER_ADMIN' as never] },
      deletedAt: null,
      status: 'ACTIVE',
    },
    select: { id: true, email: true },
  });

  await Promise.all(
    users.map(async (u) => {
      await prisma.notification.create({
        data: { userId: u.id, ...payload },
      });
      // Send email (non-blocking)
      sendEmail({
        to: u.email,
        subject: payload.title,
        html: `<p>${payload.message}</p>`,
      }).catch(() => {});
    }),
  );
}

/**
 * Notify all watchers of a ticket.
 */
export async function notifyTicketWatchers(
  ticketId: string,
  payload: {
    title: string;
    message: string;
    type: 'TICKET_UPDATE';
    link?: string;
  },
  excludeUserId?: string,
) {
  const watchers = await prisma.ticketWatcher.findMany({
    where: { ticketId },
    include: { user: { select: { id: true, email: true } } },
  });

  await Promise.all(
    watchers
      .filter((w) => w.userId !== excludeUserId)
      .map(async (w) => {
        await prisma.notification.create({
          data: { userId: w.userId, ...payload },
        });
        sendEmail({
          to: w.user.email,
          subject: payload.title,
          html: `<p>${payload.message}</p>`,
        }).catch(() => {});
      }),
  );
}

// ── Internal helper ─────────────────────────────────

async function sendEmailForNotification(
  userId: string,
  params: { title: string; message: string; type: string },
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user) return;

    await sendEmail({
      to: user.email,
      subject: params.title,
      html: `<p>${params.message}</p>`,
    });
  } catch {
    // Silently fail - email is best-effort
  }
}
