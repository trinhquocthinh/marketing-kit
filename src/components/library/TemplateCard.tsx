'use client';

import Image from 'next/image';
import { CDN_URL } from '@/lib/api.config';
import { LabelEnum } from '@/types/enums';
import type { GroupTemplateModel, ImageMeta } from '@/types';
import Marquee from '@/components/animations/Marquee';
import { format } from 'date-fns';

interface TemplateCardProps {
  item: GroupTemplateModel;
  onClick: () => void;
}

export default function TemplateCard({ item, onClick }: TemplateCardProps) {
  const marqueeText = item.labels?.find((l) => l.type === LabelEnum.MARQUEE)?.value || '';
  const isExpired = item.validTo ? new Date(item.validTo) < new Date() : false;

  return (
    <button
      onClick={onClick}
      className={`group text-left transition-all ${isExpired ? 'opacity-50 grayscale' : ''}`}
    >
      <div className="glass-card glass-card-hover relative rounded-2xl overflow-hidden theme-transition">
        {marqueeText && (
          <div className="absolute top-1 left-1 z-10 bg-linear-to-r from-rose-500 to-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-[var(--glow-rose)]">
            <Marquee text={marqueeText} minChars={8} />
          </div>
        )}
        <div className="relative w-full aspect-square">
          <Image
            src={`${CDN_URL}${item.imageLink}`}
            alt={item.name}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {/* Footer preview */}
          {item.imageMeta?.footerColor && (
            <div
              className="absolute bottom-0 left-0 right-0 h-[12%]"
              style={{ backgroundColor: item.imageMeta.footerColor }}
            />
          )}
        </div>
      </div>
      <p className="mt-2 text-xs font-semibold text-[var(--text-primary)] text-center line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
        {item.name}
      </p>
      {item.validTo && (
        <p className="text-[10px] text-[var(--text-muted)] text-center mt-0.5">
          {`HSD: ${format(new Date(item.validTo), 'dd/MM/yyyy')}`}
        </p>
      )}
    </button>
  );
}
