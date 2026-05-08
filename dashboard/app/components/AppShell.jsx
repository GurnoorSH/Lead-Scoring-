'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, ClipboardList, Gauge, Sparkles } from 'lucide-react';

import ThemeToggle from './ThemeToggle';

export default function AppShell({ children }) {
  const pathname = usePathname();

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <Sparkles size={19} />
          </div>
          <div>
            <h1>Lead Scoring CRM</h1>
            <p>n8n + OpenAI enriched pipeline</p>
          </div>
        </div>

        <nav className="nav" aria-label="Dashboard">
          <Link href="/" className={pathname === '/' ? 'active' : ''}>
            <Gauge size={17} />
            Leads
          </Link>
          <Link href="/stats" className={pathname === '/stats' ? 'active' : ''}>
            <BarChart3 size={17} />
            Stats
          </Link>
          <Link href="/capture" className={pathname === '/capture' ? 'active' : ''}>
            <ClipboardList size={17} />
            Capture
          </Link>
        </nav>

        <ThemeToggle />
      </header>

      <div className="page">{children}</div>
    </main>
  );
}
