'use client';

import dynamic from 'next/dynamic';

import type { ComponentProps, Ref } from 'react';

import Skeleton from '@/components/ui/Skeleton';

import type PosterCanvasComponent from './PosterCanvas';

/**
 * Lazy load `PosterCanvas` (kéo theo `qrcode` + peer của `html2canvas`).
 *
 * - `ssr: false`: component dùng canvas / DOM.
 * - Giữ nguyên API `ref` qua forwardRef.
 *
 * Lưu ý: Hàm `exportPosterAsBlob` (html2canvas ~200KB) được import **on-demand**
 * tại nơi gọi bằng `await import('./PosterCanvas').then(m => m.exportPosterAsBlob)`
 * để html2canvas chỉ nạp khi user bấm "Export" — không bundle vào initial chunk.
 */
const PosterCanvasLazy = dynamic(() => import('./PosterCanvas').then((mod) => mod.default), {
  ssr: false,
  loading: () => <Skeleton className="aspect-square w-full" />,
}) as unknown as React.ForwardRefExoticComponent<
  ComponentProps<typeof PosterCanvasComponent> & { ref?: Ref<HTMLDivElement> }
>;

export default PosterCanvasLazy;

/**
 * Helper lazy-load `exportPosterAsBlob`. Gọi tại onClick của nút Export.
 *
 * ```ts
 * const exportFn = await loadExportPoster();
 * const blob = await exportFn(canvasRef.current!);
 * ```
 */
export async function loadExportPoster() {
  const mod = await import('./PosterCanvas');
  return mod.exportPosterAsBlob;
}
