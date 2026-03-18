'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, TicketCheck, ShieldCheck, Activity } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TicketTrendChart } from '@/components/dashboard/TicketTrendChart';
import { AssetDistribution } from '@/components/dashboard/AssetDistribution';
import { TicketsByStatus } from '@/components/dashboard/TicketsByStatus';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { DashboardSkeleton } from '@/components/ui/skeleton-loaders';
import {
  mockStats,
  mockTicketTrends,
  mockAssetsByCategory,
  mockTicketsByStatus,
  mockRecentActivity,
} from '@/lib/mock-data';

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

export default function DashboardPage() {
  const greeting = getGreeting();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetch
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <ErrorBoundary fallbackTitle="Dashboard failed to load">
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

        {/* Row 1: Metric Cards */}
        <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Assets"
            value={mockStats.totalAssets}
            icon={Box}
            trend={{ value: 12, isPositive: true }}
          />
          <MetricCard
            title="Open Tickets"
            value={mockStats.openTickets}
            icon={TicketCheck}
            trend={{ value: 5, isPositive: false }}
          />
          <MetricCard
            title="Pending Approvals"
            value={mockStats.pendingApprovals}
            icon={ShieldCheck}
          />
          <MetricCard
            title="SLA Compliance"
            value={`${mockStats.slaCompliance}%`}
            icon={Activity}
            trend={{ value: 3, isPositive: true }}
          />
        </motion.div>

        {/* Row 2: Quick Actions */}
        <motion.div variants={item}>
          <SectionHeader index="01" title="QUICK ACTIONS" />
          <div className="mt-3">
            <QuickActions />
          </div>
        </motion.div>

        {/* Row 3: Ticket Trends + Asset Distribution */}
        <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ErrorBoundary fallbackTitle="Chart failed to load">
            <div
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
              <TicketTrendChart data={mockTicketTrends} />
            </div>
          </ErrorBoundary>
          <ErrorBoundary fallbackTitle="Chart failed to load">
            <div
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
              <AssetDistribution data={mockAssetsByCategory} />
            </div>
          </ErrorBoundary>
        </motion.div>

        {/* Row 4: Tickets by Status + Recent Activity */}
        <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ErrorBoundary fallbackTitle="Chart failed to load">
            <div
              className="col-span-1 rounded-xl border p-5"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
            >
              <SectionHeader index="04" title="TICKETS BY STATUS" />
              <div className="mt-4">
                <TicketsByStatus data={mockTicketsByStatus} />
              </div>
            </div>
          </ErrorBoundary>
          <ErrorBoundary fallbackTitle="Activity feed failed to load">
            <div
              className="col-span-1 rounded-xl border p-5 lg:col-span-2"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
            >
              <SectionHeader index="05" title="RECENT ACTIVITY" />
              <div className="mt-4">
                <RecentActivity data={mockRecentActivity} />
              </div>
            </div>
          </ErrorBoundary>
        </motion.div>
      </motion.div>
    </ErrorBoundary>
  );
}
