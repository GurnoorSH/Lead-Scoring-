import AppShell from '../components/AppShell';
import LeadCaptureForm from '../components/LeadCaptureForm';

export default function CapturePage() {
  return (
    <AppShell>
      <LeadCaptureForm
        title="Internal Lead Capture"
        description="Option A: submit a lead from inside the dashboard directly into the n8n workflow."
        sourceDefault="dashboard_form"
        submitLabel="Send to n8n"
      />
    </AppShell>
  );
}
