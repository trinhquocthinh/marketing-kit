'use client';

import { useEffect } from 'react';

import { DndContext } from '@dnd-kit/core';
import { Minus, Plus } from 'lucide-react';

import PosterCanvasUI from '@/components/posters/PosterCanvasUI';
import { type CanvasEditorInitialData, useCanvasEditor } from '@/hooks/useCanvasEditor';

interface PosterEditorContainerProps extends CanvasEditorInitialData {
  imageUrl: string;
  /** Cho phép page lấy ref DOM để export qua `loadExportPoster()`. */
  onReady?: (api: { exportRef: React.RefObject<HTMLDivElement | null> }) => void;
}

/**
 * Container:
 *  - Gọi `useCanvasEditor` (business logic).
 *  - Bind state/handlers vào `PosterCanvasUI` + các control UI (zoom, form).
 *  - KHÔNG chứa style phức tạp — đẩy UI xuống presentational.
 */
export default function PosterEditorContainer({
  template,
  avatar,
  imageMeta,
  imageUrl,
  onReady,
}: PosterEditorContainerProps) {
  const {
    exportRef,
    avatarUrl,
    qrUrl,
    name,
    phone,
    imageMeta: editorImageMeta,
    zoom,
    layerOffsets,
    canZoomIn,
    canZoomOut,
    zoomIn,
    zoomOut,
    setName,
    setPhone,
    handleDragEnd,
  } = useCanvasEditor({ template, avatar, imageMeta });

  // Cho page lấy ref export khi cần — chạy sau mount để tránh truy cập ref trong render.
  useEffect(() => {
    onReady?.({ exportRef });
  }, [onReady, exportRef]);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col items-center gap-4">
        {/* Canvas */}
        <div className="w-full max-w-md">
          <PosterCanvasUI
            ref={exportRef}
            imageUrl={imageUrl}
            avatarUrl={avatarUrl}
            qrData={qrUrl}
            name={name}
            phone={phone}
            imageMeta={editorImageMeta}
            zoom={zoom}
            layerOffsets={layerOffsets}
            showQrPlaceholder={!qrUrl}
          />
        </div>

        {/* Zoom bar */}
        <div className="glass-bento flex items-center gap-4 !rounded-full !px-4 !py-2">
          <button
            type="button"
            onClick={zoomOut}
            disabled={!canZoomOut}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-glass-alt)] hover:text-[var(--text-strong)] disabled:opacity-30"
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <span className="w-12 text-center text-[10px] font-black tracking-widest text-[var(--text-secondary)] uppercase">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={zoomIn}
            disabled={!canZoomIn}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-glass-alt)] hover:text-[var(--text-strong)] disabled:opacity-30"
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Form inputs */}
        <div className="grid w-full max-w-md grid-cols-1 gap-3">
          <input
            type="text"
            placeholder="Tên"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="glass-input px-4 py-3"
          />
          <input
            type="tel"
            placeholder="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="glass-input px-4 py-3"
          />
        </div>
      </div>
    </DndContext>
  );
}
