import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, requireMinRole } from '@/lib/auth-helpers';

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

    const article = await prisma.knowledgeArticle.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Article not found' } },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.knowledgeArticle.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: article });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch article';
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

    const article = await prisma.knowledgeArticle.findFirst({ where: { id, deletedAt: null } });
    if (!article) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Article not found' } },
        { status: 404 }
      );
    }

    const { authorId, ...updateData } = data;

    const updated = await prisma.knowledgeArticle.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update article';
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
    if (!requireMinRole(authUser.role, 'IT_ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }

    const { id } = await params;

    const article = await prisma.knowledgeArticle.findFirst({ where: { id, deletedAt: null } });
    if (!article) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Article not found' } },
        { status: 404 }
      );
    }

    await prisma.knowledgeArticle.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, data: { message: 'Article deleted successfully' } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete article';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
