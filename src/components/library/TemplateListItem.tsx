'use client';

import { useEffect, useRef, useState } from 'react';
import type { GroupTemplateModel } from '@/types';
import { CDN_URL } from '@/lib/api.config';
import BannerWithFooter from '@/components/posters/BannerWithFooter';

interface TemplateListItemProps {
  item: GroupTemplateModel;
  onClick: () => void;
}

export default function TemplateListItem({ item, onClick }: TemplateListItemProps) {
  const thumbRef = useRef<HTMLDivElement>(null);
  const [thumbWidth, setThumbWidth] = useState(0);

  useEffect(() => {
    const el = thumbRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setThumbWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const validTo = item.validTo
    ? new Date(item.validTo).toLocaleDateString('vi-VN')
    : null;

  return (
    <div
      onClick={onClick}
      className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-4 cursor-pointer hover:bg-[var(--surface-hover)] hover:border-[var(--primary)]/50 hover:shadow-[0_8px_30px_var(--shadow-color)] transition-all hover:-translate-y-1 group flex flex-row items-center gap-4 md:gap-6 soft-shadow w-full theme-transition"
    >
      {/* Thumbnail */}
      <div
        ref={thumbRef}
        className="w-24 h-32 md:w-32 md:h-40 bg-linear-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center overflow-hidden relative shrink-0"
      >
        {item.imageLink && thumbWidth > 0 ? (
          <BannerWithFooter
            url={`${CDN_URL}${item.imageLink}`}
            containerWidth={thumbWidth}
            containerHeight={thumbRef.current?.clientHeight ?? undefined}
          />
        ) : (
          <svg className="w-8 h-8 md:w-10 md:h-10 text-slate-500 group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 pointer-events-none" />
        {item.labels?.[0] && (
          <div className="absolute top-2 left-2 bg-linear-to-r from-orange-500 to-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md z-10">
            {item.labels[0].value}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col h-full py-1 md:py-2">
        <h3 className="text-[var(--text-primary)] font-semibold text-base md:text-lg line-clamp-2 group-hover:text-[var(--primary)] transition-colors leading-snug mb-2">
          {item.name}
        </h3>
        {validTo && (
          <p className="text-sm text-[var(--text-muted)] font-medium flex items-center gap-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Hết hạn: {validTo}
          </p>
        )}
        <div className="mt-auto flex gap-3">
          <button className="text-xs md:text-sm px-4 py-2 bg-linear-to-r from-orange-500 to-rose-500 rounded-lg text-white font-medium hover:opacity-90 shadow-md transition-opacity">
            Sử dụng mẫu
          </button>
          <button className="text-xs md:text-sm px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2">
            <svg className="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Xem trước
          </button>
        </div>
      </div>
    </div>
  );
}
