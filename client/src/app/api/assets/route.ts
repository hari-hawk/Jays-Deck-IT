import { NextRequest, NextResponse } from 'next/server';
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
    const where: Prisma.AssetWhereInput = { deletedAt: null };

    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const condition = searchParams.get('condition');
    const assigneeId = searchParams.get('assigneeId');
    const search = searchParams.get('search');

    if (category) where.category = category as Prisma.EnumAssetCategoryFilter;
    if (status) where.status = status as Prisma.EnumAssetStatusFilter;
    if (condition) where.condition = condition as Prisma.EnumAssetConditionFilter;
    if (assigneeId) where.currentAssigneeId = assigneeId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { assetTag: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { [pagination.sort]: pagination.order },
        select: {
          id: true, assetTag: true, name: true, category: true, brand: true,
          model: true, serialNumber: true, status: true, condition: true,
          purchaseDate: true, purchasePrice: true, warrantyExpiry: true,
          currentAssignee: { select: { id: true, firstName: true, lastName: true } },
          createdAt: true, updatedAt: true,
        },
      }),
      prisma.asset.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: assets,
      meta: paginationMeta(pagination.page, pagination.limit, total),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch assets';
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

    if (!data.assetTag || !data.name || !data.category) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: assetTag, name, category' } },
        { status: 400 }
      );
    }

    const existing = await prisma.asset.findUnique({ where: { assetTag: data.assetTag } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: 'Asset with this tag already exists' } },
        { status: 409 }
      );
    }

    const asset = await prisma.asset.create({
      data: {
        assetTag: data.assetTag,
        name: data.name,
        category: data.category,
        brand: data.brand,
        model: data.model,
        serialNumber: data.serialNumber,
        condition: data.condition || 'NEW',
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        purchasePrice: data.purchasePrice,
        vendor: data.vendor,
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : undefined,
        specifications: data.specifications,
        notes: data.notes,
      },
    });

    return NextResponse.json({ success: true, data: asset }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create asset';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
