'use client';

import { I18n } from '@/i18n';
import { LabelEnum, TypeEnum } from '@/types/enums';
import type { FolderModel } from '@/types';
import Marquee from '@/components/animations/Marquee';
import { format } from 'date-fns';
import { getLastExpiredDate } from '@/lib/marketing-dashboard.utils';
import LabelHot from './LabelHot';

interface FeaturedEventsProps {
  data: FolderModel[];
  onPress: (item: FolderModel) => void;
}

export default function FeaturedEvents({ data, onPress }: FeaturedEventsProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Title */}
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        {I18n.marketingDashboard.featuredEvents}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 2xl:grid-cols-5 gap-4">
        {data.map((item, index) => {
          const marqueeLabel = item.labels?.find((l) => l.type === LabelEnum.MARQUEE)?.value || '';
          const hasHot = item.labels?.some((l) => l.type === LabelEnum.HOT);
          const expiredDate = getLastExpiredDate(item);

          return (
            <button
              key={item.id ?? index}
              onClick={() => onPress(item)}
              className="w-full rounded-2xl bg-gradient-to-r from-orange-500/20 to-rose-500/20 backdrop-blur-md border border-orange-500/30 p-5 flex items-center justify-between gap-4 hover:bg-white/10 transition-all text-left group"
            >
              {/* Left container – flex-[0.9] matches RN */}
              <div className="flex-[0.9] min-w-0 space-y-1 items-start">
                {/* Marquee label */}
                {marqueeLabel && (
                  <Marquee
                    text={marqueeLabel}
                    className="h-4 leading-2 bg-rose-500/20 px-2 py-0.5 rounded w-fit mb-2"
                    textClassName="text-[10px] font-bold text-rose-400"
                  />
                )}

                {/* Title + HOT badge */}
                <div className="flex items-start gap-1.25">
                  <span className="text-[13px] font-semibold text-white font-[Montserrat,sans-serif] line-clamp-2">
                    {item.name}
                  </span>
                  {hasHot && (
                    <LabelHot />
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
                  className={`text-[10px] font-semibold font-[Montserrat,sans-serif] ${item.type === TypeEnum.RECRUIT ? 'text-blue-300' : 'text-orange-300'
                    }`}
                >
                  {item.type === TypeEnum.SALE
                    ? I18n.marketingDashboard.boostSales
                    : I18n.marketingDashboard.teamDevelopment}
                </p>
              </div>

              {/* Arrow icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
