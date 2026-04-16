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
      <h3 className="text-base font-bold text-white mb-4">
        {I18n.marketingDashboard.overviewOfActivities}
      </h3>

      {/* Time tabs */}
      <div className="flex bg-slate-800/40 p-1.5 rounded-xl backdrop-blur-md border border-white/10 shadow-inner mb-4">
        {TABS_TIME.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              selected === tab.value
                ? 'bg-slate-700/80 text-orange-400 shadow-md border border-white/5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Date range text */}
      <p className="text-sm text-slate-400 font-medium">
        <span>{I18n.marketingDashboard.from} </span>
        <span className="text-white font-bold">{formatDateToString(fromDate, 'dd/MM/yyyy')}</span>
        <span> {I18n.marketingDashboard.to} </span>
        <span className="text-white font-bold">{formatDateToString(toDate, 'dd/MM/yyyy')}</span>
      </p>
    </div>
  );
}
