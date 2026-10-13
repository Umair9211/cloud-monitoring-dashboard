/**
 * RequestsChart — Bar chart showing request rate over time.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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
          <span className="tooltip-swatch" style={{ background: p.color ?? p.fill }} />
          <span className="text-muted">{p.name}:</span>
          <strong>{p.value}{p.name === 'Requests' ? ' /min' : ' ms'}</strong>
        </div>
      ))}
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <div className="skeleton" style={{ width: 130, height: 18 }} />
      </div>
      <div className="skeleton skeleton-chart" />
    </div>
  );
}

export default function RequestsChart({ data, loading, view = 'requests' }) {
  if (loading || !data) return <SkeletonChart />;

  const chartData = data.labels.map((label, i) => ({
    label,
    Requests: data.requests[i],
    'Response Time': data.response_time[i],
  }));

  const ticks = chartData.filter((_, i) => i % 6 === 0).map((d) => d.label);

  if (view === 'response') {
    return (
      <div className="chart-wrapper">
        <div className="chart-header">
          <h3 className="section-title">Avg Response Time</h3>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot" style={{ background: 'var(--c-green)' }} />
              ms
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--c-border-s)" vertical={false} />
            <XAxis dataKey="label" ticks={ticks} tick={{ fill: 'var(--c-text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--c-text-3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}ms`} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--c-border)', strokeWidth: 1 }} />
            <Line type="monotone" dataKey="Response Time" stroke="var(--c-green)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <h3 className="section-title">Request Rate</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: 'var(--c-blue)' }} />
            req/min
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }} barSize={6}>
          <CartesianGrid stroke="var(--c-border-s)" vertical={false} />
          <XAxis dataKey="label" ticks={ticks} tick={{ fill: 'var(--c-text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--c-text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(91,143,249,.06)' }} />
          <Bar dataKey="Requests" fill="var(--c-blue)" radius={[3, 3, 0, 0]} opacity={0.85} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
