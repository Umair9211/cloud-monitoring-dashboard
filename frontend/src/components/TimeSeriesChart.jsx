/**
 * TimeSeriesChart — CPU & Memory area chart using Recharts.
 */

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.map((p) => (
        <div className="tooltip-row" key={p.dataKey}>
          <span className="tooltip-swatch" style={{ background: p.color }} />
          <span className="text-muted">{p.name}:</span>
          <strong>{p.value}%</strong>
        </div>
      ))}
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <div className="skeleton" style={{ width: 160, height: 18 }} />
      </div>
      <div className="skeleton skeleton-chart" />
    </div>
  );
}

export default function TimeSeriesChart({ data, loading }) {
  if (loading || !data) return <SkeletonChart />;

  const chartData = data.labels.map((label, i) => ({
    label,
    CPU: data.cpu[i],
    Memory: data.memory[i],
  }));

  // Show every 4th tick on x-axis to avoid crowding
  const ticks = chartData.filter((_, i) => i % 4 === 0).map((d) => d.label);

  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <h3 className="section-title">CPU & Memory Utilization</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: 'var(--c-blue)' }} />
            CPU
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: 'var(--c-purple)' }} />
            Memory
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={210}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="gradCPU" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--c-blue)"   stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--c-blue)"   stopOpacity={0}   />
            </linearGradient>
            <linearGradient id="gradMem" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--c-purple)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--c-purple)" stopOpacity={0}   />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="var(--c-border-s)" vertical={false} />

          <XAxis
            dataKey="label"
            ticks={ticks}
            tick={{ fill: 'var(--c-text-3)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'var(--c-text-3)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--c-border)', strokeWidth: 1 }} />

          <Area
            type="monotone"
            dataKey="CPU"
            stroke="var(--c-blue)"
            strokeWidth={2}
            fill="url(#gradCPU)"
            dot={false}
            activeDot={{ r: 4, fill: 'var(--c-blue)', stroke: 'var(--c-bg)' }}
          />
          <Area
            type="monotone"
            dataKey="Memory"
            stroke="var(--c-purple)"
            strokeWidth={2}
            fill="url(#gradMem)"
            dot={false}
            activeDot={{ r: 4, fill: 'var(--c-purple)', stroke: 'var(--c-bg)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
