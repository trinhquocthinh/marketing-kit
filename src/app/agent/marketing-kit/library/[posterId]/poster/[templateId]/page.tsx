'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { I18n } from '@/i18n';
import { CDN_URL } from '@/lib/api.config';
import { LabelEnum } from '@/types/enums';
import type { AliasData, AvatarData, GroupTemplateModel } from '@/types';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import {
  generateMktLink,
  generateUniqueAliasName,
} from '@/lib/marketing-dashboard.utils';
import { exportPosterAsBlob } from '@/components/posters/PosterCanvas';
import BannerWithFooter from '@/components/posters/BannerWithFooter';
import Skeleton from '@/components/ui/Skeleton';

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

export default function PosterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = Number(params.posterId);
  const templateId = Number(params.templateId);

  const {
    folders,
    createAlias,
    updateAlias,
    uploadAliasImage,
    getAlias,
    getAvatar,
  } = useMarketingDashboard();

  // Refs
  const canvasExportRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const reviewContainerRef = useRef<HTMLDivElement>(null);

  // Container width for BannerWithFooter
  const [previewWidth, setPreviewWidth] = useState(0);
  const [reviewWidth, setReviewWidth] = useState(0);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [aliasName, setAliasName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('/images/default-avatar.svg');
  const [qrUrl, setQrUrl] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  // UI state
  const [zoom, setZoom] = useState(1);
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
      setAliasName(template.name);
    }
  }, [template]);

  useEffect(() => {
    getAvatar().then((res) => {
      if (res?.data) {
        const defaultAvatar = (res.data as AvatarData[]).find(
          (a) => a.isDefault,
        );
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
      const uniqueName = generateUniqueAliasName(
        aliasName,
        aliasList,
        template.name,
      );

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
      setQrUrl(mktLink);

      // Wait for QR to render on the export canvas
      await new Promise((r) => setTimeout(r, 2000));

      // 4. Export canvas to blob
      if (!canvasExportRef.current) throw new Error('Canvas not ready');
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
        <Skeleton className="h-8 w-48 bg-white/10 rounded-lg" />
        <Skeleton className="aspect-3/4 w-full max-w-md rounded-2xl bg-white/5" />
      </div>
    );
  }

  // ── Review overlay ──
  if (isReviewing) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[var(--background)]">
        {/* Review header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--sidebar-bg)] backdrop-blur-xl border-b border-[var(--border)]">
          <button
            onClick={() => setIsReviewing(false)}
            className="text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--text-primary)] transition-colors"
          >
            {I18n.close}
          </button>
          <span className="text-[var(--text-primary)] text-sm font-semibold">
            {I18n.marketingDashboard.review}
          </span>
          <span className="text-[var(--text-muted)] text-xs">
            {Math.round(reviewZoom * 100)}%
          </span>
        </div>

        {/* Zoomable poster preview */}
        <div ref={reviewContainerRef} className="flex-1 overflow-auto flex items-start justify-center p-4">
          <div
            style={{ transform: `scale(${reviewZoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out' }}
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
        <div className="flex items-center justify-center gap-4 px-4 py-3 bg-[var(--sidebar-bg)] backdrop-blur-xl border-t border-[var(--border)]">
          <button
            onClick={() =>
              setReviewZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))
            }
            disabled={reviewZoom <= ZOOM_MIN}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="2"/><path strokeLinecap="round" strokeWidth="2" d="m21 21-4.35-4.35M8 11h6"/></svg>
          </button>
          <span className="text-sm font-medium text-[var(--text-secondary)] w-12 text-center">
            {Math.round(reviewZoom * 100)}%
          </span>
          <button
            onClick={() =>
              setReviewZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))
            }
            disabled={reviewZoom >= ZOOM_MAX}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="2"/><path strokeLinecap="round" strokeWidth="2" d="m21 21-4.35-4.35M8 11h6M11 8v6"/></svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-32 lg:pb-10 h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 sticky top-0 z-10 bg-[var(--sidebar-bg)] backdrop-blur-xl p-4 md:p-6 -mx-4 md:-mx-8 border-b border-[var(--border)] shadow-sm theme-transition">
        <button
          onClick={() => router.back()}
          className="flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
        >
          <svg
            className="w-5 h-5 mr-2 text-orange-400 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <h2 className="text-lg md:text-xl font-bold text-[var(--text-primary)] line-clamp-1">
            {template.name}
          </h2>
        </button>
        <button
          onClick={() => router.back()}
          className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors hidden sm:block"
        >
          {I18n.close}
        </button>
      </div>

      {/* Main Content Area - Responsive Split Layout */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 flex-1 px-4 md:px-0">

        {/* LEFT COLUMN: Poster Preview */}
        <div className="w-full lg:w-[55%] flex flex-col items-center">
          {/* Glassmorphism poster frame */}
          <div
            ref={previewContainerRef}
            className="w-full max-w-md bg-[var(--surface)] backdrop-blur-md rounded-2xl border border-[var(--border)] shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-auto p-4 theme-transition"
          >
            <div
              className="w-full rounded-xl relative overflow-hidden"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out' }}
            >
              {previewWidth > 0 && (
                <BannerWithFooter
                  url={bannerUrl}
                  avatarUrl={avatarUrl}
                  name={name || I18n.marketingDashboard.posterFooterPlaceholder.name}
                  phone={
                    phone ||
                    I18n.marketingDashboard.posterFooterPlaceholder.phone
                  }
                  imageMeta={template.imageMeta || {}}
                  containerWidth={previewWidth - 32}
                  onLoadSuccess={() => setImageLoaded(true)}
                />
              )}
            </div>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-4 mt-6 bg-[var(--surface)] backdrop-blur-md border border-[var(--border)] rounded-full px-4 py-2 theme-transition">
            <button
              onClick={() =>
                setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))
              }
              disabled={zoom <= ZOOM_MIN}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="2"/><path strokeLinecap="round" strokeWidth="2" d="m21 21-4.35-4.35M8 11h6"/></svg>
            </button>
            <span className="text-sm font-medium text-[var(--text-secondary)] w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() =>
                setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))
              }
              disabled={zoom >= ZOOM_MAX}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="2"/><path strokeLinecap="round" strokeWidth="2" d="m21 21-4.35-4.35M8 11h6M11 8v6"/></svg>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Form */}
        <div className="w-full lg:w-[45%] flex flex-col">

          {/* Avatar Picker */}
          <div className="flex justify-center lg:justify-start mb-8">
            <button
              onClick={() => router.push('/agent/marketing-kit/avatar')}
              className="relative"
            >
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-slate-700 to-slate-800 border-4 border-slate-900 shadow-xl overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
              <div className="absolute bottom-0 right-0 p-2 bg-linear-to-r from-orange-500 to-rose-500 rounded-full text-white shadow-lg hover:scale-110 transition-transform border-2 border-slate-900">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
              </div>
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-5 flex-1">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 pl-1">
                {I18n.fullName} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all backdrop-blur-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={I18n.fullName}
                readOnly={template.editable === false}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 pl-1">
                {I18n.phone} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all backdrop-blur-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={I18n.phone}
                readOnly={template.editable === false}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 pl-1">
                {I18n.marketingDashboard.aliasName} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all backdrop-blur-sm"
                value={aliasName}
                onChange={(e) => setAliasName(e.target.value)}
                placeholder={I18n.marketingDashboard.aliasName}
              />
              <p className="text-xs text-[var(--text-muted)] mt-2 pl-1">
                {I18n.marketingDashboard.aliasNameDesc}
              </p>
            </div>
          </div>

          {/* Action Buttons (Inline on Desktop) */}
          <div className="hidden lg:flex gap-4 mt-10">
            <button
              disabled={isSaving || !imageLoaded}
              onClick={handleReview}
              className="flex-1 py-4 px-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] font-semibold hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {I18n.marketingDashboard.review}
            </button>
            <button
              disabled={isSaving || !imageLoaded}
              onClick={handleSave}
              className="flex-1 py-4 px-6 bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 rounded-xl text-white font-bold shadow-lg hover:shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-[var(--sidebar-bg)] backdrop-blur-xl border-t border-[var(--border)] z-20 flex gap-3 safe-pb">
        <button
          disabled={isSaving || !imageLoaded}
          onClick={handleReview}
          className="flex-[0.4] py-3.5 px-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] font-semibold hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {I18n.marketingDashboard.review}
        </button>
        <button
          disabled={isSaving || !imageLoaded}
          onClick={handleSave}
          className="flex-[0.6] py-3.5 px-4 bg-linear-to-r from-orange-500 to-rose-500 rounded-xl text-white font-bold shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {I18n.loading}
            </span>
          ) : (
            I18n.save
          )}
        </button>
      </div>

      {/* Safe area helper for iOS */}
      <style dangerouslySetInnerHTML={{__html: `
        .safe-pb { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
      `}}/>

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
          <div className="bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-2xl">
            <svg
              className="animate-spin h-8 w-8 text-orange-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-sm text-slate-200">{I18n.loading}</p>
          </div>
        </div>
      )}
    </div>
  );
}
