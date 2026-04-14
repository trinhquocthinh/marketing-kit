'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { I18n } from '@/i18n';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import type { GroupTemplateModel } from '@/types';
import TemplateCard from '@/components/library/TemplateCard';
import Skeleton from '@/components/ui/Skeleton';
import NoData from '@/components/ui/NoData';
import { CDN_URL } from '@/lib/api.config';

export default function FolderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = Number(params.posterId);
  const { folders, isLoading } = useMarketingDashboard();

  const [isGrid, setIsGrid] = useState(true);

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
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!folder) {
    return <NoData message={I18n.noData} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-base font-semibold text-gray-900">{folder.name}</h2>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setIsGrid(true)}
            className={`p-1.5 rounded-md transition-colors ${isGrid ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setIsGrid(false)}
            className={`p-1.5 rounded-md transition-colors ${!isGrid ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Templates */}
      {folder.templates.length === 0 ? (
        <NoData message={I18n.noData} />
      ) : isGrid ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {folder.templates.map((template) => (
            <TemplateCard
              key={template.id}
              item={template}
              onClick={() => handleSelectTemplate(template)}
            />
          ))}
        </div>
      ) : (
        /* List/Carousel view */
        <div className="space-y-3">
          {folder.templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className="w-full flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200 hover:border-[#FA875B] transition-colors text-left"
            >
              <div className="relative w-20 h-20 flex-shrink-0 border border-gray-100 rounded overflow-hidden">
                <img
                  src={`${CDN_URL}${template.imageLink}`}
                  alt={template.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{template.name}</p>
                {template.validTo && (
                  <p className="text-xs text-gray-400 mt-1">
                    HSD: {new Date(template.validTo).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>
              <svg className="w-5 h-5 text-[#FA875B] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
