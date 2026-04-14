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
      <h4 className="text-sm font-semibold text-gray-900">
        {I18n.marketingDashboard.publicFolders}
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {data.map((item, index) => {
          const marqueeLabel = item.labels?.find((l) => l.type === LabelEnum.MARQUEE)?.value || '';
          const hasHot = item.labels?.some((l) => l.type === LabelEnum.HOT);

          return (
            <button
              key={item.id ?? index}
              onClick={() => onPress(item)}
              className="rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-4 flex items-center justify-between text-left hover:shadow-md transition-shadow min-h-[100px]"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-500">
                    {I18n.marketingDashboard.publicFolders.split(' ')[0]}
                  </span>
                  {marqueeLabel && (
                    <div className="text-[10px] text-red-500 max-w-[60px]">
                      <Marquee text={marqueeLabel} maxChars={8} />
                    </div>
                  )}
                  {hasHot && (
                    <span className="text-[10px] bg-red-500 text-white px-1 rounded">HOT</span>
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-900 line-clamp-2">{item.name}</p>
                <p
                  className={`text-[10px] font-semibold ${
                    item.type === TypeEnum.RECRUIT ? 'text-blue-600' : 'text-[#FA875B]'
                  }`}
                >
                  {item.type === TypeEnum.SALE
                    ? I18n.marketingDashboard.boostSales
                    : I18n.marketingDashboard.teamDevelopment}
                </p>
              </div>
              <svg className="w-5 h-5 text-[#FA875B] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
