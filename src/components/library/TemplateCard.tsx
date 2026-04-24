'use client';

import Image from 'next/image';

import { format } from 'date-fns';

import Marquee from '@/components/animations/Marquee';
import { CDN_URL } from '@/lib/api.config';
import type { GroupTemplateModel } from '@/types';
import { LabelEnum } from '@/types/enums';

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
      className={`group block w-full text-left transition-all ${isExpired ? 'opacity-50 grayscale' : ''}`}
    >
      <div className="glass-bento glass-bento-interactive glass-shine relative overflow-hidden !p-2">
        {marqueeText && (
          <div
            className="absolute top-3 left-3 z-10 rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-widest text-white uppercase shadow-[var(--shadow-glow-primary)]"
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            }}
          >
            <Marquee text={marqueeText} minChars={8} />
          </div>
        )}
        <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-bento-sm)]">
          <Image
            src={`${CDN_URL}${item.imageLink}`}
            alt={item.name}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {item.imageMeta?.footerColor && (
            <div
              className="absolute right-0 bottom-0 left-0 h-[12%]"
              style={{ backgroundColor: item.imageMeta.footerColor }}
            />
          )}
        </div>
      </div>
      <p className="mt-2 line-clamp-2 px-1 text-center text-xs font-black tracking-wide text-[var(--text-strong)] transition-colors group-hover:text-[var(--primary)]">
        {item.name}
      </p>
      {item.validTo && (
        <p className="mt-0.5 text-center text-[10px] text-[var(--text-muted)]">
          {`HSD: ${format(new Date(item.validTo), 'dd/MM/yyyy')}`}
        </p>
      )}
    </button>
  );
}
