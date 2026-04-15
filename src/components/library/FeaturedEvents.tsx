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
      {/* Title – matches RN SmallNext(13) SemiBold */}
      <h4 className="text-[13px] font-semibold text-black font-[Montserrat,sans-serif]">
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
            className="w-full rounded-lg bg-white border-[0.5px] border-[#B2998F] p-5 flex items-center justify-between gap-4 shadow-[0_1px_1px_0_#E5CDC3] hover:shadow-md transition-shadow text-left"
          >
            {/* Left container – flex-[0.9] matches RN */}
            <div className="flex-[0.9] min-w-0 space-y-1 items-start">
              {/* Marquee label */}
              {marqueeLabel && (
                <Marquee
                  text={marqueeLabel}
                  className="h-[14px]"
                  textClassName="text-[8px] leading-[14px] text-red-500"
                />
              )}

              {/* Title + HOT badge */}
              <div className="flex items-start gap-[5px]">
                <span className="text-[13px] font-semibold text-black font-[Montserrat,sans-serif] line-clamp-2">
                  {item.name}
                </span>
                {hasHot && (
                  <span className="flex-shrink-0 w-5 h-5 bg-red-500 text-white text-[8px] rounded flex items-center justify-center font-bold">
                    🔥
                  </span>
                )}
              </div>

              {/* Expired date – Smaller(11), Granite(#808080) */}
              {expiredDate && (
                <p className="text-[11px] text-[#808080] font-[Montserrat,sans-serif]">
                  {`${I18n.marketingDashboard.expired}: ${format(expiredDate, 'dd/MM/yyyy')}`}
                </p>
              )}

              {/* Type – ExtraSmallNext(9), HalloweenOrangeBold(#ED5E28) or NewCar(#295ACB) */}
              <p
                className={`text-[9px] font-semibold font-[Montserrat,sans-serif] ${
                  item.type === TypeEnum.RECRUIT ? 'text-[#295ACB]' : 'text-[#ED5E28]'
                }`}
              >
                {item.type === TypeEnum.SALE
                  ? I18n.marketingDashboard.boostSales
                  : I18n.marketingDashboard.teamDevelopment}
              </p>
            </div>

            {/* Arrow icon – Orange circle, 24x24 */}
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FA875B] flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        );
      })}
    </div>
  );
}
