'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Save, Loader2, Lock, Monitor, Ticket, Shield, Smartphone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/ui/status-badge';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { PageSkeleton } from '@/components/ui/skeleton-loaders';
import { PageTransition } from '@/components/layout/PageTransition';
import { useProfile } from '@/lib/queries';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface UserAsset {
  id: string;
  name: string;
  assetTag: string;
  status: string;
}

interface UserTicket {
  id: string;
  ticketNumber: string;
  title: string;
  priority: string;
  status: string;
}

interface LoginActivityItem {
  id: string;
  loginAt: string;
  ipAddress: string | null;
  device: string | null;
  method: string;
  location: string | null;
}

export default function ProfilePage() {
  const { data: profile, isLoading, error } = useProfile();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [myAssets, setMyAssets] = useState<UserAsset[]>([]);
  const [myTickets, setMyTickets] = useState<UserTicket[]>([]);
  const [loginActivity, setLoginActivity] = useState<LoginActivityItem[]>([]);

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
      });
      // Load user's assets, tickets, and login activity
      api.get(`/users/${profile.id}/assets`).then(res => setMyAssets(res.data.data || [])).catch(() => {});
      api.get(`/users/${profile.id}/tickets`).then(res => setMyTickets(res.data.data || [])).catch(() => {});
      api.get('/auth/login-activity').then(res => setLoginActivity(res.data.data || [])).catch(() => {});
    }
  }, [profile]);

  if (isLoading) {
    return <PageSkeleton type="list" count={1} />;
  }

  if (error || !profile) {
    return (
      <div className="p-6 text-center">
        <p style={{ color: 'var(--text-secondary)' }}>Failed to load profile. Please try again.</p>
      </div>
    );
  }

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`;

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/auth/me', form);
      toast.success('Profile saved successfully');
    } catch {
      toast.error('Failed to save profile');
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new,
      });
      setPasswordForm({ current: '', new: '', confirm: '' });
      toast.success('Password updated successfully');
    } catch {
      toast.error('Failed to update password');
    }
    setSaving(false);
  };

  return (
    <ErrorBoundary fallbackTitle="Profile failed to load">
      <PageTransition>
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
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{profile.designation || profile.role}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{profile.department || ''} {profile.location ? `\u00B7 ${profile.location}` : ''}</p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue={0}>
          <TabsList variant="line" className="border-b w-full justify-start gap-0 rounded-none bg-transparent p-0 overflow-x-auto" style={{ borderColor: 'var(--border-primary)' }}>
            <TabsTrigger value={0} className="rounded-none px-4 py-2.5 text-sm min-h-[44px] shrink-0" style={{ color: 'var(--text-secondary)' }}>
              Personal Info
            </TabsTrigger>
            <TabsTrigger value={1} className="rounded-none px-4 py-2.5 text-sm min-h-[44px] shrink-0" style={{ color: 'var(--text-secondary)' }}>
              <Lock className="size-4 mr-2" aria-hidden="true" />
              Change Password
            </TabsTrigger>
            <TabsTrigger value={2} className="rounded-none px-4 py-2.5 text-sm min-h-[44px] shrink-0" style={{ color: 'var(--text-secondary)' }}>
              <Monitor className="size-4 mr-2" aria-hidden="true" />
              My Assets
            </TabsTrigger>
            <TabsTrigger value={3} className="rounded-none px-4 py-2.5 text-sm min-h-[44px] shrink-0" style={{ color: 'var(--text-secondary)' }}>
              <Ticket className="size-4 mr-2" aria-hidden="true" />
              My Tickets
            </TabsTrigger>
            <TabsTrigger value={4} className="rounded-none px-4 py-2.5 text-sm min-h-[44px] shrink-0" style={{ color: 'var(--text-secondary)' }}>
              <Shield className="size-4 mr-2" aria-hidden="true" />
              Login Activity
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
                  <Label htmlFor="profile-first" className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>First Name</Label>
                  <Input id="profile-first" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="h-11" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-last" className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Last Name</Label>
                  <Input id="profile-last" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="h-11" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email" className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Email</Label>
                  <Input id="profile-email" value={profile.email} disabled className="h-11 opacity-60" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-phone" className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Phone</Label>
                  <Input id="profile-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-11" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div className="mt-6">
                <Button onClick={handleSaveProfile} disabled={saving} className="gap-2 min-h-[44px]" style={{ background: 'var(--accent-primary)', color: '#fff' }}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value={1} className="mt-6">
            <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleChangePassword} className="max-w-md rounded-xl border p-6 space-y-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Current Password</Label>
                <Input id="current-password" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} className="h-11" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} required autoComplete="current-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>New Password</Label>
                <Input id="new-password" type="password" value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} className="h-11" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} required minLength={8} autoComplete="new-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Confirm New Password</Label>
                <Input id="confirm-password" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="h-11" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} required minLength={8} autoComplete="new-password" />
              </div>
              <Button type="submit" disabled={saving || !passwordForm.current || !passwordForm.new || passwordForm.new !== passwordForm.confirm} className="gap-2 mt-2 min-h-[44px]" style={{ background: 'var(--accent-primary)', color: '#fff' }}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
                {saving ? 'Updating...' : 'Update Password'}
              </Button>
            </motion.form>
          </TabsContent>

          <TabsContent value={2} className="mt-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {myAssets.map((asset) => (
                <Link key={asset.id} href={`/assets/${asset.id}`}>
                  <div className="flex items-center justify-between rounded-xl border p-4 transition-all hover:shadow-sm" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
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
                  <div className="flex items-center justify-between rounded-xl border p-4 transition-all hover:shadow-sm" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{ticket.title}</p>
                      <p className="text-xs font-mono" style={{ color: 'var(--accent-primary)' }}>{ticket.ticketNumber}</p>
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

          <TabsContent value={4} className="mt-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Login Activity</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Last 10 sign-in sessions</p>
                </div>
                {loginActivity.slice(0, 10).map((activity, idx) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
                    style={{ borderColor: 'var(--border-primary)' }}
                  >
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: 'var(--accent-primary-subtle)' }}
                    >
                      <Smartphone className="size-4" style={{ color: 'var(--accent-primary)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {activity.device || 'Unknown device'}
                        </p>
                        {idx === 0 && (
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                            style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
                          >
                            Active now
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {new Date(activity.loginAt).toLocaleString()}
                        </span>
                        {activity.ipAddress && (
                          <>
                            <span style={{ color: 'var(--text-tertiary)' }}>&middot;</span>
                            <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                              {activity.ipAddress}
                            </span>
                          </>
                        )}
                        <span style={{ color: 'var(--text-tertiary)' }}>&middot;</span>
                        <span
                          className="text-[10px] font-mono uppercase rounded px-1.5 py-0.5"
                          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                        >
                          {activity.method}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {loginActivity.length === 0 && (
                  <p className="py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>No login activity recorded yet.</p>
                )}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
      </PageTransition>
    </ErrorBoundary>
  );
}
