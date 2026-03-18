import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyAuth, requireMinRole } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
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

    const searchParams = req.nextUrl.searchParams;
    const where: Prisma.AssetWhereInput = { deletedAt: null };

    const category = searchParams.get('category');
    const status = searchParams.get('status');
    if (category) where.category = category as Prisma.EnumAssetCategoryFilter;
    if (status) where.status = status as Prisma.EnumAssetStatusFilter;

    const assets = await prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        currentAssignee: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    const header = 'Asset Tag,Name,Category,Brand,Model,Serial Number,Status,Condition,Assigned To,Purchase Date,Purchase Price,Warranty Expiry\n';
    const rows = assets.map((a) => {
      const assignee = a.currentAssignee
        ? `${a.currentAssignee.firstName} ${a.currentAssignee.lastName}`
        : '';
      return [
        a.assetTag, a.name, a.category, a.brand || '', a.model || '',
        a.serialNumber || '', a.status, a.condition, assignee,
        a.purchaseDate ? a.purchaseDate.toISOString().split('T')[0] : '',
        a.purchasePrice?.toString() || '',
        a.warrantyExpiry ? a.warrantyExpiry.toISOString().split('T')[0] : '',
      ].map((v) => `"${v}"`).join(',');
    }).join('\n');

    const csv = header + rows;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="assets-export.csv"',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to export assets';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
