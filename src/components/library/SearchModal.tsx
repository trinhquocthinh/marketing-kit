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
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FA875B] focus:border-transparent"
            autoFocus
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-[#FA875B] text-white rounded-lg text-sm font-medium hover:bg-[#e8764e] transition-colors"
          >
            {I18n.search}
          </button>
        </div>

        {hasSearched && (
          <p className="text-sm text-gray-500">
            {results.length} {I18n.marketingDashboard.topUsedPosters ? 'kết quả' : 'results'}
          </p>
        )}

        {hasSearched && results.length === 0 && (
          <NoData message={I18n.noData} />
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
            {results.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  handleClose();
                }}
                className="text-left rounded-lg border border-gray-200 p-2 hover:border-[#FA875B] hover:shadow-sm transition-all"
              >
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
