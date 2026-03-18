'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function NewAssetPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'LAPTOP',
    serialNumber: '',
    department: '',
    location: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    router.push('/assets');
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <Link
        href="/assets"
        className="flex items-center gap-1 text-sm transition-colors hover:text-[var(--text-primary)]"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ArrowLeft className="size-4" />
        Back to Asset Vault
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Add New Asset</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Register a new IT asset in the system
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Asset Name</Label>
            <Input
              placeholder="e.g., MacBook Pro 16 inch"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="h-11"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Category</Label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="h-11 w-full rounded-lg border px-3 text-sm"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            >
              <option value="LAPTOP">Laptop</option>
              <option value="DESKTOP">Desktop</option>
              <option value="MONITOR">Monitor</option>
              <option value="PHONE">Phone</option>
              <option value="HEADSET">Headset</option>
              <option value="SOFTWARE_LICENSE">Software License</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Serial Number</Label>
            <Input
              placeholder="Enter serial number"
              value={form.serialNumber}
              onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              className="h-11"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Department</Label>
            <Input
              placeholder="e.g., Engineering"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="h-11"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Location</Label>
            <Input
              placeholder="e.g., Chennai Office"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="h-11"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Notes</Label>
            <textarea
              rows={3}
              placeholder="Additional details about the asset..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-lg border px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', resize: 'vertical' }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || !form.name}
            className="gap-2 px-6"
            style={{ background: 'var(--accent-primary)', color: '#fff' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Asset'
            )}
          </Button>
          <Link href="/assets">
            <Button type="button" variant="ghost" style={{ color: 'var(--text-secondary)' }}>
              Cancel
            </Button>
          </Link>
        </div>
      </motion.form>
    </div>
  );
}
