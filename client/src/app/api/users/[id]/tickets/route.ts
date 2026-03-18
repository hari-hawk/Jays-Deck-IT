import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyAuth, parsePagination, paginationMeta } from '@/lib/auth-helpers';

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
    const pagination = parsePagination(req.nextUrl.searchParams);

    const user = await prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const where: Prisma.TicketWhereInput = {
      deletedAt: null,
      OR: [{ reporterId: id }, { assigneeId: id }],
    };

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { [pagination.sort]: pagination.order },
        select: {
          id: true, ticketNumber: true, title: true, category: true,
          priority: true, status: true, createdAt: true,
          reporter: { select: { id: true, firstName: true, lastName: true } },
          assignee: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: tickets,
      meta: paginationMeta(pagination.page, pagination.limit, total),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch user tickets';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
