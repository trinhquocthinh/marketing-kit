'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

type ThemePreference = 'dark' | 'light' | 'auto';
type EffectiveTheme = 'dark' | 'light';

interface ThemeContextValue {
  theme: ThemePreference;
  effectiveTheme: EffectiveTheme;
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): EffectiveTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(preference: ThemePreference): EffectiveTheme {
  if (preference === 'auto') return getSystemTheme();
  return preference;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    if (typeof window === 'undefined') return 'auto';
    return (localStorage.getItem('theme') as ThemePreference) || 'auto';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>(() => resolveTheme(theme));

  const applyTheme = useCallback((effective: EffectiveTheme) => {
    document.documentElement.setAttribute('data-theme', effective);
    setEffectiveTheme(effective);
  }, []);

  const setTheme = useCallback((newTheme: ThemePreference) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(resolveTheme(newTheme));
  }, [applyTheme]);

  // Apply theme on mount and listen for system preference changes
  useEffect(() => {
    applyTheme(resolveTheme(theme));

    if (theme !== 'auto') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme(getSystemTheme());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
