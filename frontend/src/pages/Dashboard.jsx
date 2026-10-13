/**
 * pages/Dashboard.jsx — Main overview page.
 *
 * Fetches all six API endpoints in parallel and renders:
 *  • 6 KPI metric cards
 *  • CPU & Memory area chart
 *  • Request-rate bar chart
 *  • Service health table + activity feed
 *  • Error log table
 */

import {
  Activity,
  AlertTriangle,
  Clock,
  Cpu,
  HardDrive,
  Heart,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { api, useApi } from '../api/client';
import ActivityFeed from '../components/ActivityFeed';
import ErrorTable from '../components/ErrorTable';
import MetricCard from '../components/MetricCard';
import RequestsChart from '../components/RequestsChart';
import ServiceTable from '../components/ServiceTable';
import TimeSeriesChart from '../components/TimeSeriesChart';

const POLL = 30_000;    // 30 s
const POLL_TS = 60_000; // 1 min for time-series

function formatTs(date) {
  if (!date) return '—';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function Dashboard() {
  const health = useApi(() => api.health(), POLL);
  const metrics = useApi(() => api.metrics(), POLL);
  const timeseries = useApi(() => api.timeseries(), POLL_TS);
  const services = useApi(() => api.services(), POLL);
  const activity = useApi(() => api.activity(), POLL_TS);
  const errors = useApi(() => api.errors(), POLL_TS);

  const m = metrics.data;
  const svc = services.data;

  const anyError = [health, metrics, services].find((r) => r.error);

  function refetchAll() {
    health.refetch();
    metrics.refetch();
    timeseries.refetch();
    services.refetch();
    activity.refetch();
    errors.refetch();
  }

  return (
    <>
      {/* ── Page header ──────────────────────────────────────── */}
      <header className="page-header">
        <div className="header-left">
          <div className="breadcrumb">
            <span>Cloud</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Dashboard</span>
          </div>
        </div>
        <div className="header-right">
          {metrics.ts && (
            <span className="last-updated">Updated {formatTs(metrics.ts)}</span>
          )}
          <button
            id="btn-refresh-dashboard"
            className={`header-btn${metrics.loading ? ' spinning' : ''}`}
            onClick={refetchAll}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────── */}
      <main className="page-content">

        {anyError && (
          <div className="error-banner">
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>API error: {anyError.error}. Data may be stale — retrying automatically.</span>
          </div>
        )}

        {/* Metric cards */}
        <div className="metric-grid">
          <MetricCard
            id="card-health"
            label="System Health"
            value={health.data?.status ?? '—'}
            icon={<Heart size={18} strokeWidth={2} />}
            color="green"
            sub={`v${health.data?.version ?? '—'}`}
            loading={health.loading}
          />
          <MetricCard
            id="card-cpu"
            label="CPU Utilization"
            value={m ? `${m.cpu_utilization}%` : '—'}
            icon={<Cpu size={18} strokeWidth={2} />}
            color="blue"
            sub="current average"
            loading={metrics.loading}
          />
          <MetricCard
            id="card-memory"
            label="Memory Usage"
            value={m ? `${m.memory_usage}%` : '—'}
            icon={<HardDrive size={18} strokeWidth={2} />}
            color="purple"
            sub="heap + swap"
            loading={metrics.loading}
          />
          <MetricCard
            id="card-requests"
            label="Request Rate"
            value={m ? `${m.request_rate}` : '—'}
            icon={<Zap size={18} strokeWidth={2} />}
            color="cyan"
            sub="requests / min"
            loading={metrics.loading}
          />
          <MetricCard
            id="card-response"
            label="Avg Response"
            value={m ? `${m.avg_response_time_ms} ms` : '—'}
            icon={<Clock size={18} strokeWidth={2} />}
            color="yellow"
            sub="p50 latency"
            loading={metrics.loading}
          />
          <MetricCard
            id="card-errors"
            label="Error Rate"
            value={m ? `${m.error_rate}%` : '—'}
            icon={<AlertTriangle size={18} strokeWidth={2} />}
            color={m && m.error_rate > 2 ? 'red' : m && m.error_rate > 0.5 ? 'yellow' : 'green'}
            sub={m ? `${m.failed_requests.toLocaleString()} failed` : ''}
            loading={metrics.loading}
          />
        </div>

        {/* Charts */}
        <div className="charts-grid">
          <TimeSeriesChart data={timeseries.data} loading={timeseries.loading} />
          <RequestsChart data={timeseries.data} loading={timeseries.loading} />
        </div>

        {/* Service health + activity */}
        <div className="bottom-grid">
          <ServiceTable data={svc?.services} loading={services.loading} />
          <ActivityFeed data={activity.data?.activities} loading={activity.loading} />
        </div>

        {/* Error log */}
        <ErrorTable data={errors.data?.errors} loading={errors.loading} limit={5} />

      </main>
    </>
  );
}
