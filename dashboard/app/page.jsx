'use client';

import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

import AppShell from './components/AppShell';
import { fetchJson, formatDate, formatLabel, getStatus } from './lib/api';

function ScoreBadge({ score }) {
  const status = getStatus(score);
  return (
    <span className={`badge ${status}`} title={`${formatLabel(status)} lead score`}>
      {score ?? 0}/100
    </span>
  );
}

function LeadDrawer({ lead, onClose }) {
  if (!lead) return null;

  const status = lead.status || getStatus(lead.score);

  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <aside className="drawer" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <h3>{lead.name || 'Unnamed lead'}</h3>
            <p className="muted">{lead.company || lead.location || 'No company provided'}</p>
          </div>
          <button className="icon-button" onClick={onClose} title="Close" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <section className="drawer-section">
          <h4>Score</h4>
          <div className="detail-grid">
            <div className="detail">
              <span>Status</span>
              <strong className={`status-dot ${status}`}>{formatLabel(status)}</strong>
            </div>
            <div className="detail">
              <span>Score</span>
              <strong>{lead.score ?? 0}/100</strong>
            </div>
            <div className="detail">
              <span>Intent</span>
              <strong>{formatLabel(lead.intent || 'Not scored')}</strong>
            </div>
            <div className="detail">
              <span>Type</span>
              <strong>{formatLabel(lead.type || lead.leadCategory || 'Unknown')}</strong>
            </div>
          </div>
        </section>

        <section className="drawer-section">
          <h4>AI Summary</h4>
          <p>{lead.summary || 'No AI summary yet.'}</p>
          <p><strong>Next step:</strong> {lead.recommended_next_step || 'No recommendation yet.'}</p>
        </section>

        <section className="drawer-section">
          <h4>Contact</h4>
          <div className="detail-grid">
            <div className="detail">
              <span>Email</span>
              <strong>{lead.email || 'Missing'}</strong>
            </div>
            <div className="detail">
              <span>Phone</span>
              <strong>{lead.phone || 'Missing'}</strong>
            </div>
            <div className="detail">
              <span>Location</span>
              <strong>{lead.location || lead.locationPreference || 'Missing'}</strong>
            </div>
            <div className="detail">
              <span>Source</span>
              <strong>{formatLabel(lead.source || 'website')}</strong>
            </div>
          </div>
        </section>

        <section className="drawer-section">
          <h4>Form Details</h4>
          <div className="detail-grid">
            <div className="detail">
              <span>Service</span>
              <strong>{lead.serviceNeeded || lead.lookingTo || 'Not provided'}</strong>
            </div>
            <div className="detail">
              <span>Budget</span>
              <strong>{lead.monthlyBudget || lead.budgetRange || 'Not provided'}</strong>
            </div>
            <div className="detail">
              <span>Timeline</span>
              <strong>{lead.timeline || 'Not provided'}</strong>
            </div>
            <div className="detail">
              <span>Business / Property</span>
              <strong>{lead.businessType || lead.propertyType || 'Not provided'}</strong>
            </div>
          </div>
          <p>{lead.currentProblem || lead.notes || ''}</p>
        </section>
      </aside>
    </div>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadLeads() {
    setLoading(true);
    setError('');

    try {
      const data = await fetchJson('/leads');
      setLeads(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  const metrics = useMemo(() => {
    const total = leads.length;
    const hot = leads.filter((lead) => (lead.status || getStatus(lead.score)) === 'hot').length;
    const avgScore = total
      ? Math.round(leads.reduce((sum, lead) => sum + (lead.score || 0), 0) / total)
      : 0;
    const emailReady = leads.filter((lead) => lead.email && (lead.score || 0) >= 70).length;

    return { total, hot, avgScore, emailReady };
  }, [leads]);

  return (
    <AppShell>
      <div className="toolbar">
        <div>
          <h2>Leads</h2>
          <p>Newest enriched leads from the n8n workflow.</p>
        </div>
        <div className="actions">
          <button className="text-button" onClick={loadLeads} disabled={loading} title="Fetch the latest leads from the API">
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </div>

      <section className="summary-grid" aria-label="Lead summary">
        <div className="metric" title="Every lead currently saved in MongoDB">
          <span>Total leads</span>
          <strong>{metrics.total}</strong>
        </div>
        <div className="metric" title="Leads with scores of 70 or higher">
          <span>Hot leads</span>
          <strong>{metrics.hot}</strong>
        </div>
        <div className="metric" title="Average AI score across all loaded leads">
          <span>Average score</span>
          <strong>{metrics.avgScore}</strong>
        </div>
        <div className="metric" title="Hot leads with an email address available">
          <span>Call priority</span>
          <strong>{metrics.emailReady}</strong>
        </div>
      </section>

      {error && <div className="error-state">API error: {error}</div>}
      {!error && loading && <div className="empty-state">Loading leads...</div>}
      {!error && !loading && leads.length === 0 && <div className="empty-state">No leads saved yet.</div>}

      {!error && !loading && leads.length > 0 && (
        <div className="table-wrap">
          <table className="lead-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Company / Need</th>
                <th>Source</th>
                <th>Score</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const status = lead.status || getStatus(lead.score);
                return (
                  <tr
                    key={lead._id}
                    className="clickable-row"
                    onClick={() => setSelectedLead(lead)}
                    title="Click for lead details"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedLead(lead);
                      }
                    }}
                  >
                    <td>
                      <div className="lead-name">
                        <strong>{lead.name || 'Unnamed lead'}</strong>
                        <span>{lead.email || lead.phone || 'No contact details'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="lead-name">
                        <strong>{lead.company || lead.serviceNeeded || lead.lookingTo || 'Not provided'}</strong>
                        <span>{lead.location || lead.locationPreference || lead.timeline || ''}</span>
                      </div>
                    </td>
                    <td>{formatLabel(lead.source || 'website')}</td>
                    <td><ScoreBadge score={lead.score} /></td>
                    <td><span className={`status-dot ${status}`}>{formatLabel(status)}</span></td>
                    <td>{formatDate(lead.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </AppShell>
  );
}
