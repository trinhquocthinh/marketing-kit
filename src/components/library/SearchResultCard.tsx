'use client';

import { useEffect, useRef, useState } from 'react';
import type { GroupTemplateModel } from '@/types';
import { CDN_URL } from '@/lib/api.config';
import BannerWithFooter from '@/components/posters/BannerWithFooter';

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
            className="text-left bg-[var(--surface)] backdrop-blur-md border border-[var(--border)] rounded-2xl p-4 cursor-pointer hover:bg-[var(--surface-hover)] hover:border-[var(--primary)]/50 transition-all hover:-translate-y-1 group flex flex-col h-full soft-shadow theme-transition"
        >
            <div
                className="bg-linear-to-br from-slate-700 to-slate-800 rounded-xl mb-3 overflow-hidden relative flex items-center justify-center"
                style={{ height: frameHeight > 0 ? frameHeight : undefined, aspectRatio: frameHeight > 0 ? undefined : '3/4' }}
            >
                {item.imageLink && containerWidth > 0 ? (
                    <BannerWithFooter
                        url={`${CDN_URL}${item.imageLink}`}
                        containerWidth={orientation === 'landscape' ? containerWidth : containerWidth}
                        containerHeight={frameHeight}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-slate-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                {item.labels?.[0] && (
                    <div className="absolute top-2 left-2 bg-linear-to-r from-orange-500 to-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md z-10">
                        {item.labels[0].value}
                    </div>
                )}
            </div>
            <div className='mt-auto bg-[var(--surface-hover)] backdrop-blur-sm p-3 rounded-xl border border-[var(--border)] group-hover:bg-[var(--surface)] transition-colors'>
                <h3 className="text-[14px] text-[var(--text-primary)] font-semibold truncate group-hover:text-[var(--primary)] transition-colors">{item.name}</h3>
            </div>
        </button>
    );
}
