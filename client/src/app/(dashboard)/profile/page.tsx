'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Save, Loader2, Lock, Monitor, Ticket } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/ui/status-badge';
import { mockAssets, mockTickets } from '@/lib/mock-data';

const currentUser = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@techjays.com',
  phone: '+91 98765 12345',
  department: 'IT',
  designation: 'IT Administrator',
  location: 'Chennai Office',
  joinDate: '2021-01-15',
  avatarInitials: 'AK',
};

export default function ProfilePage() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    phone: currentUser.phone,
  });
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  // Simulated user assets and tickets
  const myAssets = mockAssets.slice(0, 2);
  const myTickets = mockTickets.slice(0, 3);

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border p-6"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
      >
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback
              className="text-lg font-bold"
              style={{ background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)' }}
            >
              {currentUser.avatarInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {currentUser.firstName} {currentUser.lastName}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{currentUser.designation}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{currentUser.department} &middot; {currentUser.location}</p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue={0}>
        <TabsList variant="line" className="border-b w-full justify-start gap-0 rounded-none bg-transparent p-0" style={{ borderColor: 'var(--border-primary)' }}>
          <TabsTrigger value={0} className="rounded-none px-4 py-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Personal Info
          </TabsTrigger>
          <TabsTrigger value={1} className="rounded-none px-4 py-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Lock className="size-4 mr-2" />
            Change Password
          </TabsTrigger>
          <TabsTrigger value={2} className="rounded-none px-4 py-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Monitor className="size-4 mr-2" />
            My Assets
          </TabsTrigger>
          <TabsTrigger value={3} className="rounded-none px-4 py-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Ticket className="size-4 mr-2" />
            My Tickets
          </TabsTrigger>
        </TabsList>

        <TabsContent value={0} className="mt-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl rounded-xl border p-6"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>First Name</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="h-11"
                  style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Last Name</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="h-11"
                  style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Email</Label>
                <Input
                  value={currentUser.email}
                  disabled
                  className="h-11 opacity-60"
                  style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="h-11"
                  style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
            <div className="mt-6">
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="gap-2"
                style={{ background: 'var(--accent-primary)', color: '#fff' }}
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value={1} className="mt-6">
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleChangePassword}
            className="max-w-md rounded-xl border p-6 space-y-4"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
          >
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Current Password</Label>
              <Input
                type="password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                className="h-11"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>New Password</Label>
              <Input
                type="password"
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                className="h-11"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Confirm New Password</Label>
              <Input
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                className="h-11"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                required
                minLength={8}
              />
            </div>
            <Button
              type="submit"
              disabled={saving || !passwordForm.current || !passwordForm.new || passwordForm.new !== passwordForm.confirm}
              className="gap-2 mt-2"
              style={{ background: 'var(--accent-primary)', color: '#fff' }}
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
              {saving ? 'Updating...' : 'Update Password'}
            </Button>
          </motion.form>
        </TabsContent>

        <TabsContent value={2} className="mt-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {myAssets.map((asset) => (
              <Link key={asset.id} href={`/assets/${asset.id}`}>
                <div
                  className="flex items-center justify-between rounded-xl border p-4 transition-all hover:shadow-sm"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{asset.name}</p>
                    <p className="text-xs font-mono" style={{ color: 'var(--accent-primary)' }}>{asset.assetTag}</p>
                  </div>
                  <StatusBadge status={asset.status} />
                </div>
              </Link>
            ))}
            {myAssets.length === 0 && (
              <p className="py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>No assets assigned to you.</p>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value={3} className="mt-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {myTickets.map((ticket) => (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                <div
                  className="flex items-center justify-between rounded-xl border p-4 transition-all hover:shadow-sm"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{ticket.title}</p>
                    <p className="text-xs font-mono" style={{ color: 'var(--accent-primary)' }}>{ticket.ticketId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={ticket.priority} />
                    <StatusBadge status={ticket.status} />
                  </div>
                </div>
              </Link>
            ))}
            {myTickets.length === 0 && (
              <p className="py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>No tickets found.</p>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
