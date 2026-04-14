'use client';

import { I18n } from '@/i18n';
import { LabelEnum, TypeEnum } from '@/types/enums';
import type { FolderModel } from '@/types';
import Marquee from '@/components/animations/Marquee';
import { format } from 'date-fns';
import { getLastExpiredDate } from '@/lib/marketing-dashboard.utils';

interface FeaturedEventsProps {
  data: FolderModel[];
  onPress: (item: FolderModel) => void;
}

export default function FeaturedEvents({ data, onPress }: FeaturedEventsProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">
        {I18n.marketingDashboard.featuredEvents}
      </h4>
      {data.map((item, index) => {
        const marqueeLabel = item.labels?.find((l) => l.type === LabelEnum.MARQUEE)?.value || '';
        const hasHot = item.labels?.some((l) => l.type === LabelEnum.HOT);
        const expiredDate = getLastExpiredDate(item);

        return (
          <button
            key={item.id ?? index}
            onClick={() => onPress(item)}
            className="w-full rounded-lg bg-white border border-gray-200 p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="flex-1 min-w-0 space-y-1">
              {marqueeLabel && (
                <div className="text-xs text-red-500">
                  <Marquee text={marqueeLabel} />
                </div>
              )}
              <div className="flex items-start gap-1.5">
                <span className="text-sm font-semibold text-gray-900 line-clamp-2">{item.name}</span>
                {hasHot && (
                  <span className="flex-shrink-0 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">HOT</span>
                )}
              </div>
              {expiredDate && (
                <p className="text-xs text-gray-500">
                  {`${I18n.marketingDashboard.expired}: ${format(expiredDate, 'dd/MM/yyyy')}`}
                </p>
              )}
              <p
                className={`text-xs font-semibold ${
                  item.type === TypeEnum.RECRUIT ? 'text-blue-600' : 'text-[#FA875B]'
                }`}
              >
                {item.type === TypeEnum.SALE
                  ? I18n.marketingDashboard.boostSales
                  : I18n.marketingDashboard.teamDevelopment}
              </p>
            </div>
            <svg className="w-6 h-6 text-[#FA875B] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
