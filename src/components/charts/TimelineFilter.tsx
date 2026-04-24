'use client';

import { I18n } from '@/i18n';
import { TABS_TIME } from '@/lib/constants';
import { formatDateToString, getTimeLine } from '@/lib/marketing-dashboard.utils';
import { type TimeLineEnum } from '@/types/enums';

interface TimelineFilterProps {
  selected: TimeLineEnum;
  onChange: (value: TimeLineEnum) => void;
  className?: string;
}

export default function TimelineFilter({
  selected,
  onChange,
  className = '',
}: TimelineFilterProps) {
  const periods = getTimeLine(selected);
  const fromDate = new Date(periods.from);
  const toDate = new Date(periods.to);

  return (
    <div className={className}>
      <h3 className="mb-4 text-base font-black tracking-wide text-[var(--text-strong)]">
        {I18n.marketingDashboard.overviewOfActivities}
      </h3>

      {/* Time tabs - pill toggle */}
      <div className="mb-4 flex gap-1 rounded-full bg-[var(--surface-glass-alt)] p-1 shadow-inner-soft">
        {TABS_TIME.map((tab) => {
          const isActive = selected === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={`flex-1 rounded-full py-2 text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${
                isActive
                  ? 'text-white shadow-[var(--shadow-glow-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-strong)]'
              }`}
              style={
                isActive
                  ? {
                      background:
                        'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                    }
                  : undefined
              }
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Date range text */}
      <p className="text-xs font-medium text-[var(--text-muted)]">
        <span>{I18n.marketingDashboard.from} </span>
        <span className="font-black text-[var(--text-strong)]">
          {formatDateToString(fromDate, 'dd/MM/yyyy')}
        </span>
        <span> {I18n.marketingDashboard.to} </span>
        <span className="font-black text-[var(--text-strong)]">
          {formatDateToString(toDate, 'dd/MM/yyyy')}
        </span>
      </p>
    </div>
  );
}
