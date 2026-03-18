'use client';

import { motion } from 'framer-motion';

interface PageHeaderProps {
  index: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ index, title, description, actions }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}
          >
            [{index}]
          </span>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
          >
            {title}
          </span>
        </div>
        {description && (
          <p
            className="mt-1 text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  );
}
