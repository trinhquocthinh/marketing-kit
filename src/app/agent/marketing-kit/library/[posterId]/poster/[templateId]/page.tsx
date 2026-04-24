'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { ArrowLeft, Camera, Loader2, Minus, Plus, ZoomIn, ZoomOut } from 'lucide-react';

import BannerWithFooter from '@/components/posters/BannerWithFooter';
import { loadExportPoster } from '@/components/posters/PosterCanvas.lazy';
import Skeleton from '@/components/ui/Skeleton';
import { useCanvasEditor } from '@/hooks/useCanvasEditor';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { I18n } from '@/i18n';
import { CDN_URL } from '@/lib/api.config';
import { generateMktLink, generateUniqueAliasName } from '@/lib/marketing-dashboard.utils';
import type { AliasData, AvatarData, GroupTemplateModel } from '@/types';
import { LabelEnum } from '@/types/enums';

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;
const brandGradient = 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)';

export default function PosterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = Number(params.posterId);
  const templateId = Number(params.templateId);

  const { folders, createAlias, updateAlias, uploadAliasImage, getAlias, getAvatar } =
    useMarketingDashboard();

  // Refs (không thuộc hook — scoped cho review/preview layout)
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const reviewContainerRef = useRef<HTMLDivElement>(null);

  // Container width for BannerWithFooter
  const [previewWidth, setPreviewWidth] = useState(0);
  const [reviewWidth, setReviewWidth] = useState(0);

  // ── Hook: gộp form name/phone + avatar + qr + zoom + exportRef ──
  const {
    exportRef: canvasExportRef,
    name,
    setName,
    phone,
    setPhone,
    avatarUrl,
    setAvatarUrl,
    qrUrl,
    setQrUrl,
    zoom,
    zoomIn,
    zoomOut,
    canZoomIn,
    canZoomOut,
  } = useCanvasEditor({ initialAvatarUrl: '/images/default-avatar.svg' });

  // Form state riêng cho page
  const [aliasName, setAliasName] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewZoom, setReviewZoom] = useState(1);

  const folder = folders.find((f) => f.id === folderId);
  const template: GroupTemplateModel | undefined = folder?.templates.find(
    (t) => t.id === templateId,
  );

  const bannerUrl = template ? `${CDN_URL}${template.imageLink}` : '';
  const isFilled = !!(name && phone && aliasName);

  // Measure preview container width
  useEffect(() => {
    if (isReviewing) return;
    const el = previewContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setPreviewWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isReviewing]);

  // Measure review container width
  useEffect(() => {
    if (!isReviewing) return;
    const el = reviewContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setReviewWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isReviewing]);

  // Load defaults
  useEffect(() => {
    if (template) {
      Promise.resolve().then(() => setAliasName(template.name));
    }
  }, [template]);

  useEffect(() => {
    getAvatar().then((res) => {
      if (res?.data) {
        const defaultAvatar = (res.data as AvatarData[]).find((a) => a.isDefault);
        if (defaultAvatar?.imageLink) {
          setAvatarUrl(`${CDN_URL}${defaultAvatar.imageLink}`);
        }
      }
    });
  }, [getAvatar]);

  // ── Review handler ──
  const handleReview = useCallback(() => {
    if (!isFilled) {
      alert(I18n.marketingDashboard.missingAliasInfo);
      return;
    }
    setReviewZoom(1);
    setIsReviewing(true);
  }, [isFilled]);

  // ── Save handler (alias creation pipeline) ──
  const handleSave = useCallback(async () => {
    if (!isFilled || !template || !folder) return;

    setIsSaving(true);
    try {
      // 1. Get existing aliases to generate unique name
      const aliasRes = await getAlias();
      const aliasList: AliasData[] = aliasRes?.data || [];
      const uniqueName = generateUniqueAliasName(aliasName, aliasList, template.name);

      if (!uniqueName) {
        alert(I18n.marketingDashboard.generateAlias.failure.title);
        setIsSaving(false);
        return;
      }

      // 2. Create alias
      const createRes = await createAlias({
        folderId: folder.id,
        imageData: { name, phone },
        imageLink: template.imageLink,
        labels: [{ type: LabelEnum.MARQUEE, value: '' }],
        name: uniqueName,
        templateId: template.id,
        imageMeta: {},
      });

      const aliasData = createRes?.data;
      if (!aliasData?.id) throw new Error('Failed to create alias');

      // 3. Generate QR link and set for export canvas
      const mktLink = generateMktLink(aliasData);
      setQrUrl(mktLink ?? '');

      // Wait for QR to render on the export canvas
      await new Promise((r) => setTimeout(r, 2000));

      // 4. Export canvas to blob (html2canvas loaded on-demand)
      if (!canvasExportRef.current) throw new Error('Canvas not ready');
      const exportPosterAsBlob = await loadExportPoster();
      const blob = await exportPosterAsBlob(canvasExportRef.current);

      // 5. Upload image
      const file = new File([blob], `${template.id}_${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });
      const uploadRes = await uploadAliasImage({ file, fileName: file.name });
      const uploadedLink = uploadRes?.data;
      if (!uploadedLink) throw new Error('Upload failed');

      // 6. Update alias with uploaded image link
      await updateAlias(aliasData.id, {
        ...aliasData,
        imageLink: uploadedLink,
      });

      // Navigate to my images
      router.push('/agent/marketing-kit/my-images');
    } catch (err) {
      console.error('Save poster error:', err);
      alert(I18n.marketingDashboard.generateAlias.missingData.title);
    } finally {
      setIsSaving(false);
    }
  }, [
    isFilled,
    template,
    folder,
    aliasName,
    name,
    phone,
    getAlias,
    createAlias,
    updateAlias,
    uploadAliasImage,
    router,
  ]);

  if (!template || !folder) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="aspect-3/4 w-full max-w-md" />
      </div>
    );
  }

  // ── Review overlay ──
  if (isReviewing) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        {/* Review header */}
        <div className="glass-bento m-4 flex items-center justify-between rounded-full!">
          <button
            onClick={() => setIsReviewing(false)}
            className="text-[10px] font-black tracking-widest text-t-secondary uppercase transition-colors hover:text-t-strong"
          >
            {I18n.close}
          </button>
          <span className="text-sm font-black tracking-wide text-t-strong">
            {I18n.marketingDashboard.review}
          </span>
          <span className="text-[10px] font-black tracking-widest text-t-muted uppercase">
            {Math.round(reviewZoom * 100)}%
          </span>
        </div>

        {/* Zoomable poster preview */}
        <div
          ref={reviewContainerRef}
          className="flex flex-1 items-start justify-center overflow-auto p-4"
        >
          <div
            style={{
              transform: `scale(${reviewZoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease-out',
            }}
          >
            {reviewWidth > 0 && (
              <BannerWithFooter
                url={bannerUrl}
                avatarUrl={avatarUrl}
                name={name}
                phone={phone}
                imageMeta={template.imageMeta || {}}
                containerWidth={Math.min(reviewWidth - 32, 500)}
                onLoadSuccess={() => setImageLoaded(true)}
              />
            )}
          </div>
        </div>

        {/* Zoom controls */}
        <div className="glass-bento m-4 flex items-center justify-center gap-4 rounded-full!">
          <button
            onClick={() => setReviewZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
            disabled={reviewZoom <= ZOOM_MIN}
            className="flex h-8 w-8 items-center justify-center rounded-full text-t-muted transition-colors hover:bg-(--surface-glass-alt) hover:text-t-strong disabled:opacity-30"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <span className="w-12 text-center text-[10px] font-black tracking-widest text-t-secondary uppercase">
            {Math.round(reviewZoom * 100)}%
          </span>
          <button
            onClick={() => setReviewZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
            disabled={reviewZoom >= ZOOM_MAX}
            className="flex h-8 w-8 items-center justify-center rounded-full text-t-muted transition-colors hover:bg-(--surface-glass-alt) hover:text-t-strong disabled:opacity-30"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-bento-fade-up flex h-full flex-col pb-32 lg:pb-10">
      {/* Header */}
      <div className="glass-bento sticky top-0 z-10 -mx-0 mb-6 flex items-center justify-between gap-4 md:-mx-8">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-3"
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full text-white shadow-(--shadow-glow-primary) transition-transform group-hover:scale-105"
            style={{ background: brandGradient }}
          >
            <ArrowLeft
              className="h-5 w-5 transition-transform group-hover:-translate-x-0.5"
              strokeWidth={2.5}
            />
          </span>
          <div className="text-left">
            <p className="bento-eyebrow">Chỉnh sửa</p>
            <h2 className="line-clamp-1 text-lg font-black tracking-wide text-t-strong md:text-xl">
              {template.name}
            </h2>
          </div>
        </button>
        <button
          onClick={() => router.back()}
          className="hidden text-[10px] font-black tracking-widest text-t-muted uppercase transition-colors hover:text-t-strong sm:block"
        >
          {I18n.close}
        </button>
      </div>

      {/* Main Content Area - Responsive Split Layout */}
      <div className="flex flex-1 flex-col gap-8 px-4 md:px-0 lg:flex-row lg:gap-12">
        {/* LEFT COLUMN: Poster Preview */}
        <div className="flex w-full flex-col items-center lg:w-[55%]">
          {/* Glass-bento poster frame */}
          <div
            ref={previewContainerRef}
            className="glass-bento glass-shine relative w-full max-w-md overflow-auto p-4!"
          >
            <div
              className="relative w-full overflow-hidden rounded-(--radius-bento-sm)"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-out',
              }}
            >
              {previewWidth > 0 && (
                <BannerWithFooter
                  url={bannerUrl}
                  avatarUrl={avatarUrl}
                  name={name || I18n.marketingDashboard.posterFooterPlaceholder.name}
                  phone={phone || I18n.marketingDashboard.posterFooterPlaceholder.phone}
                  imageMeta={template.imageMeta || {}}
                  containerWidth={previewWidth - 32}
                  onLoadSuccess={() => setImageLoaded(true)}
                />
              )}
            </div>
          </div>

          {/* Zoom controls */}
          <div className="glass-bento mt-6 flex items-center gap-4 rounded-full! px-4! py-2!">
            <button
              onClick={zoomOut}
              disabled={!canZoomOut}
              className="flex h-7 w-7 items-center justify-center rounded-full text-t-muted transition-colors hover:bg-(--surface-glass-alt) hover:text-t-strong disabled:opacity-30"
              aria-label="Zoom out"
            >
              <Minus className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <span className="w-12 text-center text-[10px] font-black tracking-widest text-t-secondary uppercase">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={!canZoomIn}
              className="flex h-7 w-7 items-center justify-center rounded-full text-t-muted transition-colors hover:bg-(--surface-glass-alt) hover:text-t-strong disabled:opacity-30"
              aria-label="Zoom in"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Form */}
        <div className="flex w-full flex-col lg:w-[45%]">
          {/* Avatar Picker */}
          <div className="mb-8 flex justify-center lg:justify-start">
            <button onClick={() => router.push('/agent/marketing-kit/avatar')} className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-(--surface-glass-border) bg-(--surface-glass-alt) shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
              <div
                className="absolute right-0 bottom-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background text-white shadow-(--shadow-glow-primary) transition-transform hover:scale-110"
                style={{ background: brandGradient }}
              >
                <Camera className="h-4 w-4" strokeWidth={2.5} />
              </div>
            </button>
          </div>

          {/* Form Fields */}
          <div className="flex-1 space-y-5">
            <div>
              <label className="mb-2 block pl-1 text-[10px] font-black tracking-widest text-t-muted uppercase">
                {I18n.fullName} <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="glass-input w-full px-4 py-3.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={I18n.fullName}
                readOnly={template.editable === false}
              />
            </div>

            <div>
              <label className="mb-2 block pl-1 text-[10px] font-black tracking-widest text-t-muted uppercase">
                {I18n.phone} <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="glass-input w-full px-4 py-3.5"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={I18n.phone}
                readOnly={template.editable === false}
              />
            </div>

            <div>
              <label className="mb-2 block pl-1 text-[10px] font-black tracking-widest text-t-muted uppercase">
                {I18n.marketingDashboard.aliasName} <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="glass-input w-full px-4 py-3.5"
                value={aliasName}
                onChange={(e) => setAliasName(e.target.value)}
                placeholder={I18n.marketingDashboard.aliasName}
              />
              <p className="mt-2 mb-2 pl-1 text-xs font-medium text-t-muted">
                {I18n.marketingDashboard.aliasNameDesc}
              </p>
            </div>
          </div>

          {/* Action Buttons (Inline on Desktop) */}
          <div className="mt-10 hidden gap-4 lg:flex">
            <button
              disabled={isSaving || !imageLoaded}
              onClick={handleReview}
              className="glass-bento-interactive flex-1 rounded-full! px-6! py-4! text-[10px] font-black tracking-widest text-t-strong uppercase disabled:cursor-not-allowed disabled:opacity-50"
            >
              {I18n.marketingDashboard.review}
            </button>
            <button
              disabled={isSaving || !imageLoaded}
              onClick={handleSave}
              className="btn-brand-glow flex-1 rounded-full px-6 py-4 text-[10px] font-black tracking-widest text-white uppercase disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: brandGradient }}
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {I18n.loading}
                </span>
              ) : (
                I18n.save
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons (Sticky Bottom on Mobile) */}
      <div className="safe-pb glass-bento fixed md:right-4 md:bottom-4 md:left-4 mx-4 md:mx-0 z-20 flex gap-3 rounded-full! p-3! lg:hidden">
        <button
          disabled={isSaving || !imageLoaded}
          onClick={handleReview}
          className="flex-[0.4] rounded-full bg-(--surface-glass-alt) px-4 py-3 text-[10px] font-black tracking-widest text-t-strong uppercase transition-colors hover:bg-surface-glass disabled:cursor-not-allowed disabled:opacity-50"
        >
          {I18n.marketingDashboard.review}
        </button>
        <button
          disabled={isSaving || !imageLoaded}
          onClick={handleSave}
          className="btn-brand-glow flex-[0.6] rounded-full px-4 py-3 text-[10px] font-black tracking-widest text-white uppercase disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: brandGradient }}
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {I18n.loading}
            </span>
          ) : (
            I18n.save
          )}
        </button>
      </div>

      {/* Safe area helper for iOS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .safe-pb { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
      `,
        }}
      />

      {/* Off-screen export canvas (with real QR when saving) */}
      {qrUrl && (
        <div ref={canvasExportRef} className="fixed" style={{ top: '200vh', left: 0 }}>
          <BannerWithFooter
            url={bannerUrl}
            avatarUrl={avatarUrl}
            qr={qrUrl}
            name={name}
            phone={phone}
            imageMeta={template.imageMeta || {}}
            containerWidth={800}
          />
        </div>
      )}

      {/* Full-screen loading overlay */}
      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="glass-bento glass-shine flex flex-col items-center gap-3 shadow-2xl">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-[10px] font-black tracking-widest text-t-strong uppercase">
              {I18n.loading}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
