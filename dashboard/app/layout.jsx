import './globals.css';

export const metadata = {
  title: 'Lead Scoring CRM',
  description: 'Lead scoring dashboard for n8n and OpenAI enriched leads.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
