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
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{I18n.scanQrPage.invalidLink}</h2>
            <p className="text-sm text-gray-500 mb-6">{I18n.scanQrPage.invalidLinkDesc}</p>
            <a
              href="https://zalo.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
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
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{I18n.scanQrPage.submitSuccess}</h2>
            <p className="text-sm text-gray-500">{I18n.scanQrPage.submitSuccessDesc}</p>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#FA875B] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{I18n.scanQrPage.salesTitle}</h1>
            <p className="text-sm text-gray-500 mt-1">{I18n.scanQrPage.salesDesc}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {I18n.scanQrPage.name} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                }}
                maxLength={NAME_MAX_LENGTH}
                className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#FA875B]/50 focus:border-[#FA875B] transition-colors`}
                placeholder={I18n.scanQrPage.name}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {I18n.scanQrPage.phone} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                }}
                className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#FA875B]/50 focus:border-[#FA875B] transition-colors`}
                placeholder="0912 345 678"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#FA875B] text-white py-3 rounded-lg font-medium hover:bg-[#e87a50] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? I18n.loading : I18n.submit}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Powered by Marketing Kit
        </p>
      </div>
    </div>
  );
}
