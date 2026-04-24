'use client';

import { useEffect, useRef, useState } from 'react';

import { Eye, ImageIcon } from 'lucide-react';

import BannerWithFooter from '@/components/posters/BannerWithFooter';
import { CDN_URL } from '@/lib/api.config';
import type { GroupTemplateModel } from '@/types';

interface TemplateListItemProps {
  item: GroupTemplateModel;
  onClick: () => void;
}

export default function TemplateListItem({ item, onClick }: TemplateListItemProps) {
  const thumbRef = useRef<HTMLDivElement>(null);
  const [thumbWidth, setThumbWidth] = useState(0);
  const [thumbHeight, setThumbHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = thumbRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setThumbWidth(entry.contentRect.width);
      setThumbHeight(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const validTo = item.validTo ? new Date(item.validTo).toLocaleDateString('vi-VN') : null;

  return (
    <div
      onClick={onClick}
      className="glass-bento glass-bento-interactive glass-shine group flex w-full cursor-pointer flex-row items-center gap-4 md:gap-6"
    >
      {/* Thumbnail */}
      <div
        ref={thumbRef}
        className="relative flex h-32 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-bento-sm)] bg-[var(--surface-glass-alt)] md:h-40 md:w-32"
      >
        {item.imageLink && thumbWidth > 0 ? (
          <BannerWithFooter
            url={`${CDN_URL}${item.imageLink}`}
            containerWidth={thumbWidth}
            containerHeight={thumbHeight}
          />
        ) : (
          <ImageIcon
            className="h-8 w-8 text-[var(--text-muted)] transition-transform duration-500 group-hover:scale-110 md:h-10 md:w-10"
            strokeWidth={1.5}
          />
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

      {/* Info */}
      <div className="flex h-full flex-1 flex-col py-1 md:py-2">
        <h3 className="mb-2 line-clamp-2 text-base leading-snug font-black tracking-wide text-[var(--text-strong)] transition-colors group-hover:text-[var(--primary)] md:text-lg">
          {item.name}
        </h3>
        {validTo && (
          <p className="mb-4 flex items-center gap-1.5 text-xs font-black tracking-widest text-[var(--text-muted)] uppercase">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--primary)' }}
            />
            Hết hạn: {validTo}
          </p>
        )}
        <div className="mt-auto flex gap-3">
          <button
            className="rounded-full px-4 py-2 text-xs font-black tracking-widest text-white uppercase shadow-[var(--shadow-glow-primary)] transition-all hover:scale-[1.02] active:scale-95 md:text-sm"
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            }}
          >
            Sử dụng mẫu
          </button>
          <button className="flex items-center gap-2 rounded-full bg-[var(--surface-glass-alt)] px-4 py-2 text-xs font-black tracking-widest text-[var(--text-secondary)] uppercase transition-colors hover:bg-[var(--surface-glass)] hover:text-[var(--text-strong)] md:text-sm">
            <Eye className="hidden h-4 w-4 sm:block" strokeWidth={2.5} />
            Xem trước
          </button>
        </div>
      </div>
    </div>
  );
}
