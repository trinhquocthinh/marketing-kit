'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { I18n } from '@/i18n';
import { CDN_URL } from '@/lib/api.config';
import { SortEnum, StatusEnum, TimeLineEnum, TypeEnum } from '@/types/enums';
import type { PerformanceFolderData, PerformanceAliasData } from '@/types';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { getTimeLine } from '@/lib/marketing-dashboard.utils';
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
        const items = res?.data;
        const result: PerformanceFolderData = Array.isArray(items) && items.length > 0
          ? items[0]
          : PERFORMANCE_DETAIL_DEFAULT;
        setData(result);

        // Adjust sort options based on type
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
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-lg" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  const isSale = data.type === TypeEnum.SALE || (data.type as string) === StatusEnum.SALE;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-semibold text-gray-900 truncate">{data.name}</h2>
      </div>

      {/* Chart area */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Dữ liệu hiệu suất theo thời gian
        </div>

        <TimelineFilter selected={timeLine} onChange={handleTimelineChange} />

        <PerformanceChart alias={data} timeLine={timeLine} timeRange={periods} />
      </div>

      {/* Aliases list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Danh mục hình ảnh</h3>
          <div className="w-48">
            <Dropdown
              options={sortOptions.map((s) => ({ ...s, isSelected: s.id === sort }))}
              onSelect={(opt) => setSort(opt.id as SortEnum)}
              label={I18n.default}
            />
          </div>
        </div>

        <div className="space-y-2">
          {sortedAliases.map((alias) => (
            <div
              key={alias.id}
              className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3"
            >
              {alias.imageLink && (
                <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden border border-gray-100">
                  <img
                    src={`${CDN_URL}${alias.imageLink}`}
                    alt={alias.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{alias.name}</p>
                <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                  <span>{I18n.marketingDashboard.clicked}: <strong>{alias.count}</strong></span>
                  <span>
                    {isSale ? I18n.marketingDashboard.insurancePremium : I18n.marketingDashboard.esignCompleted}:{' '}
                    <strong>{alias.sum}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
