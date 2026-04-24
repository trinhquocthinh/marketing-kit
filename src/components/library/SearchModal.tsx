'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Search, SearchX, X } from 'lucide-react';

import Button from '@/components/ui/Button';
import { I18n } from '@/i18n';
import { normalizeVietnamese } from '@/lib/marketing-dashboard.utils';
import type { GroupTemplateModel } from '@/types';

import SearchResultCard from './SearchResultCard';

interface SearchModalProps {
  folders: { templates: GroupTemplateModel[] }[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: GroupTemplateModel) => void;
}

export default function SearchModal({ folders, isOpen, onClose, onSelect }: SearchModalProps) {
  const [searchText, setSearchText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const allTemplates = folders.flatMap((f) => f.templates);

  const results = searchText.trim()
    ? allTemplates.filter((t) =>
        normalizeVietnamese(t.name).includes(normalizeVietnamese(searchText)),
      )
    : allTemplates;

  const handleClose = useCallback(() => {
    setSearchText('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-end justify-center bg-(--overlay-bg) p-0 backdrop-blur-md md:items-start md:p-6 md:pt-20"
      onClick={handleClose}
    >
      <div
        className="glass-bento flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-(--radius-bento-lg)! !p-0 md:h-auto md:max-h-[85vh] md:!rounded-[var(--radius-bento-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--surface-glass-border) p-5 md:p-6">
          <div>
            <p className="bento-eyebrow mb-1.5">Tìm kiếm</p>
            <h2 className="text-2xl font-black tracking-wide text-t-strong">
              {I18n.search} mẫu thiết kế
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-(--surface-glass-alt) text-t-muted transition-all hover:scale-105 hover:bg-surface-glass hover:text-[var(--text-strong)] active:scale-95"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Search Input */}
        <div className="border-b border-(--surface-glass-border) p-5 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-t-muted"
                strokeWidth={2}
              />
              <input
                ref={inputRef}
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value.slice(0, 100))}
                placeholder="Nhập tên mẫu, ví dụ: 'sức khỏe', 'tuyển dụng'..."
                className="glass-input w-full rounded-full! py-2 pl-12! text-base"
              />
            </div>
            <Button
              variant="primary"
              onClick={() => inputRef.current?.focus()}
              className="shrink-0"
            >
              {I18n.search}
            </Button>
          </div>
          <p className="mt-4 pl-1 text-[11px] font-black tracking-widest text-[var(--primary)] uppercase">
            {searchText.trim()
              ? `${results.length} kết quả cho "${searchText}"`
              : `${allTemplates.length} kết quả hiển thị`}
          </p>
        </div>

        {/* Results */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-5 md:p-6">
          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 pb-8 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
              {results.map((item) => (
                <SearchResultCard
                  key={item.id}
                  item={item}
                  onClick={() => {
                    onSelect(item);
                    handleClose();
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-full shadow-inner-soft"
                style={{
                  background:
                    'color-mix(in srgb, var(--text-muted) 15%, var(--surface-glass-alt))',
                }}
              >
                <SearchX className="h-8 w-8 text-[var(--text-muted)]" strokeWidth={1.75} />
              </div>
              <p className="mb-2 text-xl font-black text-[var(--text-strong)]">
                Không tìm thấy mẫu thiết kế
              </p>
              <p className="max-w-sm text-sm text-[var(--text-muted)]">
                Không có kết quả phù hợp cho &quot;{searchText}&quot;. Vui lòng thử lại với một từ
                khóa khác.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
