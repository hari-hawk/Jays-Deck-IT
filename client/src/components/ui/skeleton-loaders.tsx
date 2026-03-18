'use client';

import { cn } from '@/lib/utils';

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn('skeleton-shimmer rounded-md', className)}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
      aria-hidden="true"
    >
      <div className="flex items-start justify-between mb-3">
        <Bone className="h-10 w-10 rounded-lg" />
        <Bone className="h-6 w-20 rounded-full" />
      </div>
      <Bone className="h-4 w-3/4 mt-3" />
      <Bone className="h-3 w-1/2 mt-2" />
      <Bone className="h-3 w-2/3 mt-2" />
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div
      className="flex items-center justify-between rounded-xl border p-4"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Bone className="h-10 w-10 rounded-lg shrink-0" />
        <div className="flex-1">
          <Bone className="h-4 w-48 mb-2" />
          <Bone className="h-3 w-32" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Bone className="h-6 w-16 rounded-full" />
        <Bone className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="border-b px-4 py-3" style={{ borderColor: 'var(--border-primary)' }}>
          <Bone className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

export function MetricCardSkeleton() {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
      aria-hidden="true"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Bone className="h-10 w-10 rounded-lg" />
          <div>
            <Bone className="h-8 w-16 mb-2" />
            <Bone className="h-3 w-24" />
          </div>
        </div>
        <Bone className="h-6 w-14 rounded-md" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
      aria-hidden="true"
    >
      <Bone className="h-3 w-32 mb-2" />
      <Bone className="h-3 w-48 mb-4" />
      <Bone className="h-[300px] w-full rounded-lg" />
    </div>
  );
}

export function PageSkeleton({ type = 'cards', count = 6 }: { type?: 'cards' | 'list' | 'table'; count?: number }) {
  return (
    <div className="space-y-6 p-6 md:p-8" role="status" aria-label="Loading content">
      <span className="sr-only">Loading...</span>
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Bone className="h-3 w-24 mb-2" />
          <Bone className="h-3 w-48" />
        </div>
        <Bone className="h-10 w-32 rounded-lg" />
      </div>

      {/* Filter skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Bone className="h-10 w-full max-w-sm rounded-lg" />
        <Bone className="h-10 w-36 rounded-lg" />
        <Bone className="h-10 w-36 rounded-lg" />
      </div>

      {/* Content skeleton */}
      {type === 'cards' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}
      {type === 'list' && (
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      )}
      {type === 'table' && (
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-primary)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <th key={i} className="border-b px-4 py-3" style={{ borderColor: 'var(--border-primary)' }}>
                    <Bone className="h-3 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: count }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-6 md:p-8" role="status" aria-label="Loading dashboard">
      <span className="sr-only">Loading dashboard...</span>
      <div>
        <Bone className="h-3 w-32 mb-3" />
        <Bone className="h-8 w-48 mb-2" />
        <Bone className="h-3 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><ChartSkeleton /></div>
        <ChartSkeleton />
      </div>
    </div>
  );
}
