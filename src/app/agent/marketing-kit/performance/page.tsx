'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { I18n } from '@/i18n';
import { SortEnum, StatusEnum, TypeEnum } from '@/types/enums';
import type { PerformanceModel } from '@/types';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { LIST_FILTER, LIST_PERFORMANCE_SORT } from '@/lib/constants';
import { numberWithCommasDot } from '@/lib/marketing-dashboard.utils';
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

    // Filter
    if (filter !== StatusEnum.ALL) {
      data = data.filter((item) => item.type === filter);
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
      <div className="space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row gap-4 lg:gap-8">
          <Skeleton className="h-16 flex-1 bg-white/5 rounded-xl" />
          <Skeleton className="h-16 flex-1 bg-white/5 rounded-xl" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 bg-white/5 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (performances.length === 0 && !isLoading) {
    return <NoData message={I18n.noData} />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 lg:gap-8">
        <div className="flex-1 flex flex-col gap-2">
          <Dropdown
            options={LIST_FILTER.map((f) => ({ ...f, isSelected: f.id === filter }))}
            onSelect={(opt) => handleFilter(opt.id)}
            label={I18n.filterBy}
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <Dropdown
            options={sortOptions.map((s) => ({ ...s, isSelected: s.id === sort }))}
            onSelect={(opt) => setSort(opt.id as SortEnum)}
            label={I18n.arrangeBy}
          />
        </div>
      </div>

      {/* Section title */}
      <h3 className="text-lg font-bold text-[var(--text-primary)] pl-1">
        {I18n.marketingDashboard.tutorialTitle2}
      </h3>

      {/* Performance item list */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3">
        {sortedData.map((item, index) => (
          <PerformanceCard
            key={item.id ?? index}
            item={item}
            onClick={() => router.push(`/agent/marketing-kit/performance/${item.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Performance Item Card ── */
function PerformanceCard({ item, onClick }: { item: PerformanceModel; onClick: () => void }) {
  const isSale = item.type === TypeEnum.SALE || item.type === StatusEnum.SALE;

  return (
    <button
      onClick={onClick}
      className="w-full bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[var(--surface-hover)] hover:border-orange-500/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all cursor-pointer group text-left theme-transition"
    >
      {/* Left: Name & Type */}
      <div className="w-full md:w-1/3 pr-4">
        <h4 className="text-[var(--text-primary)] font-bold text-base mb-1 group-hover:text-orange-200 transition-colors line-clamp-1">
          {item.name}
        </h4>
        <p className={`text-xs font-semibold ${isSale ? 'text-orange-500' : 'text-blue-400'}`}>
          {isSale
            ? I18n.marketingDashboard.boostSales
            : I18n.marketingDashboard.teamDevelopment}
        </p>
      </div>

      {/* Right: Stats & Arrow */}
      <div className="w-full md:w-2/3 flex flex-row items-center border-t md:border-t-0 md:border-l border-[var(--border)] pt-4 md:pt-0 md:pl-8 relative">
        {/* Stat 1: Interactions */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <span className="text-orange-500 font-bold text-xl">
            {numberWithCommasDot(item.count)}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1">
            {I18n.marketingDashboard.interactions}
          </span>
        </div>

        {/* Vertical divider */}
        <div className="w-px h-12 bg-[var(--border)] mx-2 sm:mx-6" />

        {/* Stat 2: Revenue or E-sign */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <span className="text-orange-500 font-bold text-xl">
            {numberWithCommasDot(item.sum)}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1">
            {isSale
              ? I18n.marketingDashboard.insuranceFee
              : I18n.marketingDashboard.eSignCompletions}
          </span>
        </div>

        {/* Arrow button */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 md:relative md:top-auto md:translate-y-0 md:ml-6 shrink-0 bg-[var(--surface)] md:bg-transparent rounded-full shadow-lg md:shadow-none">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_4px_15px_rgba(249,115,22,0.4)]">
            <svg className="w-5 h-5 text-white ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}
