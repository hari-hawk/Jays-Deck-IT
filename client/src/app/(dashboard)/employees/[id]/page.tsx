'use client';

import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Building, Monitor, Ticket, Users } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { EmptyState } from '@/components/ui/empty-state';
import { mockEmployees, mockAssets, mockTickets } from '@/lib/mock-data';

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const employee = mockEmployees.find((e) => e.id === id);

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <EmptyState
          icon={Users}
          title="Employee not found"
          description="The employee profile you are looking for does not exist."
          actionLabel="Back to People Link"
          actionHref="/employees"
        />
      </div>
    );
  }

  const assignedAssets = mockAssets.filter((a) => a.assigneeId === id);
  const employeeTickets = mockTickets.filter((t) => t.createdById === id);

  return (
    <ErrorBoundary fallbackTitle="Employee profile failed to load">
      <div className="space-y-6 p-6 md:p-8">
        <Link
          href="/employees"
          className="flex items-center gap-1 text-sm transition-colors hover:text-[var(--text-primary)] min-h-[44px] inline-flex"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="size-4" />
          Back to People Link
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border p-6"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarFallback
                  className="text-lg font-bold"
                  style={{ background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)' }}
                >
                  {employee.avatarInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {employee.firstName} {employee.lastName}
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{employee.designation}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{employee.department}</p>
              </div>
            </div>
            <StatusBadge status={employee.status} />
          </div>
        </motion.div>

        <Tabs defaultValue={0}>
          <TabsList variant="line" className="border-b w-full justify-start gap-0 rounded-none bg-transparent p-0" style={{ borderColor: 'var(--border-primary)' }}>
            <TabsTrigger value={0} className="rounded-none px-4 py-2.5 text-sm min-h-[44px]" style={{ color: 'var(--text-secondary)' }}>
              Profile
            </TabsTrigger>
            <TabsTrigger value={1} className="rounded-none px-4 py-2.5 text-sm min-h-[44px]" style={{ color: 'var(--text-secondary)' }}>
              Assigned Assets ({assignedAssets.length})
            </TabsTrigger>
            <TabsTrigger value={2} className="rounded-none px-4 py-2.5 text-sm min-h-[44px]" style={{ color: 'var(--text-secondary)' }}>
              Tickets ({employeeTickets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={0} className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4 rounded-xl border p-5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  Contact
                </h3>
                <InfoRow icon={Mail} label="Email" value={employee.email} />
                <InfoRow icon={Phone} label="Phone" value={employee.phone} />
                <InfoRow icon={MapPin} label="Location" value={employee.location} />
              </div>
              <div className="space-y-4 rounded-xl border p-5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  Organization
                </h3>
                <InfoRow icon={Building} label="Department" value={employee.department} />
                <InfoRow icon={Calendar} label="Join Date" value={employee.joinDate} />
                <InfoRow icon={Monitor} label="Assigned Assets" value={String(employee.assignedAssets)} />
                <InfoRow icon={Ticket} label="Open Tickets" value={String(employee.openTickets)} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value={1} className="mt-6">
            <div className="space-y-3">
              {assignedAssets.length > 0 ? assignedAssets.map((asset) => (
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
              )) : (
                <p className="py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  No assets assigned to this employee.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value={2} className="mt-6">
            <div className="space-y-3">
              {employeeTickets.length > 0 ? employeeTickets.map((ticket) => (
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
              )) : (
                <p className="py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  No tickets created by this employee.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} style={{ color: 'var(--text-tertiary)' }} aria-hidden="true" />
      <div>
        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{label}</span>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}
