'use client';

import { Monitor, Moon, Sun } from 'lucide-react';

import { useTheme } from '@/components/providers/ThemeProvider';

const icons = {
  dark: <Moon className="h-5 w-5" strokeWidth={2} />,
  auto: <Monitor className="h-5 w-5" strokeWidth={2} />,
  light: <Sun className="h-5 w-5" strokeWidth={2} />,
};

const labels = { dark: 'Dark', auto: 'Auto', light: 'Light' };
const cycle: Record<string, 'dark' | 'light' | 'auto'> = {
  dark: 'auto',
  auto: 'light',
  light: 'dark',
};

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setTheme(cycle[theme])}
        className="theme-transition flex h-10 w-10 items-center justify-center rounded-full border border-(--surface-glass-border) bg-(--surface-glass-alt) text-primary backdrop-blur-xl transition-all hover:bg-surface-hover active:scale-95"
        title={`Theme: ${labels[theme]}`}
        aria-label={`Theme: ${labels[theme]}`}
      >
        {icons[theme]}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(cycle[theme])}
      className="theme-transition flex items-center gap-2 rounded-full border border-(--surface-glass-border) bg-(--surface-glass-alt) px-4 py-2 text-xs font-black tracking-widest text-t-strong uppercase backdrop-blur-xl transition-all hover:bg-surface-hover active:scale-95"
      title={`Theme: ${labels[theme]}`}
    >
      <span className="text-[var(--primary)]">{icons[theme]}</span>
      <span>{labels[theme]}</span>
    </button>
  );
}
