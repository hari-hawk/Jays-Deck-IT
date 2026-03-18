'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface CCUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function NewTicketPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'General IT',
    priority: 'MEDIUM',
  });
  const [ccUsers, setCcUsers] = useState<CCUser[]>([]);
  const [ccSearch, setCcSearch] = useState('');
  const [ccResults, setCcResults] = useState<CCUser[]>([]);

  useEffect(() => {
    if (ccSearch.length < 2) { setCcResults([]); return; }
    const timeout = setTimeout(async () => {
      try {
        const { data } = await api.get('/users', { params: { search: ccSearch, limit: 5 } });
        setCcResults((data.data || []).filter((u: CCUser) => !ccUsers.some((cc) => cc.id === u.id)));
      } catch { setCcResults([]); }
    }, 300);
    return () => clearTimeout(timeout);
  }, [ccSearch, ccUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    toast.success('Ticket created successfully');
    router.push('/tickets');
  };

  return (
    <ErrorBoundary fallbackTitle="Form failed to load">
      <div className="space-y-6 p-6 md:p-8">
        <Link
          href="/tickets"
          className="flex items-center gap-1 text-sm transition-colors hover:text-[var(--text-primary)] min-h-[44px] inline-flex"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="size-4" />
          Back to Service Hub
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Create New Ticket</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Submit a new IT support request
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="max-w-2xl space-y-6 rounded-xl border p-6"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
        >
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-xs uppercase tracking-wider"
              style={{ color: 'var(--text-secondary)' }}
            >
              Title
            </Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="h-11"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-xs uppercase tracking-wider"
              style={{ color: 'var(--text-secondary)' }}
            >
              Description
            </Label>
            <textarea
              id="description"
              rows={5}
              placeholder="Provide detailed information about the issue..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              className="w-full rounded-lg border px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', resize: 'vertical' }}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="category"
                className="text-xs uppercase tracking-wider"
                style={{ color: 'var(--text-secondary)' }}
              >
                Category
              </Label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-11 w-full rounded-lg border px-3 text-sm"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
              >
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Network">Network</option>
                <option value="Access Request">Access Request</option>
                <option value="Security">Security</option>
                <option value="General IT">General IT</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="priority"
                className="text-xs uppercase tracking-wider"
                style={{ color: 'var(--text-secondary)' }}
              >
                Priority
              </Label>
              <select
                id="priority"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="h-11 w-full rounded-lg border px-3 text-sm"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          {/* CC / Add People */}
          <div className="space-y-2">
            <Label
              htmlFor="cc-search"
              className="text-xs uppercase tracking-wider"
              style={{ color: 'var(--text-secondary)' }}
            >
              CC / Add People (Optional)
            </Label>
            {ccUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {ccUsers.map((u) => (
                  <span
                    key={u.id}
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
                    style={{ background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)' }}
                  >
                    {u.firstName} {u.lastName}
                    <button
                      type="button"
                      onClick={() => setCcUsers(ccUsers.filter((cc) => cc.id !== u.id))}
                      className="ml-0.5 hover:opacity-70"
                      aria-label={`Remove ${u.firstName} ${u.lastName}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: 'var(--text-tertiary)' }} />
              <Input
                id="cc-search"
                placeholder="Search people by name or email..."
                value={ccSearch}
                onChange={(e) => setCcSearch(e.target.value)}
                className="h-11 pl-9"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
              />
            </div>
            {ccResults.length > 0 && (
              <div className="rounded-lg border p-1 space-y-0.5" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}>
                {ccResults.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => { setCcUsers([...ccUsers, u]); setCcSearch(''); }}
                    className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-left transition-colors hover:bg-[var(--bg-secondary)] min-h-[36px]"
                  >
                    <Avatar size="sm">
                      <AvatarFallback className="text-[10px]" style={{ background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)' }}>
                        {u.firstName[0]}{u.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{u.firstName} {u.lastName}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || !form.title || !form.description}
              className="gap-2 px-6 min-h-[44px]"
              style={{ background: 'var(--accent-primary)', color: '#fff' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Create Ticket'
              )}
            </Button>
            <Link href="/tickets">
              <Button
                type="button"
                variant="ghost"
                className="min-h-[44px]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Cancel
              </Button>
            </Link>
          </div>
        </motion.form>
      </div>
    </ErrorBoundary>
  );
}
