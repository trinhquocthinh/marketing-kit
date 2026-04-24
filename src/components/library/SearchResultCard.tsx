'use client';

import { useEffect, useRef, useState } from 'react';

import { ImageIcon } from 'lucide-react';

import BannerWithFooter from '@/components/posters/BannerWithFooter';
import { CDN_URL } from '@/lib/api.config';
import type { GroupTemplateModel } from '@/types';

interface SearchResultCardProps {
  item: GroupTemplateModel;
  onClick: () => void;
}

export default function SearchResultCard({ item, onClick }: SearchResultCardProps) {
  const containerRef = useRef<HTMLButtonElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | null>(null);

  // Measure card width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Detect image orientation
  useEffect(() => {
    if (!item.imageLink) return;
    const img = new window.Image();
    img.onload = () => {
      setOrientation(img.naturalWidth > img.naturalHeight ? 'landscape' : 'portrait');
    };
    img.src = `${CDN_URL}${item.imageLink}`;
  }, [item.imageLink]);

  // Portrait: aspect 3/4, Landscape: aspect 4/3
  const aspectRatio = orientation === 'landscape' ? 4 / 3 : 3 / 4;
  const frameHeight = containerWidth > 0 ? containerWidth / aspectRatio : 0;

  return (
    <button
      ref={containerRef}
      onClick={onClick}
      className="glass-bento glass-bento-interactive glass-shine group flex h-full cursor-pointer flex-col !p-4 text-left"
    >
      <div
        className="relative mb-3 flex items-center justify-center overflow-hidden rounded-[var(--radius-bento-sm)] bg-[var(--surface-glass-alt)]"
        style={{
          height: frameHeight > 0 ? frameHeight : undefined,
          aspectRatio: frameHeight > 0 ? undefined : '3/4',
        }}
      >
        {item.imageLink && containerWidth > 0 ? (
          <BannerWithFooter
            url={`${CDN_URL}${item.imageLink}`}
            containerWidth={orientation === 'landscape' ? containerWidth : containerWidth}
            containerHeight={frameHeight}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon
              className="h-10 w-10 text-[var(--text-muted)] transition-transform group-hover:scale-110"
              strokeWidth={1.5}
            />
          </div>
        )}
        {item.labels?.[0] && (
          <div
            className="absolute top-2 left-2 z-10 rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-widest text-white uppercase shadow-[var(--shadow-glow-primary)]"
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            }}
          >
            {item.labels[0].value}
          </div>
        )}
      </div>
      <div className="mt-auto rounded-[var(--radius-bento-sm)] bg-[var(--surface-glass-alt)] p-3">
        <h3 className="truncate text-sm font-black tracking-wide text-[var(--text-strong)] transition-colors group-hover:text-[var(--primary)]">
          {item.name}
        </h3>
      </div>
    </button>
  );
}
