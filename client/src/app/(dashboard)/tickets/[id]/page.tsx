'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, User, Clock } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { mockTickets } from '@/lib/mock-data';

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' at ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

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

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const ticket = mockTickets.find((t) => t.id === id);
  const [comment, setComment] = useState('');

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Ticket not found</p>
        <Link href="/tickets" className="mt-4 text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
          Back to Service Hub
        </Link>
      </div>
    );
  }

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    // In production, this would call the API
    setComment('');
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <Link
        href="/tickets"
        className="flex items-center gap-1 text-sm transition-colors hover:text-[var(--text-primary)]"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ArrowLeft className="size-4" />
        Back to Service Hub
      </Link>

      {/* Ticket Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border p-6"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>{ticket.ticketId}</span>
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                {ticket.category}
              </span>
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{ticket.title}</h1>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Created by {ticket.createdBy} {formatTimeAgo(ticket.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border p-5"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              Description
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {ticket.description}
            </p>
          </motion.div>

          {/* Comments */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border p-5"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              Comments ({ticket.comments.length})
            </h3>
            <div className="space-y-4">
              {ticket.comments.length > 0 ? (
                ticket.comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar size="sm">
                      <AvatarFallback
                        className="text-[10px] font-bold"
                        style={{ background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)' }}
                      >
                        {c.author.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.author}</span>
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                          {formatTimeAgo(c.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No comments yet.</p>
              )}
            </div>

            {/* Add Comment */}
            <form onSubmit={handleSubmitComment} className="mt-6 flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!comment.trim()}
                style={{ background: 'var(--accent-primary)', color: '#fff' }}
              >
                <Send className="size-4" />
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Sidebar Info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="rounded-xl border p-5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              Details
            </h3>
            <div className="space-y-4">
              <DetailRow icon={User} label="Created By" value={ticket.createdBy} />
              <DetailRow icon={User} label="Assignee" value={ticket.assignee || 'Unassigned'} />
              <DetailRow icon={Clock} label="Created" value={formatDateTime(ticket.createdAt)} />
              <DetailRow icon={Clock} label="Updated" value={formatDateTime(ticket.updatedAt)} />
            </div>
          </div>

          {/* Status History */}
          <div className="rounded-xl border p-5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              Status History
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1.5 size-2 rounded-full" style={{ background: 'var(--accent-primary)' }} />
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Status: {ticket.status.replace(/_/g, ' ')}</p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{formatTimeAgo(ticket.updatedAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1.5 size-2 rounded-full" style={{ background: 'var(--text-tertiary)' }} />
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Ticket Created</p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{formatTimeAgo(ticket.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={14} className="mt-0.5" style={{ color: 'var(--text-tertiary)' }} />
      <div>
        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{label}</span>
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}
