import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-helpers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const ticket = await prisma.ticket.findFirst({
      where: { id, deletedAt: null },
      include: {
        reporter: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
        relatedAsset: { select: { id: true, assetTag: true, name: true, category: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        attachments: {
          include: {
            uploadedBy: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Ticket not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch ticket';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}

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
    const data = await req.json();

    const ticket = await prisma.ticket.findFirst({ where: { id, deletedAt: null } });
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Ticket not found' } },
        { status: 404 }
      );
    }

    // Filter out fields that shouldn't be directly updated
    const { reporterId, ticketNumber, ...updateData } = data;

    const updated = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        reporter: { select: { id: true, firstName: true, lastName: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update ticket';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
