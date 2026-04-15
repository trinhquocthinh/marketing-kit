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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = mostUsedImages.length;

  // ── Auto-play every 2 seconds (matches RN autoPlayInterval: 2000) ──
  const startAutoPlay = useCallback(() => {
    if (count <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, 2000);
  }, [count]);

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
    setCurrentIndex(index);
    startAutoPlay();
  };

  return (
    <div className="py-6 space-y-4">
      {/* Section title – matches RN label style: fontSize Normal(16), fontWeight SemiBold */}
      <h3 className="text-base font-semibold text-black px-[15px] font-[Montserrat,sans-serif]">
        {I18n.marketingDashboard.topUsedPosters}
      </h3>

      {/* Carousel viewport */}
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={stopAutoPlay}
        onMouseLeave={startAutoPlay}
      >
        {/* Slides track – CSS transition for smooth sliding */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {mostUsedImages.map((item, index) => {
            const marqueeText = item.labels?.find((l) => l.type === LabelEnum.MARQUEE)?.value || '';

            return (
              <div
                key={item.id ?? index}
                className="w-full flex-shrink-0 px-4 cursor-pointer"
                onClick={() => onSelect(item)}
              >
                {/* Image card – aspect ratio 4:3, matching RN height: SCREEN_WIDTH * 0.75 */}
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={`${CDN_URL}${item.imageLink}`}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                {/* Title + marquee below image */}
                <div className="mt-2 space-y-0.5">
                  {marqueeText && (
                    <Marquee
                      text={marqueeText}
                      className="h-[14px]"
                      textClassName="text-xs leading-[14px] text-red-500"
                    />
                  )}
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination dots – matches RN dotStyle / activeDotStyle */}
      {count > 1 && (
        <div className="flex justify-center gap-2">
          {mostUsedImages.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex ? 'bg-[#FF8050]' : 'bg-[#C9C9C9]'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
