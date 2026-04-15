'use client';

import { I18n } from '@/i18n';
import { LabelEnum, TypeEnum } from '@/types/enums';
import type { FolderModel } from '@/types';
import Marquee from '@/components/animations/Marquee';

interface PublicFoldersProps {
  data: FolderModel[];
  onPress: (item: FolderModel) => void;
}

export default function PublicFolders({ data, onPress }: PublicFoldersProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Title – SmallNext(13) SemiBold */}
      <h4 className="text-[13px] font-semibold text-black font-[Montserrat,sans-serif]">
        {I18n.marketingDashboard.publicFolders}
      </h4>

      {/* 2-column grid – matches RN columnGap/rowGap ~1.3% screen width */}
      <div className="grid grid-cols-2 gap-[1.3vw]">
        {data.map((item, index) => {
          const marqueeLabel = item.labels?.find((l) => l.type === LabelEnum.MARQUEE)?.value || '';
          const hasHot = item.labels?.some((l) => l.type === LabelEnum.HOT);

          return (
            <button
              key={item.id ?? index}
              onClick={() => onPress(item)}
              className="rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 py-5 px-4 flex items-center justify-between text-left hover:shadow-md transition-shadow"
            >
              {/* Left content – 80% width matching RN */}
              <div className="flex-1 min-w-0 space-y-1 w-[80%]">
                {/* Topic label row + marquee + HOT */}
                <div className="flex items-center gap-[5px]">
                  <span className="text-[9px] text-[#808080] font-[Montserrat,sans-serif]">
                    {I18n.marketingDashboard.topic}
                  </span>
                  {marqueeLabel && (
                    <Marquee
                      text={marqueeLabel}
                      className="max-w-[60px]"
                      textClassName="text-[8px] text-red-500"
                    />
                  )}
                  {hasHot && (
                    <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-[8px]">
                      🔥
                    </span>
                  )}
                </div>

                {/* Folder name – SmallNext(13) SemiBold */}
                <p className="text-[13px] font-semibold text-black font-[Montserrat,sans-serif] line-clamp-2">
                  {item.name}
                </p>

                {/* Type badge – ExtraSmallNext(9), HalloweenOrangeBold or NewCar */}
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

              {/* Arrow */}
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FA875B] flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
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
