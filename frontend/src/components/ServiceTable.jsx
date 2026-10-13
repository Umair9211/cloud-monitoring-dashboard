/**
 * ServiceTable — compact service health overview for the Dashboard.
 */

import { ExternalLink } from 'lucide-react';

function statusBadge(status) {
  const map = {
    healthy:  'badge-green',
    degraded: 'badge-yellow',
    offline:  'badge-red',
  };
  return map[status] ?? 'badge-gray';
}

function UptimeBar({ value }) {
  const pct = Math.min(100, value);
  const color = pct >= 99.5 ? 'var(--c-green)' : pct >= 98 ? 'var(--c-yellow)' : 'var(--c-red)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="uptime-bar">
        <div className="uptime-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span style={{ fontSize: '.72rem', color: 'var(--c-text-2)', fontVariantNumeric: 'tabular-nums', minWidth: 42 }}>
        {value}%
      </span>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="card">
      <div className="section-header">
        <div className="skeleton" style={{ width: 140, height: 18 }} />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton skeleton-row" style={{ marginBottom: 1, borderRadius: 0 }} />
      ))}
    </div>
  );
}

export default function ServiceTable({ data, loading }) {
  if (loading || !data) return <SkeletonTable />;

  // Show top 6 on the dashboard
  const visible = data.slice(0, 6);

  return (
    <div className="card" style={{ padding: '18px 0' }}>
      <div className="section-header" style={{ padding: '0 18px', marginBottom: 8 }}>
        <h3 className="section-title">Service Health</h3>
        <span style={{ fontSize: '.72rem', color: 'var(--c-text-3)' }}>{data.length} services</span>
      </div>

      <div className="scroll-area">
        <table className="data-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Status</th>
              <th>Latency</th>
              <th>Uptime</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((svc) => (
              <tr key={svc.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`status-dot ${svc.status}`} />
                    <div>
                      <div style={{ color: 'var(--c-text)', fontWeight: 500, fontSize: '.82rem' }}>{svc.name}</div>
                      <div style={{ color: 'var(--c-text-3)', fontSize: '.7rem' }}>{svc.type}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${statusBadge(svc.status)}`}>
                    {svc.status}
                  </span>
                </td>
                <td>
                  <span className="font-mono text-sm" style={{ color: svc.status === 'offline' ? 'var(--c-text-3)' : 'var(--c-text)' }}>
                    {svc.status === 'offline' ? '—' : `${svc.latency_ms} ms`}
                  </span>
                </td>
                <td><UptimeBar value={svc.uptime_percent} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
