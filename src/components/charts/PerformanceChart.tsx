'use client';

import {
  CheckCircle2,
  ClipboardList,
  FileSignature,
  FileText,
  type LucideIcon,
  MousePointerClick,
  UserPlus,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useBrandColors } from '@/hooks/useBrandColors';
import { I18n } from '@/i18n';
import {
  cookChartData,
  getYaxisMaxValue,
  numberWithCommasDot,
} from '@/lib/marketing-dashboard.utils';
import type { ChartComponentProps } from '@/types';
import { TypeEnum } from '@/types/enums';

type CardConfig = {
  key: string;
  Icon: LucideIcon;
  tone: 'primary' | 'accent' | 'success';
};

const SALE_CARDS: readonly CardConfig[] = [
  { key: 'click', Icon: MousePointerClick, tone: 'primary' },
  { key: 'allocate', Icon: ClipboardList, tone: 'accent' },
  { key: 'submited', Icon: FileText, tone: 'success' },
] as const;

const RECRUIT_CARDS: readonly CardConfig[] = [
  { key: 'click', Icon: MousePointerClick, tone: 'primary' },
  { key: 'register', Icon: UserPlus, tone: 'accent' },
  { key: 'esign', Icon: FileSignature, tone: 'success' },
] as const;

const TONE_STYLES: Record<CardConfig['tone'], { value: string; chipBg: string; chipText: string }> =
  {
    primary: {
      value: 'text-[var(--primary)]',
      chipBg: 'bg-[color-mix(in_srgb,var(--primary)_15%,transparent)]',
      chipText: 'text-[var(--primary)]',
    },
    accent: {
      value: 'text-[var(--accent)]',
      chipBg: 'bg-[color-mix(in_srgb,var(--accent)_15%,transparent)]',
      chipText: 'text-[var(--accent)]',
    },
    success: {
      value: 'text-[var(--success)]',
      chipBg: 'bg-[color-mix(in_srgb,var(--success)_15%,transparent)]',
      chipText: 'text-[var(--success)]',
    },
  };

interface PerformanceChartProps extends ChartComponentProps {
  className?: string;
}

export default function PerformanceChart({
  alias,
  timeLine,
  timeRange,
  className = '',
}: PerformanceChartProps) {
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

  const chartColors = useBrandColors();

  const summaryCards = isSale
    ? [
        {
          ...SALE_CARDS[0],
          label: I18n.marketingDashboard.performances.clickOrScan,
          value: totalClicked,
        },
        {
          ...SALE_CARDS[1],
          label: I18n.marketingDashboard.performances.allocate,
          value: totalAllocate,
        },
        {
          ...SALE_CARDS[2],
          label: I18n.marketingDashboard.performances.submited,
          value: totalSubmited,
        },
      ]
    : [
        {
          ...RECRUIT_CARDS[0],
          label: I18n.marketingDashboard.performances.clickOrScan,
          value: totalClicked,
        },
        {
          ...RECRUIT_CARDS[1],
          label: I18n.marketingDashboard.performances.register,
          value: totalRegister,
        },
        {
          ...RECRUIT_CARDS[2],
          label: I18n.marketingDashboard.performances.esign,
          value: totalEsign,
        },
      ];

  return (
    <div className={className}>
      <h3 className="mb-4 text-base font-black tracking-wide text-[var(--text-strong)]">
        {I18n.marketingDashboard.performances.statistics}
      </h3>

      {/* Report summary cards */}
      <div className="flex flex-col gap-3">
        {summaryCards.map((card) => {
          const tone = TONE_STYLES[card.tone];
          const Icon = card.Icon;
          return (
            <div
              key={card.key}
              className="flex items-center gap-4 rounded-[var(--radius-bento-sm)] bg-[var(--surface-glass-alt)] p-4 transition-all hover:bg-[var(--surface-glass)]"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone.chipBg} ${tone.chipText}`}
              >
                <Icon className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className={`text-2xl font-black ${tone.value}`}>
                  {numberWithCommasDot(card.value)}
                </span>
                <span className="text-xs font-black tracking-wide text-[var(--text-secondary)]">
                  {card.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart header */}
      <div className="mt-8">
        <h3 className="mb-1 text-base font-black tracking-wide text-[var(--text-strong)]">
          {isSale
            ? I18n.marketingDashboard.performances.sale.title
            : I18n.marketingDashboard.performances.recruit.title}
        </h3>
        <p className="mb-6 text-sm font-black text-[var(--success)]">
          {numberWithCommasDot(isSale ? totalPaid : totalEsign)}{' '}
          <span className="font-medium text-[var(--text-muted)]">
            {isSale
              ? I18n.marketingDashboard.performances.sale.unitOfTotal
              : I18n.marketingDashboard.performances.recruit.unitOfTotal}
          </span>
        </p>
      </div>

      {/* Line chart */}
      <div className="w-full rounded-[var(--radius-bento-sm)] bg-[var(--surface-glass-alt)] p-4 md:p-6">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} strokeWidth={1} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: chartColors.tick }}
              tickLine={false}
              axisLine={{ stroke: chartColors.axis, strokeWidth: 1 }}
            />
            <YAxis
              domain={[0, yMax]}
              tickCount={7}
              tick={{ fontSize: 12, fill: chartColors.tick }}
              tickLine={false}
              axisLine={{ stroke: chartColors.axisStrong }}
            />
            <RechartsTooltip
              contentStyle={{
                borderRadius: '12px',
                backgroundColor: chartColors.tooltipBg,
                border: `1px solid ${chartColors.grid}`,
                backdropFilter: 'blur(8px)',
                color: chartColors.tooltipText,
                fontSize: '12px',
              }}
              itemStyle={{ color: chartColors.tooltipText }}
              labelStyle={{ color: chartColors.tick, fontSize: '11px' }}
              cursor={{ stroke: chartColors.axis, strokeDasharray: '4 4' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={chartColors.line}
              strokeWidth={2}
              dot={{
                r: 4,
                fill: chartColors.dotFill,
                stroke: chartColors.line,
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: chartColors.dotFill,
                stroke: chartColors.line,
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart note */}
      <div className="mt-4 flex items-start gap-2 pl-1 text-xs font-medium text-[var(--text-muted)] italic">
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent)]" strokeWidth={2.5} />
        <p>
          {isSale
            ? I18n.marketingDashboard.performances.sale.chartNote.text
            : I18n.marketingDashboard.performances.recruit.chartNote.text}
        </p>
      </div>
    </div>
  );
}
