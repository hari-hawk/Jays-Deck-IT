'use client';

import { motion } from 'framer-motion';
import { Box, TicketCheck, ShieldCheck, Activity } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TicketTrendChart } from '@/components/dashboard/TicketTrendChart';
import { AssetDistribution } from '@/components/dashboard/AssetDistribution';
import { TicketsByStatus } from '@/components/dashboard/TicketsByStatus';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { DashboardSkeleton } from '@/components/ui/skeleton-loaders';
import { PageTransition } from '@/components/layout/PageTransition';
import { useDashboardStats, useTicketTrends, useAssetOverview, useTicketsByStatus, useAuditLogs } from '@/lib/queries';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function SectionHeader({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-xs font-medium"
        style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}
      >
        [{index}]
      </span>
      <span
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
      >
        {title}
      </span>
    </div>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const metricStagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const metricItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

import { QuickActions } from '@/components/dashboard/QuickActions';

export default function DashboardPage() {
  const greeting = getGreeting();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: ticketTrends, isLoading: trendsLoading } = useTicketTrends();
  const { data: assetOverview, isLoading: assetsLoading } = useAssetOverview();
  const { data: ticketsByStatus, isLoading: ticketsStatusLoading } = useTicketsByStatus();
  const { data: auditLogs, isLoading: auditLoading } = useAuditLogs();

  const isLoading = statsLoading || trendsLoading || assetsLoading || ticketsStatusLoading || auditLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Build recent activity from audit logs
  const recentActivity = (auditLogs || []).slice(0, 10).map((log: { id: string; action: string; entityType: string; entityId: string; user?: { firstName: string; lastName: string }; createdAt: string }) => ({
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    user: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
    timestamp: log.createdAt,
  }));

  return (
    <ErrorBoundary fallbackTitle="Dashboard failed to load">
      <PageTransition>
        {/* Gradient accent line at top */}
        <div className="accent-gradient-line" aria-hidden="true" />

        <motion.div
          className="space-y-8 p-6 md:p-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <motion.div variants={item}>
            <SectionHeader index="00" title="COMMAND BRIDGE" />
            <h1
              className="mt-3 text-2xl font-bold tracking-tight md:text-3xl"
              style={{ color: 'var(--text-primary)' }}
            >
              {greeting}.
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}
            >
              Here&apos;s your IT overview for today.
            </p>
          </motion.div>

          {/* Row 1: Metric Cards - stagger each card individually */}
          <motion.div
            variants={metricStagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <motion.div variants={metricItem}>
              <MetricCard
                title="Total Assets"
                value={stats?.totalAssets ?? 0}
                icon={Box}
                trend={{ value: 12, isPositive: true }}
              />
            </motion.div>
            <motion.div variants={metricItem}>
              <MetricCard
                title="Open Tickets"
                value={stats?.openTickets ?? 0}
                icon={TicketCheck}
                trend={{ value: 5, isPositive: false }}
              />
            </motion.div>
            <motion.div variants={metricItem}>
              <MetricCard
                title="Pending Approvals"
                value={stats?.pendingApprovals ?? 0}
                icon={ShieldCheck}
              />
            </motion.div>
            <motion.div variants={metricItem}>
              <MetricCard
                title="SLA Compliance"
                value={`${stats?.slaCompliance ?? 0}%`}
                icon={Activity}
                trend={{ value: 3, isPositive: true }}
              />
            </motion.div>
          </motion.div>

          {/* Row 2: Quick Actions */}
          <motion.div variants={item}>
            <SectionHeader index="01" title="QUICK ACTIONS" />
            <div className="mt-3">
              <QuickActions />
            </div>
          </motion.div>

          {/* Row 3: Ticket Trends + Asset Distribution */}
          <motion.div
            variants={item}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            <ErrorBoundary fallbackTitle="Chart failed to load">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="col-span-1 rounded-xl border p-5 lg:col-span-2"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
              >
                <SectionHeader index="02" title="TICKET TRENDS" />
                <p
                  className="mb-4 mt-1 text-xs"
                  style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}
                >
                  Last 30 days &mdash;{' '}
                  <span style={{ color: 'var(--accent-primary)' }}>opened</span> vs{' '}
                  <span style={{ color: 'var(--success)' }}>resolved</span>
                </p>
                <TicketTrendChart data={ticketTrends || []} />
              </motion.div>
            </ErrorBoundary>
            <ErrorBoundary fallbackTitle="Chart failed to load">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="col-span-1 rounded-xl border p-5"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
              >
                <SectionHeader index="03" title="ASSET DISTRIBUTION" />
                <p
                  className="mb-4 mt-1 text-xs"
                  style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}
                >
                  By category
                </p>
                <AssetDistribution data={assetOverview?.byCategory || []} />
              </motion.div>
            </ErrorBoundary>
          </motion.div>

          {/* Row 4: Tickets by Status + Recent Activity */}
          <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <ErrorBoundary fallbackTitle="Chart failed to load">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="col-span-1 rounded-xl border p-5"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
              >
                <SectionHeader index="04" title="TICKETS BY STATUS" />
                <div className="mt-4">
                  <TicketsByStatus data={ticketsByStatus || []} />
                </div>
              </motion.div>
            </ErrorBoundary>
            <ErrorBoundary fallbackTitle="Activity feed failed to load">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="col-span-1 rounded-xl border p-5 lg:col-span-2"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
              >
                <SectionHeader index="05" title="RECENT ACTIVITY" />
                <div className="mt-4">
                  <RecentActivity data={recentActivity} />
                </div>
              </motion.div>
            </ErrorBoundary>
          </motion.div>
        </motion.div>
      </PageTransition>
    </ErrorBoundary>
  );
}
