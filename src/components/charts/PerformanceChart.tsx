'use client';

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

// ── Report summary card configs matching RN chart.style.ts ──
const SALE_CARDS = [
  {
    key: 'click',
    bgClass: 'bg-orange-500/5',
    borderClass: 'border-orange-500/30',
    hoverClass: 'hover:bg-orange-500/10',
    iconBgClass: 'bg-orange-500/20 border-orange-500/30',
    iconClass: 'text-orange-400',
    valueClass: 'text-orange-500',
    icon: '👆',
  },
  {
    key: 'allocate',
    bgClass: 'bg-amber-500/5',
    borderClass: 'border-amber-500/30',
    hoverClass: 'hover:bg-amber-500/10',
    iconBgClass: 'bg-amber-500/20 border-amber-500/30',
    iconClass: 'text-amber-400',
    valueClass: 'text-amber-500',
    icon: '📋',
  },
  {
    key: 'submited',
    bgClass: 'bg-blue-500/5',
    borderClass: 'border-blue-500/30',
    hoverClass: 'hover:bg-blue-500/10',
    iconBgClass: 'bg-blue-500/20 border-blue-500/30',
    iconClass: 'text-blue-400',
    valueClass: 'text-blue-500',
    icon: '📄',
  },
] as const;

const RECRUIT_CARDS = [
  {
    key: 'click',
    bgClass: 'bg-orange-500/5',
    borderClass: 'border-orange-500/30',
    hoverClass: 'hover:bg-orange-500/10',
    iconBgClass: 'bg-orange-500/20 border-orange-500/30',
    iconClass: 'text-orange-400',
    valueClass: 'text-orange-500',
    icon: '👆',
  },
  {
    key: 'register',
    bgClass: 'bg-amber-500/5',
    borderClass: 'border-amber-500/30',
    hoverClass: 'hover:bg-amber-500/10',
    iconBgClass: 'bg-amber-500/20 border-amber-500/30',
    iconClass: 'text-amber-400',
    valueClass: 'text-amber-500',
    icon: '✅',
  },
  {
    key: 'esign',
    bgClass: 'bg-blue-500/5',
    borderClass: 'border-blue-500/30',
    hoverClass: 'hover:bg-blue-500/10',
    iconBgClass: 'bg-blue-500/20 border-blue-500/30',
    iconClass: 'text-blue-400',
    valueClass: 'text-blue-500',
    icon: '✍️',
  },
] as const;

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
  const lineColor = isSale ? '#4CAF50' : '#1C3FAA';

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
      {/* Section title */}
      <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">
        {I18n.marketingDashboard.performances.statistics}
      </h3>

      {/* Report summary cards */}
      <div className="flex flex-col gap-3 mt-4">
        {summaryCards.map((card) => (
          <div
            key={card.key}
            className={`${card.bgClass} backdrop-blur-md border ${card.borderClass} rounded-xl p-4 flex items-center gap-4 ${card.hoverClass} transition-colors`}
          >
            <div className={`w-10 h-10 rounded-full ${card.iconBgClass} flex items-center justify-center border shrink-0`}>
              <span className={`text-lg ${card.iconClass}`}>{card.icon}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-bold ${card.valueClass}`}>
                {numberWithCommasDot(card.value)}
              </span>
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                {card.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart header: title + total */}
      <div className="mt-8">
        <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
          {isSale
            ? I18n.marketingDashboard.performances.sale.title
            : I18n.marketingDashboard.performances.recruit.title}
        </h3>
        <p className="text-sm text-emerald-400 font-bold mb-6">
          {numberWithCommasDot(isSale ? totalPaid : totalEsign)}{' '}
          <span className="text-[var(--text-muted)] font-medium">
            {isSale
              ? I18n.marketingDashboard.performances.sale.unitOfTotal
              : I18n.marketingDashboard.performances.recruit.unitOfTotal}
          </span>
        </p>
      </div>

      {/* Line chart */}
      <div className="w-full bg-[var(--surface)] backdrop-blur-sm border border-[var(--border)] rounded-2xl p-4 md:p-6 theme-transition">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={{ stroke: '#475569', strokeWidth: 1 }}
            />
            <YAxis
              domain={[0, yMax]}
              tickCount={7}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <RechartsTooltip
              contentStyle={{
                borderRadius: '8px',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                fontSize: '12px',
              }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
              cursor={{ stroke: '#475569', strokeDasharray: '4 4' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2}
              dot={{
                r: 4,
                fill: '#0f172a',
                stroke: '#10b981',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: '#0f172a',
                stroke: '#10b981',
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart note */}
      <div className="flex items-start gap-2 mt-4 text-xs text-[var(--text-muted)] font-medium italic pl-1">
        <div className="w-1.5 h-1.5 rounded-sm bg-blue-500 mt-1 shrink-0 rotate-45" />
        <p>
          {isSale
            ? I18n.marketingDashboard.performances.sale.chartNote.text
            : I18n.marketingDashboard.performances.recruit.chartNote.text}
        </p>
      </div>
    </div>
  );
}
