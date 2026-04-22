'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { I18n } from '@/i18n';
import { CDN_URL } from '@/lib/api.config';
import { TimeLineEnum } from '@/types/enums';
import type { PerformanceAliasData } from '@/types';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { getTimeLine } from '@/lib/marketing-dashboard.utils';
import { PERFORMANCE_DETAIL_DEFAULT_ALIAS } from '@/lib/constants';
import Skeleton from '@/components/ui/Skeleton';
import PerformanceChart from '@/components/charts/PerformanceChart';
import TimelineFilter from '@/components/charts/TimelineFilter';

export default function AliasPerformancePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 pb-8">
          <Skeleton className="h-16 bg-white/5 rounded-xl" />
          <Skeleton className="h-64 bg-white/5 rounded-2xl" />
        </div>
      }
    >
      <AliasPerformanceContent />
    </Suspense>
  );
}

function AliasPerformanceContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const folderId = Number(params.folderId);
  const aliasId = Number(params.aliasId);

  const { isLoading, getPerformanceAlias } = useMarketingDashboard();

  const [data, setData] = useState<PerformanceAliasData>(PERFORMANCE_DETAIL_DEFAULT_ALIAS);

  // Restore timeline from query params or default
  const initialTimeLine = (searchParams.get('timeLine') as TimeLineEnum) || TimeLineEnum.ONE_MONTH;
  const [timeLine, setTimeLine] = useState<TimeLineEnum>(initialTimeLine);
  const [periods, setPeriods] = useState(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (from && to) return { from, to };
    return getTimeLine(initialTimeLine);
  });

  useEffect(() => {
    if (folderId && aliasId && periods.from && periods.to) {
      getPerformanceAlias({ folderId, aliasId, from: periods.from, to: periods.to }).then(
        (res) => {
          const raw = res?.data;
          const result: PerformanceAliasData = Array.isArray(raw)
            ? (raw[0] ?? PERFORMANCE_DETAIL_DEFAULT_ALIAS)
            : (raw ?? PERFORMANCE_DETAIL_DEFAULT_ALIAS);
          setData(result);
        }
      );
    }
  }, [folderId, aliasId, periods.from, periods.to, getPerformanceAlias]);

  const handleTimelineChange = (tl: TimeLineEnum) => {
    setTimeLine(tl);
    setPeriods(getTimeLine(tl));
  };

  if (isLoading && !data.name) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-16 bg-white/5 rounded-xl" />
        <Skeleton className="h-10 bg-white/5 rounded-xl" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 bg-white/5 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="pb-10 flex flex-col gap-8">
      {/* Header: back + image + title */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group w-fit"
        >
          <svg
            className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform text-[var(--primary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <h2 className="font-display text-lg md:text-xl font-bold text-[var(--text-primary)] line-clamp-1 tracking-tight">
            {data.name || I18n.marketingDashboard.imagePerformance}
          </h2>
        </button>
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] ml-7">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>{I18n.marketingDashboard.textHeaderPerformanceTip}</span>
        </div>
      </div>

      <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
        {/* Image preview */}
        {data.imageLink && (
          <div className="flex justify-center">
            <div className="w-full max-w-xs glass-card rounded-2xl overflow-hidden">
              <div className="aspect-4/5 w-full">
                <img
                  src={`${CDN_URL}${data.imageLink}`}
                  alt={data.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="px-4 py-3 border-t border-[var(--glass-border)]">
                <p className="font-display text-sm text-[var(--text-primary)] font-bold text-center truncate">{data.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Timeline filter */}
        <section>
          <TimelineFilter selected={timeLine} onChange={handleTimelineChange} />
        </section>

        {/* Chart + Stats */}
        <section>
          <PerformanceChart alias={data} timeLine={timeLine} timeRange={periods} />
        </section>
      </div>
    </div>
  );
}
