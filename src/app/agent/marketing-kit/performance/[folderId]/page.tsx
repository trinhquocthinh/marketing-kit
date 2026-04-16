'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { I18n } from '@/i18n';
import { CDN_URL } from '@/lib/api.config';
import { SortEnum, StatusEnum, TimeLineEnum, TypeEnum } from '@/types/enums';
import type { PerformanceFolderData } from '@/types';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { getTimeLine, numberWithCommasDot } from '@/lib/marketing-dashboard.utils';
import { LIST_PERFORMANCE_SORT, PERFORMANCE_DETAIL_DEFAULT } from '@/lib/constants';
import Dropdown from '@/components/ui/Dropdown';
import Skeleton from '@/components/ui/Skeleton';
import PerformanceChart from '@/components/charts/PerformanceChart';
import TimelineFilter from '@/components/charts/TimelineFilter';

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
        <Skeleton className="h-16 bg-white/5 rounded-xl" />
        <Skeleton className="h-10 bg-white/5 rounded-xl" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 bg-white/5 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 bg-white/5 rounded-2xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 bg-white/5 rounded-2xl" />
        ))}
      </div>
    );
  }

  const isSale = data.type === TypeEnum.SALE || (data.type as string) === StatusEnum.SALE;

  return (
    <div className="pb-10 flex flex-col gap-8">
      {/* Header: back + title + info tip */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => router.back()}
          className="flex items-center text-slate-300 hover:text-white transition-colors group w-fit"
        >
          <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <h2 className="text-lg md:text-xl font-bold text-white line-clamp-1">{data.name}</h2>
        </button>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 ml-7">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>{I18n.marketingDashboard.textHeaderPerformanceTip}</span>
        </div>
      </div>

      {/* Timeline filter + Chart */}
      <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
        <section>
          <TimelineFilter selected={timeLine} onChange={handleTimelineChange} />
        </section>

        <section>
          <PerformanceChart alias={data} timeLine={timeLine} timeRange={periods} />
        </section>

        {/* Alias list section */}
        <section>
          <h3 className="text-base font-bold text-white mb-4">
            {I18n.marketingDashboard.imageCatalog}
          </h3>

          <div className="flex flex-col gap-2 mb-4">
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
                className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-6 hover:bg-white/5 transition-all"
              >
                {/* Left: image + name */}
                <div className="w-full md:w-32 h-40 md:h-32 bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden shrink-0 relative border border-white/5">
                  {alias.imageLink ? (
                    <img
                      src={`${CDN_URL}${alias.imageLink}`}
                      alt={alias.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2">
                    <p className="text-[10px] text-white font-medium truncate text-center">{alias.name}</p>
                  </div>
                </div>

                {/* Right: stats + button */}
                <div className="flex-1 flex flex-col">
                  <div className="flex flex-col sm:flex-row gap-4 mb-4 md:mb-auto">
                    <div className="flex-1">
                      <span className="text-orange-500 font-bold text-xl">
                        {numberWithCommasDot(alias.count)}
                      </span>
                      <p className="text-xs text-slate-400 font-medium">
                        {I18n.marketingDashboard.interactions}
                      </p>
                    </div>
                    <div className="h-px w-full sm:w-px sm:h-12 bg-white/10" />
                    <div className="flex-1">
                      <span className="text-orange-500 font-bold text-xl">
                        {numberWithCommasDot(alias.sum)}
                      </span>
                      <p className="text-xs text-slate-400 font-medium">
                        {isSale
                          ? I18n.marketingDashboard.insuranceFee
                          : I18n.marketingDashboard.eSignCompletions}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-white/10 pt-4 flex justify-end md:border-t-0 md:pt-0 md:mt-0">
                    <button
                      onClick={() =>
                        router.push(
                          `/agent/marketing-kit/performance/${folderId}/${alias.id}?timeLine=${timeLine}&from=${periods.from}&to=${periods.to}`
                        )
                      }
                      className="px-6 py-2 rounded-xl border border-orange-500 text-orange-400 font-semibold hover:bg-orange-500/10 transition-colors w-full sm:w-auto text-sm"
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
