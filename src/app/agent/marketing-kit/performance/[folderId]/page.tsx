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
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-lg" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  const isSale = data.type === TypeEnum.SALE || (data.type as string) === StatusEnum.SALE;

  return (
    <div className="min-h-full">
      {/* Header with back button */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-[#E6E6E6]">
        <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-semibold text-black font-[Montserrat,sans-serif] truncate">
          {data.name}
        </h2>
      </div>

      {/* Top container: white bg – info tip, time tabs, chart */}
      <div className="bg-white px-5 py-4">
        {/* Info tip */}
        <div className="flex items-start gap-2 mb-4">
          <svg className="w-4 h-4 text-[#999] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-[11px] italic text-[#888] font-[Montserrat,sans-serif]">
            {I18n.marketingDashboard.textHeaderPerformanceTip}
          </p>
        </div>

        {/* Timeline filter tabs */}
        <TimelineFilter selected={timeLine} onChange={handleTimelineChange} />

        {/* Chart */}
        <PerformanceChart alias={data} timeLine={timeLine} timeRange={periods} className="mt-6" />
      </div>

      {/* List container: WildSand bg – title, sort, alias cards */}
      <div className="bg-[#F5F5F5] px-5 py-4">
        <p className="text-sm font-semibold text-black font-[Montserrat,sans-serif] mb-3">
          {I18n.marketingDashboard.imageCatalog}
        </p>

        <div className="mb-4">
          <Dropdown
            options={sortOptions.map((s) => ({ ...s, isSelected: s.id === sort }))}
            onSelect={(opt) => setSort(opt.id as SortEnum)}
            label={I18n.arrangeBy}
          />
        </div>

        {/* Alias items */}
        <div className="flex flex-col gap-3">
          {sortedAliases.map((alias) => (
            <div
              key={alias.id}
              className="flex gap-4 rounded-lg bg-white overflow-hidden"
              style={{
                border: '0.5px solid #9E9E9E',
                boxShadow: '0px 1px 1px 0px rgba(0,0,0,0.3)',
                padding: '17px 28px 17px 20px',
              }}
            >
              {/* Left: image + name */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className="overflow-hidden"
                  style={{
                    width: '30vw',
                    maxWidth: 120,
                    aspectRatio: '1',
                    border: '0.5px solid #C0C0C0',
                  }}
                >
                  {alias.imageLink && (
                    <img
                      src={`${CDN_URL}${alias.imageLink}`}
                      alt={alias.name}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <p
                  className="text-xs font-semibold text-black font-[Montserrat,sans-serif] text-center line-clamp-2"
                  style={{ width: '30vw', maxWidth: 120 }}
                >
                  {alias.name}
                </p>
              </div>

              {/* Right: stats + button */}
              <div className="flex-1 flex flex-col justify-center py-1">
                {/* Interactions */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-base font-semibold text-[#FF8050] font-[Montserrat,sans-serif]">
                    {numberWithCommasDot(alias.count)}
                  </span>
                  <span className="text-xs font-semibold text-[#666] font-[Montserrat,sans-serif]">
                    {I18n.marketingDashboard.interactions}
                  </span>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-[#C0C0C0] my-2" />

                {/* Fee / eSign */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-base font-semibold text-[#FF8050] font-[Montserrat,sans-serif]">
                    {numberWithCommasDot(alias.sum)}
                  </span>
                  <span className="text-xs font-semibold text-[#666] font-[Montserrat,sans-serif]">
                    {isSale
                      ? I18n.marketingDashboard.insuranceFee
                      : I18n.marketingDashboard.eSignCompletions}
                  </span>
                </div>

                {/* View detail button */}
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() =>
                      router.push(
                        `/agent/marketing-kit/performance/${folderId}/${alias.id}?timeLine=${timeLine}&from=${periods.from}&to=${periods.to}`
                      )
                    }
                    className="px-3 py-1.5 rounded-md text-xs font-semibold font-[Montserrat,sans-serif] text-[#ED5E28]"
                    style={{
                      backgroundColor: '#FFF0E6',
                      border: '0.5px solid #FFA07A',
                    }}
                  >
                    {I18n.marketingDashboard.imagePerformance}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
