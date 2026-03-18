'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, UserCheck, CheckCircle, LogIn, AlertTriangle, ScrollText } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { EmptyState } from '@/components/ui/empty-state';
import { PageSkeleton } from '@/components/ui/skeleton-loaders';
import { PageTransition } from '@/components/layout/PageTransition';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { useAuditLogs } from '@/lib/queries';

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

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  user?: { id: string; firstName: string; lastName: string; email: string };
  userId: string;
  ipAddress?: string;
  createdAt: string;
  metadata?: Record<string, string>;
}

export default function AuditPage() {
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [userFilter, setUserFilter] = useState('');

  const { data: auditEntries, isLoading, error } = useAuditLogs({
    entityType: entityFilter !== 'ALL' ? entityFilter : undefined,
    action: actionFilter !== 'ALL' ? actionFilter : undefined,
  });

  if (isLoading) {
    return <PageSkeleton type="list" count={6} />;
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          icon={ScrollText}
          title="Failed to load audit trail"
          description="There was an error loading the audit logs. Please try again."
        />
      </div>
    );
  }

  const entries: AuditEntry[] = auditEntries || [];
  const entityTypes = [...new Set(entries.map((e) => e.entityType).filter(Boolean))];
  const actionTypes = [...new Set(entries.map((e) => e.action).filter(Boolean))];

  const filtered = entries.filter((entry) => {
    const userName = entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : '';
    const matchesUser = !userFilter || userName.toLowerCase().includes(userFilter.toLowerCase());
    return matchesUser;
  });

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'IT_ADMIN']}>
    <ErrorBoundary fallbackTitle="Audit Trail failed to load">
      <PageTransition>
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
          <label htmlFor="audit-user" className="sr-only">Filter by user</label>
          <Input
            id="audit-user"
            placeholder="Filter by user..."
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="h-10 max-w-xs"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            aria-label="Filter by user"
          />
          <label htmlFor="entity-filter" className="sr-only">Filter by entity type</label>
          <select
            id="entity-filter"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="h-10 rounded-lg border px-3 text-sm min-h-[44px]"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
          >
            <option value="ALL">All Entities</option>
            {entityTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <label htmlFor="action-filter" className="sr-only">Filter by action</label>
          <select
            id="action-filter"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-10 rounded-lg border px-3 text-sm min-h-[44px]"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
          >
            <option value="ALL">All Actions</option>
            {actionTypes.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </motion.div>

        {/* Results count */}
        <p className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }} aria-live="polite">
          {filtered.length} entr{filtered.length !== 1 ? 'ies' : 'y'} found
        </p>

        {/* Timeline */}
        {filtered.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-1"
          >
            {filtered.map((entry, idx) => {
              const config = ACTION_CONFIG[entry.action] || ACTION_CONFIG.UPDATE;
              const Icon = config.icon;
              const userName = entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : 'System';

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex gap-4 rounded-xl border p-4 transition-all hover:shadow-sm card-hover-lift"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
                >
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `color-mix(in srgb, ${config.color} 15%, transparent)` }}
                    aria-hidden="true"
                  >
                    <Icon size={18} style={{ color: config.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {entry.description}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                        {formatDateTime(entry.createdAt)}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        by {userName}
                      </span>
                      <span className="text-xs font-mono" style={{ color: 'var(--accent-primary)' }}>
                        {entry.entityId}
                      </span>
                      {entry.ipAddress && (
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                          IP: {entry.ipAddress}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className="shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider self-start"
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
        ) : (
          <EmptyState
            icon={ScrollText}
            title="No audit entries found"
            description="Try adjusting your filters to see more results."
          />
        )}
      </div>
      </PageTransition>
    </ErrorBoundary>
    </RoleGuard>
  );
}
