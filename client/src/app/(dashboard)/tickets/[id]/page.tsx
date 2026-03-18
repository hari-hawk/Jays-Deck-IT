'use client';

import { use, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, User, Clock, Ticket, Eye, Lock, UserPlus, Search, X, Loader2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { EmptyState } from '@/components/ui/empty-state';
import { PageSkeleton } from '@/components/ui/skeleton-loaders';
import { PageTransition } from '@/components/layout/PageTransition';
import { useTicket, useAddComment } from '@/lib/queries';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/lib/api';
import { toast } from 'sonner';

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

interface Comment {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string; avatarUrl?: string };
}

interface Watcher {
  id: string;
  userId: string;
  user: { id: string; firstName: string; lastName: string; email: string };
}

interface SearchUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: ticket, isLoading, error } = useTicket(id);
  const addComment = useAddComment(id);
  const currentUser = useAuthStore((s) => s.user);
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [watchers, setWatchers] = useState<Watcher[]>([]);
  const [showAddWatcher, setShowAddWatcher] = useState(false);
  const [watcherSearch, setWatcherSearch] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [optimisticComments, setOptimisticComments] = useState<Comment[]>([]);

  // Load watchers
  useEffect(() => {
    if (id) {
      api.get(`/tickets/${id}/watchers`).then(res => setWatchers(res.data?.data || [])).catch(() => {});
    }
  }, [id]);

  // Scroll to bottom on new comments
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [optimisticComments, ticket?.comments]);

  // Search users for watcher
  useEffect(() => {
    if (watcherSearch.length < 2) { setSearchResults([]); return; }
    const timeout = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await api.get('/users', { params: { search: watcherSearch, limit: 5 } });
        setSearchResults(data.data || []);
      } catch { setSearchResults([]); }
      setSearchLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [watcherSearch]);

  if (isLoading) {
    return <PageSkeleton type="list" count={1} />;
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <EmptyState
          icon={Ticket}
          title="Ticket not found"
          description="The ticket you are looking for does not exist or has been removed."
          actionLabel="Back to Service Hub"
          actionHref="/tickets"
        />
      </div>
    );
  }

  const reporterName = ticket.reporter ? `${ticket.reporter.firstName} ${ticket.reporter.lastName}` : 'Unknown';
  const assigneeName = ticket.assignee ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}` : 'Unassigned';
  const allComments: Comment[] = [...(ticket.comments || []), ...optimisticComments];

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    // Optimistic update
    const tempComment: Comment = {
      id: `temp-${Date.now()}`,
      content: comment,
      isInternal,
      createdAt: new Date().toISOString(),
      author: {
        id: currentUser?.id || '',
        firstName: currentUser?.firstName || '',
        lastName: currentUser?.lastName || '',
      },
    };
    setOptimisticComments((prev) => [...prev, tempComment]);
    const commentText = comment;
    setComment('');

    try {
      await addComment.mutateAsync({ content: commentText, isInternal } as { content: string });
      // After success, clear optimistic (real data will come from refetch)
      setOptimisticComments([]);
      toast.success(isInternal ? 'Internal note added' : 'Comment added');
    } catch {
      setOptimisticComments((prev) => prev.filter((c) => c.id !== tempComment.id));
      toast.error('Failed to add comment');
    }
  };

  const handleAddWatcher = async (userId: string) => {
    try {
      await api.post(`/tickets/${id}/watchers`, { userId });
      // Reload watchers
      const { data } = await api.get(`/tickets/${id}/watchers`);
      setWatchers(data.data || []);
      setWatcherSearch('');
      setShowAddWatcher(false);
      toast.success('Watcher added');
    } catch {
      toast.error('Failed to add watcher');
    }
  };

  return (
    <ErrorBoundary fallbackTitle="Ticket details failed to load">
      <PageTransition>
      <div className="space-y-6 p-6 md:p-8">
        <Link
          href="/tickets"
          className="flex items-center gap-1 text-sm transition-colors hover:text-[var(--text-primary)] min-h-[44px] inline-flex"
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
                <span className="font-mono text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>{ticket.ticketNumber}</span>
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                  {ticket.category}
                </span>
              </div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{ticket.title}</h1>
              <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Created by {reporterName} {formatTimeAgo(ticket.createdAt)}
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

            {/* Chat-Style Thread */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border overflow-hidden"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
            >
              <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  Thread ({allComments.length})
                </h3>
              </div>

              {/* Messages */}
              <div className="p-4 space-y-4 max-h-[480px] overflow-y-auto">
                {allComments.length > 0 ? (
                  allComments.map((c) => {
                    const isOwnMessage = c.author?.id === currentUser?.id;
                    const authorName = c.author ? `${c.author.firstName} ${c.author.lastName}` : 'Unknown';
                    const authorInitials = c.author ? `${c.author.firstName[0]}${c.author.lastName[0]}` : '?';
                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar size="sm" className="shrink-0">
                          <AvatarFallback
                            className="text-[10px] font-bold"
                            style={{ background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)' }}
                          >
                            {authorInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`max-w-[75%] ${isOwnMessage ? 'text-right' : ''}`}>
                          <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'justify-end' : ''}`}>
                            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{authorName}</span>
                            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                              {formatTimeAgo(c.createdAt)}
                            </span>
                          </div>
                          <div
                            className="rounded-xl px-4 py-2.5 text-sm leading-relaxed"
                            style={{
                              background: c.isInternal
                                ? 'rgba(251, 191, 36, 0.1)'
                                : isOwnMessage
                                  ? 'var(--accent-primary)'
                                  : 'var(--bg-tertiary)',
                              color: c.isInternal
                                ? 'var(--text-primary)'
                                : isOwnMessage
                                  ? '#fff'
                                  : 'var(--text-primary)',
                              border: c.isInternal ? '1px solid rgba(251, 191, 36, 0.25)' : 'none',
                            }}
                          >
                            {c.isInternal && (
                              <div className="flex items-center gap-1 mb-1">
                                <Lock className="size-3" style={{ color: '#f59e0b' }} />
                                <span className="text-[10px] font-semibold uppercase" style={{ color: '#f59e0b' }}>
                                  Internal Note
                                </span>
                              </div>
                            )}
                            {c.content}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <p className="text-sm text-center py-8" style={{ color: 'var(--text-tertiary)' }}>No messages yet. Start the conversation below.</p>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="border-t p-4" style={{ borderColor: 'var(--border-primary)' }}>
                {/* Internal note toggle */}
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setIsInternal(!isInternal)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors min-h-[32px]"
                    style={{
                      background: isInternal ? 'rgba(251, 191, 36, 0.15)' : 'var(--bg-tertiary)',
                      color: isInternal ? '#f59e0b' : 'var(--text-secondary)',
                      border: isInternal ? '1px solid rgba(251, 191, 36, 0.25)' : '1px solid var(--border-primary)',
                    }}
                    aria-pressed={isInternal}
                  >
                    <Lock className="size-3" />
                    {isInternal ? 'Internal Note' : 'Public Comment'}
                  </button>
                  {isInternal && (
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                      Only visible to staff
                    </span>
                  )}
                </div>

                <form onSubmit={handleSubmitComment} className="flex gap-2">
                  <label htmlFor="add-comment" className="sr-only">Add a message</label>
                  <input
                    id="add-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={isInternal ? 'Add an internal note...' : 'Type a message...'}
                    className="flex-1 rounded-lg border px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                    style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!comment.trim() || addComment.isPending}
                    className="min-h-[44px] min-w-[44px]"
                    style={{ background: 'var(--accent-primary)', color: '#fff' }}
                    aria-label="Send message"
                  >
                    <Send className="size-4" />
                  </Button>
                </form>
              </div>
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
                <DetailRow icon={User} label="Created By" value={reporterName} />
                <DetailRow icon={User} label="Assignee" value={assigneeName} />
                <DetailRow icon={Clock} label="Created" value={formatDateTime(ticket.createdAt)} />
                <DetailRow icon={Clock} label="Updated" value={formatDateTime(ticket.updatedAt)} />
              </div>
            </div>

            {/* Watchers / People in Loop */}
            <div className="rounded-xl border p-5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  <Eye className="size-3 inline mr-1" aria-hidden="true" />
                  People in Loop
                </h3>
                <button
                  onClick={() => setShowAddWatcher(!showAddWatcher)}
                  className="flex items-center gap-1 text-xs font-medium min-h-[32px] px-2 rounded-md transition-colors"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  <UserPlus className="size-3" />
                  Add
                </button>
              </div>

              <AnimatePresence>
                {showAddWatcher && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 overflow-hidden"
                  >
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5" style={{ color: 'var(--text-tertiary)' }} />
                      <input
                        value={watcherSearch}
                        onChange={(e) => setWatcherSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full rounded-lg border pl-8 pr-3 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                        style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    {searchLoading && (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="size-4 animate-spin" style={{ color: 'var(--text-tertiary)' }} />
                      </div>
                    )}
                    {searchResults.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {searchResults
                          .filter((u) => !watchers.some((w) => w.userId === u.id))
                          .map((u) => (
                            <button
                              key={u.id}
                              onClick={() => handleAddWatcher(u.id)}
                              className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-left transition-colors min-h-[36px]"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              <Avatar size="sm">
                                <AvatarFallback className="text-[10px]" style={{ background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)' }}>
                                  {u.firstName[0]}{u.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-medium">{u.firstName} {u.lastName}</p>
                                <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{u.email}</p>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                {watchers.map((w) => (
                  <div key={w.id} className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarFallback className="text-[10px]" style={{ background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)' }}>
                        {w.user.firstName[0]}{w.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{w.user.firstName} {w.user.lastName}</p>
                      <p className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>{w.user.email}</p>
                    </div>
                  </div>
                ))}
                {watchers.length === 0 && (
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No watchers yet.</p>
                )}
              </div>
            </div>

            {/* Status History */}
            <div className="rounded-xl border p-5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                Status History
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 size-2 rounded-full" style={{ background: 'var(--accent-primary)' }} aria-hidden="true" />
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Status: {(ticket.status || '').replace(/_/g, ' ')}</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{formatTimeAgo(ticket.updatedAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 size-2 rounded-full" style={{ background: 'var(--text-tertiary)' }} aria-hidden="true" />
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
      </PageTransition>
    </ErrorBoundary>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={14} className="mt-0.5" style={{ color: 'var(--text-tertiary)' }} aria-hidden="true" />
      <div>
        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{label}</span>
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}
