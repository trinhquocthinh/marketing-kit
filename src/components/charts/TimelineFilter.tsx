'use client';

import { TABS_TIME } from '@/lib/constants';
import { TimeLineEnum } from '@/types/enums';

interface TimelineFilterProps {
  selected: TimeLineEnum;
  onChange: (value: TimeLineEnum) => void;
  className?: string;
}

export default function TimelineFilter({ selected, onChange, className = '' }: TimelineFilterProps) {
  return (
    <div className={`flex gap-1 bg-gray-100 rounded-lg p-1 ${className}`}>
      {TABS_TIME.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
            selected === tab.value
              ? 'bg-white text-[#FA875B] font-medium shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
}
