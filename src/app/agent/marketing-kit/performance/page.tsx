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
      <div className="space-y-4 p-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  if (performances.length === 0 && !isLoading) {
    return <NoData message={I18n.noData} />;
  }

  return (
    <div className="min-h-full">
      {/* Filter & Sort */}
      <div className="flex gap-3 px-4 py-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 mb-4">
        <div className="w-[48%]">
          <Dropdown
            options={LIST_FILTER.map((f) => ({ ...f, isSelected: f.id === filter }))}
            onSelect={(opt) => handleFilter(opt.id)}
            label={I18n.filterBy}
          />
        </div>
        <div className="w-[48%]">
          <Dropdown
            options={sortOptions.map((s) => ({ ...s, isSelected: s.id === sort }))}
            onSelect={(opt) => setSort(opt.id as SortEnum)}
            label={I18n.arrangeBy}
          />
        </div>
      </div>

      {/* Section title */}
      <p className="px-5 pt-5 pb-2 text-sm font-semibold text-white font-[Montserrat,sans-serif]">
        {I18n.marketingDashboard.tutorialTitle2}
      </p>

      {/* Performance item list */}
      <div className="flex flex-col gap-3 px-4 pb-6">
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

/* ── Performance Item Card – matches RN sectionTop + sectionBottom ── */
function PerformanceCard({ item, onClick }: { item: PerformanceModel; onClick: () => void }) {
  const isSale = item.type === TypeEnum.SALE || item.type === StatusEnum.SALE;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 overflow-hidden text-left hover:bg-white/15 transition-all group"
    >
      {/* Section top: name + type + arrow */}
      <div className="flex items-center justify-between px-5 pt-3 pb-4">
        <div className="flex-[0.7] min-w-0">
          <p className="text-sm font-semibold text-white font-[Montserrat,sans-serif] line-clamp-2">
            {item.name}
          </p>
          <p
            className="text-xs font-semibold font-[Montserrat,sans-serif] mt-1"
            style={{ color: isSale ? '#ED5E28' : '#295ACB' }}
          >
            {isSale
              ? I18n.marketingDashboard.boostSales
              : I18n.marketingDashboard.teamDevelopment}
          </p>
        </div>
        {/* Orange circle arrow icon */}
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Section bottom: two stat blocks */}
      <div className="flex items-center bg-white/5 border-t border-white/10 rounded-b-2xl py-2 pb-3.5">
        <div className="flex-1 flex flex-col items-center gap-0.5 px-4">
          <span className="text-base font-semibold text-orange-400 font-[Montserrat,sans-serif]">
            {numberWithCommasDot(item.count)}
          </span>
          <span className="text-xs font-semibold text-slate-500 font-[Montserrat,sans-serif]">
            {I18n.marketingDashboard.interactions}
          </span>
        </div>
        {/* Vertical divider */}
        <div className="w-px self-stretch bg-white/10" />
        <div className="flex-1 flex flex-col items-center gap-0.5 px-4">
          <span className="text-base font-semibold text-orange-400 font-[Montserrat,sans-serif]">
            {numberWithCommasDot(item.sum)}
          </span>
          <span className="text-xs font-semibold text-slate-500 font-[Montserrat,sans-serif]">
            {isSale
              ? I18n.marketingDashboard.insuranceFee
              : I18n.marketingDashboard.eSignCompletions}
          </span>
        </div>
      </div>
    </button>
  );
}
