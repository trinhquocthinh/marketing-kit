'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { I18n } from '@/i18n';
import { LabelEnum, SortEnum, StatusEnum } from '@/types/enums';
import type { FolderModel, GroupTemplateModel } from '@/types';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { listTopUsed } from '@/lib/marketing-dashboard.utils';
import { LIST_FILTER, LIST_SORT } from '@/lib/constants';
import Dropdown from '@/components/ui/Dropdown';
import Skeleton from '@/components/ui/Skeleton';
import NoData from '@/components/ui/NoData';
import ImageSlider from '@/components/library/ImageSlider';
import FeaturedEvents from '@/components/library/FeaturedEvents';
import PublicFolders from '@/components/library/PublicFolders';
import SearchModal from '@/components/library/SearchModal';

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
      <div className="min-h-screen p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ──
  if (folders.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <NoData message={I18n.marketingDashboard.libraryEmpty} />
      </div>
    );
  }

  return (
    <>
      {/* Main container */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Marquee effect for Marketing Kit label (from BRD rule 3.2.1) */}

        <div className="mb-8 relative bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] rounded-2xl h-12 flex items-center soft-shadow overflow-hidden theme-transition">
          <div className="absolute left-0 top-0 bottom-0 w-36 bg-linear-to-r from-[var(--background)]/95 via-[var(--background)]/80 to-transparent z-10 flex items-center pl-3">
            <span className="bg-linear-to-r from-orange-500 to-rose-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)] whitespace-nowrap flex items-center gap-1.5">
              <span className="animate-pulse">🔥</span> THÔNG BÁO
            </span>
          </div>
          <div className="flex-1 overflow-hidden ml-32 relative h-full flex items-center">
            <div className="absolute whitespace-nowrap animate-marquee flex items-center">
              <p className="text-sm text-[var(--text-secondary)] font-medium tracking-wide">
                {I18n.marketingDashboard.marquee}
              </p>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-[var(--background)]/90 to-transparent z-10 pointer-events-none"></div>
        </div>

        {/* Top Used Image Carousel – "Dùng nhiều nhất" */}
        {topUsed.length > 0 && (
          <section>
            <ImageSlider mostUsedImages={topUsed} onSelect={handleNavigatePoster} />
          </section>
        )}

        {/* Filter & Sort + Search */}
        <section className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[var(--surface)] backdrop-blur-sm p-4 rounded-2xl border border-[var(--border)] overflow-visible theme-transition">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {I18n.marketingDashboard.folderTitle}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto items-end">
            <div className="w-full md:w-50">
              <Dropdown
                options={LIST_FILTER.map((f) => ({
                  ...f,
                  isSelected: f.id === filter,
                }))}
                onSelect={(opt) => handleFilter(opt.id)}
                label={I18n.filterBy}
              />
            </div>
            <div className="w-full md:w-40">
              <Dropdown
                options={LIST_SORT.map((s) => ({
                  ...s,
                  isSelected: s.id === sort,
                }))}
                onSelect={(opt) => handleSort(opt.id)}
                label={I18n.arrangeBy}
              />
            </div>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center justify-center p-1.5 px-4 bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {I18n.search}
            </button>
          </div>
        </section>

        {/* Featured Events – "Sự kiện nổi bật" */}
        {featuredEvents.length > 0 && (
          <section>
            <FeaturedEvents data={featuredEvents} onPress={handleNavigateFolder} />
          </section>
        )}

        {/* Public Folders – "Thư mục chung" */}
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

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl p-6 flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-[var(--text-secondary)]">{I18n.loading}</span>
          </div>
        </div>
      )}
    </>
  );
}
