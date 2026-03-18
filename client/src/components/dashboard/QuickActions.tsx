'use client';

import Link from 'next/link';
import { Plus, Package } from 'lucide-react';

const actions = [
  {
    label: 'New Ticket',
    href: '/tickets/new',
    icon: Plus,
    variant: 'primary' as const,
  },
  {
    label: 'Add Asset',
    href: '/assets/new',
    icon: Package,
    variant: 'outlined' as const,
  },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        const isPrimary = action.variant === 'primary';

        return (
          <Link
            key={action.label}
            href={action.href}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all hover:shadow-md min-h-[44px]"
            style={{
              fontFamily: 'var(--font-mono)',
              background: isPrimary ? 'var(--accent-primary)' : 'transparent',
              color: isPrimary ? '#fff' : 'var(--text-secondary)',
              borderColor: isPrimary ? 'var(--accent-primary)' : 'var(--border-secondary)',
            }}
            onMouseEnter={(e) => {
              if (!isPrimary) {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-primary)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
              } else {
                (e.currentTarget as HTMLElement).style.background = 'var(--accent-primary-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isPrimary) {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-secondary)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              } else {
                (e.currentTarget as HTMLElement).style.background = 'var(--accent-primary)';
              }
            }}
          >
            <Icon size={16} aria-hidden="true" />
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}
