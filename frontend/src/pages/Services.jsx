/**
 * pages/Services.jsx — Full service health grid.
 */

import { AlertTriangle, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';
import { api, useApi } from '../api/client';

function statusIcon(status) {
  if (status === 'healthy') return <CheckCircle2 size={16} color="var(--c-green)" strokeWidth={2} />;
  if (status === 'degraded') return <AlertTriangle size={16} color="var(--c-yellow)" strokeWidth={2} />;
  return <XCircle size={16} color="var(--c-red)" strokeWidth={2} />;
}

function statusClass(status) {
  return { healthy: 'badge-green', degraded: 'badge-yellow', offline: 'badge-red' }[status] ?? 'badge-gray';
}

function UptimeBar({ value }) {
  const color = value >= 99.5 ? 'var(--c-green)' : value >= 98 ? 'var(--c-yellow)' : 'var(--c-red)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="uptime-bar" style={{ width: 90 }}>
        <div className="uptime-fill" style={{ width: `${Math.min(100, value)}%`, background: color }} />
      </div>
      <span className="font-mono text-sm">{value}%</span>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="services-grid">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="service-card">
          <div className="skeleton" style={{ height: 18, width: '60%', marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 60 }} />
        </div>
      ))}
    </div>
  );
}

export default function Services() {
  const { data, loading, error, ts, refetch } = useApi(() => api.services(), 30_000);

  const svcs = data?.services ?? [];

  return (
    <>
      <header className="page-header">
        <div className="header-left">
          <div className="breadcrumb">
            <span>Cloud</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Services</span>
          </div>
        </div>
        <div className="header-right">
          {ts && <span className="last-updated">Updated {ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
          <button id="btn-refresh-services" className={`header-btn${loading ? ' spinning' : ''}`} onClick={refetch}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </header>

      <main className="page-content">
        {error && (
          <div className="error-banner">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Summary pills */}
        {data && (
          <div className="stat-row">
            {[
              { label: 'Total', value: data.total, color: 'var(--c-text)' },
              { label: 'Healthy', value: data.healthy, color: 'var(--c-green)' },
              { label: 'Degraded', value: data.degraded, color: 'var(--c-yellow)' },
              { label: 'Offline', value: data.offline, color: 'var(--c-red)' },
            ].map(({ label, value, color }) => (
              <div className="stat-pill" key={label}>
                <span style={{ color, fontWeight: 700, fontSize: '.95rem' }}>{value}</span>
                <span className="text-muted">{label}</span>
              </div>
            ))}
          </div>
        )}

        {loading ? <SkeletonGrid /> : (
          <div className="services-grid">
            {svcs.map((svc) => (
              <div className="service-card" key={svc.id}>
                <div className="service-card-top">
                  <div>
                    <div className="service-name">{svc.name}</div>
                    <div className="service-type">{svc.type} · {svc.region}</div>
                  </div>
                  {statusIcon(svc.status)}
                </div>

                <div className="service-stats">
                  <div className="stat-box">
                    <div className="stat-label">Status</div>
                    <span className={`badge ${statusClass(svc.status)}`}>{svc.status}</span>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Latency</div>
                    <div className="stat-value font-mono">
                      {svc.status === 'offline' ? '—' : `${svc.latency_ms} ms`}
                    </div>
                  </div>
                  <div className="stat-box" style={{ gridColumn: 'span 2' }}>
                    <div className="stat-label">Uptime</div>
                    <UptimeBar value={svc.uptime_percent} />
                  </div>
                </div>

                <div style={{ marginTop: 12, fontSize: '.7rem', color: 'var(--c-text-3)' }}>
                  Checked: {svc.last_checked ? new Date(svc.last_checked).toLocaleTimeString() : '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
