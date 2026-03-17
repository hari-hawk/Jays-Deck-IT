'use client';

import { Plus, Pencil, Trash2, UserCheck, CheckCircle, LogIn } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

interface ActivityEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  user: string;
  timestamp: string;
}

interface RecentActivityProps {
  data: ActivityEntry[];
}

const ACTION_CONFIG: Record<string, { icon: LucideIcon; color: string }> = {
  CREATE: { icon: Plus, color: 'var(--success)' },
  UPDATE: { icon: Pencil, color: 'var(--info)' },
  DELETE: { icon: Trash2, color: 'var(--danger)' },
  ASSIGN: { icon: UserCheck, color: 'var(--accent-primary)' },
  APPROVE: { icon: CheckCircle, color: 'var(--success)' },
  DENY: { icon: Trash2, color: 'var(--danger)' },
  LOGIN: { icon: LogIn, color: 'var(--info)' },
};

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function RecentActivity({ data }: RecentActivityProps) {
  return (
    <div className="space-y-0 divide-y" style={{ borderColor: 'var(--border-primary)' }}>
      {data.map((entry) => {
        const config = ACTION_CONFIG[entry.action] || ACTION_CONFIG.UPDATE;
        const Icon = config.icon;

        return (
          <div
            key={entry.id}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: `color-mix(in srgb, ${config.color} 15%, transparent)` }}
            >
              <Icon size={14} style={{ color: config.color }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm" style={{ color: 'var(--text-primary)' }}>
                <span className="font-medium">{entry.user}</span>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>
                  {entry.action.toLowerCase()}d {entry.entityType}
                </span>{' '}
                <span
                  className="font-medium"
                  style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                >
                  {entry.entityId}
                </span>
              </p>
            </div>
            <span
              className="flex-shrink-0 text-xs"
              style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}
            >
              {formatRelativeTime(entry.timestamp)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
