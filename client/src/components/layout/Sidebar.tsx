'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Monitor,
  Users,
  Ticket,
  BookOpen,
  ScrollText,
  Settings,
  ChevronLeft,
  LogOut,
} from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebar';
import { useAuthStore, isAdmin, isManager } from '@/stores/auth';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface NavItemDef {
  section: string;
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const ALL_NAV_ITEMS: NavItemDef[] = [
  { section: '00', label: 'COMMAND BRIDGE', href: '/', icon: LayoutDashboard },
  { section: '01', label: 'ASSET VAULT', href: '/assets', icon: Monitor },
  { section: '02', label: 'PEOPLE LINK', href: '/employees', icon: Users },
  { section: '03', label: 'SERVICE HUB', href: '/tickets', icon: Ticket },
  { section: '04', label: 'KNOW HUB', href: '/knowledge', icon: BookOpen },
  { section: '05', label: 'AUDIT TRAIL', href: '/audit', icon: ScrollText },
];

function getNavItemsForRole(role?: string): NavItemDef[] {
  if (isAdmin(role)) {
    // Full access
    return ALL_NAV_ITEMS;
  }
  if (isManager(role)) {
    // No Audit Trail, no Settings
    return ALL_NAV_ITEMS.filter((item) =>
      ['/', '/assets', '/employees', '/tickets', '/knowledge'].includes(item.href)
    );
  }
  // EMPLOYEE: Dashboard, My Assets (assets), Service Hub, Know Hub
  return ALL_NAV_ITEMS.filter((item) =>
    ['/', '/assets', '/tickets', '/knowledge'].includes(item.href)
  );
}

function shouldShowSettings(role?: string): boolean {
  return isAdmin(role);
}

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 72;

const sidebarTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

function NavItem({
  item,
  isActive,
  isCollapsed,
}: {
  item: NavItemDef;
  isActive: boolean;
  isCollapsed: boolean;
}) {
  const Icon = item.icon;

  const linkContent = (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
        'min-h-[44px] min-w-[44px]',
        'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-secondary)]',
        isActive
          ? 'text-[var(--text-primary)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
        isCollapsed && 'justify-center px-0'
      )}
      style={
        isActive
          ? {
              background: 'var(--accent-primary-subtle)',
            }
          : undefined
      }
    >
      {/* Animated hover background that slides in from left */}
      {!isActive && (
        <span
          className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'var(--bg-tertiary)' }}
          aria-hidden="true"
        />
      )}

      {/* Animated active indicator - left border with spring */}
      {isActive && (
        <motion.span
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
          style={{ background: 'var(--accent-primary)' }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          aria-hidden="true"
        />
      )}

      <Icon className="relative z-10 size-5 shrink-0" />
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 overflow-hidden relative z-10"
          >
            <span
              className="font-mono text-xs tracking-wider whitespace-nowrap"
              style={{ color: 'var(--text-tertiary)' }}
            >
              [{item.section}]
            </span>
            <span className="truncate text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
              {item.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={<div />}>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          <span className="font-mono text-xs">[{item.section}]</span>{' '}
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

export function Sidebar() {
  const router = useRouter();
  const { isCollapsed, toggle } = useSidebarStore();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const role = user?.role;
  const navItems = getNavItemsForRole(role);
  const showSettings = shouldShowSettings(role);

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U';
  const roleLabel = role?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'User';

  return (
    <TooltipProvider>
      <motion.aside
        className="flex h-screen flex-col overflow-hidden border-r"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
        initial={false}
        animate={{
          width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        }}
        transition={sidebarTransition}
        aria-label="Main navigation"
        role="navigation"
      >
        {/* Logo + Collapse Toggle (near logo) */}
        <div
          className={cn(
            'flex shrink-0 items-center justify-between border-b px-4 h-16',
            isCollapsed && 'justify-center px-0'
          )}
          style={{ borderColor: 'var(--border-primary)' }}
        >
          {isCollapsed ? (
            <button
              onClick={toggle}
              className="flex items-center justify-center min-h-[44px] min-w-[44px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-md"
              aria-label="Expand sidebar"
            >
              <span
                className="text-lg font-extrabold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                J<span className="logo-glow" style={{ color: 'var(--accent-primary)' }}>D</span>
              </span>
            </button>
          ) : (
            <>
              <span
                className="text-xl font-extrabold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                JAYS{' '}
                <span className="logo-glow" style={{ color: 'var(--accent-primary)' }}>DECK</span>
              </span>
              <button
                onClick={toggle}
                className={cn(
                  'flex items-center justify-center rounded-md min-h-[44px] min-w-[44px] transition-colors',
                  'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]',
                  'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]',
                )}
                aria-label="Collapse sidebar"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: 0 }}
                  transition={sidebarTransition}
                >
                  <ChevronLeft className="size-5" />
                </motion.div>
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1" role="list">
            {navItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <NavItem
                    item={item}
                    isActive={isActive}
                    isCollapsed={isCollapsed}
                  />
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Settings - only for admins */}
        {showSettings && (
          <div className="px-3 py-1">
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger render={<div />}>
                  <Link
                    href="/settings"
                    className={cn(
                      'flex items-center justify-center rounded-md py-2.5 text-sm font-medium transition-colors',
                      'min-h-[44px] min-w-[44px]',
                      'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]',
                      'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]',
                      pathname === '/settings' && 'text-[var(--text-primary)]'
                    )}
                    aria-current={pathname === '/settings' ? 'page' : undefined}
                  >
                    <Settings className="size-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  Settings
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                href="/settings"
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  'min-h-[44px]',
                  'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]',
                  'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]',
                  pathname === '/settings' && 'text-[var(--text-primary)]'
                )}
                aria-current={pathname === '/settings' ? 'page' : undefined}
              >
                <Settings className="size-5" />
                <span className="text-xs uppercase tracking-wider">Settings</span>
              </Link>
            )}
          </div>
        )}

        <Separator className="mx-3" style={{ background: 'var(--border-primary)' }} />

        {/* Theme Toggle (at the bottom) */}
        <div className="px-3 py-2">
          <ThemeToggle collapsed={isCollapsed} />
        </div>

        <Separator className="mx-3" style={{ background: 'var(--border-primary)' }} />

        {/* User Section */}
        <div
          className={cn(
            'flex shrink-0 items-center gap-3 p-4 transition-all duration-200 rounded-lg mx-1 mb-1',
            isCollapsed && 'flex-col justify-center px-0 py-3 gap-2',
            'hover-glow'
          )}
        >
          <Link href="/profile" className={cn('flex items-center gap-3 min-w-0 flex-1', isCollapsed && 'flex-col')}>
            <Avatar size="default">
              <AvatarFallback
                className="text-xs font-bold"
                style={{
                  background: 'var(--accent-primary-subtle)',
                  color: 'var(--accent-primary)',
                }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col overflow-hidden"
                >
                  <span
                    className="truncate text-sm font-medium whitespace-nowrap"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {displayName}
                  </span>
                  <span
                    className="truncate text-xs whitespace-nowrap"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {roleLabel}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
          {/* Logout button */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger render={<div />}>
                <button
                  onClick={async () => { await logout(); router.replace('/login'); }}
                  className={cn(
                    'flex items-center justify-center rounded-md min-h-[36px] min-w-[36px] transition-colors',
                    'text-[var(--text-tertiary)] hover:text-[var(--danger)] hover:bg-[var(--danger-subtle)]',
                    'outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)]',
                  )}
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Sign out
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={async () => { await logout(); router.replace('/login'); }}
              className={cn(
                'flex items-center justify-center rounded-md min-h-[36px] min-w-[36px] transition-colors',
                'text-[var(--text-tertiary)] hover:text-[var(--danger)] hover:bg-[var(--danger-subtle)]',
                'outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)]',
              )}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          )}
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
