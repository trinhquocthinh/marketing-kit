'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { ArrowLeft, Image as ImageIcon, Info } from 'lucide-react';

import PerformanceChart from '@/components/charts/PerformanceChart.lazy';
import TimelineFilter from '@/components/charts/TimelineFilter';
import BentoSectionHeading from '@/components/ui/BentoSectionHeading';
import Dropdown from '@/components/ui/Dropdown';
import Skeleton from '@/components/ui/Skeleton';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { I18n } from '@/i18n';
import { CDN_URL } from '@/lib/api.config';
import { LIST_PERFORMANCE_SORT, PERFORMANCE_DETAIL_DEFAULT } from '@/lib/constants';
import { getTimeLine, numberWithCommasDot } from '@/lib/marketing-dashboard.utils';
import type { PerformanceFolderData } from '@/types';
import { SortEnum, StatusEnum, TimeLineEnum, TypeEnum } from '@/types/enums';

const brandGradient = 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)';

export default function FolderPerformancePage() {
  const router = useRouter();
  const params = useParams();
  const folderId = Number(params.folderId);

  const { isLoading, getPerformanceFolder } = useMarketingDashboard();

  const [data, setData] = useState<PerformanceFolderData>(PERFORMANCE_DETAIL_DEFAULT);
  const [timeLine, setTimeLine] = useState<TimeLineEnum>(TimeLineEnum.ONE_MONTH);
  const [periods, setPeriods] = useState(getTimeLine(TimeLineEnum.ONE_MONTH));
  const [sort, setSort] = useState<SortEnum>(SortEnum.MostInteractions);
  const [sortOptions, setSortOptions] = useState(LIST_PERFORMANCE_SORT);

  useEffect(() => {
    if (folderId && periods.from && periods.to) {
      getPerformanceFolder({ folderId, from: periods.from, to: periods.to }).then((res) => {
        const raw = res?.data;
        const result: PerformanceFolderData = Array.isArray(raw)
          ? (raw[0] ?? PERFORMANCE_DETAIL_DEFAULT)
          : (raw ?? PERFORMANCE_DETAIL_DEFAULT);
        setData(result);

        let options = LIST_PERFORMANCE_SORT;
        if (result.type === TypeEnum.RECRUIT) {
          options = options.filter((o) => o.id !== SortEnum.MostFee);
        } else if (result.type === TypeEnum.SALE) {
          options = options.filter((o) => o.id !== SortEnum.MostESign);
        }
        setSortOptions(options);
      });
    }
  }, [folderId, periods.from, periods.to, getPerformanceFolder]);

  const handleTimelineChange = (tl: TimeLineEnum) => {
    setTimeLine(tl);
    setPeriods(getTimeLine(tl));
  };

  const sortedAliases = useMemo(() => {
    const aliases = [...(data.aliases || [])];
    switch (sort) {
      case SortEnum.MostInteractions:
        return aliases.sort((a, b) => b.count - a.count);
      case SortEnum.MostFee:
        return [
          ...aliases.filter((a) => a.type === StatusEnum.SALE).sort((a, b) => b.sum - a.sum),
          ...aliases.filter((a) => a.type !== StatusEnum.SALE),
        ];
      case SortEnum.MostESign:
        return [
          ...aliases.filter((a) => a.type === StatusEnum.RECRUIT).sort((a, b) => b.sum - a.sum),
          ...aliases.filter((a) => a.type !== StatusEnum.RECRUIT),
        ];
      case SortEnum.FromAToZ:
        return aliases.sort((a, b) => a.name.localeCompare(b.name));
      case SortEnum.FromZToA:
        return aliases.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return aliases;
    }
  }, [data.aliases, sort]);

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
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  const isSale = data.type === TypeEnum.SALE || (data.type as string) === StatusEnum.SALE;

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
            <p className="bento-eyebrow mb-0.5">Hiệu suất</p>
            <h2 className="line-clamp-1 text-xl font-black tracking-wide text-[var(--text-strong)] md:text-2xl">
              {data.name}
            </h2>
          </div>
        </button>
        <div className="ml-13 flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
          <Info className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <span>{I18n.marketingDashboard.textHeaderPerformanceTip}</span>
        </div>
      </div>

      {/* Timeline + Chart + List */}
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <section className="glass-bento">
          <TimelineFilter selected={timeLine} onChange={handleTimelineChange} />
        </section>

        <section className="glass-bento">
          <PerformanceChart alias={data} timeLine={timeLine} timeRange={periods} />
        </section>

        <section className="space-y-4">
          <BentoSectionHeading title={I18n.marketingDashboard.imageCatalog} variant="accent" />

          <div className="glass-bento">
            <Dropdown
              options={sortOptions.map((s) => ({ ...s, isSelected: s.id === sort }))}
              onSelect={(opt) => setSort(opt.id as SortEnum)}
              label={I18n.arrangeBy}
            />
          </div>

          <div className="flex flex-col gap-4">
            {sortedAliases.map((alias) => (
              <div
                key={alias.id}
                className="glass-bento glass-bento-interactive flex flex-col gap-6 md:flex-row"
              >
                {/* Image */}
                <div className="relative flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-bento-sm)] bg-[var(--surface-glass-alt)] md:h-32 md:w-32">
                  {alias.imageLink ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${CDN_URL}${alias.imageLink}`}
                      alt={alias.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <ImageIcon
                      className="h-8 w-8 text-[var(--text-muted)]"
                      strokeWidth={1.25}
                    />
                  )}
                  <div className="absolute right-0 bottom-0 left-0 bg-[var(--overlay-bg)] p-2 backdrop-blur-md">
                    <p className="truncate text-center text-[10px] font-black tracking-wider text-white">
                      {alias.name}
                    </p>
                  </div>
                </div>

                {/* Stats + button */}
                <div className="flex flex-1 flex-col">
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row md:mb-auto">
                    <div className="flex-1">
                      <span className="text-2xl font-black text-[var(--primary)]">
                        {numberWithCommasDot(alias.count)}
                      </span>
                      <p className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
                        {I18n.marketingDashboard.interactions}
                      </p>
                    </div>
                    <div className="h-px w-full bg-[var(--surface-glass-border)] sm:h-12 sm:w-px" />
                    <div className="flex-1">
                      <span className="text-2xl font-black text-[var(--accent)]">
                        {numberWithCommasDot(alias.sum)}
                      </span>
                      <p className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
                        {isSale
                          ? I18n.marketingDashboard.insuranceFee
                          : I18n.marketingDashboard.eSignCompletions}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end border-t border-[var(--surface-glass-border)] pt-4 md:mt-0 md:border-t-0 md:pt-0">
                    <button
                      onClick={() =>
                        router.push(
                          `/agent/marketing-kit/performance/${folderId}/${alias.id}?timeLine=${timeLine}&from=${periods.from}&to=${periods.to}`,
                        )
                      }
                      className="btn-brand-glow w-full rounded-full px-6 py-2.5 text-[10px] font-black tracking-widest text-white uppercase active:scale-[0.98] sm:w-auto"
                    >
                      {I18n.marketingDashboard.imagePerformance}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
