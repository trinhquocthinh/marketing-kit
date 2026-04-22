'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { I18n } from '@/i18n';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import type { GroupTemplateModel } from '@/types';
import SearchResultCard from '@/components/library/SearchResultCard';
import TemplateListItem from '@/components/library/TemplateListItem';
import Skeleton from '@/components/ui/Skeleton';
import NoData from '@/components/ui/NoData';

export default function FolderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = Number(params.posterId);
  const { folders, isLoading } = useMarketingDashboard();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const folder = folders.find((f) => f.id === folderId);

  const handleSelectTemplate = (item: GroupTemplateModel) => {
    router.push(`/agent/marketing-kit/library/${folderId}/poster/${item.id}`);
  };

  if (isLoading && !folder) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!folder) {
    return <NoData message={I18n.noData} />;
  }

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 sticky top-0 z-10 bg-[var(--sidebar-bg)] backdrop-blur-xl p-4 md:p-6 -mx-4 md:-mx-8 border-b border-[var(--border)] shadow-sm theme-transition">
        <button
          onClick={() => router.back()}
          className="flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group w-fit"
        >
          <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <h2 className="font-display text-lg md:text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-orange-400 to-rose-500 line-clamp-1 tracking-tight">
            {folder.name}
          </h2>
        </button>

        {/* Grid / Card View Toggle */}
        <div className="flex glass-card p-1 rounded-xl self-end md:self-auto theme-transition">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 md:px-4 md:py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${viewMode === 'grid'
                ? 'bg-linear-to-r from-orange-400 to-rose-500 text-white shadow-[var(--glow-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">Lưới</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 md:px-4 md:py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${viewMode === 'list'
                ? 'bg-linear-to-r from-orange-400 to-rose-500 text-white shadow-[var(--glow-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">Danh sách</span>
          </button>
        </div>
      </div>

      {/* Templates */}
      {folder.templates.length === 0 ? (
        <NoData message={I18n.noData} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-2 md:px-0">
          {folder.templates.map((template) => (
            <SearchResultCard
              key={template.id}
              item={template}
              onClick={() => handleSelectTemplate(template)}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="flex flex-col gap-4 md:gap-6 px-2 md:px-0">
          {folder.templates.map((template) => (
            <TemplateListItem
              key={template.id}
              item={template}
              onClick={() => handleSelectTemplate(template)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
