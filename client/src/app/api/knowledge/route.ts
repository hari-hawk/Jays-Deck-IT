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
    const where: Prisma.KnowledgeArticleWhereInput = { deletedAt: null };

    const category = searchParams.get('category');
    const isPublished = searchParams.get('isPublished');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');

    if (category) where.category = category;
    if (isPublished !== null && isPublished !== undefined) where.isPublished = isPublished === 'true';
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (tag) {
      where.tags = { has: tag };
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

    return NextResponse.json({
      success: true,
      data: articles,
      meta: paginationMeta(pagination.page, pagination.limit, total),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch articles';
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

    if (!data.title || !data.content) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: title, content' } },
        { status: 400 }
      );
    }

    const article = await prisma.knowledgeArticle.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
        authorId: authUser.userId,
        isPublished: data.isPublished ?? false,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ success: true, data: article }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create article';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
