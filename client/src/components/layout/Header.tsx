'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search, Menu, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/auth';

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Command Bridge',
  '/assets': 'Asset Vault',
  '/employees': 'People Link',
  '/tickets': 'Service Hub',
  '/knowledge': 'Know Hub',
  '/audit': 'Audit Trail',
  '/settings': 'Settings',
  '/profile': 'Profile',
};

function getBreadcrumbLabel(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  const base = '/' + pathname.split('/')[1];
  return ROUTE_LABELS[base] || 'Dashboard';
}

export function Header({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) {
  const pathname = usePathname();
  const label = getBreadcrumbLabel(pathname);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header
      className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b px-4 backdrop-blur-md md:px-6"
      style={{
        background: 'var(--bg-glass)',
        borderColor: 'var(--border-primary)',
      }}
      role="banner"
    >
      {/* Mobile menu button */}
      {onMobileMenuToggle && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden min-h-[44px] min-w-[44px]"
          onClick={onMobileMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu className="size-5" style={{ color: 'var(--text-secondary)' }} />
        </Button>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li>
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--text-tertiary)' }}
              >
                JAYS DECK
              </span>
            </li>
            <li aria-hidden="true">
              <span
                className="text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              >
                /
              </span>
            </li>
            <li>
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary)' }}
                aria-current="page"
              >
                {label}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      {/* Search bar (centered) */}
      <div className="mx-auto hidden max-w-md flex-1 md:block">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
            style={{ color: 'var(--text-tertiary)' }}
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search assets, people, tickets..."
            className="h-9 pl-9 text-sm"
            style={{
              background: 'var(--bg-tertiary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)',
            }}
            aria-label="Search assets, people, and tickets"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative min-h-[44px] min-w-[44px]"
          aria-label="Notifications (3 unread)"
        >
          <Bell className="size-5" style={{ color: 'var(--text-secondary)' }} />
          <Badge
            className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center p-0 text-[10px]"
            style={{
              background: 'var(--accent-primary)',
              color: 'white',
            }}
            aria-live="polite"
          >
            3
          </Badge>
        </Button>

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors',
              'min-h-[44px] min-w-[44px]',
              'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]',
              'hover:bg-[var(--bg-tertiary)]'
            )}
          >
            <Avatar size="sm">
              <AvatarFallback
                className="text-[10px] font-bold"
                style={{
                  background: 'var(--accent-primary-subtle)',
                  color: 'var(--accent-primary)',
                }}
              >
                AK
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8}>
            <DropdownMenuLabel>Admin User</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => { window.location.href = '/profile'; }}
            >
              <User className="size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
