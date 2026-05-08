'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
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
    <button
      className={['icon-button', 'theme-toggle', className].filter(Boolean).join(' ')}
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Use light mode' : 'Use dark mode'}
      aria-label={theme === 'dark' ? 'Use light mode' : 'Use dark mode'}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
