'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ArrowRight } from 'lucide-react';

import BentoSectionHeading from '@/components/ui/BentoSectionHeading';
import Dropdown from '@/components/ui/Dropdown';
import NoData from '@/components/ui/NoData';
import Skeleton from '@/components/ui/Skeleton';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { I18n } from '@/i18n';
import { LIST_FILTER, LIST_PERFORMANCE_SORT } from '@/lib/constants';
import { numberWithCommasDot } from '@/lib/marketing-dashboard.utils';
import type { PerformanceModel } from '@/types';
import { SortEnum, StatusEnum, TypeEnum } from '@/types/enums';

const brandGradient = 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)';

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
        <div className="flex flex-col gap-4 sm:flex-row lg:gap-8">
          <Skeleton className="h-16 flex-1" />
          <Skeleton className="h-16 flex-1" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  if (performances.length === 0 && !isLoading) {
    return (
      <div className="glass-bento flex min-h-[60vh] items-center justify-center">
        <NoData message={I18n.noData} />
      </div>
    );
  }

  return (
    <div className="animate-bento-fade-up space-y-6 pb-8">
      {/* Filters */}
      <div className="glass-bento flex flex-col gap-4 sm:flex-row lg:gap-8">
        <div className="flex flex-1 flex-col gap-2">
          <Dropdown
            options={LIST_FILTER.map((f) => ({ ...f, isSelected: f.id === filter }))}
            onSelect={(opt) => handleFilter(opt.id)}
            label={I18n.filterBy}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Dropdown
            options={sortOptions.map((s) => ({ ...s, isSelected: s.id === sort }))}
            onSelect={(opt) => setSort(opt.id as SortEnum)}
            label={I18n.arrangeBy}
          />
        </div>
      </div>

      <BentoSectionHeading title={I18n.marketingDashboard.tutorialTitle2} variant="accent" />

      {/* Performance item list */}
      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
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
      className="glass-bento glass-bento-interactive glass-shine group flex w-full cursor-pointer flex-col justify-between gap-4 text-left md:flex-row md:items-center"
    >
      {/* Left: Name & Type */}
      <div className="w-full pr-4 md:w-1/3">
        <h4 className="mb-1 line-clamp-1 text-base font-black tracking-wide text-[var(--text-strong)] transition-colors group-hover:text-[var(--primary)]">
          {item.name}
        </h4>
        <p className="text-[10px] font-black tracking-widest text-[var(--primary)] uppercase">
          {isSale ? I18n.marketingDashboard.boostSales : I18n.marketingDashboard.teamDevelopment}
        </p>
      </div>

      {/* Right: Stats & Arrow */}
      <div className="relative flex w-full flex-row items-center border-t border-[var(--surface-glass-border)] pt-4 md:w-2/3 md:border-t-0 md:border-l md:pt-0 md:pl-8">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-[var(--primary)]">
            {numberWithCommasDot(item.count)}
          </span>
          <span className="mt-1 text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
            {I18n.marketingDashboard.interactions}
          </span>
        </div>

        <div className="mx-2 h-12 w-px bg-[var(--surface-glass-border)] sm:mx-6" />

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-[var(--accent)]">
            {numberWithCommasDot(item.sum)}
          </span>
          <span className="mt-1 text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
            {isSale
              ? I18n.marketingDashboard.insuranceFee
              : I18n.marketingDashboard.eSignCompletions}
          </span>
        </div>

        <div className="absolute top-1/2 right-0 shrink-0 -translate-y-1/2 md:relative md:top-auto md:ml-6 md:translate-y-0">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-white shadow-[var(--shadow-glow-primary)] transition-transform group-hover:translate-x-0.5 group-hover:scale-110"
            style={{ background: brandGradient }}
          >
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </button>
  );
}
