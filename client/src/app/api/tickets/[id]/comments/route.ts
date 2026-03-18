import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-helpers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const { id: ticketId } = await params;
    const { content, isInternal } = await req.json();

    if (!content) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Content is required' } },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.findFirst({ where: { id: ticketId, deletedAt: null } });
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Ticket not found' } },
        { status: 404 }
      );
    }

    const comment = await prisma.ticketComment.create({
      data: {
        ticketId,
        authorId: authUser.userId,
        content,
        isInternal: isInternal || false,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add comment';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
