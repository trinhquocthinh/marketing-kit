'use client';

import { useEffect, useState } from 'react';

import QRCode from 'qrcode';

import { I18n } from '@/i18n';
import type { ImageMeta } from '@/types';

// ── RN originals: POSTER_TEMPLATE_WIDTH ≈ screenWidth - 40, POSTER_TEMPLATE_FOOTER_HEIGHT = 40 ──
const ORIGINAL_WIDTH = 380;
const ORIGINAL_FOOTER_HEIGHT = 40;

export interface BannerWithFooterProps {
  name?: string;
  phone?: string;
  qr?: string;
  avatarUrl?: string;
  imageMeta?: ImageMeta;
  url: string;
  containerWidth: number;
  containerHeight?: number;
  onLoadSuccess?: () => void;
}

export default function BannerWithFooter({
  name,
  phone,
  qr,
  avatarUrl,
  imageMeta,
  url,
  containerWidth,
  containerHeight,
  onLoadSuccess,
}: BannerWithFooterProps) {
  const [originalSize, setOriginalSize] = useState({ width: 1, height: 1 });
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Load image to get natural dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setOriginalSize({ width: img.naturalWidth, height: img.naturalHeight });
      onLoadSuccess?.();
    };
    img.src = url;
  }, [url, onLoadSuccess]);

  // Generate QR code (real if qr prop provided, placeholder otherwise)
  useEffect(() => {
    if (qr) {
      QRCode.toDataURL(qr, {
        width: 168,
        margin: 1,
      }).then(setQrDataUrl);
    } else {
      QRCode.toDataURL('https://example.com', {
        width: 168,
        margin: 1,
        color: { dark: '#CCCCCC', light: '#FFFFFF' },
      }).then(setQrDataUrl);
    }
  }, [qr]);

  const imageAspectRatio = originalSize.width / originalSize.height;
  const originalTotalHeight = ORIGINAL_WIDTH / imageAspectRatio + ORIGINAL_FOOTER_HEIGHT;

  const scale =
    containerWidth && containerHeight
      ? Math.min(containerWidth / ORIGINAL_WIDTH, containerHeight / originalTotalHeight)
      : containerWidth / ORIGINAL_WIDTH;

  const scaledWidth = ORIGINAL_WIDTH * scale;
  const scaledImageHeight = (ORIGINAL_WIDTH / imageAspectRatio) * scale;
  const scaledFooterHeight = ORIGINAL_FOOTER_HEIGHT * scale;

  const footerColor = imageMeta?.footerColor || '#FFFFFF';
  const textColor = imageMeta?.characterColor || '#000000';

  const isLoaded = originalSize.width !== 1 || originalSize.height !== 1;

  return (
    <div
      style={{
        width: scaledWidth,
        boxShadow: '0px 4px 8px 0px rgba(0,0,0,0.08)',
        borderRadius: '0.75rem',
        overflow: 'hidden',
      }}
    >
      {/* Banner image */}
      {isLoaded ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="Poster"
          style={{
            display: 'block',
            width: scaledWidth,
            height: scaledImageHeight,
            objectFit: 'cover',
          }}
        />
      ) : (
        <div
          className="bg-[var(--surface-glass-alt)]"
          style={{
            width: scaledWidth,
            height: scaledWidth,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
            {I18n.loading}
          </span>
        </div>
      )}

      {/* Footer with gradient */}
      <div
        className="relative flex items-center"
        style={{
          width: scaledWidth,
          height: scaledFooterHeight,
          background: imageMeta?.footerColor
            ? footerColor
            : 'linear-gradient(to bottom, #FFFFFF, #F5F5F5)',
        }}
      >
        {/* Left: avatar + info */}
        <div className="flex items-center" style={{ marginLeft: 16 * scale }}>
          {/* Avatar */}
          <div
            className="flex-shrink-0 overflow-hidden rounded-full"
            style={{ width: 32 * scale, height: 32 * scale }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl || '/images/default-avatar.svg'}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Name + Phone */}
          <div style={{ marginLeft: 7 * scale }}>
            <p
              className="font-[Montserrat,sans-serif] leading-tight font-semibold"
              style={{ fontSize: 9 * scale, color: textColor }}
            >
              {name && name.length > 0
                ? name
                : I18n.marketingDashboard.posterFooterPlaceholder.name}
            </p>
            <p
              className="font-[Montserrat,sans-serif] leading-tight"
              style={{ fontSize: 7 * scale, color: textColor }}
            >
              {phone && phone.length > 0
                ? phone
                : I18n.marketingDashboard.posterFooterPlaceholder.phone}
            </p>
          </div>
        </div>

        {/* Right: QR label + QR box (absolute positioned) */}
        <div
          className="flex items-center"
          style={{
            position: 'absolute',
            bottom: 8 * scale,
            right: 16 * scale,
          }}
        >
          <span
            className="font-[Montserrat,sans-serif]"
            style={{
              fontSize: 7 * scale,
              marginRight: 7 * scale,
              marginTop: 20 * scale,
              color: textColor,
            }}
          >
            {I18n.scanQr}
          </span>
          {qrDataUrl && (
            <div
              className="flex items-center justify-center bg-white"
              style={{
                width: 48 * scale,
                height: 48 * scale,
                padding: 6 * scale,
                borderRadius: 6 * scale,
                boxShadow: '0px 1.05px 1.05px 0px rgba(0,0,0,0.25)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="QR Code"
                style={{ width: 42 * scale, height: 42 * scale }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
