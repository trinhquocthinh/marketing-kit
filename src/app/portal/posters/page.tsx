'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Flame, ImagePlus, Plus } from 'lucide-react';

import Marquee from '@/components/animations/Marquee';
import { Button, DropdownV2, Input, Modal, NoData, Skeleton, Toast } from '@/components/ui';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { I18n } from '@/i18n';
import { CDN_URL } from '@/lib/api.config';
import { isExpiredDate } from '@/lib/marketing-dashboard.utils';
import { type GroupTemplateModel } from '@/types';
import { LabelEnum, TypeEnum } from '@/types/enums';

const brandGradient = 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)';

export default function PortalPostersPage() {
  const { folders, getFolders, isLoading } = useMarketingDashboard();
  const allPosters = useMemo(
    () =>
      folders.flatMap((folder) =>
        (folder.templates ?? []).map((t) => ({
          ...t,
          folderName: folder.name,
          folderId: folder.id,
        })),
      ),
    [folders],
  );
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPoster, setEditingPoster] = useState<GroupTemplateModel | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formFolderId, setFormFolderId] = useState<number | null>(null);
  const [_formType, setFormType] = useState<string>(TypeEnum.SALE);
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

  const filteredPosters = selectedFolderId
    ? allPosters.filter((p) => p.folderId === selectedFolderId)
    : allPosters;

  const selectedFolderLabel =
    selectedFolderId === null
      ? I18n.all
      : (folders.find((f) => f.id === selectedFolderId)?.name ?? I18n.all);
  const formFolderLabel = folders.find((f) => f.id === formFolderId)?.name ?? null;

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
    <div className="animate-bento-fade-up space-y-6">
      {/* Header */}
      <div className="glass-bento flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="bento-eyebrow mb-1">Quản trị</p>
          <h1 className="text-2xl font-black tracking-wide text-[var(--text-strong)] md:text-3xl">
            {I18n.portal.posters}
          </h1>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" strokeWidth={2.5} />
          {I18n.portal.createPoster}
        </Button>
      </div>

      {/* Filter */}
      <div className="glass-bento">
        <DropdownV2
          value={selectedFolderId === null ? '0' : String(selectedFolderId)}
          label={selectedFolderLabel}
          onSelect={(v) => setSelectedFolderId(v === '0' ? null : Number(v))}
        >
          <DropdownV2.TriggerButton />
          <DropdownV2.Content>
            <DropdownV2.Item value="0">{I18n.all}</DropdownV2.Item>
            {folders.map((f) => (
              <DropdownV2.Item key={f.id} value={String(f.id)}>
                {f.name}
              </DropdownV2.Item>
            ))}
          </DropdownV2.Content>
        </DropdownV2>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4]" />
          ))}
        </div>
      ) : filteredPosters.length === 0 ? (
        <div className="glass-bento flex min-h-[40vh] items-center justify-center">
          <NoData />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredPosters.map((poster) => {
            const expired = isExpiredDate(poster.validTo ?? null);
            return (
              <div
                key={poster.id}
                className={`glass-bento glass-bento-interactive glass-shine group cursor-pointer overflow-hidden !p-0 ${expired ? 'opacity-60' : ''}`}
                onClick={() => openEditModal(poster)}
              >
                <div className="relative aspect-[3/4]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${CDN_URL}${poster.imageLink}`}
                    alt={poster.name}
                    className="h-full w-full object-cover"
                  />
                  {expired && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--overlay-bg)] backdrop-blur-md">
                      <span
                        className="rounded-full px-4 py-1.5 text-[10px] font-black tracking-widest text-white uppercase shadow-lg"
                        style={{ background: 'var(--danger)' }}
                      >
                        {I18n.marketingDashboard.expired}
                      </span>
                    </div>
                  )}
                  {poster.labels?.some((l) => l.type === LabelEnum.HOT) && !expired && (
                    <span
                      className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black tracking-widest text-white uppercase shadow-[var(--shadow-glow-primary)]"
                      style={{ background: brandGradient }}
                    >
                      <Flame className="h-3 w-3" fill="currentColor" />
                      HOT
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <Marquee
                    text={poster.name}
                    minChars={20}
                    className="text-sm font-black text-[var(--text-strong)]"
                  />
                  <p className="mt-1 text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
                    {poster.folderName}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPoster ? I18n.portal.editPoster : I18n.portal.createPoster}
        size="lg"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left: Image */}
          <div>
            <label className="mb-2 block text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
              {I18n.portal.uploadImage}
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-[3/4] cursor-pointer items-center justify-center overflow-hidden rounded-[var(--radius-bento-sm)] border-2 border-dashed border-[var(--surface-glass-border)] bg-[var(--surface-glass-alt)] transition-colors hover:border-[var(--primary)]"
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center text-[var(--text-muted)]">
                  <ImagePlus className="mx-auto mb-2 h-10 w-10" strokeWidth={1.5} />
                  <p className="text-[10px] font-black tracking-widest uppercase">
                    {I18n.portal.uploadImage}
                  </p>
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
              <label className="mb-2 block text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
                {I18n.portal.posterFolder}
              </label>
              <DropdownV2
                value={formFolderId === null ? undefined : String(formFolderId)}
                label={formFolderLabel}
                onSelect={(v) => setFormFolderId(Number(v))}
              >
                <DropdownV2.TriggerButton placeholder={I18n.portal.posterFolder} />
                <DropdownV2.Content>
                  {folders.map((f) => (
                    <DropdownV2.Item key={f.id} value={String(f.id)}>
                      {f.name}
                    </DropdownV2.Item>
                  ))}
                </DropdownV2.Content>
              </DropdownV2>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
                {I18n.portal.posterEditable}
              </label>
              <button
                type="button"
                onClick={() => setFormEditable(!formEditable)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                style={{
                  background: formEditable ? brandGradient : 'var(--surface-glass-alt)',
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${formEditable ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
                  {I18n.portal.posterValidFrom}
                </label>
                <input
                  type="date"
                  value={formValidFrom}
                  onChange={(e) => setFormValidFrom(e.target.value)}
                  className="glass-input w-full rounded-full px-4 py-2.5 text-sm text-[var(--text-strong)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
                  {I18n.portal.posterValidTo}
                </label>
                <input
                  type="date"
                  value={formValidTo}
                  onChange={(e) => setFormValidTo(e.target.value)}
                  className="glass-input w-full rounded-full px-4 py-2.5 text-sm text-[var(--text-strong)] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
                  {I18n.portal.footerColor}
                </label>
                <div className="glass-input flex items-center gap-2 rounded-full px-3 py-1.5">
                  <input
                    type="color"
                    value={formFooterColor}
                    onChange={(e) => setFormFooterColor(e.target.value)}
                    className="h-7 w-7 cursor-pointer rounded-full border-0"
                  />
                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    {formFooterColor}
                  </span>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
                  {I18n.portal.characterColor}
                </label>
                <div className="glass-input flex items-center gap-2 rounded-full px-3 py-1.5">
                  <input
                    type="color"
                    value={formCharacterColor}
                    onChange={(e) => setFormCharacterColor(e.target.value)}
                    className="h-7 w-7 cursor-pointer rounded-full border-0"
                  />
                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    {formCharacterColor}
                  </span>
                </div>
              </div>
            </div>

            {/* Labels */}
            <div>
              <label className="mb-2 block text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
                {I18n.portal.posterLabels}
              </label>
              <div className="flex gap-2">
                {labelOptions.map((opt) => {
                  const active = formLabels.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleLabel(opt.value)}
                      className={`rounded-full px-3 py-1.5 text-[10px] font-black tracking-widest uppercase transition-all ${
                        active
                          ? 'text-white shadow-[var(--shadow-glow-primary)]'
                          : 'bg-[var(--surface-glass-alt)] text-[var(--text-secondary)] hover:bg-[var(--surface-glass)]'
                      }`}
                      style={active ? { background: brandGradient } : undefined}
                    >
                      {opt.label}
                    </button>
                  );
                })}
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
