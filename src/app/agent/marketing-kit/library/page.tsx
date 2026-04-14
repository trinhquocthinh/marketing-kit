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

  const topUsed = useMemo(() => listTopUsed(folders), [folders]);

  const featuredEvents = useMemo(
    () =>
      sortedAndFiltered.filter(
        (item) =>
          item.labels?.some((l) => l.type === LabelEnum.FEATURED) && item.templates.length > 0,
      ),
    [sortedAndFiltered],
  );

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

  if (isLoading && folders.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (folders.length === 0 && !isLoading) {
    return <NoData message={I18n.noData} />;
  }

  return (
    <>
      <div className="space-y-0">
        {/* Top Used Carousel */}
        {topUsed.length > 0 && (
          <>
            <ImageSlider mostUsedImages={topUsed} onSelect={handleNavigatePoster} />
            <div className="h-2 bg-gray-200" />
          </>
        )}

        {/* Folders Section */}
        <div className="px-0 pt-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              {I18n.marketingDashboard.publicFolders}
            </h3>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-[#FA875B] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {I18n.search}
            </button>
          </div>

          {/* Filter & Sort */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Dropdown
                options={LIST_FILTER.map((f) => ({
                  ...f,
                  isSelected: f.id === filter,
                }))}
                onSelect={(opt) => handleFilter(opt.id)}
                label={I18n.all}
              />
            </div>
            <div className="flex-1">
              <Dropdown
                options={LIST_SORT.map((s) => ({
                  ...s,
                  isSelected: s.id === sort,
                }))}
                onSelect={(opt) => handleSort(opt.id)}
                label={I18n.default}
              />
            </div>
          </div>

          {/* Featured Events */}
          {featuredEvents.length > 0 && (
            <FeaturedEvents data={featuredEvents} onPress={handleNavigateFolder} />
          )}

          {/* Public Folders */}
          <PublicFolders data={generalFolders} onPress={handleNavigateFolder} />
        </div>
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
