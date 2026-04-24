'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Copy,
  Download,
  Heart,
  ImageIcon,
  Share2,
} from 'lucide-react';

import NoData from '@/components/ui/NoData';
import Skeleton from '@/components/ui/Skeleton';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { I18n } from '@/i18n';
import { CDN_URL } from '@/lib/api.config';
import { generateMktLink, isExpiredDate } from '@/lib/marketing-dashboard.utils';
import type { AliasData } from '@/types';
import { LabelEnum } from '@/types/enums';

const brandGradient = 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)';

export default function MyImageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const aliasId = Number(params.aliasId);

  const { getAliasDetail, updateAlias } = useMarketingDashboard();
  const [alias, setAlias] = useState<AliasData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAliasDetail(aliasId).then((res) => {
      setAlias(res?.data ?? null);
      setLoading(false);
    });
  }, [aliasId, getAliasDetail]);

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
    if (!link) return;
    await navigator.clipboard.writeText(link);
    alert(I18n.marketingDashboard.linkCopied);
  };

  const handleShare = async () => {
    if (!alias) return;
    const link = generateMktLink(alias);
    if (!link) return;
    if (navigator.share) {
      await navigator.share({ title: alias.name, url: link });
    } else {
      await navigator.clipboard.writeText(link);
      alert(I18n.marketingDashboard.linkCopied);
    }
  };

  const handleDownload = () => {
    if (!alias?.imageLink) return;
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

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <Skeleton className="h-14 w-full" />
        <div className="flex flex-col gap-6 lg:flex-row">
          <Skeleton className="aspect-video w-full lg:w-[60%]" />
          <div className="w-full space-y-4 lg:w-[40%]">
            <Skeleton className="h-32" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!alias) {
    return (
      <div className="glass-bento flex min-h-[60vh] items-center justify-center">
        <NoData message={I18n.noData} />
      </div>
    );
  }

  return (
    <div className="animate-bento-fade-up flex h-full flex-col pb-10">
      {/* Header */}
      <div className="glass-bento mb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="group flex w-fit items-center gap-3 text-left"
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full text-white shadow-[var(--shadow-glow-primary)] transition-transform group-hover:-translate-x-1"
            style={{ background: brandGradient }}
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <div>
            <p className="bento-eyebrow mb-0.5">Chi tiết</p>
            <h2 className="line-clamp-1 text-xl font-black tracking-wide text-[var(--text-strong)] md:text-2xl">
              {alias.name}
            </h2>
          </div>
        </button>
      </div>

      {/* Main Content: Split Layout */}
      <div className="relative flex flex-1 flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Left: Image Preview */}
        <div className="flex w-full flex-col lg:w-[60%]">
          <div className="glass-bento glass-shine relative flex w-full items-center justify-center !p-2 md:!p-4">
            {alias.imageLink ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${CDN_URL}${alias.imageLink}`}
                alt={alias.name || 'Alias'}
                className="h-full w-full rounded-[var(--radius-bento-sm)] object-contain"
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-[var(--radius-bento-sm)] bg-[var(--surface-glass-alt)]">
                <ImageIcon className="h-16 w-16 text-[var(--text-muted)]" strokeWidth={1.25} />
              </div>
            )}

            {expired && (
              <div className="absolute inset-0 flex items-center justify-center rounded-[var(--radius-bento)] bg-[var(--overlay-bg)] backdrop-blur-md">
                <div
                  className="flex items-center gap-3 rounded-full px-6 py-3 text-sm font-black tracking-widest text-white uppercase shadow-[var(--shadow-glow-primary-strong)]"
                  style={{ background: 'var(--danger)' }}
                >
                  <AlertTriangle className="h-5 w-5" strokeWidth={2.5} />
                  {I18n.marketingDashboard.expired}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Info & Actions */}
        <div className="sticky top-4 flex w-full flex-col gap-6 lg:w-[40%]">
          {/* Info Card */}
          <div className="glass-bento flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <span className="text-[10px] font-black tracking-widest whitespace-nowrap text-[var(--text-muted)] uppercase">
                {I18n.marketingDashboard.aliasName}
              </span>
              <span className="text-right leading-tight font-black text-[var(--text-strong)]">
                {alias.name}
              </span>
            </div>
            <div className="h-px w-full bg-[var(--surface-glass-border)]" />
            {alias.created && (
              <>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
                    {I18n.portal.posterValidFrom}
                  </span>
                  <span className="font-black text-[var(--text-strong)]">
                    {new Date(alias.created).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="h-px w-full bg-[var(--surface-glass-border)]" />
              </>
            )}
            {alias.validTo && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
                  {I18n.portal.posterValidTo}
                </span>
                <span
                  className={`font-black ${expired ? 'text-[var(--danger)]' : 'text-[var(--text-strong)]'}`}
                >
                  {new Date(alias.validTo).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons Grid */}
          <div className="glass-bento grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            {(
              [
                {
                  key: 'fav',
                  Icon: Heart,
                  label: I18n.marketingDashboard.favorite,
                  active: !!isFav,
                  disabled: false,
                  onClick: handleFavorite,
                },
                {
                  key: 'dl',
                  Icon: Download,
                  label: I18n.marketingDashboard.download,
                  active: false,
                  disabled: expired,
                  onClick: handleDownload,
                },
                {
                  key: 'cp',
                  Icon: Copy,
                  label: I18n.marketingDashboard.copyLink,
                  active: false,
                  disabled: expired,
                  onClick: handleCopyLink,
                },
                {
                  key: 'sh',
                  Icon: Share2,
                  label: I18n.marketingDashboard.share,
                  active: false,
                  disabled: expired,
                  onClick: handleShare,
                },
              ] as const
            ).map(({ key, Icon, label, active, disabled, onClick }) => (
              <button
                key={key}
                onClick={onClick}
                disabled={disabled}
                className={`flex flex-col items-center justify-center gap-2 rounded-[var(--radius-bento-sm)] py-4 transition-all hover:scale-[1.02] active:scale-95 ${
                  disabled
                    ? 'cursor-not-allowed bg-[var(--surface-glass-alt)] text-[var(--text-muted)] opacity-50'
                    : active
                      ? 'text-white shadow-[var(--shadow-glow-primary)]'
                      : 'bg-[var(--surface-glass-alt)] text-[var(--text-secondary)] hover:bg-[var(--surface-glass)] hover:text-[var(--text-strong)]'
                }`}
                style={active && !disabled ? { background: brandGradient } : undefined}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={2.5}
                  fill={key === 'fav' && active ? 'currentColor' : 'none'}
                />
                <span className="text-center text-[10px] leading-tight font-black tracking-widest uppercase">
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* View Performance Button */}
          <button
            onClick={() => router.push(`/agent/marketing-kit/performance/${alias.id}`)}
            className="btn-brand-glow flex w-full items-center justify-center gap-2 rounded-full py-4 text-xs font-black tracking-widest text-white uppercase active:scale-[0.98]"
          >
            <BarChart3 className="h-5 w-5" strokeWidth={2.5} />
            {I18n.marketingDashboard.imagePerformance}
          </button>
        </div>
      </div>
    </div>
  );
}
