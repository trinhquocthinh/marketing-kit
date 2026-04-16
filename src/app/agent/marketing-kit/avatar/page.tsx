'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { I18n } from '@/i18n';
import { CDN_URL } from '@/lib/api.config';
import { AvatarStatusOption } from '@/types/enums';
import type { AvatarData } from '@/types';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { mapAvatarResponseToOptions } from '@/lib/marketing-dashboard.utils';
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
          <div className="absolute top-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case AvatarStatusOption.Waiting:
        return (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-medium text-amber-400 whitespace-nowrap flex items-center gap-1 border border-white/10">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth={2} />
              <path strokeLinecap="round" strokeWidth={2} d="M12 8v4l3 3" />
            </svg>
            Chờ duyệt
          </div>
        );
      case AvatarStatusOption.Rejected:
        return (
          <div className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading && patternAvatars.length === 0) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <Skeleton className="h-8 w-48 bg-white/10 rounded-lg" />
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-28 h-28 rounded-full bg-white/5" />
          ))}
        </div>
        <Skeleton className="h-6 w-32 bg-white/10 rounded-lg" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-full bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-20">
        <button
          onClick={() => router.back()}
          className="flex items-center text-slate-300 hover:text-white transition-colors group"
        >
          <svg
            className="w-5 h-5 mr-2 text-orange-400 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <h2 className="text-lg md:text-xl font-bold text-white">
            {I18n.marketingDashboard.avatarManagement}
          </h2>
        </button>
        {isDeleteMode ? (
          <button
            onClick={() => {
              setIsDeleteMode(false);
              setYourAvatars((prev) => prev.map((a) => ({ ...a, isSelectedDelete: undefined })));
            }}
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Hủy thao tác
          </button>
        ) : null}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-10">

          {/* Section 1: Pattern Avatars (System) */}
          <section>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Mẫu đại diện
            </h3>
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x">
              {patternAvatars.map((item) => {
                const isSelected = item.isSelected && !isDeleteMode;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectPattern(item)}
                    className={`relative snap-start shrink-0 cursor-pointer group transition-all duration-300 ${isDeleteMode ? 'opacity-50 grayscale' : ''}`}
                  >
                    <div
                      className={`w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-[3px] transition-all ${
                        isSelected
                          ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                          : 'border-transparent group-hover:border-white/30'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${CDN_URL}${item.imageLink}`}
                        alt="Pattern avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-6 h-6 bg-orange-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 2: Your Avatars (Personal) */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Ảnh của bạn ({yourAvatars.length}/10)
              </h3>
              <span className="text-xs text-slate-500">{I18n.marketingDashboard.maxFileSize}</span>
            </div>

            {yourAvatars.length >= 10 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4 text-xs text-amber-400">
                {I18n.marketingDashboard.maxAvatars}
              </div>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 md:gap-6">
              {/* Upload button */}
              {!isDeleteMode && yourAvatars.length < 10 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full aspect-square rounded-full border-2 border-dashed border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-500/5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <svg className="w-8 h-8 text-slate-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-slate-500 group-hover:text-orange-500 transition-colors mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-[10px] text-slate-500 group-hover:text-orange-400 font-medium">Tải lên</span>
                    </>
                  )}
                </button>
              )}

              {/* Avatar list */}
              {yourAvatars.map((item) => {
                const isSelectedForUse = item.isSelected && !isDeleteMode;
                const isSelectedForDelete = isDeleteMode && item.isSelectedDelete;
                const isPending = item.avatarStatusOption === AvatarStatusOption.Waiting;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectYour(item)}
                    className={`relative w-full aspect-square rounded-full overflow-hidden cursor-pointer transition-all duration-300 ${
                      isDeleteMode ? 'hover:scale-95' : isPending ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${CDN_URL}${item.imageLink}`}
                      alt="Your avatar"
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay */}
                    <div className={`absolute inset-0 transition-opacity duration-300 ${
                      isSelectedForUse || isSelectedForDelete ? 'bg-black/20' : 'bg-black/0 hover:bg-black/10'
                    }`} />

                    {/* Border ring */}
                    <div className={`absolute inset-0 rounded-full border-[3px] transition-colors duration-300 ${
                      isSelectedForUse
                        ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                        : isSelectedForDelete
                          ? 'border-rose-500'
                          : 'border-transparent'
                    }`} />

                    {/* Checkmark for selected as active */}
                    {isSelectedForUse && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-sm">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}

                    {/* Checkmark for delete selection */}
                    {isSelectedForDelete && (
                      <div className="absolute inset-0 flex items-center justify-center bg-rose-500/20 backdrop-blur-[2px]">
                        <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Status badge */}
                    {!isDeleteMode && statusBadge(item.avatarStatusOption)}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Footer: Enter delete mode button */}
      {yourAvatars.length > 0 && !isDeleteMode && yourAvatars.some((a) => a.approved) && (
        <div className="p-4 md:p-6 flex justify-center sticky bottom-0 bg-linear-to-t from-slate-950 to-transparent pointer-events-none">
          <button
            onClick={() => {
              setIsDeleteMode(true);
              setYourAvatars((prev) =>
                prev.map((a) => ({
                  ...a,
                  isSelectedDelete:
                    a.avatarStatusOption === AvatarStatusOption.Waiting ? undefined : false,
                })),
              );
            }}
            className="pointer-events-auto flex items-center px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 text-slate-300 rounded-full transition-all text-sm font-medium shadow-lg backdrop-blur-md"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Chọn ảnh để xóa
          </button>
        </div>
      )}

      {/* Floating action bar in delete mode */}
      {isDeleteMode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 bg-slate-800/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-30">
          <span className="text-sm font-medium text-white px-4">
            Đã chọn <span className="text-rose-400">{selectedDeleteCount}</span> ảnh
          </span>
          <div className="w-px h-6 bg-white/20" />
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={selectedDeleteCount === 0}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              selectedDeleteCount > 0
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 hover:bg-rose-600 hover:-translate-y-0.5'
                : 'bg-white/5 text-slate-500 cursor-not-allowed'
            }`}
          >
            Xóa ngay
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />

      {/* Delete confirmation modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmOpen(false)} />
          <div className="relative bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              {I18n.marketingDashboard.deleteConfirmTitle}
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              {I18n.marketingDashboard.deleteConfirmMessage}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-colors text-sm"
              >
                {I18n.cancel}
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={isLoading}
                className="px-5 py-2.5 bg-rose-500 rounded-xl text-white font-bold shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {I18n.loading}
                  </span>
                ) : (
                  I18n.confirm
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
