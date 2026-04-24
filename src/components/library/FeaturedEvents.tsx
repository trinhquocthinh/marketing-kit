'use client';

import { format } from 'date-fns';
import { Flame, Sparkles, Users } from 'lucide-react';

import BentoSectionHeading from '@/components/ui/BentoSectionHeading';
import { I18n } from '@/i18n';
import { getLastExpiredDate } from '@/lib/marketing-dashboard.utils';
import type { FolderModel } from '@/types';
import { LabelEnum, TypeEnum } from '@/types/enums';

interface FeaturedEventsProps {
  data: FolderModel[];
  onPress: (item: FolderModel) => void;
}

const brandGradient = 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)';
const recruitGradient =
  'linear-gradient(135deg, color-mix(in srgb, var(--text-strong) 60%, var(--primary)) 0%, color-mix(in srgb, var(--text-strong) 40%, var(--accent)) 100%)';

function FolderIcon({ type }: { type: string }) {
  const isRecruit = type === TypeEnum.RECRUIT;
  const Icon = isRecruit ? Users : Sparkles;
  return (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl text-white shadow-(--shadow-glow-primary)"
      style={{ background: isRecruit ? recruitGradient : brandGradient }}
    >
      <Icon className="h-7 w-7" strokeWidth={2} />
    </div>
  );
}

export default function FeaturedEvents({ data, onPress }: FeaturedEventsProps) {
  if (!data || data.length === 0) return null;

  return (
    <div>
      <BentoSectionHeading title={I18n.marketingDashboard.featuredEvents} variant="accent" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {data.map((item, index) => {
          const hasHot = item.labels?.some((l) => l.type === LabelEnum.HOT);
          const expiredDate = getLastExpiredDate(item);
          const isRecruit = item.type === TypeEnum.RECRUIT;

          return (
            <button
              key={item.id ?? index}
              onClick={() => onPress(item)}
              className="glass-bento glass-bento-interactive glass-shine group flex w-full items-center gap-5 text-left"
            >
              <FolderIcon type={item.type as string} />

              <div className="min-w-0 flex-1 space-y-1.5">
                {hasHot && (
                  <p className="flex items-center gap-1 text-[10px] font-black tracking-widest text-primary uppercase">
                    <Flame className="h-3 w-3" strokeWidth={2.5} />
                    Hot nhất
                  </p>
                )}

                <p className="line-clamp-2 text-sm leading-snug font-black text-t-strong">
                  {item.name}
                </p>

                {expiredDate && (
                  <p className="text-[10px] text-t-muted">
                    {`${I18n.marketingDashboard.expired}: ${format(expiredDate, 'dd/MM/yyyy')}`}
                  </p>
                )}

                <p className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-t-muted uppercase">
                  {isRecruit
                    ? I18n.marketingDashboard.teamDevelopment
                    : I18n.marketingDashboard.boostSales}
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: 'var(--primary)' }}
                  />
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
