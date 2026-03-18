import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';
import { PaginationParams } from '../utils/pagination.js';

export class UsersService {
  async list(pagination: PaginationParams, filters: Record<string, unknown>) {
    const where: Prisma.UserWhereInput = { deletedAt: null };

    if (filters.role) where.role = filters.role as Prisma.EnumRoleFilter;
    if (filters.department) where.department = { contains: filters.department as string, mode: 'insensitive' };
    if (filters.location) where.location = filters.location as Prisma.EnumLocationFilter;
    if (filters.status) where.status = filters.status as Prisma.EnumUserStatusFilter;
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search as string, mode: 'insensitive' } },
        { lastName: { contains: filters.search as string, mode: 'insensitive' } },
        { email: { contains: filters.search as string, mode: 'insensitive' } },
        { employeeId: { contains: filters.search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { [pagination.sort]: pagination.order },
        select: {
          id: true, email: true, firstName: true, lastName: true, avatarUrl: true,
          role: true, department: true, designation: true, employeeId: true,
          phone: true, location: true, dateOfJoining: true, status: true,
          createdAt: true, updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async getById(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true, email: true, firstName: true, lastName: true, avatarUrl: true,
        role: true, department: true, designation: true, employeeId: true,
        phone: true, location: true, dateOfJoining: true, status: true,
        managerId: true,
        manager: { select: { id: true, firstName: true, lastName: true } },
        assignedAssets: {
          where: { deletedAt: null },
          select: { id: true, assetTag: true, name: true, category: true, status: true },
        },
        createdAt: true, updatedAt: true,
      },
    });
    if (!user) throw new Error('User not found');
    return user;
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    department?: string;
    designation?: string;
    employeeId: string;
    phone?: string;
    location?: string;
    dateOfJoining?: string;
    managerId?: string;
    avatarUrl?: string;
  }) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { employeeId: data.employeeId }] },
    });
    if (existing) throw new Error('User with this email or employee ID already exists');

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: (data.role as any) || 'EMPLOYEE',
        department: data.department,
        designation: data.designation,
        employeeId: data.employeeId,
        phone: data.phone,
        location: (data.location as any) || 'USA',
        dateOfJoining: data.dateOfJoining ? new Date(data.dateOfJoining) : undefined,
        managerId: data.managerId,
        avatarUrl: data.avatarUrl,
      },
      select: {
        id: true, email: true, firstName: true, lastName: true, role: true,
        department: true, designation: true, employeeId: true, phone: true,
        location: true, dateOfJoining: true, status: true, createdAt: true,
      },
    });

    return user;
  }

  async update(id: string, data: Record<string, unknown>) {
    const user = await prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) throw new Error('User not found');

    // Don't allow updating passwordHash directly
    const { password, passwordHash, ...updateData } = data as any;
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }
    if (updateData.dateOfJoining) {
      updateData.dateOfJoining = new Date(updateData.dateOfJoining);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true, email: true, firstName: true, lastName: true, avatarUrl: true,
        role: true, department: true, designation: true, employeeId: true,
        phone: true, location: true, dateOfJoining: true, status: true, updatedAt: true,
      },
    });

    return updated;
  }

  async softDelete(id: string) {
    const user = await prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) throw new Error('User not found');

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'OFFBOARDED' },
    });
  }

  async getUserAssets(userId: string) {
    const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!user) throw new Error('User not found');

    return prisma.asset.findMany({
      where: { currentAssigneeId: userId, deletedAt: null },
      select: {
        id: true, assetTag: true, name: true, category: true, brand: true,
        model: true, serialNumber: true, status: true, condition: true,
      },
    });
  }

  async getUserTickets(userId: string, pagination: PaginationParams) {
    const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!user) throw new Error('User not found');

    const where: Prisma.TicketWhereInput = {
      deletedAt: null,
      OR: [{ reporterId: userId }, { assigneeId: userId }],
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

    return { tickets, total };
  }
}

export const usersService = new UsersService();
