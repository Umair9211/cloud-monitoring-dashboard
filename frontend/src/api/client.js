/**
 * api/client.js
 * Thin fetch wrapper + all API calls + polling hook.
 */

const BASE = import.meta.env.VITE_API_URL ?? '';

async function request(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export const api = {
  health:     () => request('/api/health'),
  metrics:    () => request('/api/metrics'),
  timeseries: (hours = 24) => request(`/api/metrics/timeseries?hours=${hours}`),
  services:   () => request('/api/services'),
  errors:     () => request('/api/errors'),
  activity:   () => request('/api/activity'),
};

// ─────────────────────────────────────────────────────────────────────────────
// useApi — polling hook
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * @param {() => Promise<any>} fetchFn  — async function returning data
 * @param {number|null}        interval — poll interval in ms (null = no polling)
 */
export function useApi(fetchFn, interval = null) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [ts,      setTs]      = useState(null);   // last-updated timestamp

  // stable reference so the effect doesn't re-run on every render
  const fnRef = useRef(fetchFn);
  useEffect(() => { fnRef.current = fetchFn; }, [fetchFn]);

  const refetch = useCallback(async () => {
    try {
      const result = await fnRef.current();
      setData(result);
      setError(null);
      setTs(new Date());
    } catch (err) {
      setError(err.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
    if (!interval) return;
    const id = setInterval(refetch, interval);
    return () => clearInterval(id);
  }, [refetch, interval]);

  return { data, loading, error, ts, refetch };
}
