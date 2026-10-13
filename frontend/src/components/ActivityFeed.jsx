/**
 * ActivityFeed — chronological list of infrastructure events.
 */

import { AlertTriangle, ArrowUpDown, Info, Rocket, Shield } from 'lucide-react';

const TYPE_CONFIG = {
  deployment: { icon: Rocket,        color: 'var(--c-blue)',   bg: 'var(--c-blue-d)'   },
  alert:      { icon: AlertTriangle, color: 'var(--c-red)',    bg: 'var(--c-red-d)'    },
  scale:      { icon: ArrowUpDown,   color: 'var(--c-purple)', bg: 'var(--c-purple-d)' },
  security:   { icon: Shield,        color: 'var(--c-yellow)', bg: 'var(--c-yellow-d)' },
  info:       { icon: Info,          color: 'var(--c-cyan)',   bg: 'var(--c-cyan-d)'   },
};

function relativeTime(minutes) {
  if (minutes < 60) return `${minutes}m ago`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m ago` : `${h}h ago`;
}

function SkeletonFeed() {
  return (
    <div className="card">
      <div className="section-header">
        <div className="skeleton" style={{ width: 120, height: 18 }} />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 14, borderBottom: '1px solid var(--c-border-s)' }}>
          <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text" style={{ width: '70%' }} />
            <div className="skeleton skeleton-text" style={{ width: '90%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ActivityFeed({ data, loading }) {
  if (loading || !data) return <SkeletonFeed />;

  return (
    <div className="card" style={{ padding: '18px 18px 4px' }}>
      <div className="section-header" style={{ marginBottom: 6 }}>
        <h3 className="section-title">Recent Activity</h3>
        <span style={{ fontSize: '.72rem', color: 'var(--c-text-3)' }}>{data.length} events</span>
      </div>

      <div className="activity-list scroll-area">
        {data.map((act) => {
          const cfg = TYPE_CONFIG[act.type] ?? TYPE_CONFIG.info;
          const Icon = cfg.icon;
          return (
            <div className="activity-item" key={act.id}>
              <div className="activity-icon" style={{ background: cfg.bg }}>
                <Icon size={14} color={cfg.color} strokeWidth={2.5} />
              </div>
              <div className="activity-body">
                <div className="activity-title">{act.title}</div>
                <div className="activity-desc">{act.description}</div>
                <div className="activity-meta">
                  <span>{relativeTime(act.minutes_ago)}</span>
                  <span>•</span>
                  <span>{act.actor}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
