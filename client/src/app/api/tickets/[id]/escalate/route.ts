import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-helpers';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
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
    if (ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') {
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: 'Cannot escalate a resolved or closed ticket' } },
        { status: 409 }
      );
    }

    // Bump priority if possible
    const priorityOrder = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const currentIdx = priorityOrder.indexOf(ticket.priority);
    const newPriority = currentIdx < priorityOrder.length - 1
      ? priorityOrder[currentIdx + 1]
      : ticket.priority;

    const updated = await prisma.ticket.update({
      where: { id },
      data: { status: 'ESCALATED', priority: newPriority as typeof ticket.priority },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to escalate ticket';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
