'use client';

import { forwardRef } from 'react';

import type { CanvasLayerPosition } from '@/hooks/useCanvasEditor';
import type { ImageMeta } from '@/types';

import PosterCanvas from './PosterCanvas';

export interface PosterCanvasUIProps {
  imageUrl: string;
  avatarUrl: string;
  qrData: string;
  name: string;
  phone: string;
  imageMeta?: ImageMeta;
  showQrPlaceholder?: boolean;
  zoom?: number;
  /** Offsets do drag tạo ra — presentational chỉ map sang `style.transform`. */
  layerOffsets?: Record<string, CanvasLayerPosition>;
}

/**
 * Presentational wrapper — pure props-in/JSX-out.
 *
 * Hiện tại delegate sang `PosterCanvas` (đã là pure component từ trước).
 * Giữ layer chuyên biệt này để sau mở rộng (draggable layers, guide lines)
 * mà không làm bẩn `PosterCanvas` lõi.
 */
const PosterCanvasUI = forwardRef<HTMLDivElement, PosterCanvasUIProps>(function PosterCanvasUI(
  { layerOffsets: _layerOffsets, ...rest },
  ref,
) {
  // TODO: khi thêm dnd layers, map `layerOffsets[id]` thành transform cho từng layer con.
  return <PosterCanvas ref={ref} {...rest} />;
});

export default PosterCanvasUI;
