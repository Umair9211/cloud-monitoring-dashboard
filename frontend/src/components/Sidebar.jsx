import { Activity, AlertTriangle, BarChart2, Cloud, Layers, LayoutDashboard, Server, Settings, Shield } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/services', icon: Server, label: 'Services' },
  { to: '/errors', icon: AlertTriangle, label: 'Errors' },
];

const SECONDARY = [
  { to: '/metrics', icon: BarChart2, label: 'Metrics' },
  { to: '/activity', icon: Activity, label: 'Activity' },
  { to: '/security', icon: Shield, label: 'Security' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ environment = 'development' }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Cloud size={18} color="#fff" strokeWidth={2} />
        </div>
        <div>
          <div className="logo-text">Cloud</div>
          <div className="logo-sub">Monitoring Dashboard</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Core</div>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={16} strokeWidth={2} />
            {label}
          </NavLink>
        ))}

        <div className="nav-section-label" style={{ marginTop: 14 }}>Management</div>
        {SECONDARY.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={16} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="env-badge">
          <span className="env-dot" />
          {environment}
        </div>
        <div style={{ marginTop: 10, fontSize: '.68rem', color: 'var(--c-text-3)' }}>
          <Layers size={12} style={{ display: 'inline', marginRight: 4 }} />
          AWS / us-east-1
        </div>
      </div>
    </aside>
  );
}
