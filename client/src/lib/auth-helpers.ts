import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  } as jwt.SignOptions);
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
}

export async function verifyAuth(req: NextRequest): Promise<TokenPayload | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.split(' ')[1];
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export function requireRole(userRole: string, ...allowed: string[]): boolean {
  return allowed.includes(userRole);
}

export function requireMinRole(userRole: string, minRole: string): boolean {
  const hierarchy: Record<string, number> = {
    SUPER_ADMIN: 4,
    IT_ADMIN: 3,
    MANAGER: 2,
    EMPLOYEE: 1,
  };
  return (hierarchy[userRole] || 0) >= (hierarchy[minRole] || 0);
}

// Pagination helpers
export interface PaginationParams {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
}

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  return {
    page: Math.max(1, parseInt(searchParams.get('page') || '1')),
    limit: Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25'))),
    sort: searchParams.get('sort') || 'createdAt',
    order: searchParams.get('order') === 'asc' ? 'asc' : 'desc',
  };
}

export function paginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
