'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ArrowLeft, Check, Clock, Loader2, Plus, Trash2, X } from 'lucide-react';

import Skeleton from '@/components/ui/Skeleton';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { I18n } from '@/i18n';
import { CDN_URL } from '@/lib/api.config';
import { mapAvatarResponseToOptions } from '@/lib/marketing-dashboard.utils';
import type { AvatarData } from '@/types';
import { AvatarStatusOption } from '@/types/enums';

const brandGradient = 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)';

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
  const { isLoading, getAvatar, createAvatar, uploadAvatarImage, updateAvatar, avatarDeleteBatch } =
    useMarketingDashboard();

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
    getAvatar().then((res) => {
      const avatarData: AvatarData[] = res?.data || [];
      if (avatarData.length > 0) {
        const patterns = avatarData.filter((a) => a.agentCode === null);
        const yours = avatarData.filter((a) => a.agentCode !== null);
        setPatternAvatars(mapAvatarResponseToOptions(patterns) as AvatarOption[]);
        setYourAvatars(mapAvatarResponseToOptions(yours) as AvatarOption[]);
      }
    });
  }, [getAvatar]);

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
        prev.map((a) => (a.id === item.id ? { ...a, isSelectedDelete: !a.isSelectedDelete } : a)),
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
          <div className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--background)] text-white shadow-[var(--shadow-glow-primary)] bg-[var(--success)]">
            <Check className="h-3 w-3" strokeWidth={3} />
          </div>
        );
      case AvatarStatusOption.Waiting:
        return (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[var(--surface-glass-border)] bg-[var(--surface-glass)] px-2 py-0.5 text-[9px] font-black tracking-widest whitespace-nowrap text-[var(--accent)] uppercase backdrop-blur-md">
            <Clock className="h-2.5 w-2.5" strokeWidth={2.5} />
            Chờ duyệt
          </div>
        );
      case AvatarStatusOption.Rejected:
        return (
          <div className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--background)] text-white shadow-[var(--shadow-glow-primary)] bg-[var(--danger)]">
            <X className="h-3 w-3" strokeWidth={3} />
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading && patternAvatars.length === 0) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-28 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col">
      {/* Header */}
      <div className="glass-bento sticky top-4 z-20 mx-4 mt-4 flex items-center justify-between md:mx-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="group flex h-10 w-10 items-center justify-center rounded-full text-white shadow-[var(--shadow-glow-primary)] transition-transform hover:scale-105"
            style={{ background: brandGradient }}
            aria-label="Back"
          >
            <ArrowLeft
              className="h-5 w-5 transition-transform group-hover:-translate-x-0.5"
              strokeWidth={2.5}
            />
          </button>
          <div>
            <p className="bento-eyebrow">Quản lý</p>
            <h2 className="text-lg font-black tracking-wide text-[var(--text-strong)] md:text-xl">
              {I18n.marketingDashboard.avatarManagement}
            </h2>
          </div>
        </div>
        {isDeleteMode ? (
          <button
            onClick={() => {
              setIsDeleteMode(false);
              setYourAvatars((prev) => prev.map((a) => ({ ...a, isSelectedDelete: undefined })));
            }}
            className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase transition-colors hover:text-[var(--text-strong)]"
          >
            Hủy thao tác
          </button>
        ) : null}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="animate-bento-fade-up mx-auto max-w-5xl space-y-8">
          {/* Section 1: Pattern Avatars (System) */}
          <section className="glass-bento">
            <p className="bento-eyebrow mb-4">Mẫu đại diện</p>
            <div className="flex snap-x gap-4 overflow-x-auto pb-2 md:gap-6">
              {patternAvatars.map((item) => {
                const isSelected = item.isSelected && !isDeleteMode;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectPattern(item)}
                    className={`group relative shrink-0 cursor-pointer snap-start transition-all duration-300 ${isDeleteMode ? 'opacity-50 grayscale' : ''}`}
                  >
                    <div
                      className={`h-28 w-28 overflow-hidden rounded-full border-[3px] transition-all md:h-36 md:w-36 ${
                        isSelected
                          ? 'shadow-[var(--shadow-glow-primary-strong)]'
                          : 'border-[var(--surface-glass-border)] group-hover:border-[var(--primary)]'
                      }`}
                      style={isSelected ? { borderColor: 'var(--primary)' } : undefined}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${CDN_URL}${item.imageLink}`}
                        alt="Pattern avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {isSelected && (
                      <div
                        className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--background)] text-white shadow-[var(--shadow-glow-primary)]"
                        style={{ background: brandGradient }}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 2: Your Avatars (Personal) */}
          <section className="glass-bento">
            <div className="mb-4 flex items-end justify-between">
              <p className="bento-eyebrow">Ảnh của bạn ({yourAvatars.length}/10)</p>
              <span className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
                {I18n.marketingDashboard.maxFileSize}
              </span>
            </div>

            {yourAvatars.length >= 10 && (
              <div className="mb-4 rounded-[var(--radius-bento-sm)] bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] p-3 text-xs font-medium text-[var(--accent)]">
                {I18n.marketingDashboard.maxAvatars}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 md:gap-6 lg:grid-cols-6 xl:grid-cols-7">
              {/* Upload button */}
              {!isDeleteMode && yourAvatars.length < 10 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="group flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-[var(--surface-glass-border)] bg-[var(--surface-glass-alt)] transition-all hover:border-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--text-muted)]" />
                  ) : (
                    <>
                      <Plus
                        className="mb-1 h-8 w-8 text-[var(--text-muted)] transition-colors group-hover:text-[var(--primary)]"
                        strokeWidth={2.5}
                      />
                      <span className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase group-hover:text-[var(--primary)]">
                        Tải lên
                      </span>
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
                    className={`relative aspect-square w-full cursor-pointer overflow-hidden rounded-full transition-all duration-300 ${
                      isDeleteMode
                        ? 'hover:scale-95'
                        : isPending
                          ? 'cursor-not-allowed opacity-70'
                          : 'hover:scale-105'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${CDN_URL}${item.imageLink}`}
                      alt="Your avatar"
                      className="h-full w-full object-cover"
                    />

                    {/* Overlay */}
                    <div
                      className={`absolute inset-0 transition-opacity duration-300 ${
                        isSelectedForUse || isSelectedForDelete
                          ? 'bg-black/20'
                          : 'bg-black/0 hover:bg-black/10'
                      }`}
                    />

                    {/* Border ring */}
                    <div
                      className={`absolute inset-0 rounded-full border-[3px] transition-colors duration-300 ${
                        isSelectedForUse
                          ? 'shadow-[var(--shadow-glow-primary-strong)]'
                          : isSelectedForDelete
                            ? 'border-[var(--danger)]'
                            : 'border-transparent'
                      }`}
                      style={isSelectedForUse ? { borderColor: 'var(--primary)' } : undefined}
                    />

                    {/* Checkmark for selected as active */}
                    {isSelectedForUse && (
                      <div
                        className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--background)] text-white shadow-[var(--shadow-glow-primary)]"
                        style={{ background: brandGradient }}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </div>
                    )}

                    {/* Checkmark for delete selection */}
                    {isSelectedForDelete && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[color-mix(in_srgb,var(--danger)_25%,transparent)] backdrop-blur-[2px]">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--danger)] text-white shadow-lg">
                          <Check className="h-6 w-6" strokeWidth={3} />
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
        <div className="pointer-events-none sticky bottom-0 flex justify-center bg-gradient-to-t from-[var(--background)] to-transparent p-4 md:p-6">
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
            className="glass-bento pointer-events-auto flex items-center !rounded-full !px-6 !py-2.5 text-[10px] font-black tracking-widest text-[var(--text-secondary)] uppercase transition-all hover:text-[var(--danger)]"
          >
            <Trash2 className="mr-2 h-4 w-4" strokeWidth={2.5} />
            Chọn ảnh để xóa
          </button>
        </div>
      )}

      {/* Floating action bar in delete mode */}
      {isDeleteMode && (
        <div className="glass-bento absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-4 !p-2 shadow-2xl">
          <span className="px-4 text-[10px] font-black tracking-widest text-[var(--text-strong)] uppercase">
            Đã chọn <span className="text-[var(--danger)]">{selectedDeleteCount}</span> ảnh
          </span>
          <div className="h-6 w-px bg-[var(--surface-glass-border)]" />
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={selectedDeleteCount === 0}
            className={`rounded-full px-6 py-2 text-[10px] font-black tracking-widest uppercase transition-all ${
              selectedDeleteCount > 0
                ? 'bg-[var(--danger)] text-white shadow-lg hover:-translate-y-0.5'
                : 'cursor-not-allowed bg-[var(--surface-glass-alt)] text-[var(--text-muted)]'
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
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirmOpen(false)}
          />
          <div className="glass-bento glass-shine relative mx-4 w-full max-w-sm shadow-2xl">
            <p className="bento-eyebrow mb-1">Xác nhận</p>
            <h3 className="mb-2 text-lg font-black tracking-wide text-[var(--text-strong)]">
              {I18n.marketingDashboard.deleteConfirmTitle}
            </h3>
            <p className="mb-6 text-sm font-medium text-[var(--text-secondary)]">
              {I18n.marketingDashboard.deleteConfirmMessage}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="rounded-full border border-[var(--surface-glass-border)] bg-[var(--surface-glass-alt)] px-5 py-2.5 text-[10px] font-black tracking-widest text-[var(--text-strong)] uppercase transition-colors hover:bg-[var(--surface-glass)]"
              >
                {I18n.cancel}
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={isLoading}
                className="rounded-full bg-[var(--danger)] px-5 py-2.5 text-[10px] font-black tracking-widest text-white uppercase shadow-lg transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
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
