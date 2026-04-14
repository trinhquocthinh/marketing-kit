'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cookChartData, getYaxisMaxValue } from '@/lib/marketing-dashboard.utils';
import { TypeEnum } from '@/types/enums';
import type { ChartComponentProps } from '@/types';
import { I18n } from '@/i18n';

interface PerformanceChartProps extends ChartComponentProps {
  className?: string;
}

export default function PerformanceChart({ alias, timeLine, timeRange, className = '' }: PerformanceChartProps) {
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

  const stats = isSale
    ? [
        { label: I18n.marketingDashboard.clicked, value: totalClicked, color: '#007AFF' },
        { label: I18n.marketingDashboard.leadAllocated, value: totalAllocate, color: '#FA875B' },
        { label: I18n.marketingDashboard.leadSubmitted, value: totalSubmited, color: '#8DCC3D' },
        { label: I18n.marketingDashboard.leadPaid, value: totalPaid, color: '#FFC107' },
      ]
    : [
        { label: I18n.marketingDashboard.clicked, value: totalClicked, color: '#007AFF' },
        { label: I18n.marketingDashboard.agentCreated, value: totalRegister, color: '#FA875B' },
        { label: I18n.marketingDashboard.agentEsigned, value: totalEsign, color: '#8DCC3D' },
      ];

  return (
    <div className={className}>
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border p-3">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-xl font-semibold mt-1" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Line chart */}
      <div className="bg-white rounded-lg border p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-4">
          {isSale ? I18n.marketingDashboard.paidCases : I18n.marketingDashboard.agentEsigned}
        </h4>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#8C8C8C' }}
              tickLine={false}
              axisLine={{ stroke: '#E6E6E6' }}
            />
            <YAxis
              domain={[0, yMax]}
              tick={{ fontSize: 12, fill: '#8C8C8C' }}
              tickLine={false}
              axisLine={{ stroke: '#E6E6E6' }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #E6E6E6',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#FA875B"
              strokeWidth={2}
              dot={{ r: 4, fill: '#FA875B', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#FA875B', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
