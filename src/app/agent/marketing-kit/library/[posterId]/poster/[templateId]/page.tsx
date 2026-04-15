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
import PosterCanvas, {
  exportPosterAsBlob,
} from '@/components/posters/PosterCanvas';
import Input from '@/components/ui/Input';
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
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasExportRef = useRef<HTMLDivElement>(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [aliasName, setAliasName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('/default-avatar.png');
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
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="aspect-[3/4] w-full max-w-md rounded-lg" />
      </div>
    );
  }

  // ── Review overlay (pinch-zoom equivalent) ──
  if (isReviewing) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black">
        {/* Review header */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/80">
          <button
            onClick={() => setIsReviewing(false)}
            className="text-white text-sm font-medium"
          >
            {I18n.close}
          </button>
          <span className="text-white text-sm font-semibold">
            {I18n.marketingDashboard.review}
          </span>
          <span className="text-white/60 text-xs">
            {Math.round(reviewZoom * 100)}%
          </span>
        </div>

        {/* Zoomable poster preview */}
        <div className="flex-1 overflow-auto flex items-start justify-center p-4">
          <PosterCanvas
            imageUrl={bannerUrl}
            avatarUrl={avatarUrl}
            qrData="https://example.com"
            name={name}
            phone={phone}
            imageMeta={template.imageMeta || {}}
            showQrPlaceholder
            zoom={reviewZoom}
          />
        </div>

        {/* Zoom controls */}
        <div className="flex items-center justify-center gap-4 px-4 py-3 bg-black/80">
          <button
            onClick={() =>
              setReviewZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))
            }
            disabled={reviewZoom <= ZOOM_MIN}
            className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center text-lg disabled:opacity-30"
          >
            −
          </button>
          <input
            type="range"
            min={ZOOM_MIN}
            max={ZOOM_MAX}
            step={ZOOM_STEP}
            value={reviewZoom}
            onChange={(e) => setReviewZoom(Number(e.target.value))}
            className="w-40 accent-[#FA875B]"
          />
          <button
            onClick={() =>
              setReviewZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))
            }
            disabled={reviewZoom >= ZOOM_MAX}
            className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center text-lg disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-[15px] py-3 border-b border-gray-100">
        <button
          onClick={() => router.back()}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-600"
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
        </button>
        <h2 className="text-base font-semibold text-gray-900 truncate flex-1">
          {template.name}
        </h2>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {I18n.close}
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-[15px] py-6">
        {/* Poster preview with zoom */}
        <div className="flex flex-col items-center">
          <div className="overflow-auto max-w-full">
            <PosterCanvas
              ref={canvasRef}
              imageUrl={bannerUrl}
              avatarUrl={avatarUrl}
              qrData="https://example.com"
              name={name || I18n.marketingDashboard.posterFooterPlaceholder.name}
              phone={
                phone ||
                I18n.marketingDashboard.posterFooterPlaceholder.phone
              }
              imageMeta={template.imageMeta || {}}
              showQrPlaceholder
              zoom={zoom}
            />
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() =>
                setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))
              }
              disabled={zoom <= ZOOM_MIN}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 disabled:opacity-30"
            >
              −
            </button>
            <span className="text-xs text-gray-500 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() =>
                setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))
              }
              disabled={zoom >= ZOOM_MAX}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>

        {/* Avatar section */}
        <div className="flex flex-col items-center mt-6 mb-4">
          <button
            onClick={() => router.push('/agent/marketing-kit/avatar')}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden border border-black/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
                onLoad={() => setImageLoaded(true)}
              />
            </div>
            {/* Camera icon */}
            <div className="-mt-3">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[#FA875B]"
              >
                <circle cx="12" cy="12" r="12" fill="currentColor" />
                <path
                  d="M8.5 9.5A1 1 0 019.5 8.5h.65a1 1 0 00.83-.45l.4-.6A1 1 0 0112.21 7h1.58a1 1 0 01.83.45l.4.6a1 1 0 00.83.45h.65a1 1 0 011 1v5a1 1 0 01-1 1h-7a1 1 0 01-1-1v-5z"
                  stroke="white"
                  strokeWidth="1"
                />
                <circle
                  cx="13"
                  cy="12"
                  r="1.8"
                  stroke="white"
                  strokeWidth="1"
                />
              </svg>
            </div>
          </button>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <Input
            label={I18n.fullName}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={I18n.fullName}
            readOnly={template.editable === false}
          />
          <Input
            label={I18n.phone}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={I18n.phone}
            readOnly={template.editable === false}
          />
          <div>
            <Input
              label={I18n.marketingDashboard.aliasName}
              value={aliasName}
              onChange={(e) => setAliasName(e.target.value)}
              placeholder={I18n.marketingDashboard.aliasName}
            />
            <p className="mt-1 text-[11px] text-gray-500 font-[Montserrat,sans-serif]">
              {I18n.marketingDashboard.aliasNameDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom action bar – matches RN: shadow, two 48% buttons */}
      <div className="flex items-center justify-between gap-3 px-[15px] py-2 bg-white shadow-[0px_-4px_60px_0px_rgba(176,143,130,0.4)]">
        <button
          disabled={isSaving || !imageLoaded}
          onClick={handleReview}
          className="flex-1 h-11 rounded-full border border-[#FF8050] text-[#FF8050] text-[13px] font-semibold font-[Montserrat,sans-serif] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {I18n.marketingDashboard.review}
        </button>
        <button
          disabled={isSaving || !imageLoaded}
          onClick={handleSave}
          className="flex-1 h-11 rounded-full bg-[#FF8050] text-white text-[13px] font-semibold font-[Montserrat,sans-serif] shadow-[0_1.5px_2px_rgba(192,68,19,1)] disabled:bg-[#D1D1D1] disabled:shadow-none disabled:cursor-not-allowed transition-colors"
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

      {/* Off-screen export canvas (with real QR when saving) */}
      {qrUrl && (
        <div className="fixed" style={{ top: '200vh', left: 0 }}>
          <PosterCanvas
            ref={canvasExportRef}
            imageUrl={bannerUrl}
            avatarUrl={avatarUrl}
            qrData={qrUrl}
            name={name}
            phone={phone}
            imageMeta={template.imageMeta || {}}
          />
        </div>
      )}

      {/* Full-screen loading overlay */}
      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-3">
            <svg
              className="animate-spin h-8 w-8 text-[#FA875B]"
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
            <p className="text-sm text-gray-700">{I18n.loading}</p>
          </div>
        </div>
      )}
    </div>
  );
}
