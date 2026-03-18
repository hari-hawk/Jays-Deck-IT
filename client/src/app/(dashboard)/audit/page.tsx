'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, UserCheck, CheckCircle, LogIn, AlertTriangle, ScrollText } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { mockAuditEntries } from '@/lib/mock-data';

const ACTION_CONFIG: Record<string, { icon: LucideIcon; color: string }> = {
  CREATE: { icon: Plus, color: 'var(--success)' },
  UPDATE: { icon: Pencil, color: 'var(--info)' },
  DELETE: { icon: Trash2, color: 'var(--danger)' },
  ASSIGN: { icon: UserCheck, color: 'var(--accent-primary)' },
  APPROVE: { icon: CheckCircle, color: 'var(--success)' },
  LOGIN: { icon: LogIn, color: 'var(--info)' },
  ESCALATE: { icon: AlertTriangle, color: 'var(--warning)' },
};

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function AuditPage() {
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [userFilter, setUserFilter] = useState('');

  const users = [...new Set(mockAuditEntries.map((e) => e.user))];
  const entityTypes = [...new Set(mockAuditEntries.map((e) => e.entityType))];
  const actionTypes = [...new Set(mockAuditEntries.map((e) => e.action))];

  const filtered = mockAuditEntries.filter((entry) => {
    const matchesEntity = entityFilter === 'ALL' || entry.entityType === entityFilter;
    const matchesAction = actionFilter === 'ALL' || entry.action === actionFilter;
    const matchesUser = !userFilter || entry.user.toLowerCase().includes(userFilter.toLowerCase());
    return matchesEntity && matchesAction && matchesUser;
  });

  return (
    <div className="space-y-6 p-6 md:p-8">
      <PageHeader
        index="05"
        title="AUDIT TRAIL"
        description="Complete activity log and system audit history"
      />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <Input
          placeholder="Filter by user..."
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="h-10 max-w-xs"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
        />
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="h-10 rounded-lg border px-3 text-sm"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
        >
          <option value="ALL">All Entities</option>
          {entityTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="h-10 rounded-lg border px-3 text-sm"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
        >
          <option value="ALL">All Actions</option>
          {actionTypes.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-1"
      >
        {filtered.map((entry, idx) => {
          const config = ACTION_CONFIG[entry.action] || ACTION_CONFIG.UPDATE;
          const Icon = config.icon;

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="flex gap-4 rounded-xl border p-4 transition-all hover:shadow-sm"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: `color-mix(in srgb, ${config.color} 15%, transparent)` }}
              >
                <Icon size={18} style={{ color: config.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {entry.description}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                    {formatDateTime(entry.timestamp)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    by {entry.user}
                  </span>
                  <span className="text-xs font-mono" style={{ color: 'var(--accent-primary)' }}>
                    {entry.entityId}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                    IP: {entry.ipAddress}
                  </span>
                </div>
              </div>
              <span
                className="shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  background: `color-mix(in srgb, ${config.color} 15%, transparent)`,
                  color: config.color,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {entry.action}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      {filtered.length === 0 && (
        <div className="py-16 text-center" style={{ color: 'var(--text-tertiary)' }}>
          <ScrollText className="mx-auto size-12 mb-3 opacity-40" />
          <p className="text-sm">No audit entries found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
