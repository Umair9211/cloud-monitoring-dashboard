/**
 * ErrorTable — application error log with level badges.
 */

const LEVEL_CLASS = {
  CRITICAL: 'badge-red',
  ERROR:    'badge-orange',
  WARNING:  'badge-yellow',
  INFO:     'badge-blue',
};

function relativeTime(isoString) {
  const diff = Math.round((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diff < 1)  return 'just now';
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  return `${h}h ago`;
}

function SkeletonTable() {
  return (
    <div className="card">
      <div className="section-header" style={{ marginBottom: 12 }}>
        <div className="skeleton" style={{ width: 140, height: 18 }} />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton skeleton-row" style={{ marginBottom: 2 }} />
      ))}
    </div>
  );
}

export default function ErrorTable({ data, loading, limit }) {
  if (loading || !data) return <SkeletonTable />;

  const rows = limit ? data.slice(0, limit) : data;

  return (
    <div className="card" style={{ padding: '18px 0' }}>
      <div className="section-header" style={{ padding: '0 18px', marginBottom: 8 }}>
        <h3 className="section-title">Recent Errors</h3>
        <span style={{ fontSize: '.72rem', color: 'var(--c-text-3)' }}>{data.length} total</span>
      </div>

      <div className="scroll-area">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 90 }}>Level</th>
              <th style={{ width: 130 }}>Service</th>
              <th>Message</th>
              <th style={{ width: 60 }}>Count</th>
              <th style={{ width: 90 }}>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((err) => (
              <tr key={err.id}>
                <td>
                  <span className={`badge ${LEVEL_CLASS[err.level] ?? 'badge-gray'}`}>
                    {err.level}
                  </span>
                </td>
                <td>
                  <span style={{ color: 'var(--c-text)', fontSize: '.8rem', fontWeight: 500 }}>
                    {err.service}
                  </span>
                </td>
                <td>
                  <span
                    className="truncate"
                    style={{ display: 'block', maxWidth: 500, color: 'var(--c-text-2)', fontSize: '.8rem' }}
                    title={err.message}
                  >
                    {err.message}
                  </span>
                </td>
                <td>
                  <span className="count-chip">{err.count}</span>
                </td>
                <td>
                  <span style={{ color: 'var(--c-text-3)', fontSize: '.75rem', fontVariantNumeric: 'tabular-nums' }}>
                    {relativeTime(err.last_seen)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
