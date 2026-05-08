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
import { fetchJson, formatLabel } from '../lib/api';

const STATUS_COLORS = {
  hot: '#148a53',
  warm: '#d39910',
  cold: '#ba3b38'
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      <strong>{formatLabel(label || payload[0].name)}</strong>
      {payload.map((item) => (
        <span key={item.dataKey || item.name}>
          {formatLabel(item.name || item.dataKey)}: {item.value}
        </span>
      ))}
    </div>
  );
}

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
      sourceLabel: formatLabel(item._id || 'unknown'),
      count: item.count,
      avgScore: Math.round(item.avgScore || 0)
    }));
  }, [stats]);

  const statusData = useMemo(() => {
    return (stats?.byStatus || []).map((item) => ({
      status: item._id || 'unknown',
      statusLabel: formatLabel(item._id || 'unknown'),
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
          <button className="text-button" onClick={loadStats} disabled={loading} title="Fetch the latest chart data from the API">
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </div>

      <section className="summary-grid" aria-label="Stats summary">
        <div className="metric" title="Every lead currently saved in MongoDB">
          <span>Total leads</span>
          <strong>{stats?.totals?.total || 0}</strong>
        </div>
        <div className="metric" title="Leads with scores of 70 or higher">
          <span>Hot leads</span>
          <strong>{stats?.totals?.hotCount || 0}</strong>
        </div>
        <div className="metric" title="Average AI score across all saved leads">
          <span>Average score</span>
          <strong>{Math.round(stats?.totals?.avgScore || 0)}</strong>
        </div>
        <div className="metric" title="Number of distinct lead sources">
          <span>Sources</span>
          <strong>{sourceData.length}</strong>
        </div>
      </section>

      {error && <div className="error-state">API error: {error}</div>}
      {!error && loading && <div className="empty-state">Loading stats...</div>}

      {!error && !loading && (
        <div className="charts-grid">
          <section className="chart-panel" title="Hover a bar to see the lead count for that source">
            <h3>Leads by source</h3>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="sourceLabel" />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Leads" fill="#1d63b7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="chart-panel" title="Hover a slice to see how many leads are in that status">
            <h3>Status split</h3>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="count" nameKey="statusLabel" innerRadius={72} outerRadius={116} paddingAngle={3}>
                    {statusData.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#647084'} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
