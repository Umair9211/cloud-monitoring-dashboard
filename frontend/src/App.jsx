import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useApi, api } from './api/client';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Errors from './pages/Errors';

// A placeholder for nav items that don't have a full page yet.
function Placeholder({ title }) {
  return (
    <>
      <header className="page-header">
        <div className="header-left">
          <div className="breadcrumb">
            <span>CloudV1</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{title}</span>
          </div>
        </div>
      </header>
      <main className="page-content">
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <span style={{ fontSize: '2rem' }}>🚧</span>
          <strong style={{ color: 'var(--c-text)' }}>{title}</strong>
          <span>This section is under construction.</span>
        </div>
      </main>
    </>
  );
}

export default function App() {
  // Fetch env from /api/health to pass to Sidebar
  const health = useApi(() => api.health(), 60_000);
  const env = health.data?.environment ?? 'development';

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar environment={env} />
        <div className="main-area">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/services" element={<Services />} />
            <Route path="/errors" element={<Errors />} />
            <Route path="/metrics" element={<Placeholder title="Metrics" />} />
            <Route path="/activity" element={<Placeholder title="Activity" />} />
            <Route path="/security" element={<Placeholder title="Security" />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
