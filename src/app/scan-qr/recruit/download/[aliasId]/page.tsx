'use client';

import {
  BarChart3,
  CircleDollarSign,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';

import { I18n } from '@/i18n';

interface RecruitPageProps {
  params: Promise<{ aliasId: string }>;
}

const APP_STORE_URL = 'https://apps.apple.com/vn/app/izion24agent/id6476207814';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.izion24agent';
const brandGradient = 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)';

export default function RecruitLandingPage(_props: RecruitPageProps) {
  const features = [
    { Icon: Sparkles, text: 'Quản lý hợp đồng dễ dàng' },
    { Icon: BarChart3, text: 'Theo dõi hiệu suất real-time' },
    { Icon: Target, text: 'Công cụ marketing chuyên nghiệp' },
    { Icon: CircleDollarSign, text: 'Thu nhập hấp dẫn' },
  ] as const;

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="animate-bento-fade-up w-full max-w-md">
        <div className="glass-bento glass-shine text-center">
          {/* Header */}
          <div className="mb-8">
            <div
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[var(--radius-bento-sm)] text-white shadow-[var(--shadow-glow-primary-strong)]"
              style={{ background: brandGradient }}
            >
              <Users className="h-10 w-10" strokeWidth={2.25} />
            </div>
            <p className="bento-eyebrow mb-2">Tham gia đội ngũ</p>
            <h1 className="mb-2 text-2xl font-black tracking-wide text-[var(--text-strong)]">
              {I18n.scanQrPage.recruitTitle}
            </h1>
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {I18n.scanQrPage.recruitDesc}
            </p>
          </div>

          {/* Features list */}
          <div className="mb-8 space-y-3 text-left">
            {features.map(({ Icon, text }, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-[var(--radius-bento-sm)] bg-[var(--surface-glass-alt)] p-3"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-[var(--shadow-glow-primary)]"
                  style={{ background: brandGradient }}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <span className="text-sm font-black text-[var(--text-strong)]">{text}</span>
              </div>
            ))}
          </div>

          {/* Download buttons */}
          <div className="space-y-3">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-3 rounded-full bg-[var(--text-strong)] py-3.5 font-black text-[var(--background)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] tracking-widest opacity-80 uppercase">
                  Download on the
                </div>
                <div className="-mt-0.5 text-base font-black">App Store</div>
              </div>
            </a>

            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-3 rounded-full bg-[var(--text-strong)] py-3.5 font-black text-[var(--background)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 010 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] tracking-widest opacity-80 uppercase">GET IT ON</div>
                <div className="-mt-0.5 text-base font-black">Google Play</div>
              </div>
            </a>
          </div>

          {/* Contact support */}
          <div className="mt-6 border-t border-[var(--surface-glass-border)] pt-6">
            <a
              href="https://zalo.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-black tracking-widest text-[var(--primary)] uppercase transition-colors hover:text-[var(--accent)]"
            >
              {I18n.scanQrPage.contactSupport}
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-4 text-center text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
          Powered by Marketing Kit
        </p>
      </div>
    </div>
  );
}
