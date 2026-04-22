'use client';

import { useState, FormEvent } from 'react';
import { I18n } from '@/i18n';
import { httpService } from '@/lib/http.service';
import { URL_ALIAS } from '@/lib/constants';

const VN_PHONE_REGEX = /^(0[2-9]|84[2-9])\d{7,8}$/;
const NAME_MAX_LENGTH = 200;

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
    params.then(p => setAliasId(p.aliasId)).catch(() => setInvalidLink(true));
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
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4" style={{ background: 'linear-gradient(180deg, #fff5ef 0%, #faf7f4 100%)' }}>
        <div className="pointer-events-none absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full blur-3xl opacity-60" style={{ background: 'radial-gradient(circle, rgba(250,135,91,0.55), transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-32 -right-16 w-[460px] h-[460px] rounded-full blur-3xl opacity-50" style={{ background: 'radial-gradient(circle, rgba(255,140,120,0.55), transparent 70%)' }} />
        <div className="relative w-full max-w-md text-center">
          <div className="glass-card rounded-2xl p-8">
            <div className="w-16 h-16 bg-[var(--accent-rose)]/15 border border-[var(--accent-rose)]/40 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[var(--glow-rose)]">
              <svg className="w-8 h-8 text-[var(--accent-rose)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-2 tracking-tight">{I18n.scanQrPage.invalidLink}</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">{I18n.scanQrPage.invalidLinkDesc}</p>
            <a
              href="https://zalo.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-linear-to-r from-orange-400 to-rose-500 text-white px-6 py-3 rounded-xl font-bold shadow-[var(--glow-primary)] hover:shadow-[var(--glow-primary-strong)] transition-all"
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
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4" style={{ background: 'linear-gradient(180deg, #fff5ef 0%, #faf7f4 100%)' }}>
        <div className="pointer-events-none absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full blur-3xl opacity-60" style={{ background: 'radial-gradient(circle, rgba(250,135,91,0.55), transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-32 -right-16 w-[460px] h-[460px] rounded-full blur-3xl opacity-50" style={{ background: 'radial-gradient(circle, rgba(255,140,120,0.55), transparent 70%)' }} />
        <div className="relative w-full max-w-md text-center">
          <div className="glass-card rounded-2xl p-8">
            <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_24px_rgba(16,185,129,0.35)]">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-2 tracking-tight">{I18n.scanQrPage.submitSuccess}</h2>
            <p className="text-sm text-[var(--text-muted)]">{I18n.scanQrPage.submitSuccessDesc}</p>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4" style={{ background: 'linear-gradient(180deg, #fff5ef 0%, #faf7f4 100%)' }}>
      <div className="pointer-events-none absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full blur-3xl opacity-60" style={{ background: 'radial-gradient(circle, rgba(250,135,91,0.55), transparent 70%)' }} />
      <div className="pointer-events-none absolute -bottom-32 -right-16 w-[460px] h-[460px] rounded-full blur-3xl opacity-50" style={{ background: 'radial-gradient(circle, rgba(255,140,120,0.55), transparent 70%)' }} />
      <div className="relative w-full max-w-md">
        <div className="glass-card rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-linear-to-br from-orange-400 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[var(--glow-primary)]">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="font-display text-xl font-bold text-[var(--text-primary)] tracking-tight">{I18n.scanQrPage.salesTitle}</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">{I18n.scanQrPage.salesDesc}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">
                {I18n.scanQrPage.name} <span className="text-[var(--accent-rose)]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                }}
                maxLength={NAME_MAX_LENGTH}
                className={`w-full px-4 py-3 rounded-xl bg-[var(--surface-hover)] border ${errors.name ? 'border-[var(--accent-rose)]/60 shadow-[var(--glow-rose)]' : 'border-[var(--glass-border)]'} text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:shadow-[var(--glow-primary)] transition-all`}
                placeholder={I18n.scanQrPage.name}
              />
              {errors.name && <p className="text-[var(--accent-rose)] text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">
                {I18n.scanQrPage.phone} <span className="text-[var(--accent-rose)]">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                }}
                className={`w-full px-4 py-3 rounded-xl bg-[var(--surface-hover)] border ${errors.phone ? 'border-[var(--accent-rose)]/60 shadow-[var(--glow-rose)]' : 'border-[var(--glass-border)]'} text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:shadow-[var(--glow-primary)] transition-all`}
                placeholder="0912 345 678"
              />
              {errors.phone && <p className="text-[var(--accent-rose)] text-xs mt-1">{errors.phone}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-linear-to-r from-orange-400 to-rose-500 text-white py-3 rounded-xl font-bold shadow-[var(--glow-primary)] hover:shadow-[var(--glow-primary-strong)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? I18n.loading : I18n.submit}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-4">
          Powered by Marketing Kit
        </p>
      </div>
    </div>
  );
}
