'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Flame, Search } from 'lucide-react';

import FeaturedEvents from '@/components/library/FeaturedEvents';
import ImageSlider from '@/components/library/ImageSlider';
import PublicFolders from '@/components/library/PublicFolders';
import SearchModal from '@/components/library/SearchModal';
import BentoSectionHeading from '@/components/ui/BentoSectionHeading';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import NoData from '@/components/ui/NoData';
import Skeleton from '@/components/ui/Skeleton';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { I18n } from '@/i18n';
import { LIST_FILTER, LIST_SORT } from '@/lib/constants';
import { listTopUsed } from '@/lib/marketing-dashboard.utils';
import type { FolderModel, GroupTemplateModel } from '@/types';
import { LabelEnum, SortEnum, StatusEnum } from '@/types/enums';

export default function LibraryPage() {
  const router = useRouter();
  const { isLoading, folders, getFolders } = useMarketingDashboard();

  const [filter, setFilter] = useState<StatusEnum>(LIST_FILTER[0].id);
  const [sort, setSort] = useState<SortEnum>(LIST_SORT[0].id);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    getFolders();
  }, [getFolders]);

  // ── Sort + Filter logic (matches RN handleSortAndFilter) ──
  const sortedAndFiltered = useMemo(() => {
    let result = [...folders];

    if (sort === SortEnum.Newest) {
      result.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    } else if (sort === SortEnum.Oldest) {
      result.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());
    }

    if (filter !== StatusEnum.ALL) {
      result = result.filter((item) => item.type === filter);
    }

    return result;
  }, [folders, sort, filter]);

  // ── Top used posters (matches RN listTopUsed) ──
  const topUsed = useMemo(() => listTopUsed(folders), [folders]);

  // ── Featured events – folders with FEATURED label + templates ──
  const featuredEvents = useMemo(
    () =>
      sortedAndFiltered.filter(
        (item) =>
          item.labels?.some((l) => l.type === LabelEnum.FEATURED) && item.templates.length > 0,
      ),
    [sortedAndFiltered],
  );

  // ── General folders – non-FEATURED, with templates ──
  const generalFolders = useMemo(
    () =>
      sortedAndFiltered.filter(
        (item) =>
          (item.labels === null || item.labels?.every((l) => l.type !== LabelEnum.FEATURED)) &&
          item.templates.length > 0,
      ),
    [sortedAndFiltered],
  );

  const handleNavigateFolder = (item: FolderModel) => {
    router.push(`/agent/marketing-kit/library/${item.id}`);
  };

  const handleNavigatePoster = (item: GroupTemplateModel) => {
    const parentFolder = folders.find((f) => f.templates.some((t) => t.id === item.id));
    if (parentFolder) {
      router.push(`/agent/marketing-kit/library/${parentFolder.id}/poster/${item.id}`);
    }
  };

  const handleFilter = (value: string) => {
    setFilter(value as StatusEnum);
  };

  const handleSort = (value: string) => {
    setSort(value as SortEnum);
  };

  // ── Loading skeleton ──
  if (isLoading && folders.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ──
  if (folders.length === 0 && !isLoading) {
    return (
      <div className="glass-bento flex min-h-[60vh] items-center justify-center">
        <NoData message={I18n.marketingDashboard.libraryEmpty} />
      </div>
    );
  }

  return (
    <>
      <div className="animate-bento-fade-up space-y-8">
        {/* Marquee announcement strip */}
        <div className="glass-bento relative flex h-14 items-center overflow-hidden !p-0">
          <div className="absolute top-0 bottom-0 left-0 z-10 flex items-center pl-3">
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black tracking-widest whitespace-nowrap text-white uppercase shadow-[var(--shadow-glow-primary)]"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
              }}
            >
              <Flame className="h-3 w-3 animate-pulse" strokeWidth={2.5} />
              Thông báo
            </span>
          </div>
          <div className="relative ml-32 flex h-full flex-1 items-center overflow-hidden">
            <div className="animate-marquee absolute flex items-center whitespace-nowrap">
              <p className="text-sm font-bold tracking-wide text-t-secondary">
                {I18n.marketingDashboard.marquee}
              </p>
            </div>
          </div>
        </div>

        {/* Top Used Image Carousel */}
        {topUsed.length > 0 && (
          <section>
            <ImageSlider mostUsedImages={topUsed} onSelect={handleNavigatePoster} />
          </section>
        )}

        {/* Filter & Sort + Search toolbar */}
        <section className="glass-bento flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-end">
          <BentoSectionHeading title={I18n.marketingDashboard.folderTitle} className="mb-0" />
          <div className="flex w-full flex-wrap items-end gap-3 md:w-auto">
            <div className="w-full md:w-52">
              <Dropdown
                options={LIST_FILTER.map((f) => ({
                  ...f,
                  isSelected: f.id === filter,
                }))}
                onSelect={(opt) => handleFilter(opt.id)}
                label={I18n.filterBy}
              />
            </div>
            <div className="w-full md:w-44">
              <Dropdown
                options={LIST_SORT.map((s) => ({
                  ...s,
                  isSelected: s.id === sort,
                }))}
                onSelect={(opt) => handleSort(opt.id)}
                label={I18n.arrangeBy}
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsSearchOpen(true)}
              className="gap-2"
            >
              <Search className="h-4 w-4" strokeWidth={2.5} />
              {I18n.search}
            </Button>
          </div>
        </section>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <section>
            <FeaturedEvents data={featuredEvents} onPress={handleNavigateFolder} />
          </section>
        )}

        {/* Public Folders */}
        <section>
          <PublicFolders data={generalFolders} onPress={handleNavigateFolder} />
        </section>
      </div>

      {/* Search Modal */}
      <SearchModal
        folders={folders}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleNavigatePoster}
      />
    </>
  );
}
