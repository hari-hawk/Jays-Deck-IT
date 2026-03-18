'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Users, Save, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { PageSkeleton } from '@/components/ui/skeleton-loaders';
import { PageTransition } from '@/components/layout/PageTransition';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { useUsers, useSlaConfig } from '@/lib/queries';
import { toast } from 'sonner';

interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
  role: string;
  status: string;
}

interface SlaItem {
  priority: string;
  responseTime: number;
  resolutionTime: number;
  unit: string;
}

const fallbackSlaConfig: SlaItem[] = [
  { priority: 'CRITICAL', responseTime: 15, resolutionTime: 120, unit: 'minutes' },
  { priority: 'HIGH', responseTime: 1, resolutionTime: 8, unit: 'hours' },
  { priority: 'MEDIUM', responseTime: 4, resolutionTime: 24, unit: 'hours' },
  { priority: 'LOW', responseTime: 8, resolutionTime: 72, unit: 'hours' },
];

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: slaConfig } = useSlaConfig();

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    toast.success('Configuration saved successfully');
  };

  if (usersLoading) {
    return <PageSkeleton type="list" count={6} />;
  }

  const userList: UserItem[] = users || [];
  const slaList: SlaItem[] = slaConfig || fallbackSlaConfig;

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'IT_ADMIN']}>
    <ErrorBoundary fallbackTitle="Settings failed to load">
      <PageTransition>
      <div className="space-y-6 p-6 md:p-8">
        <PageHeader
          index=""
          title="SETTINGS"
          description="System configuration and administration"
        />

        <Tabs defaultValue={0}>
          <TabsList variant="line" className="border-b w-full justify-start gap-0 rounded-none bg-transparent p-0" style={{ borderColor: 'var(--border-primary)' }}>
            <TabsTrigger value={0} className="rounded-none px-4 py-2.5 text-sm min-h-[44px]" style={{ color: 'var(--text-secondary)' }}>
              <Users className="size-4 mr-2" aria-hidden="true" />
              User Management
            </TabsTrigger>
            <TabsTrigger value={1} className="rounded-none px-4 py-2.5 text-sm min-h-[44px]" style={{ color: 'var(--text-secondary)' }}>
              <Clock className="size-4 mr-2" aria-hidden="true" />
              SLA Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value={0} className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm" role="table">
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)' }}>
                      <th scope="col" className="border-b px-4 py-3 text-left font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-primary)' }}>User</th>
                      <th scope="col" className="border-b px-4 py-3 text-left font-mono text-xs uppercase tracking-wider hidden md:table-cell" style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-primary)' }}>Email</th>
                      <th scope="col" className="border-b px-4 py-3 text-left font-mono text-xs uppercase tracking-wider hidden lg:table-cell" style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-primary)' }}>Department</th>
                      <th scope="col" className="border-b px-4 py-3 text-left font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-primary)' }}>Role</th>
                      <th scope="col" className="border-b px-4 py-3 text-left font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-primary)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList.map((emp) => {
                      const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`;
                      return (
                        <tr key={emp.id} className="transition-colors hover:bg-[var(--bg-tertiary)]">
                          <td className="border-b px-4 py-3" style={{ borderColor: 'var(--border-primary)' }}>
                            <div className="flex items-center gap-2">
                              <Avatar size="sm">
                                <AvatarFallback className="text-[10px] font-bold" style={{ background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)' }}>
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{emp.firstName} {emp.lastName}</span>
                            </div>
                          </td>
                          <td className="border-b px-4 py-3 hidden md:table-cell text-xs" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-primary)' }}>
                            {emp.email}
                          </td>
                          <td className="border-b px-4 py-3 hidden lg:table-cell text-xs" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-primary)' }}>
                            {emp.department}
                          </td>
                          <td className="border-b px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-primary)' }}>
                            {emp.role}
                          </td>
                          <td className="border-b px-4 py-3" style={{ borderColor: 'var(--border-primary)' }}>
                            <StatusBadge status={emp.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value={1} className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl space-y-6"
            >
              <div className="rounded-xl border p-6" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={16} style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>SLA Targets by Priority</h3>
                </div>
                <div className="space-y-4">
                  {slaList.map((sla) => (
                    <div key={sla.priority} className="grid grid-cols-3 gap-4 items-end rounded-lg border p-4" style={{ borderColor: 'var(--border-primary)' }}>
                      <div>
                        <StatusBadge status={sla.priority} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`response-${sla.priority}`} className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Response Time</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`response-${sla.priority}`}
                            type="number"
                            defaultValue={sla.responseTime}
                            className="h-9 w-20"
                            style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                          />
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{sla.unit}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`resolution-${sla.priority}`} className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Resolution Time</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`resolution-${sla.priority}`}
                            type="number"
                            defaultValue={sla.resolutionTime}
                            className="h-9 w-20"
                            style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                          />
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{sla.unit}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="gap-2 min-h-[44px]"
                    style={{ background: 'var(--accent-primary)', color: '#fff' }}
                  >
                    {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    {saving ? 'Saving...' : 'Save Configuration'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
      </PageTransition>
    </ErrorBoundary>
    </RoleGuard>
  );
}
