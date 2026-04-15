'use client';

import { TABS_TIME } from '@/lib/constants';
import { TimeLineEnum } from '@/types/enums';
import { getTimeLine, formatDateToString } from '@/lib/marketing-dashboard.utils';
import { I18n } from '@/i18n';

interface TimelineFilterProps {
  selected: TimeLineEnum;
  onChange: (value: TimeLineEnum) => void;
  className?: string;
}

export default function TimelineFilter({ selected, onChange, className = '' }: TimelineFilterProps) {
  const periods = getTimeLine(selected);
  const fromDate = new Date(periods.from);
  const toDate = new Date(periods.to);

  return (
    <div className={className}>
      {/* Header: Tổng quan hoạt động */}
      <p className="text-sm font-semibold text-[#333] font-[Montserrat,sans-serif]">
        {I18n.marketingDashboard.overviewOfActivities}
      </p>

      {/* Time tabs */}
      <div className="flex gap-1 bg-[#F5F5F5] rounded-lg p-1 mt-3">
        {TABS_TIME.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors font-[Montserrat,sans-serif] ${
              selected === tab.value
                ? 'bg-white text-[#ED5E28] font-semibold shadow-sm'
                : 'text-[#666] hover:text-[#333]'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Date range text */}
      <p className="text-[11px] text-[#888] font-[Montserrat,sans-serif] mt-2">
        <span>{I18n.marketingDashboard.from} </span>
        <span className="font-semibold text-[#333]">{formatDateToString(fromDate, 'dd/MM/yyyy')}</span>
        <span> {I18n.marketingDashboard.to} </span>
        <span className="font-semibold text-[#333]">{formatDateToString(toDate, 'dd/MM/yyyy')}</span>
      </p>
    </div>
  );
}
