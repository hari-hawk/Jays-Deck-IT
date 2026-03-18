import { prisma } from './prisma';

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: 'TICKET_UPDATE' | 'ASSET_ASSIGNED' | 'ACCESS_GRANTED' | 'SLA_WARNING' | 'SYSTEM';
  link?: string;
}) {
  return prisma.notification.create({ data: params });
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
    select: { id: true },
  });

  await Promise.all(
    users.map((u) =>
      prisma.notification.create({
        data: { userId: u.id, ...payload },
      }),
    ),
  );
}
