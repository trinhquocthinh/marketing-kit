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
    borderColor: '#FF8050',
    bg: 'rgba(255,128,80,0.1)',
    shadow: '#FFDACD',
    textColor: '#CE5C31',
    icon: '👆',
  },
  {
    key: 'allocate',
    borderColor: '#EA9E35',
    bg: 'rgba(234,158,53,0.1)',
    shadow: '#FFE1BA',
    textColor: '#A45F00',
    icon: '📋',
  },
  {
    key: 'submited',
    borderColor: '#4A91F9',
    bg: 'rgba(74,145,249,0.1)',
    shadow: '#C0DAFF',
    textColor: '#1D69D8',
    icon: '📄',
  },
] as const;

const RECRUIT_CARDS = [
  {
    key: 'click',
    borderColor: '#4A91F9',
    bg: 'rgba(74,145,249,0.07)',
    shadow: '#C0DAFF',
    textColor: '#1C3FAA',
    icon: '👆',
  },
  {
    key: 'register',
    borderColor: '#1C70C4',
    bg: '#D9E7FF',
    shadow: '#C0DAFF',
    textColor: '#1C3FAA',
    icon: '✅',
  },
  {
    key: 'esign',
    borderColor: '#1C3FAA',
    bg: '#B2D1FF',
    shadow: '#C0DAFF',
    textColor: '#1C3FAA',
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
      <p className="text-[13px] font-semibold font-[Montserrat,sans-serif] text-black">
        {I18n.marketingDashboard.performances.statistics}
      </p>

      {/* Report summary cards – matching RN summaryContainer */}
      <div className="flex flex-col gap-3 mt-4">
        {summaryCards.map((card) => (
          <div
            key={card.key}
            className="flex items-center rounded-lg px-4 py-2"
            style={{
              border: `1px solid ${card.borderColor}`,
              backgroundColor: card.bg,
              boxShadow: `0px 2px 0px 0px ${card.shadow}`,
            }}
          >
            <div className="w-11 h-11 rounded-full border border-black/20 bg-white flex items-center justify-center text-lg flex-shrink-0">
              {card.icon}
            </div>
            <span
              className="ml-3.5 text-base font-semibold font-[Montserrat,sans-serif]"
              style={{ color: card.textColor }}
            >
              {numberWithCommasDot(card.value)}
            </span>
            <span className="ml-1.5 text-[11px] text-black font-[Montserrat,sans-serif]">
              {card.label}
            </span>
          </div>
        ))}
      </div>

      {/* Chart header: title + total */}
      <div className="mt-8">
        <p className="text-[13px] font-semibold font-[Montserrat,sans-serif] text-black">
          {isSale
            ? I18n.marketingDashboard.performances.sale.title
            : I18n.marketingDashboard.performances.recruit.title}
        </p>
        <div className="flex items-baseline gap-1 mt-4">
          <span
            className="text-base font-semibold font-[Montserrat,sans-serif]"
            style={{ color: lineColor }}
          >
            {numberWithCommasDot(isSale ? totalPaid : totalEsign)}
          </span>
          <span className="text-[11px] text-[#4D4D4D] font-[Montserrat,sans-serif]">
            {isSale
              ? I18n.marketingDashboard.performances.sale.unitOfTotal
              : I18n.marketingDashboard.performances.recruit.unitOfTotal}
          </span>
        </div>
      </div>

      {/* Line chart – 250px matching RN */}
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0,0,0,0.15)"
              strokeWidth={1}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#000', fontFamily: 'Montserrat, sans-serif' }}
              tickLine={false}
              axisLine={{ stroke: '#666', strokeWidth: 2 }}
            />
            <YAxis
              domain={[0, yMax]}
              tickCount={7}
              tick={{ fontSize: 12, fill: '#000', fontFamily: 'Montserrat, sans-serif' }}
              tickLine={false}
              axisLine={{ stroke: '#E6E6E6' }}
            />
            <RechartsTooltip
              contentStyle={{
                borderRadius: '4px',
                backgroundColor: '#000',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                fontFamily: 'Montserrat, sans-serif',
              }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#fff', fontSize: '11px' }}
              cursor={{ stroke: '#000', strokeDasharray: '4 4' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2}
              dot={{
                r: 4,
                fill: '#fff',
                stroke: lineColor,
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: '#fff',
                stroke: lineColor,
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart note */}
      <p className="mt-2 text-[11px] italic text-[#666] font-[Montserrat,sans-serif]">
        {isSale
          ? I18n.marketingDashboard.performances.sale.chartNote.text
          : I18n.marketingDashboard.performances.recruit.chartNote.text}
      </p>
    </div>
  );
}
