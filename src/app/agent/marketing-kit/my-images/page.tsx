'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { I18n } from '@/i18n';
import { CDN_URL } from '@/lib/api.config';
import { LabelEnum } from '@/types/enums';
import type { AliasData } from '@/types';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { generateMktLink, isExpiredDate } from '@/lib/marketing-dashboard.utils';
import Skeleton from '@/components/ui/Skeleton';
import NoData from '@/components/ui/NoData';

type FilterMode = 'all' | 'favorites';

export default function MyImagesPage() {
  const router = useRouter();
  const { getAlias, updateAlias, isLoading } = useMarketingDashboard();
  const [aliasList, setAliasList] = useState<AliasData[]>([]);
  const [filter, setFilter] = useState<FilterMode>('all');

  useEffect(() => {
    const loadData = async () => {
      const res = await getAlias();
      setAliasList(res?.data || []);
    };
    loadData();
  }, [getAlias]);

  const favorites = aliasList
    .filter((a) => a.labels?.some((l) => l.type === LabelEnum.FAVORITE))
    .sort((a, b) => new Date(b.priorityAt || b.created!).getTime() - new Date(a.priorityAt || a.created!).getTime());

  const allSorted = [...aliasList].sort(
    (a, b) => new Date(b.created!).getTime() - new Date(a.created!).getTime(),
  );

  const filteredAliases = filter === 'favorites' ? favorites : allSorted;

  const handleFavorite = async (alias: AliasData) => {
    const hasFav = alias.labels?.some((l) => l.type === LabelEnum.FAVORITE);
    const newLabels = hasFav
      ? (alias.labels || []).filter((l) => l.type !== LabelEnum.FAVORITE)
      : [...(alias.labels || []), { type: LabelEnum.FAVORITE, value: '' }];

    // Optimistic update
    setAliasList((prev) =>
      prev.map((a) => (a.id === alias.id ? { ...a, labels: newLabels } : a)),
    );

    const res = await updateAlias(alias.id, { ...alias, labels: newLabels });
    if (res?.data) {
      setAliasList((prev) =>
        prev.map((a) => (a.id === res.data!.id ? res.data! : a)),
      );
    }
  };

  const handleCopyLink = async (alias: AliasData) => {
    const link = generateMktLink(alias);
    await navigator.clipboard.writeText(link);
    alert(I18n.marketingDashboard.linkCopied);
  };

  const handleShare = async (alias: AliasData) => {
    const link = generateMktLink(alias);
    if (navigator.share) {
      await navigator.share({ title: alias.name, url: link });
    } else {
      await navigator.clipboard.writeText(link);
      alert(I18n.marketingDashboard.linkCopied);
    }
  };

  const handleDownload = (alias: AliasData) => {
    if (!alias.imageLink) return;
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

  if (isLoading && aliasList.length === 0) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <Skeleton className="h-8 w-64 bg-white/10 rounded-lg" />
        <Skeleton className="h-12 w-80 bg-white/5 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-0">
              <Skeleton className="aspect-4/5 rounded-t-2xl bg-white/5" />
              <Skeleton className="h-16 rounded-b-2xl bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (aliasList.length === 0 && !isLoading) {
    return <NoData message={I18n.noData} />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          {I18n.marketingDashboard.myPictures}
        </h2>
        <button
          onClick={() => router.push('/agent/marketing-kit/library')}
          className="px-5 py-2.5 bg-linear-to-r from-orange-500 to-rose-500 rounded-xl text-white font-semibold hover:opacity-90 shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-transform hover:-translate-y-0.5 w-full sm:w-auto text-sm"
        >
          + {I18n.marketingDashboard.createNew}
        </button>
      </div>

      {/* Filter Toggle */}
      <div className="flex bg-[var(--surface)] p-1.5 rounded-xl backdrop-blur-md border border-[var(--border)] w-fit shadow-inner theme-transition">
        <button
          onClick={() => setFilter('all')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
            filter === 'all'
              ? 'bg-[var(--surface-hover)] text-orange-400 border border-[var(--border)] shadow-md'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {I18n.marketingDashboard.myPictures} ({aliasList.length})
        </button>
        <button
          onClick={() => setFilter('favorites')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
            filter === 'favorites'
              ? 'bg-[var(--surface-hover)] text-rose-400 border border-[var(--border)] shadow-md'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <svg
            className={`w-4 h-4 ${filter === 'favorites' ? 'fill-rose-400 text-rose-400' : ''}`}
            fill={filter === 'favorites' ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {I18n.marketingDashboard.favorite} ({favorites.length})
        </button>
      </div>

      {/* Grid */}
      {filteredAliases.length === 0 ? (
        <NoData message={filter === 'favorites' ? 'Chưa có ảnh yêu thích' : I18n.noData} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAliases.map((alias) => (
            <AliasCard
              key={alias.id}
              alias={alias}
              onFavorite={() => handleFavorite(alias)}
              onCopyLink={() => handleCopyLink(alias)}
              onShare={() => handleShare(alias)}
              onDownload={() => handleDownload(alias)}
              onClick={() => router.push(`/agent/marketing-kit/my-images/${alias.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AliasCardProps {
  alias: AliasData;
  onFavorite: () => void;
  onCopyLink: () => void;
  onShare: () => void;
  onDownload: () => void;
  onClick: () => void;
}

function AliasCard({ alias, onFavorite, onCopyLink, onShare, onDownload, onClick }: AliasCardProps) {
  const expired = alias.validTo ? isExpiredDate(alias.validTo) : false;
  const isFav = alias.labels?.some((l) => l.type === LabelEnum.FAVORITE);

  return (
    <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] rounded-2xl overflow-hidden hover:border-orange-500/40 transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col group theme-transition">
      {/* Image Container */}
      <button onClick={onClick} className="relative aspect-4/5 bg-linear-to-br from-[var(--surface-hover)] to-[var(--surface)] flex items-center justify-center overflow-hidden cursor-pointer p-4 group-hover:bg-[var(--surface-hover)] transition-colors w-full">
        <div className="w-full h-full bg-[var(--surface-hover)] rounded-xl border border-[var(--border)] flex items-center justify-center group-hover:scale-105 transition-transform duration-500 relative overflow-hidden shadow-inner">
          {alias.imageLink ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${CDN_URL}${alias.imageLink}`}
              alt={alias.name || 'Alias'}
              className="w-full h-full object-contain"
            />
          ) : (
            <svg className="w-16 h-16 text-slate-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>

        {/* Expired badge */}
        {expired && (
          <div className="absolute top-3 left-3 bg-[var(--surface)]/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-medium text-[var(--text-secondary)] border border-[var(--border)] shadow-sm">
            {I18n.marketingDashboard.expired}
          </div>
        )}
      </button>

      {/* Info Section */}
      <div className="p-4 bg-[var(--surface-hover)] flex flex-col gap-1 border-t border-[var(--border)]">
        <h3 className="text-[var(--text-primary)] font-medium text-sm line-clamp-1 group-hover:text-orange-300 transition-colors">
          {alias.name}
        </h3>
        {alias.created && (
          <p className="text-xs text-slate-500 font-medium">
            {new Date(alias.created).toLocaleDateString('vi-VN')}
          </p>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-2 py-2 bg-[var(--surface)] border-t border-[var(--border)]">
        <button
          onClick={onFavorite}
          className="p-2.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors group/btn"
          title={I18n.marketingDashboard.favorite}
        >
          <svg
            className={`w-4.5 h-4.5 transition-colors ${
              isFav
                ? 'text-rose-500 fill-rose-500 group-hover/btn:fill-transparent'
                : 'text-[var(--text-muted)] group-hover/btn:text-rose-400'
            }`}
            fill={isFav ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button
          onClick={onDownload}
          className="p-2.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-muted)] hover:text-orange-400"
          title={I18n.marketingDashboard.download}
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
        <button
          onClick={onCopyLink}
          className="p-2.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-muted)] hover:text-orange-400"
          title={I18n.marketingDashboard.copyLink}
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        </button>
        <button
          onClick={onShare}
          className="p-2.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-muted)] hover:text-orange-400"
          title={I18n.marketingDashboard.share}
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
