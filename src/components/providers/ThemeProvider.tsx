'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';

type ThemePreference = 'dark' | 'light' | 'auto';
type EffectiveTheme = 'dark' | 'light';
export type Brand = 'orange' | 'fecredit' | 'ocean';

export const BRANDS: readonly Brand[] = ['orange', 'fecredit', 'ocean'] as const;
const DEFAULT_BRAND: Brand = 'orange';

interface ThemeContextValue {
  theme: ThemePreference;
  effectiveTheme: EffectiveTheme;
  setTheme: (theme: ThemePreference) => void;
  brand: Brand;
  setBrand: (brand: Brand) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): EffectiveTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStoredBrand(): Brand {
  if (typeof window === 'undefined') return DEFAULT_BRAND;
  const stored = localStorage.getItem('brand') as Brand | null;
  return stored && BRANDS.includes(stored) ? stored : DEFAULT_BRAND;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always start with 'auto' so server & client initial render match,
  // then hydrate from localStorage after mount to avoid mismatch.
  const [theme, setThemeState] = useState<ThemePreference>('auto');
  const [brand, setBrandState] = useState<Brand>(DEFAULT_BRAND);
  const [systemPreference, setSystemPreference] = useState<EffectiveTheme>('dark');
  const [mounted, setMounted] = useState(false);

  // Derived — no setState in render
  const effectiveTheme: EffectiveTheme = theme === 'auto' ? systemPreference : theme;

  const setTheme = useCallback((newTheme: ThemePreference) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  }, []);

  const setBrand = useCallback((newBrand: Brand) => {
    setBrandState(newBrand);
    localStorage.setItem('brand', newBrand);
  }, []);

  // Apply theme to DOM — no setState here
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }, [effectiveTheme]);

  // Apply brand to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-brand', brand);
  }, [brand]);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as ThemePreference | null;
    if (storedTheme && storedTheme !== theme) setThemeState(storedTheme);
    const storedBrand = localStorage.getItem('brand') as Brand | null;
    if (storedBrand && BRANDS.includes(storedBrand) && storedBrand !== brand) setBrandState(storedBrand);
    setSystemPreference(getSystemTheme());
    setMounted(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to system preference changes — setState only inside callback
  useEffect(() => {
    if (theme !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPreference(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : 'auto', effectiveTheme, setTheme, brand: mounted ? brand : DEFAULT_BRAND, setBrand }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
