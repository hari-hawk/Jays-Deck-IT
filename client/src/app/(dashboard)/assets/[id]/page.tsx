'use client';

import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Monitor, MapPin, Calendar, Hash, User, FileText, Wrench } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockAssets } from '@/lib/mock-data';

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const asset = mockAssets.find((a) => a.id === id);

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Asset not found</p>
        <Link href="/assets" className="mt-4 text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
          Back to Assets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-3">
        <Link
          href="/assets"
          className="flex items-center gap-1 text-sm transition-colors hover:text-[var(--text-primary)]"
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
          <TabsTrigger value={0} className="rounded-none px-4 py-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Overview
          </TabsTrigger>
          <TabsTrigger value={1} className="rounded-none px-4 py-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Assignment History
          </TabsTrigger>
          <TabsTrigger value={2} className="rounded-none px-4 py-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Linked Tickets
          </TabsTrigger>
        </TabsList>

        <TabsContent value={0} className="mt-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            <div className="space-y-4 rounded-xl border p-5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                Details
              </h3>
              <InfoRow icon={Hash} label="Serial Number" value={asset.serialNumber} />
              <InfoRow icon={Monitor} label="Category" value={asset.category.replace(/_/g, ' ')} />
              <InfoRow icon={MapPin} label="Location" value={asset.location} />
              <InfoRow icon={FileText} label="Department" value={asset.department} />
              <InfoRow icon={User} label="Assignee" value={asset.assignee || 'Unassigned'} />
            </div>
            <div className="space-y-4 rounded-xl border p-5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                Warranty & Dates
              </h3>
              <InfoRow icon={Calendar} label="Purchase Date" value={asset.purchaseDate} />
              <InfoRow icon={Wrench} label="Warranty Expiry" value={asset.warrantyExpiry} />
              <div className="pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>Notes</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{asset.notes}</p>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value={1} className="mt-6">
          <div className="rounded-xl border p-6" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            <div className="space-y-4">
              {[
                { date: '2024-09-15', action: 'Assigned to ' + (asset.assignee || 'N/A'), by: 'James Wilson' },
                { date: '2024-06-20', action: 'Added to inventory', by: 'System' },
              ].map((entry, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-4" style={{ borderBottom: idx < 1 ? '1px solid var(--border-primary)' : 'none' }}>
                  <div className="mt-1 size-2 rounded-full" style={{ background: 'var(--accent-primary)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{entry.action}</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      {entry.date} by {entry.by}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value={2} className="mt-6">
          <div className="rounded-xl border p-6" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              No linked tickets found for this asset.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Monitor; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} style={{ color: 'var(--text-tertiary)' }} />
      <div className="flex-1">
        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{label}</span>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}
