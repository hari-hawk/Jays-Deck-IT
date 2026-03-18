'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Plus, LayoutGrid, List, Monitor, Laptop, Smartphone, Headphones, HardDrive, FileCode, Package } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { EmptyState } from '@/components/ui/empty-state';
import { PageSkeleton } from '@/components/ui/skeleton-loaders';
import { PageTransition } from '@/components/layout/PageTransition';
import { useAssets } from '@/lib/queries';

const CATEGORY_ICONS: Record<string, typeof Monitor> = {
  LAPTOP: Laptop,
  DESKTOP: HardDrive,
  MONITOR: Monitor,
  PHONE: Smartphone,
  HEADSET: Headphones,
  SOFTWARE_LICENSE: FileCode,
  OTHER: Package,
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

interface Asset {
  id: string;
  name: string;
  assetTag: string;
  category: string;
  status: string;
  currentAssignee?: { id: string; firstName: string; lastName: string } | null;
}

export default function AssetsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: assets, isLoading, error } = useAssets({
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
  });

  if (isLoading) {
    return <PageSkeleton type="cards" count={8} />;
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Package}
          title="Failed to load assets"
          description="There was an error loading the assets. Please try again."
        />
      </div>
    );
  }

  const filtered = assets || [];

  return (
    <ErrorBoundary fallbackTitle="Asset Vault failed to load">
      <PageTransition>
      <div className="space-y-6 p-6 md:p-8">
        <PageHeader
          index="01"
          title="ASSET VAULT"
          description="Manage and track all company IT assets"
          actions={
            <Link href="/assets/new">
              <Button
                className="gap-2"
                style={{ background: 'var(--accent-primary)', color: '#fff' }}
              >
                <Plus className="size-4" />
                Add Asset
              </Button>
            </Link>
          }
        />

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} aria-hidden="true" />
              <Input
                placeholder="Search assets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                aria-label="Search assets"
              />
            </div>
            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-lg border px-3 text-sm min-h-[44px]"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            >
              <option value="ALL">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_MAINTENANCE">In Maintenance</option>
              <option value="RETIRED">Retired</option>
              <option value="LOST">Lost</option>
            </select>
            <label htmlFor="category-filter" className="sr-only">Filter by category</label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 rounded-lg border px-3 text-sm hidden sm:block min-h-[44px]"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            >
              <option value="ALL">All Categories</option>
              <option value="LAPTOP">Laptop</option>
              <option value="DESKTOP">Desktop</option>
              <option value="MONITOR">Monitor</option>
              <option value="PHONE">Phone</option>
              <option value="HEADSET">Headset</option>
              <option value="SOFTWARE_LICENSE">Software License</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="flex items-center gap-1 rounded-lg border p-1" style={{ borderColor: 'var(--border-primary)' }} role="group" aria-label="View mode">
            <button
              onClick={() => setViewMode('grid')}
              className="rounded-md p-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              style={{ background: viewMode === 'grid' ? 'var(--accent-primary-subtle)' : 'transparent', color: viewMode === 'grid' ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="rounded-md p-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              style={{ background: viewMode === 'list' ? 'var(--accent-primary-subtle)' : 'transparent', color: viewMode === 'list' ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              <List className="size-4" />
            </button>
          </div>
        </motion.div>

        {/* Results count */}
        <p className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }} aria-live="polite">
          {filtered.length} asset{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Grid View */}
        {filtered.length > 0 ? (
          viewMode === 'grid' ? (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filtered.map((asset: Asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-x-auto rounded-xl border"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                    <th scope="col" className="border-b px-4 py-3 text-left font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-primary)' }}>Asset</th>
                    <th scope="col" className="border-b px-4 py-3 text-left font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-primary)' }}>Tag</th>
                    <th scope="col" className="border-b px-4 py-3 text-left font-mono text-xs uppercase tracking-wider hidden md:table-cell" style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-primary)' }}>Category</th>
                    <th scope="col" className="border-b px-4 py-3 text-left font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-primary)' }}>Status</th>
                    <th scope="col" className="border-b px-4 py-3 text-left font-mono text-xs uppercase tracking-wider hidden lg:table-cell" style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-primary)' }}>Assignee</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((asset: Asset) => (
                    <tr
                      key={asset.id}
                      className="transition-colors hover:bg-[var(--bg-tertiary)]"
                      style={{ borderColor: 'var(--border-primary)' }}
                    >
                      <td className="border-b px-4 py-3" style={{ borderColor: 'var(--border-primary)' }}>
                        <Link href={`/assets/${asset.id}`} className="font-medium hover:underline" style={{ color: 'var(--text-primary)' }}>
                          {asset.name}
                        </Link>
                      </td>
                      <td className="border-b px-4 py-3 font-mono text-xs" style={{ color: 'var(--accent-primary)', borderColor: 'var(--border-primary)' }}>
                        {asset.assetTag}
                      </td>
                      <td className="border-b px-4 py-3 hidden md:table-cell text-xs uppercase" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-primary)' }}>
                        {asset.category}
                      </td>
                      <td className="border-b px-4 py-3" style={{ borderColor: 'var(--border-primary)' }}>
                        <StatusBadge status={asset.status} />
                      </td>
                      <td className="border-b px-4 py-3 hidden lg:table-cell text-sm" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-primary)' }}>
                        {asset.currentAssignee ? `${asset.currentAssignee.firstName} ${asset.currentAssignee.lastName}` : '\u2014'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )
        ) : (
          <EmptyState
            icon={Package}
            title="No devices in the vault yet"
            description="Start by adding your first IT asset to track and manage."
            actionLabel="Add Asset"
            actionHref="/assets/new"
          />
        )}
      </div>
      </PageTransition>
    </ErrorBoundary>
  );
}

function AssetCard({ asset }: { asset: Asset }) {
  const Icon = CATEGORY_ICONS[asset.category] || Package;
  const assigneeName = asset.currentAssignee
    ? `${asset.currentAssignee.firstName} ${asset.currentAssignee.lastName}`
    : null;

  return (
    <motion.div variants={item} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Link href={`/assets/${asset.id}`}>
        <div
          className="group rounded-xl border p-5 transition-all hover:shadow-md"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-secondary)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'; }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ background: 'var(--accent-primary-subtle)' }}
            >
              <Icon size={20} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <StatusBadge status={asset.status} />
          </div>
          <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {asset.name}
          </h3>
          <p className="mt-1 font-mono text-xs" style={{ color: 'var(--accent-primary)' }}>
            {asset.assetTag}
          </p>
          {assigneeName && (
            <p className="mt-2 text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
              Assigned to {assigneeName}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
