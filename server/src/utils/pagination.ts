export interface PaginationParams {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
}

export function parsePagination(query: Record<string, unknown>): PaginationParams {
  return {
    page: Math.max(1, parseInt(query.page as string) || 1),
    limit: Math.min(100, Math.max(1, parseInt(query.limit as string) || 25)),
    sort: (query.sort as string) || 'createdAt',
    order: (query.order as string) === 'asc' ? 'asc' : 'desc',
  };
}

export function paginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
