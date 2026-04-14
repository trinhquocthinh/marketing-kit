'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CDN_URL } from '@/lib/api.config';
import { I18n } from '@/i18n';
import { LabelEnum } from '@/types/enums';
import type { GroupTemplateModel } from '@/types';
import Marquee from '@/components/animations/Marquee';

interface ImageSliderProps {
  mostUsedImages: GroupTemplateModel[];
  onSelect: (item: GroupTemplateModel) => void;
}

export default function ImageSlider({ mostUsedImages, onSelect }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoPlay = useCallback(() => {
    if (mostUsedImages.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mostUsedImages.length);
    }, 2000);
  }, [mostUsedImages.length]);

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

  useEffect(() => {
    if (containerRef.current) {
      const scrollLeft = currentIndex * containerRef.current.offsetWidth;
      containerRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [currentIndex]);

  if (mostUsedImages.length === 0) return null;

  return (
    <div className="py-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 px-4">
        {I18n.marketingDashboard.topUsedPosters}
      </h3>
      <div
        ref={containerRef}
        className="flex overflow-x-hidden snap-x snap-mandatory scroll-smooth"
        onMouseEnter={stopAutoPlay}
        onMouseLeave={startAutoPlay}
      >
        {mostUsedImages.map((item, index) => {
          const marqueeText = item.labels?.find((l) => l.type === LabelEnum.MARQUEE)?.value || '';
          return (
            <div
              key={item.id ?? index}
              className="w-full flex-shrink-0 snap-center px-4 cursor-pointer"
              onClick={() => onSelect(item)}
            >
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={`${CDN_URL}${item.imageLink}`}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {marqueeText && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                    <Marquee text={marqueeText} />
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-gray-800 truncate">{item.name}</p>
            </div>
          );
        })}
      </div>
      {/* Pagination dots */}
      {mostUsedImages.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {mostUsedImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex ? 'bg-[#FA875B]' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
