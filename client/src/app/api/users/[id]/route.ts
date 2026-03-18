import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifyAuth, requireMinRole, requireRole } from '@/lib/auth-helpers';

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

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch user';
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
    if (!requireMinRole(authUser.role, 'IT_ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const data = await req.json();

    const user = await prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Don't allow updating passwordHash directly
    const { password, passwordHash, ...updateData } = data as Record<string, unknown>;
    if (password) {
      (updateData as Record<string, unknown>).passwordHash = await bcrypt.hash(password as string, 12);
    }
    if (updateData.dateOfJoining) {
      updateData.dateOfJoining = new Date(updateData.dateOfJoining as string);
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

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update user';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }
    if (!requireRole(authUser.role, 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Only SUPER_ADMIN can delete users' } },
        { status: 403 }
      );
    }

    const { id } = await params;

    const user = await prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'OFFBOARDED' },
    });

    return NextResponse.json({ success: true, data: { message: 'User deleted successfully' } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete user';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
