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
      <div className="space-y-6 pb-10">
        <Skeleton className="h-12 w-full bg-white/5 rounded-xl" />
        <div className="flex flex-col lg:flex-row gap-6">
          <Skeleton className="w-full lg:w-[60%] aspect-video bg-white/5 rounded-2xl" />
          <div className="w-full lg:w-[40%] space-y-4">
            <Skeleton className="h-32 bg-white/5 rounded-2xl" />
            <Skeleton className="h-40 bg-white/5 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!alias) {
    return <NoData message={I18n.noData} />;
  }

  return (
    <div className="pb-10 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-slate-300 hover:text-white transition-colors group w-fit"
        >
          <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <h2 className="text-lg md:text-xl font-bold text-white line-clamp-1">{alias.name}</h2>
        </button>
      </div>

      {/* Main Content: Split Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1">
        {/* Left: Image Preview */}
        <div className="w-full lg:w-[60%] flex flex-col">
          <div className="w-full bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden p-2 md:p-4 flex items-center justify-center relative group">
            {alias.imageLink ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${CDN_URL}${alias.imageLink}`}
                alt={alias.name || 'Alias'}
                className="w-full h-auto object-contain rounded-xl"
              />
            ) : (
              <div className="w-full aspect-video bg-slate-900/50 rounded-xl flex items-center justify-center">
                <svg className="w-16 h-16 text-slate-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* Expired overlay */}
            {expired && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <div className="bg-rose-500/20 border border-rose-500/50 text-rose-400 px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-3 backdrop-blur-md shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {I18n.marketingDashboard.expired}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Info & Actions */}
        <div className="w-full lg:w-[40%] flex flex-col gap-6">
          {/* Info Card */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col gap-4">
            <div className="flex justify-between items-start gap-4">
              <span className="text-slate-400 text-sm font-medium whitespace-nowrap">{I18n.marketingDashboard.aliasName}</span>
              <span className="text-white font-semibold text-right leading-tight">{alias.name}</span>
            </div>
            <div className="h-px w-full bg-white/5" />
            {alias.created && (
              <>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-slate-400 text-sm font-medium">{I18n.portal.posterValidFrom}</span>
                  <span className="text-white font-medium">{new Date(alias.created).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="h-px w-full bg-white/5" />
              </>
            )}
            {alias.validTo && (
              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-400 text-sm font-medium">{I18n.portal.posterValidTo}</span>
                <span className={`font-medium ${expired ? 'text-rose-400' : 'text-white'}`}>
                  {new Date(alias.validTo).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons Grid */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
            <button
              onClick={handleFavorite}
              className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all hover:scale-[1.02] active:scale-95 ${
                isFav
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-white/5 border-transparent text-slate-300 hover:bg-white/10'
              }`}
            >
              <svg
                className={`w-5.5 h-5.5 ${isFav ? 'fill-rose-400' : ''}`}
                fill={isFav ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs font-semibold">{I18n.marketingDashboard.favorite}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={expired}
              className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-transparent transition-all hover:scale-[1.02] active:scale-95 ${
                expired
                  ? 'bg-white/5 opacity-50 cursor-not-allowed text-slate-500'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="text-xs font-semibold">{I18n.marketingDashboard.download}</span>
            </button>

            <button
              onClick={handleCopyLink}
              disabled={expired}
              className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-transparent transition-all hover:scale-[1.02] active:scale-95 ${
                expired
                  ? 'bg-white/5 opacity-50 cursor-not-allowed text-slate-500'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-xs font-semibold text-center leading-tight">{I18n.marketingDashboard.copyLink}</span>
            </button>

            <button
              onClick={handleShare}
              disabled={expired}
              className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-transparent transition-all hover:scale-[1.02] active:scale-95 ${
                expired
                  ? 'bg-white/5 opacity-50 cursor-not-allowed text-slate-500'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="text-xs font-semibold">{I18n.marketingDashboard.share}</span>
            </button>
          </div>

          {/* View Performance Button */}
          <div className="mt-auto pt-2">
            <button
              onClick={() => router.push(`/agent/marketing-kit/performance/${alias.id}`)}
              className="w-full py-4 bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 rounded-xl text-white font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {I18n.marketingDashboard.imagePerformance}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
