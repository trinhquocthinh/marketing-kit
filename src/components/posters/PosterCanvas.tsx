'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { I18n } from '@/i18n';
import type { ImageMeta } from '@/types';

interface PosterCanvasProps {
  imageUrl: string;
  avatarUrl: string;
  qrData: string;
  name: string;
  phone: string;
  imageMeta: ImageMeta;
  showQrPlaceholder?: boolean;
}

export default function PosterCanvas({
  imageUrl,
  avatarUrl,
  qrData,
  name,
  phone,
  imageMeta,
  showQrPlaceholder = false,
}: PosterCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);

  const footerColor = imageMeta?.footerColor || '#FFFFFF';
  const textColor = imageMeta?.characterColor || '#000000';

  useEffect(() => {
    const generateQr = async () => {
      if (showQrPlaceholder) {
        // Generate a placeholder QR
        const url = await QRCode.toDataURL('https://example.com', {
          width: 128,
          margin: 1,
          color: { dark: '#CCCCCC', light: '#FFFFFF' },
        });
        setQrDataUrl(url);
      } else if (qrData) {
        const url = await QRCode.toDataURL(qrData, {
          width: 128,
          margin: 1,
        });
        setQrDataUrl(url);
      }
    };
    generateQr();
  }, [qrData, showQrPlaceholder]);

  return (
    <div ref={containerRef} className="relative inline-block bg-white">
      {/* Template image */}
      <div className="relative">
        <img
          src={imageUrl}
          alt="Poster template"
          className="block w-full h-auto"
          onLoad={() => setImageLoaded(true)}
          crossOrigin="anonymous"
        />
      </div>

      {/* Footer overlay */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ backgroundColor: footerColor, minHeight: '48px' }}
      >
        {/* Left: Avatar + Name/Phone */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          </div>
          <div>
            <p className="text-xs font-semibold leading-tight" style={{ color: textColor }}>
              {name}
            </p>
            <p className="text-[10px] leading-tight" style={{ color: textColor }}>
              {phone}
            </p>
          </div>
        </div>

        {/* Right: QR Code + scan text */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] hidden sm:block" style={{ color: textColor }}>
            {I18n.scanQr}
          </span>
          {qrDataUrl && (
            <div className="w-10 h-10 bg-white rounded p-0.5 shadow-sm">
              <img src={qrDataUrl} alt="QR Code" className="w-full h-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
