'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { EmptyState } from '@/components/ui/empty-state';
import { PageSkeleton } from '@/components/ui/skeleton-loaders';
import { PageTransition } from '@/components/layout/PageTransition';
import { useEmployees } from '@/lib/queries';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
  location: string;
  status: string;
}

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: employees, isLoading, error } = useEmployees({
    search: search || undefined,
    department: departmentFilter !== 'ALL' ? departmentFilter : undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  if (isLoading) {
    return <PageSkeleton type="cards" count={8} />;
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Users}
          title="Failed to load employees"
          description="There was an error loading the employee directory. Please try again."
        />
      </div>
    );
  }

  const filtered: Employee[] = employees || [];

  // Extract unique departments for filter dropdown
  const departments = [...new Set(filtered.map((e: Employee) => e.department).filter(Boolean))];

  return (
    <ErrorBoundary fallbackTitle="People Link failed to load">
      <PageTransition>
      <div className="space-y-6 p-6 md:p-8">
        <PageHeader
          index="02"
          title="PEOPLE LINK"
          description="Employee directory and management"
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
              placeholder="Search people..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
              aria-label="Search employees"
            />
          </div>
          <label htmlFor="dept-filter" className="sr-only">Filter by department</label>
          <select
            id="dept-filter"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-10 rounded-lg border px-3 text-sm min-h-[44px]"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <label htmlFor="emp-status-filter" className="sr-only">Filter by status</label>
          <select
            id="emp-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border px-3 text-sm min-h-[44px]"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>
        </motion.div>

        {/* Results count */}
        <p className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }} aria-live="polite">
          {filtered.length} employee{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Employee Grid */}
        {filtered.length > 0 ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filtered.map((emp: Employee) => {
              const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`;
              return (
                <motion.div key={emp.id} variants={item} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                  <Link href={`/employees/${emp.id}`}>
                    <div
                      className="group rounded-xl border p-5 transition-all hover:shadow-md"
                      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-secondary)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'; }}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar size="default">
                          <AvatarFallback
                            className="text-xs font-bold"
                            style={{ background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)' }}
                          >
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                            {emp.firstName} {emp.lastName}
                          </h3>
                          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{emp.designation}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{emp.department}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{emp.location}</span>
                        <StatusBadge status={emp.status} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <EmptyState
            icon={Users}
            title="No employees found"
            description="Try adjusting your search or filter criteria."
          />
        )}
      </div>
      </PageTransition>
    </ErrorBoundary>
  );
}
