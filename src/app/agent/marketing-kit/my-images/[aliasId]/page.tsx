'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { I18n } from '@/i18n';
import { CDN_URL } from '@/lib/api.config';
import { LabelEnum } from '@/types/enums';
import type { AliasData } from '@/types';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { generateMktLink, isExpiredDate } from '@/lib/marketing-dashboard.utils';
import Skeleton from '@/components/ui/Skeleton';
import NoData from '@/components/ui/NoData';

export default function MyImageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const aliasId = Number(params.aliasId);

  const { getAliasDetail, updateAlias } = useMarketingDashboard();
  const [alias, setAlias] = useState<AliasData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await getAliasDetail(aliasId);
    setAlias(res?.data ?? null);
    setLoading(false);
  }, [aliasId, getAliasDetail]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const expired = alias?.validTo ? isExpiredDate(alias.validTo) : false;
  const isFav = alias?.labels?.some((l) => l.type === LabelEnum.FAVORITE);

  const handleFavorite = async () => {
    if (!alias) return;
    const hasFav = alias.labels?.some((l) => l.type === LabelEnum.FAVORITE);
    const newLabels = hasFav
      ? (alias.labels || []).filter((l) => l.type !== LabelEnum.FAVORITE)
      : [...(alias.labels || []), { type: LabelEnum.FAVORITE, value: '' }];

    setAlias({ ...alias, labels: newLabels });
    const res = await updateAlias(alias.id, { ...alias, labels: newLabels });
    if (res?.data) {
      setAlias(res.data);
    }
  };

  const handleCopyLink = async () => {
    if (!alias) return;
    const link = generateMktLink(alias);
    await navigator.clipboard.writeText(link);
    alert(I18n.marketingDashboard.linkCopied);
  };

  const handleShare = async () => {
    if (!alias) return;
    const link = generateMktLink(alias);
    if (navigator.share) {
      await navigator.share({ title: alias.name, url: link });
    } else {
      await navigator.clipboard.writeText(link);
      alert(I18n.marketingDashboard.linkCopied);
    }
  };

  const handleDownload = () => {
    if (!alias?.imageLink) return;
    const url = `${CDN_URL}${alias.imageLink}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${alias.name || 'poster'}.jpg`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="aspect-[4/3] rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
    );
  }

  if (!alias) {
    return <NoData message={I18n.noData} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-semibold text-gray-900 truncate">{alias.name}</h2>
        {expired && (
          <span className="text-xs bg-gray-800 text-white px-2 py-0.5 rounded">
            {I18n.marketingDashboard.expired}
          </span>
        )}
      </div>

      {/* Image */}
      <div className={`relative bg-gray-50 rounded-lg overflow-hidden ${expired ? 'opacity-50 grayscale' : ''}`}>
        {alias.imageLink && (
          <img
            src={`${CDN_URL}${alias.imageLink}`}
            alt={alias.name || 'Alias'}
            className="w-full object-contain"
          />
        )}
      </div>

      {/* Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">{I18n.marketingDashboard.aliasName}</span>
          <span className="text-gray-900 font-medium">{alias.name}</span>
        </div>
        {alias.created && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{I18n.portal.posterValidFrom}</span>
            <span className="text-gray-900">{new Date(alias.created).toLocaleDateString('vi-VN')}</span>
          </div>
        )}
        {alias.validTo && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{I18n.portal.posterValidTo}</span>
            <span className={`${expired ? 'text-red-500' : 'text-gray-900'}`}>
              {new Date(alias.validTo).toLocaleDateString('vi-VN')}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleFavorite}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg
            className={`w-5 h-5 ${isFav ? 'text-red-500 fill-current' : 'text-gray-400'}`}
            fill={isFav ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-sm text-gray-700">{I18n.marketingDashboard.favorite}</span>
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="text-sm text-gray-700">{I18n.marketingDashboard.download}</span>
        </button>
        <button
          onClick={handleCopyLink}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          <span className="text-sm text-gray-700">{I18n.marketingDashboard.copyLink}</span>
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="text-sm text-gray-700">{I18n.marketingDashboard.share}</span>
        </button>
      </div>
    </div>
  );
}
