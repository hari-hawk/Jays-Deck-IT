import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';
import { PaginationParams } from '../utils/pagination.js';

export class AssetsService {
  async list(pagination: PaginationParams, filters: Record<string, unknown>) {
    const where: Prisma.AssetWhereInput = { deletedAt: null };

    if (filters.category) where.category = filters.category as Prisma.EnumAssetCategoryFilter;
    if (filters.status) where.status = filters.status as Prisma.EnumAssetStatusFilter;
    if (filters.condition) where.condition = filters.condition as Prisma.EnumAssetConditionFilter;
    if (filters.assigneeId) where.currentAssigneeId = filters.assigneeId as string;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search as string, mode: 'insensitive' } },
        { assetTag: { contains: filters.search as string, mode: 'insensitive' } },
        { brand: { contains: filters.search as string, mode: 'insensitive' } },
        { serialNumber: { contains: filters.search as string, mode: 'insensitive' } },
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

    return { assets, total };
  }

  async getById(id: string) {
    const asset = await prisma.asset.findFirst({
      where: { id, deletedAt: null },
      include: {
        currentAssignee: { select: { id: true, firstName: true, lastName: true, email: true, department: true } },
        assignments: {
          take: 10,
          orderBy: { assignedAt: 'desc' },
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
            assignedBy: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
    if (!asset) throw new Error('Asset not found');
    return asset;
  }

  async create(data: {
    assetTag: string;
    name: string;
    category: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    condition?: string;
    purchaseDate?: string;
    purchasePrice?: number;
    vendor?: string;
    warrantyExpiry?: string;
    specifications?: any;
    notes?: string;
  }) {
    const existing = await prisma.asset.findUnique({ where: { assetTag: data.assetTag } });
    if (existing) throw new Error('Asset with this tag already exists');

    const asset = await prisma.asset.create({
      data: {
        assetTag: data.assetTag,
        name: data.name,
        category: data.category as any,
        brand: data.brand,
        model: data.model,
        serialNumber: data.serialNumber,
        condition: (data.condition as any) || 'NEW',
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        purchasePrice: data.purchasePrice,
        vendor: data.vendor,
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : undefined,
        specifications: data.specifications,
        notes: data.notes,
      },
    });

    return asset;
  }

  async update(id: string, data: Record<string, unknown>) {
    const asset = await prisma.asset.findFirst({ where: { id, deletedAt: null } });
    if (!asset) throw new Error('Asset not found');

    const updateData = { ...data } as any;
    if (updateData.purchaseDate) updateData.purchaseDate = new Date(updateData.purchaseDate);
    if (updateData.warrantyExpiry) updateData.warrantyExpiry = new Date(updateData.warrantyExpiry);
    // Prevent direct status/assignee manipulation through update
    delete updateData.currentAssigneeId;

    const updated = await prisma.asset.update({ where: { id }, data: updateData });
    return updated;
  }

  async softDelete(id: string) {
    const asset = await prisma.asset.findFirst({ where: { id, deletedAt: null } });
    if (!asset) throw new Error('Asset not found');

    await prisma.asset.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async assign(id: string, userId: string, assignedById: string, notes?: string) {
    const asset = await prisma.asset.findFirst({ where: { id, deletedAt: null } });
    if (!asset) throw new Error('Asset not found');
    if (asset.status === 'ASSIGNED') throw new Error('Asset is already assigned');
    if (asset.status === 'RETIRED' || asset.status === 'DISPOSED') {
      throw new Error('Cannot assign a retired or disposed asset');
    }

    const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!user) throw new Error('User not found');

    const [updatedAsset] = await prisma.$transaction([
      prisma.asset.update({
        where: { id },
        data: { status: 'ASSIGNED', currentAssigneeId: userId },
      }),
      prisma.assetAssignment.create({
        data: {
          assetId: id,
          userId,
          assignedById,
          notes,
          conditionAtAssign: asset.condition,
        },
      }),
    ]);

    return updatedAsset;
  }

  async unassign(id: string, conditionAtReturn?: string, notes?: string) {
    const asset = await prisma.asset.findFirst({ where: { id, deletedAt: null } });
    if (!asset) throw new Error('Asset not found');
    if (asset.status !== 'ASSIGNED') throw new Error('Asset is not currently assigned');

    // Find the active assignment
    const activeAssignment = await prisma.assetAssignment.findFirst({
      where: { assetId: id, returnedAt: null },
      orderBy: { assignedAt: 'desc' },
    });

    const txOps: any[] = [
      prisma.asset.update({
        where: { id },
        data: {
          status: 'AVAILABLE',
          currentAssigneeId: null,
          condition: (conditionAtReturn as any) || asset.condition,
        },
      }),
    ];

    if (activeAssignment) {
      txOps.push(
        prisma.assetAssignment.update({
          where: { id: activeAssignment.id },
          data: {
            returnedAt: new Date(),
            conditionAtReturn: (conditionAtReturn as any) || undefined,
          },
        })
      );
    }

    const [updatedAsset] = await prisma.$transaction(txOps);
    return updatedAsset;
  }

  async markMaintenance(id: string, notes?: string) {
    const asset = await prisma.asset.findFirst({ where: { id, deletedAt: null } });
    if (!asset) throw new Error('Asset not found');

    const updated = await prisma.asset.update({
      where: { id },
      data: { status: 'IN_MAINTENANCE', notes: notes || asset.notes },
    });

    return updated;
  }

  async retire(id: string, notes?: string) {
    const asset = await prisma.asset.findFirst({ where: { id, deletedAt: null } });
    if (!asset) throw new Error('Asset not found');

    // Unassign first if currently assigned
    if (asset.status === 'ASSIGNED') {
      const activeAssignment = await prisma.assetAssignment.findFirst({
        where: { assetId: id, returnedAt: null },
        orderBy: { assignedAt: 'desc' },
      });
      if (activeAssignment) {
        await prisma.assetAssignment.update({
          where: { id: activeAssignment.id },
          data: { returnedAt: new Date() },
        });
      }
    }

    const updated = await prisma.asset.update({
      where: { id },
      data: { status: 'RETIRED', currentAssigneeId: null, notes: notes || asset.notes },
    });

    return updated;
  }

  async getHistory(id: string) {
    const asset = await prisma.asset.findFirst({ where: { id, deletedAt: null } });
    if (!asset) throw new Error('Asset not found');

    const history = await prisma.assetAssignment.findMany({
      where: { assetId: id },
      orderBy: { assignedAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return history;
  }

  async exportCsv(filters: Record<string, unknown>) {
    const where: Prisma.AssetWhereInput = { deletedAt: null };

    if (filters.category) where.category = filters.category as Prisma.EnumAssetCategoryFilter;
    if (filters.status) where.status = filters.status as Prisma.EnumAssetStatusFilter;

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

    return header + rows;
  }
}

export const assetsService = new AssetsService();
