'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Marquee from '@/components/animations/Marquee';
import BentoSectionHeading from '@/components/ui/BentoSectionHeading';
import { I18n } from '@/i18n';
import { CDN_URL } from '@/lib/api.config';
import type { GroupTemplateModel } from '@/types';
import { LabelEnum } from '@/types/enums';

import BannerWithFooter from '../posters/BannerWithFooter';

const GAP = 16; // px – matches gap-4
const CARD_PADDING = 32; // p-4 = 16px each side

interface ImageSliderProps {
  mostUsedImages: GroupTemplateModel[];
  onSelect: (item: GroupTemplateModel) => void;
}

export default function ImageSlider({ mostUsedImages, onSelect }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Start with 1 (mobile default) to match SSR output and avoid hydration mismatch
  const [itemsPerView, setItemsPerView] = useState(1);
  const [viewportWidth, setViewportWidth] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const count = mostUsedImages.length;
  const maxIndex = Math.max(0, count - itemsPerView);

  // Measure viewport pixel width for BannerWithFooter containerWidth
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      setViewportWidth(entries[0].contentRect.width);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Update items-per-view based on screen width
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setItemsPerView(4);
      else if (window.innerWidth >= 768) setItemsPerView(3);
      else setItemsPerView(1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const startAutoPlay = useCallback(() => {
    if (count <= itemsPerView) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);
  }, [count, itemsPerView, maxIndex]);

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoPlay();
    return stopAutoPlay;
  }, [startAutoPlay, stopAutoPlay]);

  if (count === 0) return null;

  const goTo = (index: number) => {
    stopAutoPlay();
    setCurrentIndex(Math.min(index, maxIndex));
    startAutoPlay();
  };

  // Derive a safe index without mutating state in an effect
  const displayIndex = Math.min(currentIndex, maxIndex);

  // Each item CSS width: fills container evenly with gaps
  const itemWidthStyle = `calc(${100 / itemsPerView}% - ${(GAP * (itemsPerView - 1)) / itemsPerView}px)`;

  // Per-item pixel width → content width inside card (subtract p-4 padding)
  const itemPixelWidth =
    viewportWidth > 0 ? (viewportWidth - GAP * (itemsPerView - 1)) / itemsPerView : 0;
  const contentPixelWidth = Math.max(0, itemPixelWidth - CARD_PADDING);
  // Fixed aspect ratio (≈ 380:547 matching original poster + footer proportions)
  const contentPixelHeight = contentPixelWidth > 0 ? Math.round(contentPixelWidth * 1.44) : 0;

  // Translation per step
  const translatePct = (displayIndex * 100) / itemsPerView;
  const translatePx = (displayIndex * GAP) / itemsPerView;

  return (
    <div className="space-y-4">
      <BentoSectionHeading title={I18n.marketingDashboard.topUsedPosters} variant="accent" />

      {/* Carousel viewport */}
      <div
        ref={viewportRef}
        className="relative w-full overflow-hidden"
        onMouseEnter={stopAutoPlay}
        onMouseLeave={startAutoPlay}
      >
        {/* Slides track */}
        <div
          className="flex gap-4 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(calc(-${translatePct}% - ${translatePx}px))` }}
        >
          {mostUsedImages.map((item, index) => {
            const marqueeText = item.labels?.find((l) => l.type === LabelEnum.MARQUEE)?.value || '';

            return (
              <div
                key={item.id ?? index}
                style={{ width: itemWidthStyle }}
                className="glass-bento glass-bento-interactive glass-shine group flex shrink-0 cursor-pointer flex-col !p-4"
                onClick={() => onSelect(item)}
              >
                {/* Poster: image on top, agent footer at bottom – fixed height for uniform cards */}
                <div
                  className="mb-3 flex items-start justify-center overflow-hidden"
                  style={{ height: contentPixelHeight > 0 ? contentPixelHeight : undefined }}
                >
                  {contentPixelWidth > 0 && (
                    <BannerWithFooter
                      url={`${CDN_URL}${item.imageLink}`}
                      containerWidth={contentPixelWidth}
                      containerHeight={contentPixelHeight}
                    />
                  )}
                </div>

                {/* Title + marquee below card */}
                <div className="mt-4 space-y-1.5">
                  {marqueeText && (
                    <Marquee
                      text={marqueeText}
                      className="h-3.5"
                      textClassName="text-xs leading-[14px] font-black tracking-wider text-[var(--danger)]"
                    />
                  )}
                  <div className="rounded-[var(--radius-bento-sm)] bg-[var(--surface-glass-alt)] p-3">
                    <h3 className="truncate text-sm font-black tracking-wide text-[var(--text-strong)] transition-colors group-hover:text-[var(--primary)]">
                      {item.name}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination dots */}
      {count > itemsPerView && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === displayIndex
                  ? 'w-8 shadow-[var(--shadow-glow-primary)]'
                  : 'w-2 bg-[var(--surface-glass-alt)]'
              }`}
              style={
                i === displayIndex
                  ? { background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)' }
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
