import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyAuth, parsePagination, paginationMeta } from '@/lib/auth-helpers';
import { notifyByRole } from '@/lib/notifications';

function generateTicketNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${y}${m}-${rand}`;
}

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const pagination = parsePagination(searchParams);
    const where: Prisma.TicketWhereInput = { deletedAt: null };

    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const assigneeId = searchParams.get('assigneeId');
    const reporterId = searchParams.get('reporterId');
    const search = searchParams.get('search');

    if (status) where.status = status as Prisma.EnumTicketStatusFilter;
    if (priority) where.priority = priority as Prisma.EnumTicketPriorityFilter;
    if (category) where.category = category as Prisma.EnumTicketCategoryFilter;
    if (assigneeId) where.assigneeId = assigneeId;
    if (reporterId) where.reporterId = reporterId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { ticketNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { [pagination.sort]: pagination.order },
        select: {
          id: true, ticketNumber: true, title: true, category: true,
          priority: true, status: true, slaDeadline: true,
          createdAt: true, updatedAt: true,
          reporter: { select: { id: true, firstName: true, lastName: true } },
          assignee: { select: { id: true, firstName: true, lastName: true } },
          relatedAsset: { select: { id: true, assetTag: true, name: true } },
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
    const message = err instanceof Error ? err.message : 'Failed to fetch tickets';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const data = await req.json();

    if (!data.title || !data.description || !data.category) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: title, description, category' } },
        { status: 400 }
      );
    }

    // Generate unique ticket number with retry
    let ticketNumber = generateTicketNumber();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.ticket.findUnique({ where: { ticketNumber } });
      if (!existing) break;
      ticketNumber = generateTicketNumber();
      attempts++;
    }

    // Calculate SLA deadline based on priority
    const slaHours: Record<string, number> = { URGENT: 4, HIGH: 8, MEDIUM: 24, LOW: 72 };
    const priority = data.priority || 'MEDIUM';
    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + (slaHours[priority] || 24));

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority || 'MEDIUM',
        reporterId: authUser.userId,
        assigneeId: data.assigneeId,
        relatedAssetId: data.relatedAssetId,
        slaDeadline,
      },
      include: {
        reporter: { select: { id: true, firstName: true, lastName: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Notify all IT_ADMIN users about the new ticket
    try {
      await notifyByRole('IT_ADMIN', {
        title: 'New ticket created',
        message: `New ticket: ${data.title}`,
        type: 'TICKET_UPDATE',
        link: `/tickets/${ticket.id}`,
      });
    } catch {
      // Notification failure should not break ticket creation
    }

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create ticket';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
