'use client';

import { ArrowRight } from 'lucide-react';

import Marquee from '@/components/animations/Marquee';
import BentoSectionHeading from '@/components/ui/BentoSectionHeading';
import { I18n } from '@/i18n';
import type { FolderModel } from '@/types';
import { LabelEnum, TypeEnum } from '@/types/enums';

import LabelHot from './LabelHot';

interface PublicFoldersProps {
  data: FolderModel[];
  onPress: (item: FolderModel) => void;
}

export default function PublicFolders({ data, onPress }: PublicFoldersProps) {
  if (!data || data.length === 0) return null;

  const brandGradient = 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)';

  return (
    <div>
      <BentoSectionHeading title={I18n.marketingDashboard.publicFolders} />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
        {data.map((item, index) => {
          const marqueeLabel = item.labels?.find((l) => l.type === LabelEnum.MARQUEE)?.value || '';
          const hasHot = item.labels?.some((l) => l.type === LabelEnum.HOT);

          return (
            <button
              key={item.id ?? index}
              onClick={() => onPress(item)}
              className="glass-bento glass-bento-interactive glass-shine group relative flex items-center justify-between text-left"
            >
              <div className="w-[80%] min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black tracking-widest text-t-muted uppercase">
                    {I18n.marketingDashboard.topic}
                  </span>
                  {marqueeLabel && (
                    <Marquee
                      text={marqueeLabel}
                      className="h-4 w-fit max-w-20 rounded bg-rose-500/20 px-2 py-0.5 leading-2"
                      textClassName="text-[10px] font-black text-rose-400"
                    />
                  )}
                  {hasHot && <LabelHot />}
                </div>

                <p className="line-clamp-2 text-[13px] leading-snug font-black text-t-strong">
                  {item.name}
                </p>

                <p className="text-[9px] font-black tracking-widest text-primary uppercase">
                  {item.type === TypeEnum.SALE
                    ? I18n.marketingDashboard.boostSales
                    : I18n.marketingDashboard.teamDevelopment}
                </p>
              </div>

              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-(--shadow-glow-primary) transition-transform group-hover:translate-x-0.5 group-hover:scale-110"
                style={{ background: brandGradient }}
              >
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
