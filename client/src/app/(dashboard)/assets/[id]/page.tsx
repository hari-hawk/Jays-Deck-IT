'use client';

import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Monitor, MapPin, Calendar, Hash, User, FileText, Wrench, Package } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { EmptyState } from '@/components/ui/empty-state';
import { PageSkeleton } from '@/components/ui/skeleton-loaders';
import { PageTransition } from '@/components/layout/PageTransition';
import { useAsset } from '@/lib/queries';

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: asset, isLoading, error } = useAsset(id);

  if (isLoading) {
    return <PageSkeleton type="list" count={1} />;
  }

  if (error || !asset) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <EmptyState
          icon={Package}
          title="Asset not found"
          description="The asset you are looking for does not exist or has been removed."
          actionLabel="Back to Assets"
          actionHref="/assets"
        />
      </div>
    );
  }

  const assigneeName = asset.currentAssignee
    ? `${asset.currentAssignee.firstName} ${asset.currentAssignee.lastName}`
    : 'Unassigned';

  return (
    <ErrorBoundary fallbackTitle="Asset details failed to load">
      <PageTransition>
      <div className="space-y-6 p-6 md:p-8">
        <div className="flex items-center gap-3">
          <Link
            href="/assets"
            className="flex items-center gap-1 text-sm transition-colors hover:text-[var(--text-primary)] min-h-[44px]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="size-4" />
            Back to Assets
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border p-6"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ background: 'var(--accent-primary-subtle)' }}
              >
                <Monitor size={28} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{asset.name}</h1>
                <p className="mt-1 font-mono text-sm" style={{ color: 'var(--accent-primary)' }}>{asset.assetTag}</p>
              </div>
            </div>
            <StatusBadge status={asset.status} />
          </div>
        </motion.div>

        <Tabs defaultValue={0}>
          <TabsList variant="line" className="border-b w-full justify-start gap-0 rounded-none bg-transparent p-0" style={{ borderColor: 'var(--border-primary)' }}>
            <TabsTrigger value={0} className="rounded-none px-4 py-2.5 text-sm min-h-[44px]" style={{ color: 'var(--text-secondary)' }}>
              Overview
            </TabsTrigger>
            <TabsTrigger value={1} className="rounded-none px-4 py-2.5 text-sm min-h-[44px]" style={{ color: 'var(--text-secondary)' }}>
              Assignment History
            </TabsTrigger>
            <TabsTrigger value={2} className="rounded-none px-4 py-2.5 text-sm min-h-[44px]" style={{ color: 'var(--text-secondary)' }}>
              Linked Tickets
            </TabsTrigger>
          </TabsList>

          <TabsContent value={0} className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 gap-6 md:grid-cols-2"
            >
              <div className="space-y-4 rounded-xl border p-5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  Details
                </h3>
                <InfoRow icon={Hash} label="Serial Number" value={asset.serialNumber || 'N/A'} />
                <InfoRow icon={Monitor} label="Category" value={(asset.category || '').replace(/_/g, ' ')} />
                <InfoRow icon={MapPin} label="Location" value={asset.location || 'N/A'} />
                <InfoRow icon={FileText} label="Department" value={asset.department || 'N/A'} />
                <InfoRow icon={User} label="Assignee" value={assigneeName} />
              </div>
              <div className="space-y-4 rounded-xl border p-5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  Warranty & Dates
                </h3>
                <InfoRow icon={Calendar} label="Purchase Date" value={asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'} />
                <InfoRow icon={Wrench} label="Warranty Expiry" value={asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : 'N/A'} />
                <div className="pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>Notes</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{asset.notes || 'No notes'}</p>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value={1} className="mt-6">
            <div className="rounded-xl border p-6" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
              <div className="space-y-4">
                {asset.assignments && asset.assignments.length > 0 ? (
                  asset.assignments.map((entry: { id: string; assignedAt: string; returnedAt?: string; user?: { firstName: string; lastName: string }; assignedBy?: { firstName: string; lastName: string } }, idx: number) => (
                    <div key={entry.id} className="flex items-start gap-3 pb-4" style={{ borderBottom: idx < asset.assignments.length - 1 ? '1px solid var(--border-primary)' : 'none' }}>
                      <div className="mt-1 size-2 rounded-full" style={{ background: 'var(--accent-primary)' }} aria-hidden="true" />
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {entry.returnedAt ? 'Returned' : 'Assigned to'} {entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : 'N/A'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                          {new Date(entry.assignedAt).toLocaleDateString()} by {entry.assignedBy ? `${entry.assignedBy.firstName} ${entry.assignedBy.lastName}` : 'System'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No assignment history.</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value={2} className="mt-6">
            <div className="rounded-xl border p-6" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
              {asset.tickets && asset.tickets.length > 0 ? (
                <div className="space-y-3">
                  {asset.tickets.map((ticket: { id: string; ticketNumber: string; title: string; status: string }) => (
                    <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                      <div className="flex items-center justify-between rounded-lg border p-3 hover:shadow-sm transition-all" style={{ borderColor: 'var(--border-primary)' }}>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{ticket.title}</p>
                          <p className="text-xs font-mono" style={{ color: 'var(--accent-primary)' }}>{ticket.ticketNumber}</p>
                        </div>
                        <StatusBadge status={ticket.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  No linked tickets found for this asset.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      </PageTransition>
    </ErrorBoundary>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Monitor; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} style={{ color: 'var(--text-tertiary)' }} aria-hidden="true" />
      <div className="flex-1">
        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{label}</span>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}
