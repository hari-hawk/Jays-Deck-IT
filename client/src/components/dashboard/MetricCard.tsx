'use client';

import { type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedNumber } from '@/components/ui/animations';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
}

export function MetricCard({ title, value, icon: Icon, trend }: MetricCardProps) {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const isNumeric = !isNaN(numericValue) && typeof value === 'number';
  const isPercentage = typeof value === 'string' && value.endsWith('%');
  const percentNum = isPercentage ? parseFloat(value) : 0;

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: 'var(--shadow-glow)' }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-xl border p-5 transition-colors"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-secondary)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)';
      }}
    >
      {/* Subtle top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-[2px] rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'var(--accent-primary)' }}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ background: 'var(--accent-primary-subtle)' }}
          >
            <Icon size={20} style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
          </div>
          <div>
            <p
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}
            >
              {isNumeric ? (
                <AnimatedNumber value={numericValue} duration={1.2} />
              ) : isPercentage ? (
                <>
                  <AnimatedNumber value={percentNum} duration={1.2} />%
                </>
              ) : (
                value
              )}
            </p>
            <p
              className="mt-1 text-xs font-medium uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}
            >
              {title}
            </p>
          </div>
        </div>

        {trend && (
          <span
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium"
            style={{
              fontFamily: 'var(--font-mono)',
              color: trend.isPositive ? 'var(--success)' : 'var(--danger)',
              background: trend.isPositive ? 'var(--success-subtle)' : 'var(--danger-subtle)',
            }}
          >
            {trend.isPositive ? '\u2191' : '\u2193'} {trend.value}%
          </span>
        )}
      </div>
    </motion.div>
  );
}
