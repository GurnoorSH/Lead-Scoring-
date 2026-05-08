'use client';

import { useMemo, useState } from 'react';
import { Send } from 'lucide-react';

const defaultWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '';

function buildNotes(leadCategory, data) {
  if (leadCategory === 'marketing_agency') {
    return [
      `Service needed: ${data.get('serviceNeeded')}`,
      `Monthly budget: ${data.get('monthlyBudget')}`,
      `Timeline: ${data.get('marketingTimeline')}`,
      `Business type: ${data.get('businessType')}`,
      `Current problem: ${data.get('currentProblem')}`
    ].join('\n');
  }

  return [
    `Looking to: ${data.get('lookingTo')}`,
    `Property type: ${data.get('propertyType')}`,
    `Budget range: ${data.get('budgetRange')}`,
    `Timeline: ${data.get('realEstateTimeline')}`,
    `Location preference: ${data.get('locationPreference')}`
  ].join('\n');
}

function buildPayload(data, sourceDefault) {
  const leadCategory = data.get('leadCategory');
  const payload = {
    name: data.get('name'),
    email: data.get('email'),
    phone: data.get('phone'),
    location: data.get('location'),
    company: data.get('company'),
    source: data.get('source') || sourceDefault,
    leadCategory,
    notes: buildNotes(leadCategory, data)
  };

  if (leadCategory === 'marketing_agency') {
    payload.serviceNeeded = data.get('serviceNeeded');
    payload.monthlyBudget = data.get('monthlyBudget');
    payload.timeline = data.get('marketingTimeline');
    payload.businessType = data.get('businessType');
    payload.currentProblem = data.get('currentProblem');
  } else {
    payload.lookingTo = data.get('lookingTo');
    payload.propertyType = data.get('propertyType');
    payload.budgetRange = data.get('budgetRange');
    payload.timeline = data.get('realEstateTimeline');
    payload.locationPreference = data.get('locationPreference');
  }

  return payload;
}

export default function LeadCaptureForm({
  title = 'Lead Capture',
  description = 'Submit a lead to the n8n webhook for AI scoring.',
  sourceDefault = 'dashboard_form',
  showWebhookField = true,
  submitLabel = 'Submit lead'
}) {
  const [leadCategory, setLeadCategory] = useState('marketing_agency');
  const [status, setStatus] = useState({ type: '', message: 'Ready' });
  const [submitting, setSubmitting] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(() => {
    if (typeof window === 'undefined') return defaultWebhookUrl;
    return window.localStorage.getItem('leadWebhookUrl') || defaultWebhookUrl;
  });

  const statusClass = useMemo(() => {
    return ['form-status', status.type].filter(Boolean).join(' ');
  }, [status.type]);

  async function handleSubmit(event) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const targetWebhookUrl = showWebhookField ? data.get('webhookUrl') : webhookUrl;

    if (!targetWebhookUrl) {
      setStatus({ type: 'error', message: 'Add your n8n webhook URL first.' });
      return;
    }

    setSubmitting(true);
    setStatus({ type: '', message: 'Sending to n8n...' });

    try {
      const response = await fetch(targetWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(buildPayload(data, sourceDefault))
      });

      if (!response.ok) {
        throw new Error(`n8n returned ${response.status}`);
      }

      window.localStorage.setItem('leadWebhookUrl', targetWebhookUrl);
      setWebhookUrl(targetWebhookUrl);
      event.currentTarget.reset();
      setLeadCategory('marketing_agency');
      setStatus({ type: 'success', message: 'Lead submitted to n8n.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="capture-panel">
      <div className="capture-head">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className={statusClass} role="status">
          {status.message}
        </div>
      </div>

      <form className="capture-form" onSubmit={handleSubmit}>
        {showWebhookField && (
          <label className="field full" title="Use the n8n Webhook node test or production URL">
            <span>n8n webhook URL</span>
            <input
              name="webhookUrl"
              type="url"
              value={webhookUrl}
              onChange={(event) => setWebhookUrl(event.target.value)}
              placeholder="http://localhost:5678/webhook-test/lead"
              required
            />
          </label>
        )}

        <div className="segmented-control" aria-label="Lead type">
          <label title="Use this for agency service inquiries">
            <input
              type="radio"
              name="leadCategory"
              value="marketing_agency"
              checked={leadCategory === 'marketing_agency'}
              onChange={(event) => setLeadCategory(event.target.value)}
            />
            Marketing Agency
          </label>
          <label title="Use this for property buyer or seller inquiries">
            <input
              type="radio"
              name="leadCategory"
              value="real_estate_agent"
              checked={leadCategory === 'real_estate_agent'}
              onChange={(event) => setLeadCategory(event.target.value)}
            />
            Real Estate Agent
          </label>
        </div>

        <div className="form-grid">
          <label className="field" title="Lead name">
            <span>Name</span>
            <input name="name" type="text" autoComplete="name" required />
          </label>
          <label className="field" title="Lead email address">
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label className="field" title="Phone number for hot-lead follow-up">
            <span>Phone</span>
            <input name="phone" type="tel" autoComplete="tel" required />
          </label>
          <label className="field" title="City, region, or country">
            <span>Location</span>
            <input name="location" type="text" autoComplete="address-level2" required />
          </label>
          <label className="field" title="Where this lead came from">
            <span>Source</span>
            <select name="source" defaultValue={sourceDefault}>
              <option value={sourceDefault}>This form</option>
              <option value="website">Website</option>
              <option value="facebook_ad">Facebook ad</option>
              <option value="google_ad">Google ad</option>
              <option value="referral">Referral</option>
            </select>
          </label>
          <label className="field" title="Company or organization name">
            <span>Company</span>
            <input name="company" type="text" autoComplete="organization" />
          </label>
        </div>

        {leadCategory === 'marketing_agency' && (
          <fieldset className="form-fieldset">
            <legend>Marketing Agency</legend>
            <div className="form-grid">
              <label className="field">
                <span>Service needed</span>
                <select name="serviceNeeded" defaultValue="Website">
                  <option>Website</option>
                  <option>SEO</option>
                  <option>Paid Ads</option>
                  <option>Social Media</option>
                  <option>Automation</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="field">
                <span>Monthly budget</span>
                <select name="monthlyBudget" defaultValue="$1500-$5000">
                  <option>Under $500</option>
                  <option>$500-$1500</option>
                  <option>$1500-$5000</option>
                  <option>$5000+</option>
                </select>
              </label>
              <label className="field">
                <span>Timeline</span>
                <select name="marketingTimeline" defaultValue="ASAP">
                  <option>ASAP</option>
                  <option>Within a month</option>
                  <option>1-3 months</option>
                  <option>Exploring</option>
                </select>
              </label>
              <label className="field">
                <span>Business type</span>
                <select name="businessType" defaultValue="Local business">
                  <option>Local business</option>
                  <option>Ecommerce</option>
                  <option>SaaS</option>
                  <option>Agency</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="field full">
                <span>Current problem</span>
                <textarea name="currentProblem" rows={4} />
              </label>
            </div>
          </fieldset>
        )}

        {leadCategory === 'real_estate_agent' && (
          <fieldset className="form-fieldset">
            <legend>Real Estate Agent</legend>
            <div className="form-grid">
              <label className="field">
                <span>Looking to</span>
                <select name="lookingTo" defaultValue="Buy">
                  <option>Buy</option>
                  <option>Sell</option>
                  <option>Both</option>
                </select>
              </label>
              <label className="field">
                <span>Property type</span>
                <select name="propertyType" defaultValue="Apartment">
                  <option>Apartment</option>
                  <option>Villa</option>
                  <option>Commercial</option>
                  <option>Land</option>
                </select>
              </label>
              <label className="field">
                <span>Budget range</span>
                <select name="budgetRange" defaultValue="$300k-$700k">
                  <option>&lt;$100k</option>
                  <option>$100k-$300k</option>
                  <option>$300k-$700k</option>
                  <option>$700k+</option>
                </select>
              </label>
              <label className="field">
                <span>Timeline</span>
                <select name="realEstateTimeline" defaultValue="1-3 months">
                  <option>Immediately</option>
                  <option>1-3 months</option>
                  <option>3-6 months</option>
                  <option>Just browsing</option>
                </select>
              </label>
              <label className="field full">
                <span>Location preference</span>
                <input name="locationPreference" type="text" />
              </label>
            </div>
          </fieldset>
        )}

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={submitting} title="Send this lead to the n8n webhook">
            <Send size={17} />
            {submitting ? 'Sending...' : submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}
