'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { ArrowLeft, LayoutGrid, List } from 'lucide-react';

import SearchResultCard from '@/components/library/SearchResultCard';
import TemplateListItem from '@/components/library/TemplateListItem';
import NoData from '@/components/ui/NoData';
import Skeleton from '@/components/ui/Skeleton';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { I18n } from '@/i18n';
import type { GroupTemplateModel } from '@/types';

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
        <Skeleton className="h-14 w-full" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="glass-bento flex min-h-[60vh] items-center justify-center">
        <NoData message={I18n.noData} />
      </div>
    );
  }

  return (
    <div className="animate-bento-fade-up space-y-6 pb-10">
      {/* Header */}
      <div className="glass-bento sticky top-4 z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <button
          onClick={() => router.back()}
          className="group flex w-fit items-center gap-3 text-left"
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full text-white shadow-[var(--shadow-glow-primary)] transition-transform group-hover:-translate-x-1"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)' }}
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <div>
            <p className="bento-eyebrow mb-0.5">Thư mục</p>
            <h2 className="line-clamp-1 text-xl font-black tracking-wide text-[var(--text-strong)] md:text-2xl">
              {folder.name}
            </h2>
          </div>
        </button>

        {/* Grid / List view toggle */}
        <div className="flex self-end rounded-full bg-[var(--surface-glass-alt)] p-1 md:self-auto">
          {(
            [
              { mode: 'grid' as const, Icon: LayoutGrid, label: 'Lưới' },
              { mode: 'list' as const, Icon: List, label: 'Danh sách' },
            ]
          ).map(({ mode, Icon, label }) => {
            const active = viewMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black tracking-widest uppercase transition-all ${
                  active
                    ? 'text-white shadow-[var(--shadow-glow-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-strong)]'
                }`}
                style={
                  active
                    ? {
                        background:
                          'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                      }
                    : undefined
                }
              >
                <Icon className="h-4 w-4" strokeWidth={2.5} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates */}
      {folder.templates.length === 0 ? (
        <div className="glass-bento flex min-h-[40vh] items-center justify-center">
          <NoData message={I18n.noData} />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {folder.templates.map((template) => (
            <SearchResultCard
              key={template.id}
              item={template}
              onClick={() => handleSelectTemplate(template)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4 md:gap-6">
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
