import LeadCaptureForm from '../components/LeadCaptureForm';
import ThemeToggle from '../components/ThemeToggle';

export const metadata = {
  title: 'Request a Consultation',
  description: 'Public lead capture form connected to the AI lead scoring workflow.'
};

export default function SubmitPage() {
  const hasConfiguredWebhook = Boolean(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL);

  return (
    <main className="public-submit-shell">
      <div className="public-hero-row">
        <section className="public-hero">
          <p>AI-scored intake workflow</p>
          <h1>Request a Consultation</h1>
          <span>Your details go directly into our automated lead review pipeline.</span>
        </section>
        <ThemeToggle className="public-theme-toggle" />
      </div>

      <LeadCaptureForm
        title="Tell Us What You Need"
        description="Option B: a client-facing lead form that sends submissions to the same n8n automation."
        sourceDefault="public_submit"
        showWebhookField={!hasConfiguredWebhook}
        submitLabel="Request consultation"
      />
    </main>
  );
}
