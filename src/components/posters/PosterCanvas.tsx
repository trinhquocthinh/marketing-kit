'use client';

import { useEffect, useState, forwardRef } from 'react';
import QRCode from 'qrcode';
import { I18n } from '@/i18n';
import type { ImageMeta } from '@/types';

// ── Constants matching RN AliasGenerate layout ──
// RN: footer = 40px, avatar = 32x32, qr box = 50x50, qr img = 42x42
const FOOTER_HEIGHT_RATIO = 0.1; // ~40/400
const AVATAR_SIZE_RATIO = 0.08; // ~32/400
const QR_BOX_SIZE_RATIO = 0.125; // ~50/400
const QR_IMG_SIZE_RATIO = 0.105; // ~42/400

interface PosterCanvasProps {
  imageUrl: string;
  avatarUrl: string;
  qrData: string;
  name: string;
  phone: string;
  imageMeta: ImageMeta;
  showQrPlaceholder?: boolean;
  zoom?: number;
}

const PosterCanvas = forwardRef<HTMLDivElement, PosterCanvasProps>(
  function PosterCanvas(
    {
      imageUrl,
      avatarUrl,
      qrData,
      name,
      phone,
      imageMeta,
      showQrPlaceholder = false,
      zoom = 1,
    },
    ref,
  ) {
    const [qrDataUrl, setQrDataUrl] = useState<string>('');

    const footerColor = imageMeta?.footerColor || '#FFFFFF';
    const textColor = imageMeta?.characterColor || '#000000';

    useEffect(() => {
      const generateQr = async () => {
        if (showQrPlaceholder) {
          const url = await QRCode.toDataURL('https://example.com', {
            width: 168,
            margin: 1,
            color: { dark: '#CCCCCC', light: '#FFFFFF' },
          });
          setQrDataUrl(url);
        } else if (qrData) {
          const url = await QRCode.toDataURL(qrData, {
            width: 168,
            margin: 1,
          });
          setQrDataUrl(url);
        }
      };
      generateQr();
    }, [qrData, showQrPlaceholder]);

    return (
      <div
        ref={ref}
        className="relative inline-block bg-white origin-top-left transition-transform duration-200"
        style={{ transform: `scale(${zoom})` }}
      >
        {/* Template background image */}
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Poster template"
            className="block w-full h-auto"
          />
        </div>

        {/* Footer – matches RN: footerColor rect, POSTER_TEMPLATE_FOOTER_HEIGHT (40px base) */}
        <div
          className="relative flex items-center justify-between"
          style={{
            backgroundColor: footerColor,
            paddingTop: '1%',
            paddingBottom: '1%',
            paddingLeft: '4%',
            paddingRight: '4%',
            minHeight: '10%',
          }}
        >
          {/* Left: Avatar + Name + Phone */}
          <div className="flex items-center gap-[3%]">
            {/* Avatar – 32x32 in RN base */}
            <div
              className="rounded-full overflow-hidden border border-gray-200 shrink-0"
              style={{
                width: `${AVATAR_SIZE_RATIO * 100}cqw`,
                height: `${AVATAR_SIZE_RATIO * 100}cqw`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              {/* Name – Montserrat-SemiBold, 8pt base */}
              <p
                className="font-semibold leading-tight font-[Montserrat,sans-serif]"
                style={{
                  color: textColor,
                  fontSize: 'clamp(6px, 2.2cqw, 14px)',
                }}
              >
                {name}
              </p>
              {/* Phone – Montserrat-Regular, 7pt base */}
              <p
                className="leading-tight font-[Montserrat,sans-serif]"
                style={{
                  color: textColor,
                  fontSize: 'clamp(5px, 1.8cqw, 12px)',
                }}
              >
                {phone}
              </p>
            </div>
          </div>

          {/* Right: "Quét mã QR" label + QR code in white box */}
          <div className="flex items-center gap-[2%]">
            <span
              className="font-[Montserrat,sans-serif] hidden sm:block"
              style={{
                color: textColor,
                fontSize: 'clamp(5px, 1.8cqw, 11px)',
              }}
            >
              {I18n.scanQr}
            </span>

            {/* QR white box – overlapping footer/image boundary, shadow, rounded */}
            {qrDataUrl && (
              <div
                className="bg-white rounded-md shadow-md flex items-center justify-center shrink-0"
                style={{
                  width: `${QR_BOX_SIZE_RATIO * 100}cqw`,
                  height: `${QR_BOX_SIZE_RATIO * 100}cqw`,
                  padding: `${(QR_BOX_SIZE_RATIO - QR_IMG_SIZE_RATIO) * 50}cqw`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="QR Code" className="w-full h-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

export default PosterCanvas;

/** Export poster as JPEG blob using html2canvas */
export async function exportPosterAsBlob(element: HTMLElement): Promise<Blob> {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(element, {
    useCORS: true,
    scale: 2,
    backgroundColor: null,
  });
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      },
      'image/jpeg',
      0.7,
    );
  });
}
