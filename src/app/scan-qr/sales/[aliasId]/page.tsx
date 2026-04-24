'use client';

import { type FormEvent, useState } from 'react';

import { AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';

import { I18n } from '@/i18n';
import { URL_ALIAS } from '@/lib/constants';
import { httpService } from '@/lib/http.service';

const VN_PHONE_REGEX = /^(0[2-9]|84[2-9])\d{7,8}$/;
const NAME_MAX_LENGTH = 200;
const brandGradient = 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)';

interface SalesPageProps {
  params: Promise<{ aliasId: string }>;
}

export default function SalesLandingPage({ params }: SalesPageProps) {
  const [aliasId, setAliasId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  // Resolve params
  if (aliasId === null) {
    params.then((p) => setAliasId(p.aliasId)).catch(() => setInvalidLink(true));
  }

  const validate = (): boolean => {
    const newErrors: { name?: string; phone?: string } = {};

    if (!name.trim()) {
      newErrors.name = I18n.fieldIsRequired;
    } else if (name.length > NAME_MAX_LENGTH) {
      newErrors.name = I18n.scanQrPage.nameMaxLength;
    }

    if (!phone.trim()) {
      newErrors.phone = I18n.fieldIsRequired;
    } else if (!VN_PHONE_REGEX.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = I18n.scanQrPage.phoneInvalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    try {
      const result = await httpService.post(`${URL_ALIAS}/${aliasId}/lead`, {
        name: name.trim(),
        phone: phone.replace(/\s/g, ''),
      });

      if (result.isSuccess) {
        setSuccess(true);
      } else {
        setInvalidLink(true);
      }
    } catch {
      setInvalidLink(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Invalid / expired link state
  if (invalidLink) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="animate-bento-fade-up w-full max-w-md text-center">
          <div className="glass-bento glass-shine">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--danger)_15%,transparent)] text-[var(--danger)]">
              <AlertTriangle className="h-8 w-8" strokeWidth={2.25} />
            </div>
            <p className="bento-eyebrow mb-1">Lỗi</p>
            <h2 className="mb-2 text-xl font-black tracking-wide text-[var(--text-strong)]">
              {I18n.scanQrPage.invalidLink}
            </h2>
            <p className="mb-6 text-sm font-medium text-[var(--text-secondary)]">
              {I18n.scanQrPage.invalidLinkDesc}
            </p>
            <a
              href="https://zalo.me"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brand-glow inline-flex items-center gap-2 rounded-full px-6 py-3 text-[10px] font-black tracking-widest text-white uppercase"
              style={{ background: brandGradient }}
            >
              {I18n.scanQrPage.contactZalo}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="animate-bento-fade-up w-full max-w-md text-center">
          <div className="glass-bento glass-shine">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]">
              <CheckCircle2 className="h-8 w-8" strokeWidth={2.25} />
            </div>
            <p className="bento-eyebrow mb-1">Cảm ơn</p>
            <h2 className="mb-2 text-xl font-black tracking-wide text-[var(--text-strong)]">
              {I18n.scanQrPage.submitSuccess}
            </h2>
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {I18n.scanQrPage.submitSuccessDesc}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="animate-bento-fade-up w-full max-w-md">
        <div className="glass-bento glass-shine">
          {/* Header */}
          <div className="mb-6 text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[var(--radius-bento-sm)] text-white shadow-[var(--shadow-glow-primary-strong)]"
              style={{ background: brandGradient }}
            >
              <Sparkles className="h-8 w-8" strokeWidth={2.25} />
            </div>
            <p className="bento-eyebrow mb-2">Đăng ký tư vấn</p>
            <h1 className="text-xl font-black tracking-wide text-[var(--text-strong)]">
              {I18n.scanQrPage.salesTitle}
            </h1>
            <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
              {I18n.scanQrPage.salesDesc}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
                {I18n.scanQrPage.name} <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                maxLength={NAME_MAX_LENGTH}
                className={`glass-input w-full px-4 py-3 ${errors.name ? 'border-[var(--danger)]' : ''}`}
                placeholder={I18n.scanQrPage.name}
              />
              {errors.name && (
                <p className="mt-1 text-xs font-medium text-[var(--danger)]">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
                {I18n.scanQrPage.phone} <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                className={`glass-input w-full px-4 py-3 ${errors.phone ? 'border-[var(--danger)]' : ''}`}
                placeholder="0912 345 678"
              />
              {errors.phone && (
                <p className="mt-1 text-xs font-medium text-[var(--danger)]">{errors.phone}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-brand-glow w-full rounded-full py-3 text-[10px] font-black tracking-widest text-white uppercase disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: brandGradient }}
            >
              {submitting ? I18n.loading : I18n.submit}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-4 text-center text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
          Powered by Marketing Kit
        </p>
      </div>
    </div>
  );
}
