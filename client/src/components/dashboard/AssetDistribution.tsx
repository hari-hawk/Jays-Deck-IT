'use client';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

interface AssetEntry {
  name: string;
  value: number;
}

interface AssetDistributionProps {
  data: AssetEntry[];
}

const COLORS = [
  'var(--accent-primary)',
  'var(--success)',
  'var(--warning)',
  'var(--danger)',
  'var(--info)',
  '#A855F7',
  '#EC4899',
];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
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
        {payload[0].name}: {payload[0].value}
      </p>
    </div>
  );
}

export function AssetDistribution({ data }: AssetDistributionProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
          stroke="none"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
          }}
          formatter={(value: string) => (
            <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{value}</span>
          )}
        />
        {/* Center text */}
        <text
          x="50%"
          y="48%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: '24px', fontWeight: 700, fill: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
        >
          {total}
        </text>
        <text
          x="50%"
          y="58%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: '10px', fill: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
        >
          TOTAL
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
}
