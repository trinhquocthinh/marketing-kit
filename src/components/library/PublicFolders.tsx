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
      {/* Title */}
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        📁 {I18n.marketingDashboard.publicFolders}
      </h2>

      {/* Responsive grid – 2/3/4 columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((item, index) => {
          const marqueeLabel = item.labels?.find((l) => l.type === LabelEnum.MARQUEE)?.value || '';
          const hasHot = item.labels?.some((l) => l.type === LabelEnum.HOT);

          return (
            <button
              key={item.id ?? index}
              onClick={() => onPress(item)}
              className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 py-5 px-4 flex items-center justify-between text-left hover:bg-white/10 transition-all hover:-translate-y-1 relative group"
            >
              {/* Left content – 80% width matching RN */}
              <div className="flex-1 min-w-0 space-y-1 w-[80%]">
                {/* Topic label row + marquee + HOT */}
                <div className="flex items-center gap-[5px]">
                  <span className="text-[9px] text-slate-400 font-[Montserrat,sans-serif]">
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
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                  )}
                </div>

                {/* Folder name – SmallNext(13) SemiBold */}
                <p className="text-[13px] font-semibold text-white font-[Montserrat,sans-serif] line-clamp-2">
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
              <div className="shrink-0 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
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
