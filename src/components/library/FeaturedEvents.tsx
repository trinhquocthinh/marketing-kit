'use client';

import { I18n } from '@/i18n';
import { LabelEnum, TypeEnum } from '@/types/enums';
import type { FolderModel } from '@/types';
import { format } from 'date-fns';
import { getLastExpiredDate } from '@/lib/marketing-dashboard.utils';

interface FeaturedEventsProps {
  data: FolderModel[];
  onPress: (item: FolderModel) => void;
}

function FolderIcon({ type }: { type: string }) {
  const isRecruit = type === TypeEnum.RECRUIT;

  return (
    <div
      className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center ${
        isRecruit
          ? 'bg-linear-to-br from-slate-600 to-slate-800'
          : 'bg-linear-to-br from-orange-400 to-rose-500'
      }`}
    >
      {isRecruit ? (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      ) : (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
        </svg>
      )}
    </div>
  );
}

export default function FeaturedEvents({ data, onPress }: FeaturedEventsProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Title */}
      <h2 className="text-xl font-bold text-t-primary flex items-center gap-2">
        {I18n.marketingDashboard.featuredEvents}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 2xl:grid-cols-5 gap-4">
        {data.map((item, index) => {
          const hasHot = item.labels?.some((l) => l.type === LabelEnum.HOT);
          const expiredDate = getLastExpiredDate(item);
          const isRecruit = item.type === TypeEnum.RECRUIT;

          return (
            <button
              key={item.id ?? index}
              onClick={() => onPress(item)}
              className="w-full rounded-2xl bg-[var(--surface)] backdrop-blur-md border border-[var(--border)] p-4 flex items-center gap-4 hover:shadow-lg transition-all text-left group shadow-sm"
            >
              {/* Icon */}
              <FolderIcon type={item.type as string} />

              {/* Content */}
              <div className="min-w-0 flex-1 space-y-1">
                {/* HOT label */}
                {hasHot && (
                  <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500 font-[Montserrat,sans-serif]">
                    Hot nhất hiện nay
                  </p>
                )}

                {/* Title */}
                <p className="text-sm font-bold text-[var(--text-primary)] font-[Montserrat,sans-serif] line-clamp-2 leading-snug">
                  {item.name}
                </p>

                {/* Expired date */}
                {expiredDate && (
                  <p className="text-[10px] text-gray-400 font-[Montserrat,sans-serif]">
                    {`${I18n.marketingDashboard.expired}: ${format(expiredDate, 'dd/MM/yyyy')}`}
                  </p>
                )}

                {/* Type */}
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-[Montserrat,sans-serif] flex items-center gap-1.5">
                  {isRecruit
                    ? I18n.marketingDashboard.teamDevelopment
                    : I18n.marketingDashboard.boostSales}
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500" />
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
