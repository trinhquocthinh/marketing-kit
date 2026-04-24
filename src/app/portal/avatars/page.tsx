'use client';

import { useEffect, useState } from 'react';

import { format } from 'date-fns';

import { Button, Modal, NoData, Skeleton, Toast } from '@/components/ui';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { I18n } from '@/i18n';
import { CDN_URL } from '@/lib/api.config';
import { type AvatarData } from '@/types';

const brandGradient = 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)';

type AvatarFilter = 'all' | 'waiting' | 'approved' | 'rejected';

export default function PortalAvatarsPage() {
  const { getAvatar, updateAvatar, isLoading } = useMarketingDashboard();
  const [avatars, setAvatars] = useState<AvatarData[]>([]);
  const [filter, setFilter] = useState<AvatarFilter>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<AvatarData | null>(null);

  useEffect(() => {
    getAvatar().then((result) => {
      if (result?.data) setAvatars(result.data);
    });
  }, [getAvatar]);

  const getStatus = (avatar: AvatarData): AvatarFilter => {
    if (avatar.approved) return 'approved';
    if (avatar.actionAt) return 'rejected';
    return 'waiting';
  };

  const filteredAvatars =
    filter === 'all' ? avatars : avatars.filter((a) => getStatus(a) === filter);

  const handleApprove = async (avatar: AvatarData) => {
    const result = await updateAvatar(avatar.id, {
      imageLink: avatar.imageLink,
      imageMeta: avatar.imageMeta,
      isDefault: avatar.isDefault,
      isApproved: true,
    });
    if (result) {
      setAvatars((prev) =>
        prev.map((a) =>
          a.id === avatar.id ? { ...a, approved: true, actionAt: new Date().toISOString() } : a,
        ),
      );
      setToast({ message: 'Đã duyệt ảnh đại diện', type: 'success' });
    }
  };

  const handleReject = async (avatar: AvatarData) => {
    const result = await updateAvatar(avatar.id, {
      imageLink: avatar.imageLink,
      imageMeta: avatar.imageMeta,
      isDefault: avatar.isDefault,
      isApproved: false,
    });
    if (result) {
      setAvatars((prev) =>
        prev.map((a) =>
          a.id === avatar.id ? { ...a, approved: false, actionAt: new Date().toISOString() } : a,
        ),
      );
      setToast({ message: 'Đã từ chối ảnh đại diện', type: 'success' });
    }
  };

  const filterTabs: { id: AvatarFilter; label: string; count: number }[] = [
    { id: 'all', label: I18n.all, count: avatars.length },
    {
      id: 'waiting',
      label: I18n.portal.waiting,
      count: avatars.filter((a) => getStatus(a) === 'waiting').length,
    },
    {
      id: 'approved',
      label: I18n.portal.approved,
      count: avatars.filter((a) => getStatus(a) === 'approved').length,
    },
    {
      id: 'rejected',
      label: I18n.portal.rejected,
      count: avatars.filter((a) => getStatus(a) === 'rejected').length,
    },
  ];

  const statusBadge = (avatar: AvatarData) => {
    const status = getStatus(avatar);
    const styles: Record<string, string> = {
      waiting:
        'bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)]',
      approved:
        'bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]',
      rejected:
        'bg-[color-mix(in_srgb,var(--danger)_15%,transparent)] text-[var(--danger)]',
    };
    const labels: Record<string, string> = {
      waiting: I18n.portal.waiting,
      approved: I18n.portal.approved,
      rejected: I18n.portal.rejected,
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="animate-bento-fade-up space-y-6">
      {/* Header */}
      <div className="glass-bento">
        <p className="bento-eyebrow mb-1">Quản trị</p>
        <h1 className="text-2xl font-black tracking-wide text-[var(--text-strong)] md:text-3xl">
          {I18n.portal.avatarApproval}
        </h1>
      </div>

      {/* Filter tabs */}
      <div className="glass-bento flex flex-wrap gap-2 !p-2">
        {filterTabs.map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-full px-4 py-2 text-[10px] font-black tracking-widest uppercase transition-all ${
                active
                  ? 'text-white shadow-[var(--shadow-glow-primary)]'
                  : 'bg-[var(--surface-glass-alt)] text-[var(--text-secondary)] hover:bg-[var(--surface-glass)]'
              }`}
              style={active ? { background: brandGradient } : undefined}
            >
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : filteredAvatars.length === 0 ? (
        <div className="glass-bento flex min-h-[40vh] items-center justify-center">
          <NoData />
        </div>
      ) : (
        <div className="glass-bento overflow-hidden !p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--surface-glass-border)] bg-[var(--surface-glass-alt)] text-left text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
                <th className="px-4 py-3">Avatar</th>
                <th className="px-4 py-3">{I18n.portal.agentCode}</th>
                <th className="px-4 py-3">{I18n.portal.uploadDate}</th>
                <th className="px-4 py-3">{I18n.portal.status}</th>
                <th className="px-4 py-3">{I18n.portal.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAvatars.map((avatar) => (
                <tr
                  key={avatar.id}
                  className="border-b border-[var(--surface-glass-border)] transition-colors hover:bg-[var(--surface-glass-alt)]"
                >
                  <td className="px-4 py-3">
                    <button onClick={() => setPreviewAvatar(avatar)} className="focus:outline-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${CDN_URL}${avatar.imageLink}`}
                        alt={avatar.agentCode}
                        className="h-12 w-12 rounded-full border-2 border-[var(--surface-glass-border)] object-cover transition-colors hover:border-[var(--primary)]"
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-black text-[var(--text-strong)]">
                      {avatar.agentCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    {format(new Date(avatar.created), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-3">{statusBadge(avatar)}</td>
                  <td className="px-4 py-3">
                    {getStatus(avatar) === 'waiting' && (
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => handleApprove(avatar)}>
                          {I18n.portal.approve}
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleReject(avatar)}>
                          {I18n.portal.reject}
                        </Button>
                      </div>
                    )}
                    {getStatus(avatar) === 'approved' && (
                      <Button size="sm" variant="danger" onClick={() => handleReject(avatar)}>
                        {I18n.portal.reject}
                      </Button>
                    )}
                    {getStatus(avatar) === 'rejected' && (
                      <Button size="sm" onClick={() => handleApprove(avatar)}>
                        {I18n.portal.approve}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview modal */}
      <Modal isOpen={!!previewAvatar} onClose={() => setPreviewAvatar(null)} title="Preview">
        {previewAvatar && (
          <div className="flex flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${CDN_URL}${previewAvatar.imageLink}`}
              alt={previewAvatar.agentCode}
              className="h-64 w-64 rounded-[var(--radius-bento-sm)] object-cover"
            />
            <div className="text-center">
              <p className="text-sm font-black text-[var(--text-strong)]">
                {previewAvatar.agentCode}
              </p>
              <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">
                {format(new Date(previewAvatar.created), 'dd/MM/yyyy HH:mm')}
              </p>
              <div className="mt-2">{statusBadge(previewAvatar)}</div>
            </div>
            {getStatus(previewAvatar) === 'waiting' && (
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    handleApprove(previewAvatar);
                    setPreviewAvatar(null);
                  }}
                >
                  {I18n.portal.approve}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    handleReject(previewAvatar);
                    setPreviewAvatar(null);
                  }}
                >
                  {I18n.portal.reject}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
