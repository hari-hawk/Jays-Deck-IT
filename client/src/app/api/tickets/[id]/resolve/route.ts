import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, requireMinRole } from '@/lib/auth-helpers';
import { createNotification } from '@/lib/notifications';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }
    if (!requireMinRole(authUser.role, 'IT_ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }

    const { id } = await params;

    const ticket = await prisma.ticket.findFirst({ where: { id, deletedAt: null } });
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Ticket not found' } },
        { status: 404 }
      );
    }
    if (ticket.status === 'CLOSED') {
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: 'Ticket is already closed' } },
        { status: 409 }
      );
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    });

    // Notify the ticket reporter that their ticket has been resolved
    try {
      if (ticket.reporterId) {
        await createNotification({
          userId: ticket.reporterId,
          title: 'Ticket resolved',
          message: `Your ticket ${ticket.ticketNumber} has been resolved`,
          type: 'TICKET_UPDATE',
          link: `/tickets/${id}`,
        });
      }
    } catch {
      // Notification failure should not break ticket resolution
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to resolve ticket';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
