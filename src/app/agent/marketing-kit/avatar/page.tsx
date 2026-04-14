'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { I18n } from '@/i18n';
import { CDN_URL } from '@/lib/api.config';
import { AvatarStatusOption } from '@/types/enums';
import type { AvatarData } from '@/types';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { mapAvatarResponseToOptions } from '@/lib/marketing-dashboard.utils';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';

interface AvatarOption {
  id: number;
  imageLink: string;
  agentCode: string | null;
  avatarStatusOption?: AvatarStatusOption;
  isDefault?: boolean;
  isSelected?: boolean;
  isSelectedDelete?: boolean;
  approved?: boolean;
}

export default function AvatarManagementPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    isLoading,
    getAvatar,
    createAvatar,
    uploadAvatarImage,
    updateAvatar,
    avatarDeleteBatch,
  } = useMarketingDashboard();

  const [patternAvatars, setPatternAvatars] = useState<AvatarOption[]>([]);
  const [yourAvatars, setYourAvatars] = useState<AvatarOption[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const loadAvatars = useCallback(async () => {
    const res = await getAvatar();
    const avatarData: AvatarData[] = res?.data || [];
    if (avatarData.length > 0) {
      const patterns = avatarData.filter((a) => a.agentCode === null);
      const yours = avatarData.filter((a) => a.agentCode !== null);
      setPatternAvatars(mapAvatarResponseToOptions(patterns) as AvatarOption[]);
      setYourAvatars(mapAvatarResponseToOptions(yours) as AvatarOption[]);
    }
  }, [getAvatar]);

  useEffect(() => {
    loadAvatars();
  }, [loadAvatars]);

  const handleSelectPattern = (item: AvatarOption) => {
    setPatternAvatars((prev) => prev.map((a) => ({ ...a, isSelected: a.id === item.id })));
    // Update as default
    updateAvatar(item.id, {
      imageLink: item.imageLink,
      imageMeta: {},
      isApproved: true,
      isDefault: true,
    });
    router.back();
  };

  const handleSelectYour = (item: AvatarOption) => {
    if (isDeleteMode) {
      setYourAvatars((prev) =>
        prev.map((a) =>
          a.id === item.id ? { ...a, isSelectedDelete: !a.isSelectedDelete } : a,
        ),
      );
    } else {
      updateAvatar(item.id, {
        imageLink: item.imageLink,
        imageMeta: {},
        isApproved: item.avatarStatusOption === AvatarStatusOption.Reviewed,
        isDefault: true,
      });
      router.back();
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(I18n.marketingDashboard.maxFileSize);
      return;
    }

    setIsUploading(true);
    try {
      const uploadRes = await uploadAvatarImage({
        file,
        fileName: `avatar_${Date.now()}.png`,
      });
      if (!uploadRes?.data) throw new Error('Upload failed');

      await createAvatar({
        imageLink: uploadRes.data,
        imageMeta: {},
        isApproved: false,
      });

      await loadAvatars();
    } catch (err) {
      console.error('Avatar upload error:', err);
      alert('Có lỗi xảy ra khi tải ảnh lên.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteSelected = async () => {
    const ids = yourAvatars.filter((a) => a.isSelectedDelete).map((a) => a.id);
    if (ids.length === 0) return;

    await avatarDeleteBatch({ ids });
    await loadAvatars();
    setIsDeleteMode(false);
    setDeleteConfirmOpen(false);
  };

  const selectedDeleteCount = yourAvatars.filter((a) => a.isSelectedDelete).length;

  const statusBadge = (status?: AvatarStatusOption) => {
    switch (status) {
      case AvatarStatusOption.Reviewed:
        return (
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </span>
        );
      case AvatarStatusOption.Waiting:
        return (
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3" />
            </svg>
          </span>
        );
      case AvatarStatusOption.Rejected:
        return (
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading && patternAvatars.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-semibold text-gray-900">{I18n.marketingDashboard.avatarManagement}</h2>
      </div>

      {/* Pattern Avatars */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Mẫu đại diện</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {patternAvatars.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectPattern(item)}
              className={`relative rounded-full overflow-hidden border-2 transition-all aspect-square ${
                item.isSelected ? 'border-[#FA875B] ring-2 ring-[#FA875B]/30' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={`${CDN_URL}${item.imageLink}`}
                alt="Pattern avatar"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Your Avatars */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-gray-900">{I18n.marketingDashboard.avatarManagement}</h3>
          <span className="text-xs text-gray-400">{I18n.marketingDashboard.maxFileSize}</span>
        </div>

        {yourAvatars.length >= 10 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 text-xs text-yellow-700">
            {I18n.marketingDashboard.maxAvatars}
          </div>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {/* Add button */}
          {yourAvatars.length < 10 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="aspect-square rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-[#FA875B] hover:bg-orange-50 transition-colors"
            >
              {isUploading ? (
                <svg className="w-6 h-6 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          )}

          {yourAvatars.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectYour(item)}
              className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all ${
                isDeleteMode && item.isSelectedDelete
                  ? 'border-red-500 ring-2 ring-red-300'
                  : item.isSelected
                    ? 'border-[#FA875B] ring-2 ring-[#FA875B]/30'
                    : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={`${CDN_URL}${item.imageLink}`}
                alt="Your avatar"
                className="w-full h-full object-cover"
              />
              {statusBadge(item.avatarStatusOption)}
              {isDeleteMode && item.isSelectedDelete && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex gap-3 pt-2">
        {!isDeleteMode ? (
          yourAvatars.some((a) => a.approved) && (
            <Button variant="danger" onClick={() => {
              setIsDeleteMode(true);
              setYourAvatars((prev) =>
                prev.map((a) => ({
                  ...a,
                  isSelectedDelete:
                    a.avatarStatusOption === AvatarStatusOption.Waiting ? undefined : false,
                })),
              );
            }}>
              {I18n.delete}
            </Button>
          )
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteMode(false);
                setYourAvatars((prev) => prev.map((a) => ({ ...a, isSelectedDelete: undefined })));
              }}
            >
              Thoát
            </Button>
            <Button
              variant="danger"
              disabled={selectedDeleteCount === 0}
              onClick={() => setDeleteConfirmOpen(true)}
            >
              {`Xóa (${selectedDeleteCount})`}
            </Button>
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={I18n.marketingDashboard.deleteConfirmTitle}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{I18n.marketingDashboard.deleteConfirmMessage}</p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
              {I18n.cancel}
            </Button>
            <Button variant="danger" onClick={handleDeleteSelected} loading={isLoading}>
              {I18n.confirm}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
