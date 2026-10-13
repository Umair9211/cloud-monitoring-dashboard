/**
 * pages/Errors.jsx — Full error log with level filtering.
 */

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { api, useApi } from '../api/client';

const LEVEL_CLASS = {
  CRITICAL: 'badge-red',
  ERROR: 'badge-orange',
  WARNING: 'badge-yellow',
  INFO: 'badge-blue',
};

const LEVELS = ['ALL', 'CRITICAL', 'ERROR', 'WARNING', 'INFO'];

function relativeTime(isoString) {
  const diff = Math.round((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ago`;
}

function SkeletonRows() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton skeleton-row" style={{ marginBottom: 2 }} />
      ))}
    </>
  );
}

export default function Errors() {
  const [activeLevel, setActiveLevel] = useState('ALL');
  const { data, loading, error, ts, refetch } = useApi(() => api.errors(), 30_000);

  const allErrors = data?.errors ?? [];
  const filtered = activeLevel === 'ALL' ? allErrors : allErrors.filter((e) => e.level === activeLevel);

  const counts = LEVELS.reduce((acc, l) => {
    acc[l] = l === 'ALL' ? allErrors.length : allErrors.filter((e) => e.level === l).length;
    return acc;
  }, {});

  return (
    <>
      <header className="page-header">
        <div className="header-left">
          <div className="breadcrumb">
            <span>Cloud</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Error Log</span>
          </div>
        </div>
        <div className="header-right">
          {ts && <span className="last-updated">Updated {ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
          <button id="btn-refresh-errors" className={`header-btn${loading ? ' spinning' : ''}`} onClick={refetch}>
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

        {/* Level filters */}
        <div className="error-filters">
          {LEVELS.map((l) => (
            <button
              id={`filter-${l.toLowerCase()}`}
              key={l}
              className={`filter-btn${activeLevel === l ? ' active' : ''}`}
              onClick={() => setActiveLevel(l)}
            >
              {l !== 'ALL' && <span className={`badge ${LEVEL_CLASS[l]}`} style={{ padding: '1px 5px', fontSize: '.65rem' }}>{l}</span>}
              {l === 'ALL' && 'All'}
              <span className="count-chip">{counts[l]}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card" style={{ padding: '18px 0' }}>
          <div className="section-header" style={{ padding: '0 18px', marginBottom: 8 }}>
            <h3 className="section-title">
              {activeLevel === 'ALL' ? 'All Errors' : `${activeLevel} Events`}
            </h3>
            <span style={{ fontSize: '.72rem', color: 'var(--c-text-3)' }}>{filtered.length} entries</span>
          </div>

          {loading ? <SkeletonRows /> : (
            <div className="scroll-area" style={{ maxHeight: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 95 }}>Level</th>
                    <th style={{ width: 140 }}>Service</th>
                    <th>Message</th>
                    <th style={{ width: 65 }}>Count</th>
                    <th style={{ width: 100 }}>First Seen</th>
                    <th style={{ width: 100 }}>Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">No errors at this level.</div>
                      </td>
                    </tr>
                  ) : filtered.map((err) => (
                    <tr key={err.id}>
                      <td><span className={`badge ${LEVEL_CLASS[err.level] ?? 'badge-gray'}`}>{err.level}</span></td>
                      <td>
                        <span style={{ color: 'var(--c-text)', fontWeight: 500, fontSize: '.82rem' }}>{err.service}</span>
                      </td>
                      <td>
                        <span className="font-mono" style={{ fontSize: '.75rem', color: 'var(--c-text-2)', display: 'block' }}>
                          {err.message}
                        </span>
                      </td>
                      <td><span className="count-chip">{err.count}</span></td>
                      <td>
                        <span style={{ fontSize: '.72rem', color: 'var(--c-text-3)' }}>
                          {relativeTime(err.first_seen)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '.72rem', color: 'var(--c-text-3)' }}>
                          {relativeTime(err.last_seen)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
