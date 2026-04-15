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

export default function MyImagesPage() {
  const router = useRouter();
  const { getAlias, updateAlias, isLoading } = useMarketingDashboard();
  const [aliasList, setAliasList] = useState<AliasData[]>([]);

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

  const nonFavorites = aliasList
    .filter((a) => !a.labels?.some((l) => l.type === LabelEnum.FAVORITE))
    .sort((a, b) => new Date(b.created!).getTime() - new Date(a.created!).getTime());

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
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (aliasList.length === 0 && !isLoading) {
    return (
      <NoData message={I18n.noData} />
    );
  }

  return (
    <div className="space-y-8">
      {/* Favorites */}
      {favorites.length > 0 && (
        <AliasSection
          title={I18n.marketingDashboard.favorite}
          icon="heart"
          aliases={favorites}
          onFavorite={handleFavorite}
          onCopyLink={handleCopyLink}
          onShare={handleShare}
          onDownload={handleDownload}
          onPress={(alias) => router.push(`/agent/marketing-kit/my-images/${alias.id}`)}
        />
      )}

      {/* All images */}
      {nonFavorites.length > 0 && (
        <AliasSection
          title={I18n.marketingDashboard.myPictures}
          icon="image"
          aliases={nonFavorites}
          onFavorite={handleFavorite}
          onCopyLink={handleCopyLink}
          onShare={handleShare}
          onDownload={handleDownload}
          onPress={(alias) => router.push(`/agent/marketing-kit/my-images/${alias.id}`)}
        />
      )}
    </div>
  );
}

interface AliasSectionProps {
  title: string;
  icon: 'heart' | 'image';
  aliases: AliasData[];
  onFavorite: (alias: AliasData) => void;
  onCopyLink: (alias: AliasData) => void;
  onShare: (alias: AliasData) => void;
  onDownload: (alias: AliasData) => void;
  onPress: (alias: AliasData) => void;
}

function AliasSection({ title, icon, aliases, onFavorite, onCopyLink, onShare, onDownload, onPress }: AliasSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {icon === 'heart' ? (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="text-xs text-slate-400">({aliases.length})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {aliases.map((alias) => (
          <AliasCard
            key={alias.id}
            alias={alias}
            onFavorite={() => onFavorite(alias)}
            onCopyLink={() => onCopyLink(alias)}
            onShare={() => onShare(alias)}
            onDownload={() => onDownload(alias)}
            onClick={() => onPress(alias)}
          />
        ))}
      </div>
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
    <div
      className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-all flex flex-col ${
        expired ? 'opacity-50 grayscale' : ''
      }`}
    >
      <button onClick={onClick} className="w-full text-left">
        <div className="relative aspect-[4/3] bg-slate-800 group">
          {alias.imageLink && (
            <img
              src={`${CDN_URL}${alias.imageLink}`}
              alt={alias.name || 'Alias'}
              className="w-full h-full object-contain"
            />
          )}
          {expired && (
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded">
              {I18n.marketingDashboard.expired}
            </div>
          )}
          {/* Hover overlay actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
            <span className="p-2 bg-white/20 rounded-full text-white">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </span>
          </div>
        </div>
        <div className="p-3">
          <p className="text-sm font-medium text-white truncate">{alias.name}</p>
          {alias.created && (
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date(alias.created).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>
      </button>

      {/* Action bar */}
      <div className="flex items-center border-t border-white/10 bg-white/5">
        <button
          onClick={onFavorite}
          className="flex-1 flex items-center justify-center py-2 hover:bg-white/10 transition-colors"
          title={I18n.marketingDashboard.favorite}
        >
          <svg
            className={`w-4 h-4 ${isFav ? 'text-red-500 fill-current' : 'text-slate-400'}`}
            fill={isFav ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button
          onClick={onDownload}
          className="flex-1 flex items-center justify-center py-2 hover:bg-white/10 transition-colors"
          title={I18n.marketingDashboard.download}
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
        <button
          onClick={onCopyLink}
          className="flex-1 flex items-center justify-center py-2 hover:bg-white/10 transition-colors"
          title={I18n.marketingDashboard.copyLink}
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        </button>
        <button
          onClick={onShare}
          className="flex-1 flex items-center justify-center py-2 hover:bg-white/10 transition-colors"
          title={I18n.marketingDashboard.share}
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
