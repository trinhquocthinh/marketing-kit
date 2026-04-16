'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { I18n } from '@/i18n';
import type { GroupTemplateModel } from '@/types';
import { normalizeVietnamese } from '@/lib/marketing-dashboard.utils';
import SearchResultCard from './SearchResultCard';

interface SearchModalProps {
  folders: { templates: GroupTemplateModel[] }[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: GroupTemplateModel) => void;
}

export default function SearchModal({ folders, isOpen, onClose, onSelect }: SearchModalProps) {
  console.log("🚀 ~ SearchModal ~ folders:", folders)
  const [searchText, setSearchText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const allTemplates = folders.flatMap((f) => f.templates);

  const results = searchText.trim()
    ? allTemplates.filter((t) => normalizeVietnamese(t.name).includes(normalizeVietnamese(searchText)))
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
      className="fixed inset-0 z-9999 flex items-end md:items-start justify-center md:pt-20 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full h-[90vh] md:h-auto md:max-h-[85vh] max-w-5xl glass-card md:shadow-2xl rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col theme-transition"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 md:p-6 border-b border-[var(--border)]">
          <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] tracking-wide">
            {I18n.search} mẫu thiết kế
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-5 md:p-6 border-b border-[var(--border)] bg-[var(--input-bg)]">
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value.slice(0, 100))}
                placeholder="Nhập tên mẫu, ví dụ: 'sức khỏe', 'tuyển dụng'..."
                className="w-full pl-12 pr-4 py-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/50 transition-all text-base backdrop-blur-md"
              />
            </div>
            <button
              onClick={() => inputRef.current?.focus()}
              className="px-8 py-3.5 bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-semibold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              {I18n.search}
            </button>
          </div>
          <div className="mt-4 text-sm font-medium text-[var(--primary)] pl-1">
            {searchText.trim()
              ? `${results.length} kết quả cho "${searchText}"`
              : `${allTemplates.length} kết quả hiển thị`}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 custom-scrollbar bg-[var(--surface)] backdrop-blur-md">
          {results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 pb-8">
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
            <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-80">
              <div className="w-24 h-24 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-xl text-[var(--text-primary)] font-bold mb-2">Không tìm thấy mẫu thiết kế</p>
              <p className="text-[var(--text-muted)] max-w-sm">
                Không có kết quả phù hợp cho &quot;{searchText}&quot;. Vui lòng thử lại với một từ khóa khác.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
