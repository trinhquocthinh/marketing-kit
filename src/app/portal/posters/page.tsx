'use client';

import { useState, useEffect, useRef } from 'react';
import { I18n } from '@/i18n';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { FolderModel, GroupTemplateModel } from '@/types';
import { TypeEnum, LabelEnum } from '@/types/enums';
import { Modal, Button, Input, Dropdown, Skeleton, NoData, Toast } from '@/components/ui';
import { CDN_URL } from '@/lib/api.config';
import Marquee from '@/components/animations/Marquee';
import { isExpiredDate } from '@/lib/marketing-dashboard.utils';

export default function PortalPostersPage() {
  const { folders, getFolders, isLoading } = useMarketingDashboard();
  const [allPosters, setAllPosters] = useState<(GroupTemplateModel & { folderName: string; folderId: number })[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPoster, setEditingPoster] = useState<GroupTemplateModel | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formFolderId, setFormFolderId] = useState<number | null>(null);
  const [formType, setFormType] = useState<string>(TypeEnum.SALE);
  const [formEditable, setFormEditable] = useState(true);
  const [formValidFrom, setFormValidFrom] = useState('');
  const [formValidTo, setFormValidTo] = useState('');
  const [formFooterColor, setFormFooterColor] = useState('#FFFFFF');
  const [formCharacterColor, setFormCharacterColor] = useState('#000000');
  const [formLabels, setFormLabels] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    getFolders();
  }, [getFolders]);

  useEffect(() => {
    const posters = folders.flatMap((folder) =>
      (folder.templates ?? []).map((t) => ({
        ...t,
        folderName: folder.name,
        folderId: folder.id,
      })),
    );
    setAllPosters(posters);
  }, [folders]);

  const filteredPosters = selectedFolderId
    ? allPosters.filter((p) => p.folderId === selectedFolderId)
    : allPosters;

  const folderOptions = [
    { id: '0', title: I18n.all, isSelected: selectedFolderId === null },
    ...folders.map((f) => ({ id: String(f.id), title: f.name, isSelected: selectedFolderId === f.id })),
  ];

  const labelOptions = [
    { value: LabelEnum.FEATURED, label: 'Featured' },
    { value: LabelEnum.HOT, label: 'HOT' },
  ];

  const openCreateModal = () => {
    setEditingPoster(null);
    setFormName('');
    setFormFolderId(folders[0]?.id ?? null);
    setFormType(TypeEnum.SALE);
    setFormEditable(true);
    setFormValidFrom('');
    setFormValidTo('');
    setFormFooterColor('#FFFFFF');
    setFormCharacterColor('#000000');
    setFormLabels([]);
    setPreviewUrl('');
    setShowModal(true);
  };

  const openEditModal = (poster: GroupTemplateModel & { folderId: number }) => {
    setEditingPoster(poster);
    setFormName(poster.name);
    setFormFolderId(poster.folderId);
    setFormEditable(poster.editable ?? true);
    setFormValidFrom(poster.validFrom ? poster.validFrom.split('T')[0] : '');
    setFormValidTo(poster.validTo ? poster.validTo.split('T')[0] : '');
    setFormFooterColor(poster.imageMeta?.footerColor ?? '#FFFFFF');
    setFormCharacterColor(poster.imageMeta?.characterColor ?? '#000000');
    setFormLabels(poster.labels?.map((l) => l.type) ?? []);
    setPreviewUrl(poster.imageLink ? `${CDN_URL}${poster.imageLink}` : '');
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    setToast({
      message: editingPoster ? 'Đã cập nhật mẫu thiết kế' : 'Đã tạo mẫu thiết kế',
      type: 'success',
    });
    setShowModal(false);
  };

  const toggleLabel = (value: string) => {
    setFormLabels((prev) =>
      prev.includes(value) ? prev.filter((l) => l !== value) : [...prev, value],
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{I18n.portal.posters}</h1>
        <Button onClick={openCreateModal}>{I18n.portal.createPoster}</Button>
      </div>

      {/* Filter */}
      <div className="mb-4 w-48">
        <Dropdown
          options={folderOptions}
          onSelect={(opt) => setSelectedFolderId(opt.id === '0' ? null : Number(opt.id))}
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      ) : filteredPosters.length === 0 ? (
        <NoData />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPosters.map((poster) => {
            const expired = isExpiredDate(poster.validTo ?? null);
            return (
              <div
                key={poster.id}
                className={`bg-white rounded-xl border overflow-hidden group cursor-pointer hover:shadow-md transition-shadow ${expired ? 'opacity-60' : ''}`}
                onClick={() => openEditModal(poster)}
              >
                <div className="aspect-[3/4] relative">
                  <img
                    src={`${CDN_URL}${poster.imageLink}`}
                    alt={poster.name}
                    className="w-full h-full object-cover"
                  />
                  {expired && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="text-white text-sm font-medium bg-red-500 px-3 py-1 rounded-full">
                        {I18n.marketingDashboard.expired}
                      </span>
                    </div>
                  )}
                  {poster.labels?.some((l) => l.type === LabelEnum.HOT) && !expired && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      HOT
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <Marquee text={poster.name} maxChars={20} className="text-sm font-medium text-gray-900" />
                  <p className="text-xs text-gray-500 mt-1">{poster.folderName}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingPoster ? I18n.portal.editPoster : I18n.portal.createPoster} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{I18n.portal.uploadImage}</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#FA875B] transition-colors overflow-hidden"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">{I18n.portal.uploadImage}</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Right: Fields */}
          <div className="space-y-4">
            <Input
              label={I18n.portal.posterName}
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder={I18n.portal.posterName}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{I18n.portal.posterFolder}</label>
              <Dropdown
                options={folders.map((f) => ({ id: String(f.id), title: f.name, isSelected: formFolderId === f.id }))}
                onSelect={(opt) => setFormFolderId(Number(opt.id))}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">{I18n.portal.posterEditable}</label>
              <button
                type="button"
                onClick={() => setFormEditable(!formEditable)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formEditable ? 'bg-[#FA875B]' : 'bg-gray-300'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formEditable ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{I18n.portal.posterValidFrom}</label>
                <input
                  type="date"
                  value={formValidFrom}
                  onChange={(e) => setFormValidFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FA875B]/50 focus:border-[#FA875B]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{I18n.portal.posterValidTo}</label>
                <input
                  type="date"
                  value={formValidTo}
                  onChange={(e) => setFormValidTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FA875B]/50 focus:border-[#FA875B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{I18n.portal.footerColor}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formFooterColor}
                    onChange={(e) => setFormFooterColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0"
                  />
                  <span className="text-sm text-gray-500">{formFooterColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{I18n.portal.characterColor}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formCharacterColor}
                    onChange={(e) => setFormCharacterColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0"
                  />
                  <span className="text-sm text-gray-500">{formCharacterColor}</span>
                </div>
              </div>
            </div>

            {/* Labels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{I18n.portal.posterLabels}</label>
              <div className="flex gap-2">
                {labelOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleLabel(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      formLabels.includes(opt.value)
                        ? 'bg-[#FA875B] text-white border-[#FA875B]'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-[#FA875B]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                {I18n.cancel}
              </Button>
              <Button onClick={handleSave} disabled={!formName.trim()}>
                {I18n.save}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
