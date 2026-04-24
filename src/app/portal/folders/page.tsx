'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Info, Pencil, Plus } from 'lucide-react';

import { Button, DropdownV2, Input, Modal, NoData, Skeleton, Toast } from '@/components/ui';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { I18n } from '@/i18n';
import { CDN_URL } from '@/lib/api.config';
import { type FolderModel } from '@/types';
import { StatusEnum, TypeEnum } from '@/types/enums';

function SortableFolderRow({
  folder,
  onEdit,
}: {
  folder: FolderModel;
  onEdit: (f: FolderModel) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: folder.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSale = folder.type === TypeEnum.SALE || folder.type === StatusEnum.SALE;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-[var(--surface-glass-border)] transition-colors hover:bg-[var(--surface-glass-alt)]"
    >
      <td className="w-10 px-4 py-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)] active:cursor-grabbing"
          aria-label="Drag"
        >
          <GripVertical className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {folder.templates?.[0]?.imageLink && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${CDN_URL}${folder.templates[0].imageLink}`}
              alt=""
              className="h-10 w-10 rounded-[var(--radius-bento-sm)] object-cover"
            />
          )}
          <span className="font-black text-[var(--text-strong)]">{folder.name}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase ${
            isSale
              ? 'bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]'
              : 'bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)]'
          }`}
        >
          {isSale ? I18n.marketingDashboard.boostSales : I18n.marketingDashboard.teamDevelopment}
        </span>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
        {folder.templates?.length ?? 0} {I18n.portal.posters.toLowerCase()}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
        {folder.order ?? '-'}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onEdit(folder)}
          className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest text-[var(--primary)] uppercase transition-colors hover:text-[var(--accent)]"
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={2.5} />
          {I18n.edit}
        </button>
      </td>
    </tr>
  );
}

export default function PortalFoldersPage() {
  const { folders, getFolders, isLoading } = useMarketingDashboard();
  const [orderedFolders, setOrderedFolders] = useState<FolderModel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderModel | null>(null);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<TypeEnum>(TypeEnum.SALE);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    getFolders();
  }, [getFolders]);

  useEffect(() => {
    Promise.resolve().then(() => setOrderedFolders(folders));
  }, [folders]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderedFolders((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      return reordered;
    });

    setToast({ message: 'Thứ tự đã được cập nhật', type: 'success' });
  }, []);

  const openCreateModal = () => {
    setEditingFolder(null);
    setFormName('');
    setFormType(TypeEnum.SALE);
    setShowModal(true);
  };

  const openEditModal = (folder: FolderModel) => {
    setEditingFolder(folder);
    setFormName(folder.name);
    setFormType(folder.type as TypeEnum);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    setToast({
      message: editingFolder ? 'Đã cập nhật thư mục' : 'Đã tạo thư mục',
      type: 'success',
    });
    setShowModal(false);
  };

  const typeLabels: Record<TypeEnum, string> = {
    [TypeEnum.SALE]: I18n.marketingDashboard.boostSales,
    [TypeEnum.RECRUIT]: I18n.marketingDashboard.teamDevelopment,
  };

  return (
    <div className="animate-bento-fade-up space-y-6">
      {/* Header */}
      <div className="glass-bento flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="bento-eyebrow mb-1">Quản trị</p>
          <h1 className="text-2xl font-black tracking-wide text-[var(--text-strong)] md:text-3xl">
            {I18n.portal.folders}
          </h1>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" strokeWidth={2.5} />
          {I18n.portal.createFolder}
        </Button>
      </div>

      {/* Hint */}
      <p className="flex items-center gap-2 px-2 text-xs font-medium text-[var(--text-muted)]">
        <Info className="h-4 w-4" strokeWidth={2} />
        {I18n.portal.dragToReorder}
      </p>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : orderedFolders.length === 0 ? (
        <div className="glass-bento flex min-h-[40vh] items-center justify-center">
          <NoData />
        </div>
      ) : (
        <div className="glass-bento overflow-hidden !p-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--surface-glass-border)] bg-[var(--surface-glass-alt)] text-left text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
                  <th className="w-10 px-4 py-3" />
                  <th className="px-4 py-3">{I18n.portal.folderName}</th>
                  <th className="px-4 py-3">{I18n.portal.folderType}</th>
                  <th className="px-4 py-3">{I18n.portal.posters}</th>
                  <th className="px-4 py-3">{I18n.portal.folderOrder}</th>
                  <th className="px-4 py-3">{I18n.portal.actions}</th>
                </tr>
              </thead>
              <SortableContext
                items={orderedFolders.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody>
                  {orderedFolders.map((folder) => (
                    <SortableFolderRow key={folder.id} folder={folder} onEdit={openEditModal} />
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </DndContext>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingFolder ? I18n.portal.editFolder : I18n.portal.createFolder}
      >
        <div className="space-y-4">
          <Input
            label={I18n.portal.folderName}
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder={I18n.portal.folderName}
          />
          <div>
            <label className="mb-2 block text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
              {I18n.portal.folderType}
            </label>
            <DropdownV2
              value={formType}
              label={typeLabels[formType]}
              onSelect={(v) => setFormType(v as TypeEnum)}
            >
              <DropdownV2.TriggerButton />
              <DropdownV2.Content>
                <DropdownV2.Item value={TypeEnum.SALE}>
                  {I18n.marketingDashboard.boostSales}
                </DropdownV2.Item>
                <DropdownV2.Item value={TypeEnum.RECRUIT}>
                  {I18n.marketingDashboard.teamDevelopment}
                </DropdownV2.Item>
              </DropdownV2.Content>
            </DropdownV2>
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
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
