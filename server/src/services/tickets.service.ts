import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';
import { PaginationParams } from '../utils/pagination.js';

function generateTicketNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${y}${m}-${rand}`;
}

export class TicketsService {
  async list(pagination: PaginationParams, filters: Record<string, unknown>) {
    const where: Prisma.TicketWhereInput = { deletedAt: null };

    if (filters.status) where.status = filters.status as Prisma.EnumTicketStatusFilter;
    if (filters.priority) where.priority = filters.priority as Prisma.EnumTicketPriorityFilter;
    if (filters.category) where.category = filters.category as Prisma.EnumTicketCategoryFilter;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId as string;
    if (filters.reporterId) where.reporterId = filters.reporterId as string;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search as string, mode: 'insensitive' } },
        { ticketNumber: { contains: filters.search as string, mode: 'insensitive' } },
        { description: { contains: filters.search as string, mode: 'insensitive' } },
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

    return { tickets, total };
  }

  async getById(id: string) {
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
    if (!ticket) throw new Error('Ticket not found');
    return ticket;
  }

  async create(data: {
    title: string;
    description: string;
    category: string;
    priority?: string;
    reporterId: string;
    assigneeId?: string;
    relatedAssetId?: string;
  }) {
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
        category: data.category as any,
        priority: (data.priority as any) || 'MEDIUM',
        reporterId: data.reporterId,
        assigneeId: data.assigneeId,
        relatedAssetId: data.relatedAssetId,
        slaDeadline,
      },
      include: {
        reporter: { select: { id: true, firstName: true, lastName: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return ticket;
  }

  async update(id: string, data: Record<string, unknown>) {
    const ticket = await prisma.ticket.findFirst({ where: { id, deletedAt: null } });
    if (!ticket) throw new Error('Ticket not found');

    // Filter out fields that shouldn't be directly updated
    const { reporterId, ticketNumber, ...updateData } = data as any;

    const updated = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        reporter: { select: { id: true, firstName: true, lastName: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return updated;
  }

  async addComment(ticketId: string, authorId: string, content: string, isInternal = false) {
    const ticket = await prisma.ticket.findFirst({ where: { id: ticketId, deletedAt: null } });
    if (!ticket) throw new Error('Ticket not found');

    const comment = await prisma.ticketComment.create({
      data: {
        ticketId,
        authorId,
        content,
        isInternal,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    return comment;
  }

  async resolve(id: string) {
    const ticket = await prisma.ticket.findFirst({ where: { id, deletedAt: null } });
    if (!ticket) throw new Error('Ticket not found');
    if (ticket.status === 'CLOSED') throw new Error('Ticket is already closed');

    const updated = await prisma.ticket.update({
      where: { id },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    });

    return updated;
  }

  async close(id: string) {
    const ticket = await prisma.ticket.findFirst({ where: { id, deletedAt: null } });
    if (!ticket) throw new Error('Ticket not found');

    const updated = await prisma.ticket.update({
      where: { id },
      data: { status: 'CLOSED', closedAt: new Date() },
    });

    return updated;
  }

  async escalate(id: string) {
    const ticket = await prisma.ticket.findFirst({ where: { id, deletedAt: null } });
    if (!ticket) throw new Error('Ticket not found');
    if (ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') {
      throw new Error('Cannot escalate a resolved or closed ticket');
    }

    // Bump priority if possible
    const priorityOrder = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const currentIdx = priorityOrder.indexOf(ticket.priority);
    const newPriority = currentIdx < priorityOrder.length - 1
      ? priorityOrder[currentIdx + 1]
      : ticket.priority;

    const updated = await prisma.ticket.update({
      where: { id },
      data: { status: 'ESCALATED', priority: newPriority as any },
    });

    return updated;
  }
}

export const ticketsService = new TicketsService();
