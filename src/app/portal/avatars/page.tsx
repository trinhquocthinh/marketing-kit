'use client';

import { useState, useEffect } from 'react';
import { I18n } from '@/i18n';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { AvatarData } from '@/types';
import { Button, Skeleton, NoData, Toast, Modal } from '@/components/ui';
import { CDN_URL } from '@/lib/api.config';
import { format } from 'date-fns';

type AvatarFilter = 'all' | 'waiting' | 'approved' | 'rejected';

export default function PortalAvatarsPage() {
  const { getAvatar, updateAvatar, isLoading } = useMarketingDashboard();
  const [avatars, setAvatars] = useState<AvatarData[]>([]);
  const [filter, setFilter] = useState<AvatarFilter>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<AvatarData | null>(null);

  useEffect(() => {
    loadAvatars();
  }, []);

  const loadAvatars = async () => {
    const result = await getAvatar();
    if (result?.data) setAvatars(result.data);
  };

  const getStatus = (avatar: AvatarData): AvatarFilter => {
    if (avatar.approved) return 'approved';
    if (avatar.actionAt) return 'rejected';
    return 'waiting';
  };

  const filteredAvatars = filter === 'all'
    ? avatars
    : avatars.filter((a) => getStatus(a) === filter);

  const handleApprove = async (avatar: AvatarData) => {
    const result = await updateAvatar(avatar.id, {
      imageLink: avatar.imageLink,
      imageMeta: avatar.imageMeta,
      isDefault: avatar.isDefault,
      isApproved: true,
    });
    if (result) {
      setAvatars((prev) =>
        prev.map((a) => (a.id === avatar.id ? { ...a, approved: true, actionAt: new Date().toISOString() } : a)),
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
        prev.map((a) => (a.id === avatar.id ? { ...a, approved: false, actionAt: new Date().toISOString() } : a)),
      );
      setToast({ message: 'Đã từ chối ảnh đại diện', type: 'success' });
    }
  };

  const filterTabs: { id: AvatarFilter; label: string; count: number }[] = [
    { id: 'all', label: I18n.all, count: avatars.length },
    { id: 'waiting', label: I18n.portal.waiting, count: avatars.filter((a) => getStatus(a) === 'waiting').length },
    { id: 'approved', label: I18n.portal.approved, count: avatars.filter((a) => getStatus(a) === 'approved').length },
    { id: 'rejected', label: I18n.portal.rejected, count: avatars.filter((a) => getStatus(a) === 'rejected').length },
  ];

  const statusBadge = (avatar: AvatarData) => {
    const status = getStatus(avatar);
    const styles: Record<string, string> = {
      waiting: 'bg-amber-500/15 text-amber-400 border border-amber-500/40',
      approved: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40',
      rejected: 'bg-[var(--accent-rose)]/15 text-[var(--accent-rose)] border border-[var(--accent-rose)]/40',
    };
    const labels: Record<string, string> = {
      waiting: I18n.portal.waiting,
      approved: I18n.portal.approved,
      rejected: I18n.portal.rejected,
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
          <span className="w-1.5 h-7 rounded-full bg-linear-to-b from-orange-400 to-rose-500 shadow-[var(--glow-primary)]" />
          {I18n.portal.avatarApproval}
        </h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filter === tab.id
                ? 'bg-linear-to-r from-orange-400 to-rose-500 text-white shadow-[var(--glow-primary)]'
                : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--glass-border)] hover:border-[var(--border-bright)]'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredAvatars.length === 0 ? (
        <NoData />
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--glass-border)] bg-[var(--surface-hover)] text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <th className="px-4 py-3">Avatar</th>
                <th className="px-4 py-3">{I18n.portal.agentCode}</th>
                <th className="px-4 py-3">{I18n.portal.uploadDate}</th>
                <th className="px-4 py-3">{I18n.portal.status}</th>
                <th className="px-4 py-3">{I18n.portal.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAvatars.map((avatar) => (
                <tr key={avatar.id} className="border-b border-[var(--glass-border)] hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setPreviewAvatar(avatar)}
                      className="focus:outline-none"
                    >
                      <img
                        src={`${CDN_URL}${avatar.imageLink}`}
                        alt={avatar.agentCode}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[var(--glass-border)] hover:border-[var(--primary)] hover:shadow-[var(--glow-primary)] transition-all"
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-[var(--text-primary)]">{avatar.agentCode}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-muted)]">
                    {format(new Date(avatar.created), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-3">
                    {statusBadge(avatar)}
                  </td>
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
            <img
              src={`${CDN_URL}${previewAvatar.imageLink}`}
              alt={previewAvatar.agentCode}
              className="w-64 h-64 rounded-xl object-cover"
            />
            <div className="text-center">
              <p className="text-sm font-bold text-[var(--text-primary)]">{previewAvatar.agentCode}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {format(new Date(previewAvatar.created), 'dd/MM/yyyy HH:mm')}
              </p>
              <div className="mt-2">{statusBadge(previewAvatar)}</div>
            </div>
            {getStatus(previewAvatar) === 'waiting' && (
              <div className="flex gap-3">
                <Button onClick={() => { handleApprove(previewAvatar); setPreviewAvatar(null); }}>
                  {I18n.portal.approve}
                </Button>
                <Button variant="danger" onClick={() => { handleReject(previewAvatar); setPreviewAvatar(null); }}>
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
