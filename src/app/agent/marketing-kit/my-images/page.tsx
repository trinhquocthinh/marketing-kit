'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Copy, Download, Heart, ImageIcon, Share2, Sparkles } from 'lucide-react';

import Button from '@/components/ui/Button';
import NoData from '@/components/ui/NoData';
import Skeleton from '@/components/ui/Skeleton';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { I18n } from '@/i18n';
import { CDN_URL } from '@/lib/api.config';
import { generateMktLink, isExpiredDate } from '@/lib/marketing-dashboard.utils';
import type { AliasData } from '@/types';
import { LabelEnum } from '@/types/enums';

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
    .sort(
      (a, b) =>
        new Date(b.priorityAt || b.created!).getTime() -
        new Date(a.priorityAt || a.created!).getTime(),
    );

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
    setAliasList((prev) => prev.map((a) => (a.id === alias.id ? { ...a, labels: newLabels } : a)));

    const res = await updateAlias(alias.id, { ...alias, labels: newLabels });
    if (res?.data) {
      setAliasList((prev) => prev.map((a) => (a.id === res.data!.id ? res.data! : a)));
    }
  };

  const handleCopyLink = async (alias: AliasData) => {
    const link = generateMktLink(alias);
    if (!link) return;
    await navigator.clipboard.writeText(link);
    alert(I18n.marketingDashboard.linkCopied);
  };

  const handleShare = async (alias: AliasData) => {
    const link = generateMktLink(alias);
    if (!link) return;
    if (navigator.share) {
      await navigator.share({ title: alias.name, url: link });
    } else {
      await navigator.clipboard.writeText(link);
      alert(I18n.marketingDashboard.linkCopied);
    }
  };

  const handleDownload = (alias: AliasData) => {
    if (!alias.imageLink) return;
    const imageUrl = `${CDN_URL}${alias.imageLink}`;
    const filename = `${alias.name || 'poster'}.jpg`;
    const proxyUrl = `/api/download?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`;
    const a = document.createElement('a');
    a.href = proxyUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (isLoading && aliasList.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-80" />
        <Skeleton className="h-14 w-96" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5]" />
          ))}
        </div>
      </div>
    );
  }

  if (aliasList.length === 0 && !isLoading) {
    return (
      <div className="glass-bento flex min-h-[60vh] items-center justify-center">
        <NoData message={I18n.noData} />
      </div>
    );
  }

  return (
    <div className="animate-bento-fade-up space-y-6 pb-8">
      {/* Header */}
      <div className="glass-bento flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="bento-eyebrow mb-1.5">Bộ sưu tập</p>
          <h2 className="text-2xl font-black tracking-wide text-[var(--text-strong)]">
            {I18n.marketingDashboard.myPictures}
          </h2>
        </div>
        <Button
          variant="primary"
          onClick={() => router.push('/agent/marketing-kit/library')}
          className="w-full gap-2 sm:w-auto"
        >
          <Sparkles className="h-4 w-4" strokeWidth={2.5} />
          {I18n.marketingDashboard.createNew}
        </Button>
      </div>

      {/* Filter Toggle */}
      <div className="flex w-fit rounded-full bg-[var(--surface-glass-alt)] p-1">
        {(
          [
            { mode: 'all' as const, Icon: ImageIcon, label: I18n.marketingDashboard.myPictures, count: aliasList.length },
            { mode: 'favorites' as const, Icon: Heart, label: I18n.marketingDashboard.favorite, count: favorites.length },
          ]
        ).map(({ mode, Icon, label, count }) => {
          const active = filter === mode;
          return (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black tracking-widest uppercase transition-all ${
                active
                  ? 'text-white shadow-[var(--shadow-glow-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-strong)]'
              }`}
              style={
                active
                  ? { background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)' }
                  : undefined
              }
            >
              <Icon
                className="h-4 w-4"
                strokeWidth={2.5}
                fill={mode === 'favorites' && active ? 'currentColor' : 'none'}
              />
              <span>{label}</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filteredAliases.length === 0 ? (
        <div className="glass-bento flex min-h-[40vh] items-center justify-center">
          <NoData message={filter === 'favorites' ? 'Chưa có ảnh yêu thích' : I18n.noData} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

function AliasCard({
  alias,
  onFavorite,
  onCopyLink,
  onShare,
  onDownload,
  onClick,
}: AliasCardProps) {
  const expired = alias.validTo ? isExpiredDate(alias.validTo) : false;
  const isFav = alias.labels?.some((l) => l.type === LabelEnum.FAVORITE);

  return (
    <div className="glass-bento glass-shine group flex flex-col overflow-hidden !p-0 transition-all hover:-translate-y-1">
      {/* Image Container */}
      <button
        onClick={onClick}
        className="relative flex aspect-[4/5] w-full cursor-pointer items-center justify-center overflow-hidden p-4"
      >
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[var(--radius-bento-sm)] bg-[var(--surface-glass-alt)] transition-transform duration-500 group-hover:scale-[1.02]">
          {alias.imageLink ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${CDN_URL}${alias.imageLink}`}
              alt={alias.name || 'Alias'}
              className="h-full w-full object-contain"
            />
          ) : (
            <ImageIcon className="h-16 w-16 text-[var(--text-muted)]" strokeWidth={1.25} />
          )}
        </div>

        {expired && (
          <div className="absolute top-3 left-3 rounded-full bg-[var(--surface-glass)] px-3 py-1 text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase shadow-[var(--shadow-glass-sm)]">
            {I18n.marketingDashboard.expired}
          </div>
        )}
      </button>

      {/* Info Section */}
      <div className="flex flex-col gap-1 border-t border-[var(--surface-glass-border)] px-4 py-3">
        <h3 className="line-clamp-1 text-sm font-black tracking-wide text-[var(--text-strong)] transition-colors group-hover:text-[var(--primary)]">
          {alias.name}
        </h3>
        {alias.created && (
          <p className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
            {new Date(alias.created).toLocaleDateString('vi-VN')}
          </p>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between border-t border-[var(--surface-glass-border)] bg-[var(--surface-glass-alt)] px-2 py-2">
        <button
          onClick={onFavorite}
          className="rounded-full p-2.5 transition-all hover:scale-110 hover:bg-[var(--surface-glass)]"
          title={I18n.marketingDashboard.favorite}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isFav ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
            }`}
            fill={isFav ? 'currentColor' : 'none'}
            strokeWidth={2.5}
          />
        </button>
        <button
          onClick={onDownload}
          className="rounded-full p-2.5 text-[var(--text-muted)] transition-all hover:scale-110 hover:bg-[var(--surface-glass)] hover:text-[var(--primary)]"
          title={I18n.marketingDashboard.download}
        >
          <Download className="h-4 w-4" strokeWidth={2.5} />
        </button>
        <button
          onClick={onCopyLink}
          className="rounded-full p-2.5 text-[var(--text-muted)] transition-all hover:scale-110 hover:bg-[var(--surface-glass)] hover:text-[var(--primary)]"
          title={I18n.marketingDashboard.copyLink}
        >
          <Copy className="h-4 w-4" strokeWidth={2.5} />
        </button>
        <button
          onClick={onShare}
          className="rounded-full p-2.5 text-[var(--text-muted)] transition-all hover:scale-110 hover:bg-[var(--surface-glass)] hover:text-[var(--primary)]"
          title={I18n.marketingDashboard.share}
        >
          <Share2 className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
