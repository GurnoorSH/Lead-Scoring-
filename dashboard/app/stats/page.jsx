'use client';

import { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import AppShell from '../components/AppShell';
import { fetchJson } from '../lib/api';

const STATUS_COLORS = {
  hot: '#148a53',
  warm: '#d39910',
  cold: '#ba3b38'
};

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadStats() {
    setLoading(true);
    setError('');

    try {
      const data = await fetchJson('/leads/stats');
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  const sourceData = useMemo(() => {
    return (stats?.bySource || []).map((item) => ({
      source: item._id || 'unknown',
      count: item.count,
      avgScore: Math.round(item.avgScore || 0)
    }));
  }, [stats]);

  const statusData = useMemo(() => {
    return (stats?.byStatus || []).map((item) => ({
      status: item._id || 'unknown',
      count: item.count
    }));
  }, [stats]);

  return (
    <AppShell>
      <div className="toolbar">
        <div>
          <h2>Stats</h2>
          <p>Source mix and hot/warm/cold distribution.</p>
        </div>
        <div className="actions">
          <button className="text-button" onClick={loadStats} disabled={loading}>
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </div>

      <section className="summary-grid" aria-label="Stats summary">
        <div className="metric">
          <span>Total leads</span>
          <strong>{stats?.totals?.total || 0}</strong>
        </div>
        <div className="metric">
          <span>Hot leads</span>
          <strong>{stats?.totals?.hotCount || 0}</strong>
        </div>
        <div className="metric">
          <span>Average score</span>
          <strong>{Math.round(stats?.totals?.avgScore || 0)}</strong>
        </div>
        <div className="metric">
          <span>Sources</span>
          <strong>{sourceData.length}</strong>
        </div>
      </section>

      {error && <div className="error-state">API error: {error}</div>}
      {!error && loading && <div className="empty-state">Loading stats...</div>}

      {!error && !loading && (
        <div className="charts-grid">
          <section className="chart-panel">
            <h3>Leads by source</h3>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="source" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1d63b7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="chart-panel">
            <h3>Status split</h3>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="count" nameKey="status" innerRadius={72} outerRadius={116} paddingAngle={3}>
                    {statusData.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#647084'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
