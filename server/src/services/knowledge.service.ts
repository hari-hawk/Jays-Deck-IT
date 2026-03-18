import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';
import { PaginationParams } from '../utils/pagination.js';

export class KnowledgeService {
  async list(pagination: PaginationParams, filters: Record<string, unknown>) {
    const where: Prisma.KnowledgeArticleWhereInput = { deletedAt: null };

    if (filters.category) where.category = filters.category as string;
    if (filters.isPublished !== undefined) where.isPublished = filters.isPublished === 'true';
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search as string, mode: 'insensitive' } },
        { content: { contains: filters.search as string, mode: 'insensitive' } },
      ];
    }
    if (filters.tag) {
      where.tags = { has: filters.tag as string };
    }

    const [articles, total] = await Promise.all([
      prisma.knowledgeArticle.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { [pagination.sort]: pagination.order },
        select: {
          id: true, title: true, category: true, tags: true,
          isPublished: true, viewCount: true,
          author: { select: { id: true, firstName: true, lastName: true } },
          createdAt: true, updatedAt: true,
        },
      }),
      prisma.knowledgeArticle.count({ where }),
    ]);

    return { articles, total };
  }

  async getById(id: string) {
    const article = await prisma.knowledgeArticle.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
    if (!article) throw new Error('Article not found');

    // Increment view count
    await prisma.knowledgeArticle.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return article;
  }

  async create(data: {
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    authorId: string;
    isPublished?: boolean;
  }) {
    const article = await prisma.knowledgeArticle.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
        authorId: data.authorId,
        isPublished: data.isPublished ?? false,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return article;
  }

  async update(id: string, data: Record<string, unknown>) {
    const article = await prisma.knowledgeArticle.findFirst({ where: { id, deletedAt: null } });
    if (!article) throw new Error('Article not found');

    const { authorId, ...updateData } = data as any;

    const updated = await prisma.knowledgeArticle.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return updated;
  }

  async softDelete(id: string) {
    const article = await prisma.knowledgeArticle.findFirst({ where: { id, deletedAt: null } });
    if (!article) throw new Error('Article not found');

    await prisma.knowledgeArticle.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const knowledgeService = new KnowledgeService();
