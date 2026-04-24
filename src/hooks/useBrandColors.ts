'use client';

import { useEffect, useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';

export interface BrandColors {
  line: string;
  grid: string;
  axis: string;
  axisStrong: string;
  tick: string;
  tooltipBg: string;
  tooltipText: string;
  dotFill: string;
}

const TOKENS = [
  '--chart-line',
  '--chart-grid',
  '--chart-axis',
  '--chart-axis-strong',
  '--chart-tick',
  '--chart-tooltip-bg',
  '--chart-tooltip-text',
  '--chart-dot-fill',
] as const;

function readColors(): BrandColors {
  if (typeof window === 'undefined') {
    return {
      line: '#f97316',
      grid: 'rgba(255,255,255,0.1)',
      axis: '#475569',
      axisStrong: '#334155',
      tick: '#94a3b8',
      tooltipBg: 'rgba(15, 23, 42, 0.9)',
      tooltipText: '#ffffff',
      dotFill: '#0f172a',
    };
  }
  const cs = getComputedStyle(document.documentElement);
  const get = (token: string) => cs.getPropertyValue(token).trim();
  return {
    line: get(TOKENS[0]),
    grid: get(TOKENS[1]),
    axis: get(TOKENS[2]),
    axisStrong: get(TOKENS[3]),
    tick: get(TOKENS[4]),
    tooltipBg: get(TOKENS[5]),
    tooltipText: get(TOKENS[6]),
    dotFill: get(TOKENS[7]),
  };
}

/**
 * Reads chart color tokens from CSS vars. Re-computes whenever brand or
 * effective theme changes — Recharts props don't accept CSS vars directly.
 */
export function useBrandColors(): BrandColors {
  const { brand, effectiveTheme } = useTheme();
  const [colors, setColors] = useState<BrandColors>(readColors);

  useEffect(() => {
    // Defer to next frame so the DOM reflects new [data-brand]/[data-theme] attr
    const id = requestAnimationFrame(() => setColors(readColors()));
    return () => cancelAnimationFrame(id);
  }, [brand, effectiveTheme]);

  return colors;
}
