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
      <h3 className="font-display text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2 tracking-tight">
        <span className="w-1 h-4 rounded-full bg-linear-to-b from-orange-400 to-rose-500 shadow-[var(--glow-primary)]" />
        {I18n.marketingDashboard.overviewOfActivities}
      </h3>

      {/* Time tabs */}
      <div className="flex glass-card p-1.5 rounded-xl mb-4 theme-transition">
        {TABS_TIME.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              selected === tab.value
                ? 'bg-[var(--nav-active-bg)] text-[var(--primary)] border border-[var(--nav-active-border)] shadow-[var(--glow-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Date range text */}
      <p className="text-sm text-[var(--text-muted)] font-medium">
        <span>{I18n.marketingDashboard.from} </span>
        <span className="text-[var(--text-primary)] font-bold">{formatDateToString(fromDate, 'dd/MM/yyyy')}</span>
        <span> {I18n.marketingDashboard.to} </span>
        <span className="text-[var(--text-primary)] font-bold">{formatDateToString(toDate, 'dd/MM/yyyy')}</span>
      </p>
    </div>
  );
}
