'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { I18n } from '@/i18n';
import { SortEnum, StatusEnum, TypeEnum } from '@/types/enums';
import type { PerformanceModel } from '@/types';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { LIST_FILTER, LIST_PERFORMANCE_SORT } from '@/lib/constants';
import Dropdown from '@/components/ui/Dropdown';
import Skeleton from '@/components/ui/Skeleton';
import NoData from '@/components/ui/NoData';

export default function PerformancePage() {
  const router = useRouter();
  const { isLoading, performances, getPerformanceOverview } = useMarketingDashboard();

  const [filter, setFilter] = useState<StatusEnum>(StatusEnum.ALL);
  const [sort, setSort] = useState<SortEnum>(SortEnum.MostInteractions);
  const [sortOptions, setSortOptions] = useState(LIST_PERFORMANCE_SORT);

  useEffect(() => {
    getPerformanceOverview();
  }, [getPerformanceOverview]);

  const sortedData = useMemo(() => {
    let data = [...performances];

    // Filter
    if (filter !== StatusEnum.ALL) {
      data = data.filter((item) => item.type === filter);
    }

    // Sort
    switch (sort) {
      case SortEnum.MostInteractions:
        data.sort((a, b) => b.count - a.count);
        break;
      case SortEnum.MostFee:
        data = [
          ...data.filter((f) => f.type === StatusEnum.SALE).sort((a, b) => b.sum - a.sum),
          ...data.filter((f) => f.type !== StatusEnum.SALE),
        ];
        break;
      case SortEnum.MostESign:
        data = [
          ...data.filter((f) => f.type === StatusEnum.RECRUIT).sort((a, b) => b.sum - a.sum),
          ...data.filter((f) => f.type !== StatusEnum.RECRUIT),
        ];
        break;
      case SortEnum.FromAToZ:
        data.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case SortEnum.FromZToA:
        data.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return data;
  }, [performances, filter, sort]);

  const handleFilter = (value: string) => {
    const f = value as StatusEnum;
    setFilter(f);

    let newSortOptions = LIST_PERFORMANCE_SORT;
    if (f === StatusEnum.RECRUIT) {
      newSortOptions = newSortOptions.filter((s) => s.id !== SortEnum.MostFee);
    } else if (f === StatusEnum.SALE) {
      newSortOptions = newSortOptions.filter((s) => s.id !== SortEnum.MostESign);
    }
    setSortOptions(newSortOptions);
    setSort(newSortOptions[0].id);
  };

  if (isLoading && performances.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (performances.length === 0 && !isLoading) {
    return <NoData message={I18n.noData} />;
  }

  return (
    <div className="space-y-6">
      {/* Filter & Sort */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Dropdown
            options={LIST_FILTER.map((f) => ({ ...f, isSelected: f.id === filter }))}
            onSelect={(opt) => handleFilter(opt.id)}
            label={I18n.all}
          />
        </div>
        <div className="flex-1">
          <Dropdown
            options={sortOptions.map((s) => ({ ...s, isSelected: s.id === sort }))}
            onSelect={(opt) => setSort(opt.id as SortEnum)}
            label={I18n.default}
          />
        </div>
      </div>

      {/* Performance list */}
      <div className="space-y-3">
        {sortedData.map((item) => (
          <PerformanceCard
            key={item.id}
            item={item}
            onClick={() => router.push(`/agent/marketing-kit/performance/${item.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

function PerformanceCard({ item, onClick }: { item: PerformanceModel; onClick: () => void }) {
  const isSale = item.type === TypeEnum.SALE || item.type === StatusEnum.SALE;

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between text-left hover:shadow-md transition-shadow"
    >
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
        <p className={`text-xs font-semibold ${isSale ? 'text-[#FA875B]' : 'text-blue-600'}`}>
          {isSale ? I18n.marketingDashboard.boostSales : I18n.marketingDashboard.teamDevelopment}
        </p>
        <div className="flex gap-4 text-xs text-gray-500">
          <span>{I18n.marketingDashboard.clicked}: <strong className="text-gray-900">{item.count}</strong></span>
          <span>
            {isSale ? I18n.marketingDashboard.insurancePremium : I18n.marketingDashboard.esignCompleted}:{' '}
            <strong className="text-gray-900">{item.sum}</strong>
          </span>
        </div>
      </div>
      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
