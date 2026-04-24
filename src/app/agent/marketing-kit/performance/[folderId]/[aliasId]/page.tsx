'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { ArrowLeft, Info } from 'lucide-react';

import PerformanceChart from '@/components/charts/PerformanceChart.lazy';
import TimelineFilter from '@/components/charts/TimelineFilter';
import Skeleton from '@/components/ui/Skeleton';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { I18n } from '@/i18n';
import { CDN_URL } from '@/lib/api.config';
import { PERFORMANCE_DETAIL_DEFAULT_ALIAS } from '@/lib/constants';
import { getTimeLine } from '@/lib/marketing-dashboard.utils';
import type { PerformanceAliasData } from '@/types';
import { TimeLineEnum } from '@/types/enums';

const brandGradient = 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)';

export default function AliasPerformancePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 pb-8">
          <Skeleton className="h-16" />
          <Skeleton className="h-64" />
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
      getPerformanceAlias({ folderId, aliasId, from: periods.from, to: periods.to }).then((res) => {
        const raw = res?.data;
        const result: PerformanceAliasData = Array.isArray(raw)
          ? (raw[0] ?? PERFORMANCE_DETAIL_DEFAULT_ALIAS)
          : (raw ?? PERFORMANCE_DETAIL_DEFAULT_ALIAS);
        setData(result);
      });
    }
  }, [folderId, aliasId, periods.from, periods.to, getPerformanceAlias]);

  const handleTimelineChange = (tl: TimeLineEnum) => {
    setTimeLine(tl);
    setPeriods(getTimeLine(tl));
  };

  if (isLoading && !data.name) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-16" />
        <Skeleton className="h-10" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="animate-bento-fade-up flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="glass-bento sticky top-4 z-10 flex flex-col gap-3">
        <button
          onClick={() => router.back()}
          className="group flex w-fit items-center gap-3 text-left"
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full text-white shadow-[var(--shadow-glow-primary)] transition-transform group-hover:-translate-x-1"
            style={{ background: brandGradient }}
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <div>
            <p className="bento-eyebrow mb-0.5">Hiệu suất ảnh</p>
            <h2 className="line-clamp-1 text-xl font-black tracking-wide text-[var(--text-strong)] md:text-2xl">
              {data.name || I18n.marketingDashboard.imagePerformance}
            </h2>
          </div>
        </button>
        <div className="ml-13 flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
          <Info className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <span>{I18n.marketingDashboard.textHeaderPerformanceTip}</span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        {/* Image preview */}
        {data.imageLink && (
          <div className="flex justify-center">
            <div className="glass-bento glass-shine w-full max-w-xs overflow-hidden !p-0">
              <div className="aspect-[4/5] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${CDN_URL}${data.imageLink}`}
                  alt={data.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="border-t border-[var(--surface-glass-border)] px-4 py-3">
                <p className="truncate text-center text-sm font-black tracking-wide text-[var(--text-strong)]">
                  {data.name}
                </p>
              </div>
            </div>
          </div>
        )}

        <section className="glass-bento">
          <TimelineFilter selected={timeLine} onChange={handleTimelineChange} />
        </section>

        <section className="glass-bento">
          <PerformanceChart alias={data} timeLine={timeLine} timeRange={periods} />
        </section>
      </div>
    </div>
  );
}
