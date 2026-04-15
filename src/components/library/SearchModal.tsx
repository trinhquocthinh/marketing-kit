'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { I18n } from '@/i18n';
import type { GroupTemplateModel } from '@/types';
import { normalizeVietnamese } from '@/lib/marketing-dashboard.utils';
import { CDN_URL } from '@/lib/api.config';

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
        className="w-full h-[90vh] md:h-auto md:max-h-[85vh] max-w-5xl bg-slate-900/80 backdrop-blur-2xl border border-white/20 md:shadow-2xl rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 md:p-6 border-b border-white/10">
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            {I18n.search} mẫu thiết kế
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-5 md:p-6 border-b border-white/10 bg-black/20">
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value.slice(0, 100))}
                placeholder="Nhập tên mẫu, ví dụ: 'sức khỏe', 'tuyển dụng'..."
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-400/50 focus:ring-1 focus:ring-orange-400/50 transition-all text-base backdrop-blur-md"
              />
            </div>
            <button
              onClick={() => inputRef.current?.focus()}
              className="px-8 py-3.5 bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-semibold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              {I18n.search}
            </button>
          </div>
          <div className="mt-4 text-sm font-medium text-orange-200/80 pl-1">
            {searchText.trim()
              ? `${results.length} kết quả cho "${searchText}"`
              : `${allTemplates.length} kết quả hiển thị`}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 custom-scrollbar bg-white/5">
          {results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 pb-8">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    handleClose();
                  }}
                  className="text-left bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 cursor-pointer hover:bg-white/20 hover:border-orange-500/50 transition-all hover:-translate-y-1 group flex flex-col h-full shadow-lg"
                >
                  <div className="aspect-3/4 bg-linear-to-br from-slate-700 to-slate-800 rounded-xl mb-3 overflow-hidden relative">
                    {item.imageLink ? (
                      <Image
                        src={`${CDN_URL}${item.imageLink}`}
                        alt={item.name}
                        fill
                        className="group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-slate-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    {item.labels?.[0] && (
                      <div className="absolute top-2 left-2 bg-linear-to-r from-orange-500 to-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md">
                        {item.labels[0].value}
                      </div>
                    )}
                  </div>
                  <h3 className="text-white font-medium text-sm line-clamp-2 mt-auto group-hover:text-orange-300 transition-colors">
                    {item.name}
                  </h3>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-80">
              <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-xl text-white font-bold mb-2">Không tìm thấy mẫu thiết kế</p>
              <p className="text-slate-400 max-w-sm">
                Không có kết quả phù hợp cho &quot;{searchText}&quot;. Vui lòng thử lại với một từ khóa khác.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
