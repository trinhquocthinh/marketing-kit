'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { I18n } from '@/i18n';
import { CDN_URL } from '@/lib/api.config';
import { LabelEnum } from '@/types/enums';
import type { AliasData, AvatarData, GroupTemplateModel } from '@/types';
import { useMarketingDashboard } from '@/hooks/useMarketingDashboard';
import { generateMktLink, generateUniqueAliasName } from '@/lib/marketing-dashboard.utils';
import PosterCanvas, { exportPosterAsBlob } from '@/components/posters/PosterCanvas';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';

export default function PosterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = Number(params.posterId);
  const templateId = Number(params.templateId);

  const {
    folders,
    isLoading,
    createAlias,
    updateAlias,
    uploadAliasImage,
    getAlias,
    getAvatar,
    setLoading,
  } = useMarketingDashboard();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [aliasName, setAliasName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('/default-avatar.png');
  const [qrUrl, setQrUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const folder = folders.find((f) => f.id === folderId);
  const template: GroupTemplateModel | undefined = folder?.templates.find(
    (t) => t.id === templateId,
  );

  const bannerUrl = template ? `${CDN_URL}${template.imageLink}` : '';
  const isFilled = name && phone && aliasName;

  // Load defaults
  useEffect(() => {
    if (template) {
      setAliasName(template.name);
    }
  }, [template]);

  useEffect(() => {
    getAvatar().then((res) => {
      if (res?.data) {
        const defaultAvatar = (res.data as AvatarData[]).find((a) => a.isDefault);
        if (defaultAvatar?.imageLink) {
          setAvatarUrl(`${CDN_URL}${defaultAvatar.imageLink}`);
        }
      }
    });
  }, [getAvatar]);

  const handleSave = useCallback(async () => {
    if (!isFilled || !template || !folder) return;

    setIsSaving(true);
    try {
      // 1. Get existing aliases to generate unique name
      const aliasRes = await getAlias();
      const aliasList: AliasData[] = aliasRes?.data || [];
      const uniqueName = generateUniqueAliasName(aliasName, aliasList, template.name);

      if (!uniqueName) {
        alert(I18n.marketingDashboard.createAlias + ' - name conflict');
        setIsSaving(false);
        return;
      }

      // 2. Create alias
      const createRes = await createAlias({
        folderId: folder.id,
        imageData: { name, phone },
        imageLink: template.imageLink,
        labels: [{ type: LabelEnum.MARQUEE, value: '' }],
        name: uniqueName,
        templateId: template.id,
        imageMeta: {},
      });

      const aliasData = createRes?.data;
      if (!aliasData?.id) throw new Error('Failed to create alias');

      // 3. Set QR URL for canvas
      const mktLink = generateMktLink(aliasData);
      setQrUrl(mktLink);

      // Wait for QR to render
      await new Promise((r) => setTimeout(r, 1500));

      // 4. Export canvas to blob
      if (!canvasRef.current) throw new Error('Canvas not ready');
      const blob = await exportPosterAsBlob(canvasRef.current);

      // 5. Upload image
      const file = new File([blob], `${template.id}_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const uploadRes = await uploadAliasImage({ file, fileName: file.name });
      const uploadedLink = uploadRes?.data;
      if (!uploadedLink) throw new Error('Upload failed');

      // 6. Update alias with image link
      const updateRes = await updateAlias(aliasData.id, {
        ...aliasData,
        imageLink: uploadedLink,
      });

      if (!updateRes?.data) throw new Error('Update failed');

      // Navigate to my images
      router.push('/agent/marketing-kit/my-images');
    } catch (err) {
      console.error('Save poster error:', err);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  }, [isFilled, template, folder, aliasName, name, phone, getAlias, createAlias, updateAlias, uploadAliasImage, router]);

  if (!template || !folder) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="aspect-[3/4] w-full max-w-md rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-semibold text-gray-900 truncate">{template.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preview */}
        <div className="space-y-4">
          <div ref={canvasRef} className="max-w-md mx-auto rounded-lg overflow-hidden shadow-lg">
            <PosterCanvas
              imageUrl={bannerUrl}
              avatarUrl={avatarUrl}
              qrData={qrUrl || 'https://placeholder.qr'}
              name={name || I18n.marketingDashboard.displayName}
              phone={phone || I18n.marketingDashboard.phoneNumber}
              imageMeta={template.imageMeta || {}}
              showQrPlaceholder={!qrUrl}
            />
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Avatar section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => router.push('/agent/marketing-kit/avatar')}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#FA875B] rounded-full flex items-center justify-center"
              >
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <button
              onClick={() => router.push('/agent/marketing-kit/avatar')}
              className="text-sm text-[#FA875B] font-medium hover:underline"
            >
              {I18n.marketingDashboard.changeAvatar}
            </button>
          </div>

          <Input
            label={I18n.marketingDashboard.displayName}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={I18n.marketingDashboard.displayName}
            readOnly={template.editable === false}
          />
          <Input
            label={I18n.marketingDashboard.phoneNumber}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={I18n.marketingDashboard.phoneNumber}
            readOnly={template.editable === false}
          />
          <Input
            label={I18n.marketingDashboard.aliasName}
            value={aliasName}
            onChange={(e) => setAliasName(e.target.value)}
            placeholder={I18n.marketingDashboard.aliasName}
          />

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              disabled={!isFilled || isSaving}
              onClick={() => {
                /* Preview: just scroll to canvas */
                canvasRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {I18n.marketingDashboard.gridView}
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              disabled={!isFilled || isSaving}
              loading={isSaving}
              onClick={handleSave}
            >
              {I18n.save}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
