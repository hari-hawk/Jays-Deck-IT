'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, isAdmin } from '@/stores/auth';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  /** Minimum role check. Defaults to admin-only. */
  allowedRoles?: string[];
}

/**
 * Wraps a page that should only be accessible to certain roles.
 * Non-authorized users are redirected to the dashboard.
 */
export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (!user) return;

    const role = user.role;
    const hasAccess = allowedRoles
      ? allowedRoles.includes(role)
      : isAdmin(role);

    if (!hasAccess) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    );
  }

  const role = user?.role;
  const hasAccess = allowedRoles
    ? allowedRoles.includes(role || '')
    : isAdmin(role);

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
