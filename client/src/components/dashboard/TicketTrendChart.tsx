'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface TrendEntry {
  date: string;
  opened: number;
  resolved: number;
}

interface TicketTrendChartProps {
  data: TrendEntry[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-lg"
      style={{
        background: 'var(--bg-tertiary)',
        borderColor: 'var(--border-secondary)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <p className="mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.dataKey === 'opened' ? 'var(--accent-primary)' : 'var(--success)' }}>
          {entry.dataKey}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export function TicketTrendChart({ data }: TicketTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" opacity={0.5} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}
          tickFormatter={(val: string) => val.slice(5)}
          stroke="var(--border-primary)"
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}
          stroke="var(--border-primary)"
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="opened"
          stroke="var(--accent-primary)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: 'var(--accent-primary)' }}
        />
        <Line
          type="monotone"
          dataKey="resolved"
          stroke="var(--success)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: 'var(--success)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
