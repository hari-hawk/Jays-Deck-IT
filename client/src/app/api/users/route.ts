import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyAuth, requireMinRole, parsePagination, paginationMeta } from '@/lib/auth-helpers';

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
    const where: Prisma.UserWhereInput = { deletedAt: null };

    const role = searchParams.get('role');
    const department = searchParams.get('department');
    const location = searchParams.get('location');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    if (role) where.role = role as Prisma.EnumRoleFilter;
    if (department) where.department = { contains: department, mode: 'insensitive' };
    if (location) where.location = location as Prisma.EnumLocationFilter;
    if (status) where.status = status as Prisma.EnumUserStatusFilter;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
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

    return NextResponse.json({
      success: true,
      data: users,
      meta: paginationMeta(pagination.page, pagination.limit, total),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch users';
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
    if (!requireMinRole(authUser.role, 'IT_ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }

    const data = await req.json();

    if (!data.email || !data.password || !data.firstName || !data.lastName || !data.employeeId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: email, password, firstName, lastName, employeeId' } },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { employeeId: data.employeeId }] },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: 'User with this email or employee ID already exists' } },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'EMPLOYEE',
        department: data.department,
        designation: data.designation,
        employeeId: data.employeeId,
        phone: data.phone,
        location: data.location || 'USA',
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

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create user';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
