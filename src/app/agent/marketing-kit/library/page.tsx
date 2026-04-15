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
    router.push(`/agent/marketing-kit/library/${item.id}`);
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
      <div className="min-h-screen">
        {/* Top Used Image Carousel */}
        {topUsed.length > 0 && (
          <>
            <ImageSlider mostUsedImages={topUsed} onSelect={handleNavigatePoster} />
            {/* Divider line */}
            <div className="w-full h-px bg-white/10" />
          </>
        )}

        {/* Folders section – matches RN FoldersComponent: mt-23, px-15, pb-20 */}
        <div className="mt-[23px] px-[15px] pb-5 space-y-0">
          {/* Header row: title + search button */}
          <div className="flex items-center justify-between mb-[23px]">
            <h3 className="text-base font-semibold text-white font-[Montserrat,sans-serif]">
              {I18n.marketingDashboard.folderTitle}
            </h3>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-[11px] font-semibold text-white font-[Montserrat,sans-serif]">
                {I18n.search}
              </span>
            </button>
          </div>

          {/* Filter & Sort – 2 columns, 48% each (matches RN sortContainer) */}
          <div className="flex justify-between mb-6 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <div className="w-[48%]">
              <Dropdown
                options={LIST_FILTER.map((f) => ({
                  ...f,
                  isSelected: f.id === filter,
                }))}
                onSelect={(opt) => handleFilter(opt.id)}
                label={I18n.filterBy}
              />
            </div>
            <div className="w-[48%]">
              <Dropdown
                options={LIST_SORT.map((s) => ({
                  ...s,
                  isSelected: s.id === sort,
                }))}
                onSelect={(opt) => handleSort(opt.id)}
                label={I18n.arrangeBy}
              />
            </div>
          </div>

          {/* Featured Events section – mt-24 matches RN */}
          {featuredEvents.length > 0 && (
            <div className="mt-6">
              <FeaturedEvents data={featuredEvents} onPress={handleNavigateFolder} />
            </div>
          )}

          {/* Public Folders grid – mt-16 matches RN */}
          <div className="mt-4">
            <PublicFolders data={generalFolders} onPress={handleNavigateFolder} />
          </div>
        </div>
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-slate-300">{I18n.loading}</span>
          </div>
        </div>
      )}
    </>
  );
}
