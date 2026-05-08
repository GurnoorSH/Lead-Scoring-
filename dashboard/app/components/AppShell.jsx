'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart3, Gauge, Moon, Sparkles, Sun } from 'lucide-react';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('leadCrmTheme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem('leadCrmTheme', nextTheme);
  }

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
        </nav>

        <button
          className="icon-button theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Use light mode' : 'Use dark mode'}
          aria-label={theme === 'dark' ? 'Use light mode' : 'Use dark mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <div className="page">{children}</div>
    </main>
  );
}
