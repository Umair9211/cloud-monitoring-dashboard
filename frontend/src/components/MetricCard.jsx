/**
 * MetricCard — single KPI card with icon, value, label, and optional sub-text.
 */

function Skeleton() {
  return (
    <div className="metric-card">
      <div className="metric-card-top">
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 6 }} />
      </div>
      <div className="skeleton skeleton-text" style={{ width: '55%' }} />
      <div className="skeleton skeleton-value" />
    </div>
  );
}

/**
 * @param {{
 *   label:   string,
 *   value:   string | number,
 *   icon:    React.ReactNode,
 *   color:   'blue'|'green'|'red'|'yellow'|'purple'|'cyan'|'orange',
 *   sub?:    string,
 *   delta?:  number,   // positive = good, negative = bad
 *   loading: boolean,
 * }} props
 */
export default function MetricCard({ label, value, icon, color = 'blue', sub, delta, loading }) {
  if (loading) return <Skeleton />;

  const clr = `var(--c-${color})`;
  const bg  = `var(--c-${color}-d)`;

  return (
    <div className="metric-card">
      <div className="metric-card-top">
        <div className="metric-icon" style={{ background: bg }}>
          <span style={{ color: clr, display: 'flex', alignItems: 'center' }}>{icon}</span>
        </div>
      </div>

      <div className="metric-label">{label}</div>

      <div
        className={`metric-value ${
          typeof value === 'string' && ['healthy','degraded','unhealthy','offline'].includes(value.toLowerCase())
            ? `status-${value.toLowerCase()}`
            : ''
        }`}
        style={{ color: typeof value === 'string' && value.toLowerCase() === 'healthy' ? undefined : undefined }}
      >
        {value ?? '—'}
      </div>

      {(sub || delta !== undefined) && (
        <div className="metric-sub">
          {delta !== undefined && (
            <span className={delta >= 0 ? 'delta-pos' : 'delta-neg'}>
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
            </span>
          )}
          {sub && <span>{sub}</span>}
        </div>
      )}
    </div>
  );
}
