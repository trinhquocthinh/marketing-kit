'use client';

import { useState } from 'react';
import { I18n } from '@/i18n';
import type { GroupTemplateModel } from '@/types';
import { normalizeVietnamese } from '@/lib/marketing-dashboard.utils';
import Modal from '@/components/ui/Modal';
import NoData from '@/components/ui/NoData';

interface SearchModalProps {
  folders: { templates: GroupTemplateModel[] }[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: GroupTemplateModel) => void;
}

export default function SearchModal({ folders, isOpen, onClose, onSelect }: SearchModalProps) {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<GroupTemplateModel[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (searchText.trim() === '') {
      setResults([]);
      setHasSearched(false);
      return;
    }
    const query = normalizeVietnamese(searchText);
    const matched = folders
      .flatMap((f) => f.templates)
      .filter((t) => normalizeVietnamese(t.name).includes(query));
    setResults(matched);
    setHasSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClose = () => {
    setSearchText('');
    setResults([]);
    setHasSearched(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={I18n.search} size="lg">
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value.slice(0, 100));
              setHasSearched(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder={I18n.search + '...'}
            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50"
            autoFocus
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-linear-to-r from-orange-500 to-rose-500 text-white rounded-xl text-sm font-medium hover:from-orange-400 hover:to-rose-400 transition-colors"
          >
            {I18n.search}
          </button>
        </div>

        {hasSearched && (
          <p className="text-sm text-slate-400">
            {results.length} {I18n.marketingDashboard.topUsedPosters ? 'kết quả' : 'results'}
          </p>
        )}

        {hasSearched && results.length === 0 && (
          <NoData message={I18n.noData} />
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {results.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  handleClose();
                }}
                className="text-left rounded-2xl border border-white/10 bg-white/5 p-2 hover:border-orange-500/50 hover:bg-white/10 transition-all"
              >
                <p className="text-sm font-medium text-white truncate">{item.name}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
