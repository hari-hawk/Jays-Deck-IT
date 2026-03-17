'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

interface StatusEntry {
  name: string;
  value: number;
}

interface TicketsByStatusProps {
  data: StatusEntry[];
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'var(--accent-primary)',
  ASSIGNED: 'var(--info)',
  IN_PROGRESS: 'var(--warning)',
  ON_HOLD: '#A855F7',
  RESOLVED: 'var(--success)',
  CLOSED: 'var(--text-tertiary)',
  ESCALATED: 'var(--danger)',
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: StatusEntry; value: number }> }) {
  if (!active || !payload || !payload[0]) return null;
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-lg"
      style={{
        background: 'var(--bg-tertiary)',
        borderColor: 'var(--border-secondary)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <p style={{ color: 'var(--text-primary)' }}>
        {payload[0].payload.name}: {payload[0].value}
      </p>
    </div>
  );
}

export function TicketsByStatus({ data }: TicketsByStatusProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}
          stroke="var(--border-primary)"
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 10, fill: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
          stroke="var(--border-primary)"
          width={100}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || 'var(--text-tertiary)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
