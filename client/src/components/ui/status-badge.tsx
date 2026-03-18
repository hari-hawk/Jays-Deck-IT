'use client';

import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  AVAILABLE: { bg: 'var(--success-subtle)', text: 'var(--success)', dot: 'var(--success)' },
  ASSIGNED: { bg: 'var(--accent-primary-subtle)', text: 'var(--accent-primary)', dot: 'var(--accent-primary)' },
  IN_MAINTENANCE: { bg: 'var(--warning-subtle)', text: 'var(--warning)', dot: 'var(--warning)' },
  RETIRED: { bg: 'var(--bg-tertiary)', text: 'var(--text-tertiary)', dot: 'var(--text-tertiary)' },
  LOST: { bg: 'var(--danger-subtle)', text: 'var(--danger)', dot: 'var(--danger)' },
  ACTIVE: { bg: 'var(--success-subtle)', text: 'var(--success)', dot: 'var(--success)' },
  INACTIVE: { bg: 'var(--bg-tertiary)', text: 'var(--text-tertiary)', dot: 'var(--text-tertiary)' },
  ON_LEAVE: { bg: 'var(--warning-subtle)', text: 'var(--warning)', dot: 'var(--warning)' },
  OPEN: { bg: 'var(--accent-primary-subtle)', text: 'var(--accent-primary)', dot: 'var(--accent-primary)' },
  IN_PROGRESS: { bg: 'var(--warning-subtle)', text: 'var(--warning)', dot: 'var(--warning)' },
  ON_HOLD: { bg: 'var(--info-subtle)', text: '#A855F7', dot: '#A855F7' },
  RESOLVED: { bg: 'var(--success-subtle)', text: 'var(--success)', dot: 'var(--success)' },
  CLOSED: { bg: 'var(--bg-tertiary)', text: 'var(--text-tertiary)', dot: 'var(--text-tertiary)' },
  ESCALATED: { bg: 'var(--danger-subtle)', text: 'var(--danger)', dot: 'var(--danger)' },
  LOW: { bg: 'var(--bg-tertiary)', text: 'var(--text-secondary)', dot: 'var(--text-secondary)' },
  MEDIUM: { bg: 'var(--warning-subtle)', text: 'var(--warning)', dot: 'var(--warning)' },
  HIGH: { bg: 'var(--danger-subtle)', text: 'var(--danger)', dot: 'var(--danger)' },
  CRITICAL: { bg: 'var(--danger-subtle)', text: 'var(--danger)', dot: 'var(--danger)' },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.ACTIVE;
  const label = status.replace(/_/g, ' ');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider',
        className
      )}
      style={{
        background: style.bg,
        color: style.text,
        fontFamily: 'var(--font-mono)',
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ background: style.dot }}
      />
      {label}
    </span>
  );
}
