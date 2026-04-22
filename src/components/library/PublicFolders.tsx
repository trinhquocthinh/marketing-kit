'use client';

import { I18n } from '@/i18n';
import { LabelEnum, TypeEnum } from '@/types/enums';
import type { FolderModel } from '@/types';
import Marquee from '@/components/animations/Marquee';
import LabelHot from './LabelHot';

interface PublicFoldersProps {
  data: FolderModel[];
  onPress: (item: FolderModel) => void;
}

export default function PublicFolders({ data, onPress }: PublicFoldersProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Title */}
      <h2 className="font-display text-xl font-bold text-[var(--text-primary)] flex items-center gap-3 tracking-tight">
        <span className="w-1.5 h-6 rounded-full bg-linear-to-b from-[var(--accent-violet)] to-[var(--accent-rose)] shadow-[var(--glow-violet)]" />
        {I18n.marketingDashboard.publicFolders}
      </h2>

      {/* Responsive grid – 2/3/4 columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-7 gap-4">
        {data.map((item, index) => {
          const marqueeLabel = item.labels?.find((l) => l.type === LabelEnum.MARQUEE)?.value || '';
          const hasHot = item.labels?.some((l) => l.type === LabelEnum.HOT);

          return (
            <button
              key={item.id ?? index}
              onClick={() => onPress(item)}
              className="glass-card glass-card-hover rounded-2xl py-5 px-4 flex items-center justify-between text-left relative group theme-transition"
            >
              <div className='absolute top-0 right-8 w-16 h-3 bg-[var(--surface-hover)] rounded-b-lg' />
              {/* Left content – 80% width matching RN */}
              <div className="flex-1 min-w-0 space-y-1 w-[80%]">
                {/* Topic label row + marquee + HOT */}
                <div className="flex items-center gap-1.25">
                  <span className="min-w-7.5 text-[9px] text-[var(--text-muted)]">
                    {I18n.marketingDashboard.topic}
                  </span>
                  {marqueeLabel && (
                    <Marquee
                      text={marqueeLabel}
                      className="max-w-15 h-4 leading-2 bg-rose-500/20 px-2 py-0.5 rounded w-fit"
                      textClassName="text-[10px] font-bold text-rose-400"
                    />
                  )}
                  {hasHot && (
                    <LabelHot />
                  )}
                </div>

                {/* Folder name – SmallNext(13) SemiBold */}
                <p className="font-display text-[13px] font-bold text-[var(--text-primary)] line-clamp-2">
                  {item.name}
                </p>

                {/* Type badge */}
                <p
                  className={`text-[9px] font-semibold uppercase tracking-wider ${item.type === TypeEnum.RECRUIT ? 'text-[var(--accent-violet)]' : 'text-[var(--primary)]'
                    }`}
                >
                  {item.type === TypeEnum.SALE
                    ? I18n.marketingDashboard.boostSales
                    : I18n.marketingDashboard.teamDevelopment}
                </p>
              </div>

              {/* Arrow */}
              <div className="shrink-0 w-6 h-6 rounded-full bg-linear-to-br from-orange-400 to-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[var(--glow-primary)]">
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
