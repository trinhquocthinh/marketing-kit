'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  cookChartData,
  getYaxisMaxValue,
  numberWithCommasDot,
} from '@/lib/marketing-dashboard.utils';
import { TypeEnum } from '@/types/enums';
import type { ChartComponentProps } from '@/types';
import { I18n } from '@/i18n';
import { useTheme } from '@/components/providers/ThemeProvider';

// ── Summary cards use token-based palette: primary / rose / violet ──
type SummaryCardTone = 'primary' | 'rose' | 'violet';

const toneStyles: Record<SummaryCardTone, { iconWrap: string; value: string; icon: string; glow: string }> = {
  primary: {
    iconWrap: 'bg-[var(--primary)]/15 border-[var(--primary)]/40',
    value: 'text-[var(--primary)]',
    icon: 'text-[var(--primary)]',
    glow: 'shadow-[var(--glow-primary)]',
  },
  rose: {
    iconWrap: 'bg-[var(--accent-rose)]/15 border-[var(--accent-rose)]/40',
    value: 'text-[var(--accent-rose)]',
    icon: 'text-[var(--accent-rose)]',
    glow: 'shadow-[var(--glow-rose)]',
  },
  violet: {
    iconWrap: 'bg-[var(--accent-violet)]/15 border-[var(--accent-violet)]/40',
    value: 'text-[var(--accent-violet)]',
    icon: 'text-[var(--accent-violet)]',
    glow: 'shadow-[var(--glow-violet)]',
  },
};

const SALE_TONES: SummaryCardTone[] = ['primary', 'rose', 'violet'];
const RECRUIT_TONES: SummaryCardTone[] = ['primary', 'rose', 'violet'];
const SALE_ICONS = ['👆', '📋', '📄'];
const RECRUIT_ICONS = ['👆', '✅', '✍️'];

interface PerformanceChartProps extends ChartComponentProps {
  className?: string;
}

interface ThemeColors {
  primary: string;
  violet: string;
  rose: string;
  textMuted: string;
  border: string;
  textPrimary: string;
}

function readThemeColors(): ThemeColors {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const read = (name: string, fallback: string) => {
    const v = cs.getPropertyValue(name).trim();
    return v || fallback;
  };
  return {
    primary: read('--primary', '#FA875B'),
    violet: read('--accent-violet', '#8B5CF6'),
    rose: read('--accent-rose', '#F43F5E'),
    textMuted: read('--text-muted', '#8a94a6'),
    border: read('--border', 'rgba(255,255,255,0.08)'),
    textPrimary: read('--text-primary', '#ffffff'),
  };
}

export default function PerformanceChart({
  alias,
  timeLine,
  timeRange,
  className = '',
}: PerformanceChartProps) {
  const { effectiveTheme } = useTheme();
  const [colors, setColors] = useState<ThemeColors | null>(null);

  useEffect(() => {
    setColors(readThemeColors());
  }, [effectiveTheme]);

  const {
    totalClicked,
    totalAllocate,
    totalSubmited,
    totalPaid,
    totalRegister,
    totalEsign,
    chartData,
  } = cookChartData({ alias, timeLine, timeRange });

  const maxValue = Math.max(...chartData.map((d) => d.value), 0);
  const yMax = getYaxisMaxValue(maxValue);

  const isSale = alias.type === TypeEnum.SALE;
  const lineColor = colors ? (isSale ? colors.primary : colors.violet) : '#FA875B';

  const summaryCards = isSale
    ? [
        { tone: SALE_TONES[0], icon: SALE_ICONS[0], label: I18n.marketingDashboard.performances.clickOrScan, value: totalClicked },
        { tone: SALE_TONES[1], icon: SALE_ICONS[1], label: I18n.marketingDashboard.performances.allocate, value: totalAllocate },
        { tone: SALE_TONES[2], icon: SALE_ICONS[2], label: I18n.marketingDashboard.performances.submited, value: totalSubmited },
      ]
    : [
        { tone: RECRUIT_TONES[0], icon: RECRUIT_ICONS[0], label: I18n.marketingDashboard.performances.clickOrScan, value: totalClicked },
        { tone: RECRUIT_TONES[1], icon: RECRUIT_ICONS[1], label: I18n.marketingDashboard.performances.register, value: totalRegister },
        { tone: RECRUIT_TONES[2], icon: RECRUIT_ICONS[2], label: I18n.marketingDashboard.performances.esign, value: totalEsign },
      ];

  return (
    <div className={className}>
      {/* Section title */}
      <h3 className="font-display text-base font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2 tracking-tight">
        <span className="w-1 h-4 rounded-full bg-linear-to-b from-orange-400 to-rose-500 shadow-[var(--glow-primary)]" />
        {I18n.marketingDashboard.performances.statistics}
      </h3>

      {/* Report summary cards */}
      <div className="flex flex-col gap-3 mt-4">
        {summaryCards.map((card) => {
          const s = toneStyles[card.tone];
          return (
            <div
              key={card.label}
              className="glass-card glass-card-hover rounded-2xl p-4 flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-full ${s.iconWrap} ${s.glow} flex items-center justify-center border shrink-0`}>
                <span className={`text-lg ${s.icon}`}>{card.icon}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`font-display text-xl font-bold ${s.value}`}>
                  {numberWithCommasDot(card.value)}
                </span>
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  {card.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart header: title + total */}
      <div className="mt-8">
        <h3 className="font-display text-base font-bold text-[var(--text-primary)] mb-1 tracking-tight">
          {isSale
            ? I18n.marketingDashboard.performances.sale.title
            : I18n.marketingDashboard.performances.recruit.title}
        </h3>
        <p className="font-display text-sm font-bold mb-6 text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-rose-500">
          {numberWithCommasDot(isSale ? totalPaid : totalEsign)}{' '}
          <span className="text-[var(--text-muted)] font-medium">
            {isSale
              ? I18n.marketingDashboard.performances.sale.unitOfTotal
              : I18n.marketingDashboard.performances.recruit.unitOfTotal}
          </span>
        </p>
      </div>

      {/* Line chart */}
      <div className="glass-card w-full rounded-2xl p-4 md:p-6 theme-transition">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={colors?.border ?? 'rgba(255,255,255,0.08)'}
              strokeWidth={1}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: colors?.textMuted ?? '#8a94a6' }}
              tickLine={false}
              axisLine={{ stroke: colors?.border ?? 'rgba(255,255,255,0.15)', strokeWidth: 1 }}
            />
            <YAxis
              domain={[0, yMax]}
              tickCount={7}
              tick={{ fontSize: 12, fill: colors?.textMuted ?? '#8a94a6' }}
              tickLine={false}
              axisLine={{ stroke: colors?.border ?? 'rgba(255,255,255,0.15)' }}
            />
            <RechartsTooltip
              contentStyle={{
                borderRadius: '12px',
                backgroundColor: effectiveTheme === 'dark' ? 'rgba(10,10,16,0.85)' : 'rgba(255,255,255,0.9)',
                border: `1px solid ${colors?.border ?? 'rgba(255,255,255,0.12)'}`,
                backdropFilter: 'blur(24px) saturate(140%)',
                color: colors?.textPrimary ?? '#fff',
                fontSize: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              }}
              itemStyle={{ color: colors?.textPrimary ?? '#fff' }}
              labelStyle={{ color: colors?.textMuted ?? '#94a3b8', fontSize: '11px' }}
              cursor={{ stroke: lineColor, strokeDasharray: '4 4', strokeOpacity: 0.5 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2.5}
              dot={{
                r: 4,
                fill: effectiveTheme === 'dark' ? '#07060a' : '#ffffff',
                stroke: lineColor,
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: effectiveTheme === 'dark' ? '#07060a' : '#ffffff',
                stroke: lineColor,
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart note */}
      <div className="flex items-start gap-2 mt-4 text-xs text-[var(--text-muted)] font-medium italic pl-1">
        <div className="w-1.5 h-1.5 rounded-sm bg-[var(--primary)] mt-1 shrink-0 rotate-45 shadow-[var(--glow-primary)]" />
        <p>
          {isSale
            ? I18n.marketingDashboard.performances.sale.chartNote.text
            : I18n.marketingDashboard.performances.recruit.chartNote.text}
        </p>
      </div>
    </div>
  );
}
