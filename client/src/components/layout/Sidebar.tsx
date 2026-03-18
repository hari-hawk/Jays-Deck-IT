'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Monitor,
  Users,
  Ticket,
  BookOpen,
  ScrollText,
  Settings,
  ChevronLeft,
} from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebar';
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

const NAV_ITEMS = [
  { section: '00', label: 'COMMAND BRIDGE', href: '/', icon: LayoutDashboard },
  { section: '01', label: 'ASSET VAULT', href: '/assets', icon: Monitor },
  { section: '02', label: 'PEOPLE LINK', href: '/employees', icon: Users },
  { section: '03', label: 'SERVICE HUB', href: '/tickets', icon: Ticket },
  { section: '04', label: 'KNOW HUB', href: '/knowledge', icon: BookOpen },
  { section: '05', label: 'AUDIT TRAIL', href: '/audit', icon: ScrollText },
] as const;

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
  item: (typeof NAV_ITEMS)[number];
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
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]',
        isCollapsed && 'justify-center px-0'
      )}
      style={
        isActive
          ? {
              background: 'var(--accent-primary-subtle)',
              borderLeft: '3px solid var(--accent-primary)',
              paddingLeft: isCollapsed ? '0' : '9px',
            }
          : undefined
      }
    >
      <Icon className="size-5 shrink-0" />
      {!isCollapsed && (
        <>
          <span
            className="font-mono text-xs tracking-wider"
            style={{ color: 'var(--text-tertiary)' }}
          >
            [{item.section}]
          </span>
          <span className="truncate text-xs font-semibold uppercase tracking-wider">
            {item.label}
          </span>
        </>
      )}
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
  const { isCollapsed, toggle } = useSidebarStore();
  const pathname = usePathname();

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
        role="complementary"
      >
        {/* Logo + Theme Toggle */}
        <div
          className={cn(
            'flex shrink-0 items-center justify-between border-b px-4 h-16',
            isCollapsed && 'justify-center px-0'
          )}
          style={{ borderColor: 'var(--border-primary)' }}
        >
          {isCollapsed ? (
            <span
              className="text-lg font-extrabold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              J<span style={{ color: 'var(--accent-primary)' }}>D</span>
            </span>
          ) : (
            <>
              <span
                className="text-xl font-extrabold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                JAYS{' '}
                <span style={{ color: 'var(--accent-primary)' }}>DECK</span>
              </span>
              <ThemeToggle collapsed={false} />
            </>
          )}
        </div>

        {/* Theme toggle when collapsed */}
        {isCollapsed && (
          <div className="flex justify-center py-2" style={{ borderColor: 'var(--border-primary)' }}>
            <ThemeToggle collapsed={true} />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" role="navigation">
          <ul className="flex flex-col gap-1" role="list">
            {NAV_ITEMS.map((item) => {
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

        {/* Collapse Toggle */}
        <div className="px-3 pb-2">
          <button
            onClick={toggle}
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
              'min-h-[44px] min-w-[44px]',
              'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]',
              'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-secondary)]',
              isCollapsed && 'justify-center px-0'
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={sidebarTransition}
            >
              <ChevronLeft className="size-5" />
            </motion.div>
            {!isCollapsed && (
              <span className="text-xs uppercase tracking-wider">
                Collapse
              </span>
            )}
          </button>
        </div>

        {/* Separator */}
        <Separator
          className="mx-3"
          style={{ background: 'var(--border-primary)' }}
        />

        {/* Settings */}
        <div className="px-3 py-2">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger render={<div />}>
                <Link
                  href="/settings"
                  className={cn(
                    'flex items-center justify-center rounded-md py-2.5 text-sm font-medium transition-colors',
                    'min-h-[44px] min-w-[44px]',
                    'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]',
                    'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-secondary)]',
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
                'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-secondary)]',
                pathname === '/settings' && 'text-[var(--text-primary)]'
              )}
              aria-current={pathname === '/settings' ? 'page' : undefined}
            >
              <Settings className="size-5" />
              <span className="text-xs uppercase tracking-wider">Settings</span>
            </Link>
          )}
        </div>

        {/* Separator */}
        <Separator
          className="mx-3"
          style={{ background: 'var(--border-primary)' }}
        />

        {/* User Section */}
        <div
          className={cn(
            'flex shrink-0 items-center gap-3 border-t p-4',
            isCollapsed && 'justify-center px-0 py-4'
          )}
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <Link href="/profile" className="flex items-center gap-3 min-w-0">
            <Avatar size="default">
              <AvatarFallback
                className="text-xs font-bold"
                style={{
                  background: 'var(--accent-primary-subtle)',
                  color: 'var(--accent-primary)',
                }}
              >
                AK
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span
                  className="truncate text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Admin User
                </span>
                <span
                  className="truncate text-xs"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  IT Administrator
                </span>
              </div>
            )}
          </Link>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
