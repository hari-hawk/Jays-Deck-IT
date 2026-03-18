'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Plus, Ticket } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { EmptyState } from '@/components/ui/empty-state';
import { PageSkeleton } from '@/components/ui/skeleton-loaders';
import { mockTickets } from '@/lib/mock-data';

function formatTimeAgo(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function TicketsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PageSkeleton type="list" count={6} />;
  }

  const filtered = mockTickets.filter((ticket) => {
    const matchesSearch = !search || ticket.title.toLowerCase().includes(search.toLowerCase()) || ticket.ticketId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'ALL' || ticket.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  return (
    <ErrorBoundary fallbackTitle="Service Hub failed to load">
      <div className="space-y-6 p-6 md:p-8">
        <PageHeader
          index="03"
          title="SERVICE HUB"
          description="IT service desk and ticket management"
          actions={
            <Link href="/tickets/new">
              <Button
                className="gap-2"
                style={{ background: 'var(--accent-primary)', color: '#fff' }}
              >
                <Plus className="size-4" />
                New Ticket
              </Button>
            </Link>
          }
        />

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} aria-hidden="true" />
            <Input
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
              aria-label="Search tickets"
            />
          </div>
          <label htmlFor="ticket-status" className="sr-only">Filter by status</label>
          <select
            id="ticket-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border px-3 text-sm min-h-[44px]"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="ESCALATED">Escalated</option>
          </select>
          <label htmlFor="ticket-priority" className="sr-only">Filter by priority</label>
          <select
            id="ticket-priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-10 rounded-lg border px-3 text-sm min-h-[44px]"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
          >
            <option value="ALL">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <label htmlFor="ticket-category" className="sr-only">Filter by category</label>
          <select
            id="ticket-category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-lg border px-3 text-sm hidden sm:block min-h-[44px]"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
          >
            <option value="ALL">All Categories</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Network">Network</option>
            <option value="Access Request">Access Request</option>
            <option value="Security">Security</option>
            <option value="General IT">General IT</option>
            <option value="Other">Other</option>
          </select>
        </motion.div>

        {/* Results count */}
        <p className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }} aria-live="polite">
          {filtered.length} ticket{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Ticket List */}
        {filtered.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {filtered.map((ticket, idx) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Link href={`/tickets/${ticket.id}`}>
                  <div
                    className="group rounded-xl border p-4 transition-all hover:shadow-md"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-secondary)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'; }}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs" style={{ color: 'var(--accent-primary)' }}>{ticket.ticketId}</span>
                          <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                            {ticket.category}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                          {ticket.title}
                        </h3>
                        <p className="mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          Created by {ticket.createdBy} {formatTimeAgo(ticket.createdAt)}
                          {ticket.assignee && <> &middot; Assigned to {ticket.assignee}</>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={ticket.priority} />
                        <StatusBadge status={ticket.status} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={Ticket}
            title="All clear! No open tickets right now"
            description="Create a new ticket when you need IT support."
            actionLabel="New Ticket"
            actionHref="/tickets/new"
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
