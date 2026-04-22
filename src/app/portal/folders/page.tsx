'use client';

import { useState, useEffect, useCallback } from 'react';
import { I18n } from '@/i18n';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { FolderModel } from '@/types';
import { StatusEnum, TypeEnum } from '@/types/enums';
import { Modal, Button, Input, Dropdown, Skeleton, NoData, Toast } from '@/components/ui';
import { CDN_URL } from '@/lib/api.config';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-[var(--glass-border)] hover:bg-[var(--surface-hover)] transition-colors">
      <td className="px-4 py-3 w-10">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {folder.templates?.[0]?.imageLink && (
            <img
              src={`${CDN_URL}${folder.templates[0].imageLink}`}
              alt=""
              className="w-10 h-10 rounded object-cover"
            />
          )}
          <span className="font-display font-bold text-[var(--text-primary)]">{folder.name}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
            folder.type === TypeEnum.SALE || folder.type === StatusEnum.SALE
              ? 'bg-[var(--primary)]/15 text-[var(--primary)] border-[var(--primary)]/40'
              : 'bg-[var(--accent-violet)]/15 text-[var(--accent-violet)] border-[var(--accent-violet)]/40'
          }`}
        >
          {folder.type === TypeEnum.SALE || folder.type === StatusEnum.SALE
            ? I18n.marketingDashboard.boostSales
            : I18n.marketingDashboard.teamDevelopment}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-[var(--text-muted)]">
        {folder.templates?.length ?? 0} {I18n.portal.posters.toLowerCase()}
      </td>
      <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{folder.order ?? '-'}</td>
      <td className="px-4 py-3">
        <button
          onClick={() => onEdit(folder)}
          className="text-[var(--primary)] hover:brightness-125 text-sm font-bold"
        >
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
    setOrderedFolders(folders);
  }, [folders]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderedFolders((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      // Persist order change would go here via API
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
    // In a real implementation, this would call an API
    setToast({
      message: editingFolder ? 'Đã cập nhật thư mục' : 'Đã tạo thư mục',
      type: 'success',
    });
    setShowModal(false);
  };

  const typeOptions = [
    { id: TypeEnum.SALE, title: I18n.marketingDashboard.boostSales, isSelected: formType === TypeEnum.SALE },
    { id: TypeEnum.RECRUIT, title: I18n.marketingDashboard.teamDevelopment, isSelected: formType === TypeEnum.RECRUIT },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
          <span className="w-1.5 h-7 rounded-full bg-linear-to-b from-orange-400 to-rose-500 shadow-[var(--glow-primary)]" />
          {I18n.portal.folders}
        </h1>
        <Button onClick={openCreateModal}>{I18n.portal.createFolder}</Button>
      </div>

      {/* Hint */}
      <p className="text-sm text-[var(--text-muted)] mb-4 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {I18n.portal.dragToReorder}
      </p>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : orderedFolders.length === 0 ? (
        <NoData />
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--glass-border)] bg-[var(--surface-hover)] text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="px-4 py-3 w-10"></th>
                  <th className="px-4 py-3">{I18n.portal.folderName}</th>
                  <th className="px-4 py-3">{I18n.portal.folderType}</th>
                  <th className="px-4 py-3">{I18n.portal.posters}</th>
                  <th className="px-4 py-3">{I18n.portal.folderOrder}</th>
                  <th className="px-4 py-3">{I18n.portal.actions}</th>
                </tr>
              </thead>
              <SortableContext items={orderedFolders.map((f) => f.id)} strategy={verticalListSortingStrategy}>
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingFolder ? I18n.portal.editFolder : I18n.portal.createFolder}>
        <div className="space-y-4">
          <Input
            label={I18n.portal.folderName}
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder={I18n.portal.folderName}
          />
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">{I18n.portal.folderType}</label>
            <Dropdown
              options={typeOptions}
              onSelect={(opt) => setFormType(opt.id as TypeEnum)}
            />
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
