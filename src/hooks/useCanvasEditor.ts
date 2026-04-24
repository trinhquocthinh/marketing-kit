'use client';

import { useCallback, useRef, useState } from 'react';

import type { DragEndEvent } from '@dnd-kit/core';

import { useAuthStore } from '@/stores/useAuthStore';
import type { AvatarData, GroupTemplateModel, ImageMeta } from '@/types';

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

export interface CanvasEditorInitialData {
  template?: GroupTemplateModel;
  avatar?: AvatarData | null;
  imageMeta?: ImageMeta;
  /** Giá trị khởi tạo cho avatar URL. Ưu tiên hơn `avatar?.imageLink`. */
  initialAvatarUrl?: string;
  /** Giá trị khởi tạo cho phone. Nếu không set → lấy từ auth store. */
  initialPhone?: string;
}

export interface CanvasLayerPosition {
  x: number;
  y: number;
}

/**
 * Hook quản lý toàn bộ logic của Poster Editor:
 *  - Form state (name, phone, avatar url, qr url).
 *  - Zoom controls.
 *  - dnd-kit drag-end handler cho các layer trên canvas.
 *  - Ref tới DOM node dùng cho html2canvas export.
 *
 * KHÔNG trả JSX — chỉ state + handlers. Container sẽ bind chúng vào UI.
 */
export function useCanvasEditor(initial: CanvasEditorInitialData = {}) {
  // Auth state từ Zustand (thay cho Redux)
  const phoneFromAuth = useAuthStore((s) => s.phone) ?? '';

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(initial.initialPhone ?? phoneFromAuth);
  const [avatarUrl, setAvatarUrl] = useState(
    initial.initialAvatarUrl ?? initial.avatar?.imageLink ?? '',
  );
  const [qrUrl, setQrUrl] = useState('');

  // Zoom
  const [zoom, setZoom] = useState(1);
  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2))),
    [],
  );
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2))),
    [],
  );
  const resetZoom = useCallback(() => setZoom(1), []);

  // Positions của các layer — key = layerId, value = offset từ vị trí gốc
  const [layerOffsets, setLayerOffsets] = useState<Record<string, CanvasLayerPosition>>({});

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const id = String(event.active.id);
    const { x, y } = event.delta;
    setLayerOffsets((prev) => ({
      ...prev,
      [id]: {
        x: (prev[id]?.x ?? 0) + x,
        y: (prev[id]?.y ?? 0) + y,
      },
    }));
  }, []);

  const resetLayers = useCallback(() => setLayerOffsets({}), []);

  // Ref export — Container truyền xuống PosterCanvasUI; page-level handler gọi
  // `loadExportPoster()` rồi apply ref.current.
  const exportRef = useRef<HTMLDivElement>(null);

  return {
    // state
    name,
    phone,
    avatarUrl,
    qrUrl,
    zoom,
    layerOffsets,
    exportRef,
    imageMeta: initial.imageMeta,
    template: initial.template,

    // setters
    setName,
    setPhone,
    setAvatarUrl,
    setQrUrl,

    // zoom
    zoomIn,
    zoomOut,
    resetZoom,
    canZoomIn: zoom < ZOOM_MAX,
    canZoomOut: zoom > ZOOM_MIN,

    // dnd
    handleDragEnd,
    resetLayers,
  };
}

export type CanvasEditorApi = ReturnType<typeof useCanvasEditor>;
