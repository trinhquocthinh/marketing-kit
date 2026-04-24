'use client';

import { type Brand, useTheme } from '@/components/providers/ThemeProvider';

interface BrandOption {
  value: Brand;
  label: string;
  swatch: [string, string]; // gradient [from, to]
}

const OPTIONS: BrandOption[] = [
  { value: 'orange', label: 'IZIon24', swatch: ['#fa875b', '#fb923c'] },
  { value: 'fecredit', label: 'FE Credit', swatch: ['#00a651', '#8cc63f'] },
  { value: 'ocean', label: 'Ocean', swatch: ['#0ea5e9', '#38bdf8'] },
];

const cycle: Record<Brand, Brand> = {
  orange: 'fecredit',
  fecredit: 'ocean',
  ocean: 'orange',
};

export default function BrandSwitcher({ compact = false }: { compact?: boolean }) {
  const { brand, setBrand } = useTheme();
  const current = OPTIONS.find((o) => o.value === brand) ?? OPTIONS[0];

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setBrand(cycle[brand])}
        className="theme-transition flex h-10 w-10 items-center justify-center rounded-full border border-(--surface-glass-border) bg-(--surface-glass-alt) backdrop-blur-xl transition-all hover:bg-surface-hover active:scale-95"
        title={`Brand: ${current.label}`}
        aria-label={`Brand: ${current.label}`}
      >
        <span
          aria-hidden
          className="inline-block h-5 w-5 rounded-full ring-2 ring-(--surface-glass-border-strong)"
          style={{
            background: `linear-gradient(135deg, ${current.swatch[0]}, ${current.swatch[1]})`,
          }}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setBrand(cycle[brand])}
      className="theme-transition flex items-center gap-2 rounded-full border border-(--surface-glass-border) bg-(--surface-glass-alt) px-4 py-2 text-xs font-black tracking-widest text-t-strong uppercase backdrop-blur-xl transition-all hover:bg-surface-hover active:scale-95"
      title={`Brand: ${current.label}`}
    >
      <span
        aria-hidden
        className="inline-block h-4 w-4 rounded-full ring-1 ring-(--surface-glass-border-strong)"
        style={{
          background: `linear-gradient(135deg, ${current.swatch[0]}, ${current.swatch[1]})`,
        }}
      />
      <span>{current.label}</span>
    </button>
  );
}
